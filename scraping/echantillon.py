"""Échantillon d'extraction : des liens d'AAP découverts aux fiches AapNormalized, par trois moteurs.

Usage :
  python echantillon.py --collecter                 # texte de 5 fiches max pour 10 rubriques (navigateur)
  python echantillon.py --extraire --moteur ollama  # fiches par le modèle local (results/echantillon_ollama.json)
  python echantillon.py --verifier results/echantillon_claude_code.json
  python echantillon.py --estimer                   # coût API Anthropic estimé, sans appel
  python echantillon.py --rapport                   # ECHANTILLON.md à partir des résultats et du contrôle manuel

Aucun appel à l'API Anthropic n'est fait par ce script.
"""
from __future__ import annotations

import argparse
import asyncio
import hashlib
import json
import re
import sys
import time
import urllib.request
from collections import Counter
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from schema import AapNormalized  # noqa: E402

ICI = Path(__file__).resolve().parent
DOSSIER = ICI / "decouverte"
RESULTATS_DECOUVERTE = DOSSIER / "resultats.json"
RESULTS = ICI / "results"
CONTROLE = RESULTS / "controle_echantillon.json"
RAPPORT = ICI / "ECHANTILLON.md"

# Une rubrique par famille : celle qui a le plus de liens d'AAP.
FAMILLES = ["ars", "collectivite", "agence-nationale", "fondation", "societe-savante",
            "ministere", "europe", "etablissement", "caisse-nationale", "autre"]
FICHES_PAR_RUBRIQUE = 5
FICHIERS_IGNORES = (".pdf", ".zip", ".doc", ".docx", ".xls", ".xlsx")  # pas des pages web : hors périmètre
MAX_CARACTERES = 80_000  # même borne que extractor.py

# Tarifs USD par million de tokens, copiés de extractor.py (Sonnet 4.x) : à revérifier à chaque facturation.
PRIX_ENTREE, PRIX_SORTIE = 3.0, 15.0
TOKENS_SORTIE_PAR_FICHE = 1662  # moyenne constatée sur 363 extractions (logs/extraction_costs.jsonl)
EURO_PAR_DOLLAR = 0.95  # taux arrondi [A VALIDER - Monsieur DUCOUT]

OLLAMA_URL = "http://localhost:11434/api/chat"
MOTEURS = ("ollama", "claude_code")
CHAMPS_CONTROLES = ("titre", "financeur", "date_cloture", "montant")

# Même structure que l'outil Claude de extractor.py, exprimée en schéma JSON pour Ollama.
SCHEMA_FICHE = {
    "type": "object",
    "properties": {
        "titre": {"type": "string"},
        "financeur": {"type": "string"},
        "description": {"type": "string"},
        "date_ouverture": {"type": ["string", "null"]},
        "date_cloture": {"type": ["string", "null"]},
        "montant_min": {"type": ["integer", "null"]},
        "montant_max": {"type": ["integer", "null"]},
        "enveloppe_globale": {"type": ["string", "null"]},
        "eligibilite": {"type": "array", "items": {"type": "string"}},
        "pieces_attendues": {"type": "array", "items": {"type": "string"}},
        "territoire": {"type": ["string", "null"]},
        "categories_etablissement": {"type": "array", "items": {"type": "string"}},
    },
    "required": ["titre", "financeur", "description", "date_ouverture", "date_cloture",
                 "montant_min", "montant_max", "enveloppe_globale", "eligibilite",
                 "pieces_attendues", "territoire", "categories_etablissement"],
}

CONSIGNE = (
    "Tu extrais les informations d'un appel à projets français du secteur santé ou médico-social "
    "à partir du texte d'une page web. Réponds uniquement par le JSON demandé. Dates au format "
    "AAAA-MM-JJ, null si absentes. Montants en euros entiers, null si absents. La description "
    "reprend le contenu utile en français sans le résumer à une phrase. categories_etablissement "
    "parmi : ehpad, hopital, clinique, ssr, psychiatrie, handicap, domicile, association, autre."
)


# ---------------------------------------------------------------- fonctions pures (testées)

def choisir_rubriques(resultats: dict, familles: list[str] = FAMILLES) -> list[dict]:
    """Pour chaque famille, la rubrique trouvée qui a le plus de liens d'AAP."""
    choisies = []
    for famille in familles:
        candidates = [r for r in resultats.values() if r["statut"] == "rubrique-trouvee" and r["categorie"] == famille]
        if candidates:
            choisies.append(max(candidates, key=lambda r: r["nb_liens_aap"]))
    return choisies


def liens_a_lire(liens: list[dict], maximum: int = FICHES_PAR_RUBRIQUE) -> list[dict]:
    """Les liens les mieux notés d'abord, sans doublon d'adresse ni fichier à télécharger."""
    vus, retenus = set(), []
    for lien in sorted(liens, key=lambda l: -l.get("score", 0)):
        if lien["href"] in vus or lien["href"].split("?")[0].lower().endswith(FICHIERS_IGNORES):
            continue
        vus.add(lien["href"])
        retenus.append(lien)
        if len(retenus) == maximum:
            break
    return retenus


def nettoyer_texte(texte: str, maximum: int = MAX_CARACTERES) -> str:
    lignes = [l.strip() for l in texte.splitlines()]
    texte = "\n".join(lignes)
    texte = re.sub(r"\n{3,}", "\n\n", texte).strip()
    return texte[:maximum]


def nom_fiche(url: str) -> str:
    return hashlib.sha1(url.encode("utf-8")).hexdigest()[:10] + ".txt"


def lire_fiche(chemin: Path) -> tuple[str, str]:
    """Retourne (adresse d'origine, texte) ; l'adresse est la première ligne du fichier."""
    contenu = chemin.read_text(encoding="utf-8")
    premiere, _, reste = contenu.partition("\n")
    return premiere.strip(), reste.strip()


def valider_fiche(brut: dict, url: str, financeur_defaut: str) -> AapNormalized:
    """Complète les champs obligatoires puis valide avec le schéma du projet (lève une erreur sinon)."""
    donnees = dict(brut)
    donnees["url_source"] = url
    if not donnees.get("financeur"):
        donnees["financeur"] = financeur_defaut
    return AapNormalized(**donnees)


def estimer_cout(caracteres: int, nb_fiches: int) -> dict:
    """Coût estimé en euros ; 4 caractères par token d'entrée, sortie moyenne constatée."""
    tokens_entree = caracteres / 4
    tokens_sortie = nb_fiches * TOKENS_SORTIE_PAR_FICHE
    usd = tokens_entree / 1e6 * PRIX_ENTREE + tokens_sortie / 1e6 * PRIX_SORTIE
    return {"tokens_entree": round(tokens_entree), "tokens_sortie": tokens_sortie, "euros": round(usd * EURO_PAR_DOLLAR, 2)}


def fiche_juste(controle: dict) -> bool:
    return all(controle.get(champ) is True for champ in CHAMPS_CONTROLES)


# ---------------------------------------------------------------- collecte (navigateur)

JS_TEXTE = """() => {
  document.querySelectorAll('header, nav, footer, aside, script, style, noscript, [role=navigation], [role=banner], [role=contentinfo], .cookie, #cookies').forEach(e => e.remove());
  const principal = document.querySelector('main, [role=main], article, #content, #main, .content');
  return (principal || document.body).innerText;
}"""


async def collecter(rubriques: list[dict]) -> None:
    from playwright.async_api import async_playwright
    from utils import accept_cookies, make_browser_context

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        try:
            for rubrique in rubriques:
                dossier = DOSSIER / rubrique["id"]
                liens = json.loads((dossier / "liens.json").read_text(encoding="utf-8"))["liens"]
                dossier_fiches = dossier / "fiches"
                dossier_fiches.mkdir(exist_ok=True)
                contexte = await make_browser_context(browser)
                page = await contexte.new_page()
                gardees = 0
                for lien in liens_a_lire(liens):
                    chemin = dossier_fiches / nom_fiche(lien["href"])
                    if chemin.exists():
                        gardees += 1
                        continue
                    try:
                        await page.goto(lien["href"], wait_until="domcontentloaded", timeout=30000)
                        await accept_cookies(page)
                        texte = nettoyer_texte(await page.evaluate(JS_TEXTE))
                    except Exception as err:
                        print(f"  {rubrique['id']} : {lien['href']} -> {type(err).__name__}")
                        continue
                    if len(texte) < 200:
                        print(f"  {rubrique['id']} : {lien['href']} -> texte trop court, ignoré")
                        continue
                    chemin.write_text(f"{lien['href']}\n{lien['texte']}\n\n{texte}", encoding="utf-8")
                    gardees += 1
                    await asyncio.sleep(2.0)  # rythme humain
                await contexte.close()
                print(f"{rubrique['categorie']:16} {rubrique['nom'][:45]:45} {gardees} fiches")
        finally:
            await browser.close()


# ---------------------------------------------------------------- extraction

def fiches_disponibles(rubriques: list[dict]) -> list[tuple[dict, Path]]:
    fiches = []
    for rubrique in rubriques:
        for chemin in sorted((DOSSIER / rubrique["id"] / "fiches").glob("*.txt")):
            fiches.append((rubrique, chemin))
    return fiches


def appeler_ollama(modele: str, texte: str, url: str) -> dict:
    corps = {"model": modele, "stream": False, "format": SCHEMA_FICHE, "options": {"temperature": 0, "num_ctx": 16384},
             "messages": [{"role": "system", "content": CONSIGNE},
                          {"role": "user", "content": f"URL source : {url}\n\nTexte de la page :\n{texte}"}]}
    requete = urllib.request.Request(OLLAMA_URL, data=json.dumps(corps).encode("utf-8"),
                                     headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(requete, timeout=600) as reponse:
        return json.loads(json.loads(reponse.read())["message"]["content"])


def extraire(rubriques: list[dict], moteur: str, modele: str, limite: int | None) -> None:
    fiches = fiches_disponibles(rubriques)[:limite]
    sortie, echecs, debut = [], [], time.time()
    for i, (rubrique, chemin) in enumerate(fiches, 1):
        url, texte = lire_fiche(chemin)
        texte = texte.split("\n", 1)[1] if "\n" in texte else texte  # saute le texte du lien
        t0 = time.time()
        try:
            brut = appeler_ollama(modele, texte, url)
            fiche = valider_fiche(brut, url, rubrique["nom"])
        except Exception as err:
            echecs.append({"fichier": str(chemin.relative_to(ICI)), "erreur": type(err).__name__ + ": " + str(err).splitlines()[0][:160]})
            print(f"[{i}/{len(fiches)}] échec   {chemin.name} {echecs[-1]['erreur'][:80]}")
            continue
        duree = round(time.time() - t0, 1)
        d = fiche.model_dump()
        d["scrape_metadata"] = {"source": rubrique["id"], "moteur": moteur, "modele": modele, "duree_s": duree,
                                "fichier": str(chemin.relative_to(ICI))}
        sortie.append(d)
        print(f"[{i}/{len(fiches)}] ok {duree:5.0f}s  {fiche.titre[:60]}")
    RESULTS.mkdir(exist_ok=True)
    (RESULTS / f"echantillon_{moteur}.json").write_text(json.dumps(sortie, ensure_ascii=False, indent=2), encoding="utf-8")
    (RESULTS / f"echantillon_{moteur}.errors.json").write_text(json.dumps(echecs, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"\n{len(sortie)} réussites, {len(echecs)} échecs, {time.time() - debut:.0f} s au total ({modele})")


def verifier(chemin: Path) -> int:
    fiches = json.loads(chemin.read_text(encoding="utf-8"))
    invalides = 0
    for f in fiches:
        try:
            AapNormalized(**f)
        except Exception as err:
            invalides += 1
            print(f"invalide : {f.get('url_source', '?')} -> {str(err).splitlines()[0][:120]}")
    print(f"{len(fiches) - invalides} fiches valides, {invalides} invalide")
    return invalides


def estimer(rubriques: list[dict]) -> None:
    fiches = fiches_disponibles(rubriques)
    caracteres = sum(len(lire_fiche(chemin)[1]) for _, chemin in fiches)
    resultats = json.loads(RESULTATS_DECOUVERTE.read_text(encoding="utf-8"))
    total_liens = sum(r["nb_liens_aap"] for r in resultats.values())
    e = estimer_cout(caracteres, len(fiches))
    moyenne = caracteres / max(len(fiches), 1)
    g = estimer_cout(round(moyenne * total_liens), total_liens)
    print(f"Échantillon : {len(fiches)} fiches, {caracteres} caractères -> {e['euros']} euros")
    print(f"Ensemble des liens découverts : {total_liens} fiches -> {g['euros']} euros")
    print("Estimation, aucun appel effectué (tarifs Sonnet 4.x de extractor.py, sans cache).")


# ---------------------------------------------------------------- rapport

def charger_sorties() -> dict[str, list[dict]]:
    sorties = {}
    for moteur in MOTEURS:
        chemin = RESULTS / f"echantillon_{moteur}.json"
        if chemin.exists():
            sorties[moteur] = json.loads(chemin.read_text(encoding="utf-8"))
    return sorties


def rapport(sorties: dict[str, list[dict]], controle: dict, estimation: dict | None, non_aap: list[dict] | None = None) -> str:
    lignes = ["# Extraction sur échantillon : comparaison des moteurs", "",
              "Généré par `python scraping/echantillon.py --rapport`. Contrôle manuel : pour chaque fiche, titre, "
              "financeur, date de clôture et montant comparés à la page d'origine (`results/controle_echantillon.json`).", "",
              "## Récapitulatif par moteur", "",
              "| Moteur | Fiches produites | Fiches contrôlées | Fiches justes (4/4) | Temps total | Coût |",
              "|---|---|---|---|---|---|"]
    for moteur, fiches in sorties.items():
        controlees = [controle[f["url_source"]][moteur] for f in fiches
                      if f["url_source"] in controle and moteur in controle[f["url_source"]]]
        justes = sum(fiche_juste(c) for c in controlees)
        temps = sum(f.get("scrape_metadata", {}).get("duree_s", 0) for f in fiches)
        cout = "0 euro"
        lignes.append(f"| {moteur} | {len(fiches)} | {len(controlees)} | {justes} | {temps:.0f} s | {cout} |")
    if estimation:
        lignes.append(f"| api_anthropic (estimation, aucun appel) | {estimation['nb_fiches']} | - | - | - | "
                      f"{estimation['euros']} euros ({estimation['euros_global']} euros pour {estimation['total_liens']} liens) |")
    if non_aap:
        lignes += ["", f"Pages lues par la session et jugées hors sujet (liste, présentation, page sans rapport) : {len(non_aap)}. "
                   "Le moteur Ollama, lui, produit une fiche pour chaque page, y compris celles-là : voir la colonne « hors sujet » ci-dessous."]
    lignes += ["", "## Détail par fiche", "", "T = titre, F = financeur, D = date de clôture, M = montant ; "
               "oui / non / vide = non contrôlé.", ""]
    urls = sorted({f["url_source"] for fiches in sorties.values() for f in fiches})
    hors_sujet = {n["url"] for n in non_aap or []}
    entetes = " | ".join(f"{m} T F D M" for m in sorties)
    lignes += [f"| Source | Fiche | Hors sujet | {entetes} |", "|---|---|---|" + "---|" * len(sorties)]
    for url in urls:
        source = next((f["scrape_metadata"].get("source", "") for fiches in sorties.values() for f in fiches if f["url_source"] == url), "")
        cases = []
        for moteur in sorties:
            c = controle.get(url, {}).get(moteur)
            cases.append(" ".join("oui" if c.get(ch) is True else "non" if c and ch in c else "-" for ch in CHAMPS_CONTROLES) if c else "non produite ou non contrôlée")
        lignes.append(f"| {source} | [page]({url}) | {'oui' if url in hors_sujet else ''} | " + " | ".join(cases) + " |")
    return "\n".join(lignes) + "\n"


# ---------------------------------------------------------------- entrée

def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--collecter", action="store_true")
    parser.add_argument("--extraire", action="store_true")
    parser.add_argument("--moteur", default="ollama", choices=["ollama"])
    parser.add_argument("--modele", default="mistral:7b-instruct")
    parser.add_argument("--limite", type=int, help="n'extraire que les N premières fiches (essai)")
    parser.add_argument("--verifier", metavar="FICHIER")
    parser.add_argument("--estimer", action="store_true")
    parser.add_argument("--rapport", action="store_true")
    args = parser.parse_args()

    resultats = json.loads(RESULTATS_DECOUVERTE.read_text(encoding="utf-8"))
    rubriques = choisir_rubriques(resultats)

    if args.collecter:
        asyncio.run(collecter(rubriques))
    if args.extraire:
        extraire(rubriques, args.moteur, args.modele, args.limite)
    if args.verifier:
        return 1 if verifier(Path(args.verifier)) else 0
    if args.estimer:
        estimer(rubriques)
    if args.rapport:
        controle = json.loads(CONTROLE.read_text(encoding="utf-8")) if CONTROLE.exists() else {}
        fiches = fiches_disponibles(rubriques)
        caracteres = sum(len(lire_fiche(c)[1]) for _, c in fiches)
        total_liens = sum(r["nb_liens_aap"] for r in resultats.values())
        estimation = None
        if fiches:
            e = estimer_cout(caracteres, len(fiches))
            g = estimer_cout(round(caracteres / len(fiches) * total_liens), total_liens)
            estimation = {"nb_fiches": len(fiches), "euros": e["euros"], "euros_global": g["euros"], "total_liens": total_liens}
        chemin_non_aap = RESULTS / "echantillon_non_aap.json"
        non_aap = json.loads(chemin_non_aap.read_text(encoding="utf-8")) if chemin_non_aap.exists() else []
        RAPPORT.write_text(rapport(charger_sorties(), controle, estimation, non_aap), encoding="utf-8")
        print(f"Rapport écrit : {RAPPORT.name}")
    if not any([args.collecter, args.extraire, args.verifier, args.estimer, args.rapport]):
        parser.print_help()
    return 0


if __name__ == "__main__":
    sys.exit(main())
