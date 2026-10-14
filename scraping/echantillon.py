"""Échantillon d'extraction : des liens d'AAP découverts aux fiches AapNormalized, par trois moteurs.

Usage :
  python echantillon.py --collecter                 # texte de 5 fiches max pour 10 rubriques (navigateur)
  python echantillon.py --extraire --moteur ollama --modele mistral:7b-instruct
                                                    # fiches par le modèle local, fichier par modèle
                                                    # (results/echantillon_ollama_<modele>.json), écrit au fil de l'eau
  python echantillon.py --controler --modele mistral:7b-instruct
                                                    # comparaison automatique aux fiches de référence -> grille de contrôle
  python echantillon.py --verifier results/echantillon_claude_code.json
  python echantillon.py --estimer                   # coût API Anthropic estimé, sans appel
  python echantillon.py --rapport                   # ECHANTILLON.md à partir des résultats et de la grille de contrôle

Second tour (changement extraction-ollama-second-tour) : pour chaque texte, le modèle local répond d'abord
à la question fermée « est-ce la fiche d'un appel à projets ? » ; l'extraction n'a lieu que si oui ; les
formats (dates, montants, financeur) sont contrôlés, redemandés une fois au modèle en citant l'écart, puis
mis à null avec la marque « à relire » si l'écart persiste.

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
import unicodedata
import urllib.request
from datetime import date as _date
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from schema import AapNormalized  # noqa: E402

ICI = Path(__file__).resolve().parent
DOSSIER = ICI / "decouverte"
RESULTATS_DECOUVERTE = DOSSIER / "resultats.json"
RESULTS = ICI / "results"
CONTROLE = RESULTS / "controle_echantillon.json"
REFERENCE = RESULTS / "echantillon_claude_code.json"  # fiches validées par Monsieur DUCOUT : la référence
NON_AAP = RESULTS / "echantillon_non_aap.json"  # pages jugées hors sujet par la session
RAPPORT = ICI / "ECHANTILLON.md"

# Seuil fixé par Monsieur DUCOUT le 2026-10-13 pour retenir un modèle local (sur 24 fiches de référence
# et 21 pages hors sujet).
SEUIL_JUSTES = 20
SEUIL_FABRIQUEES = 2

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
CHAMPS_CONTROLES = ("titre", "financeur", "date_cloture", "montant")
DATE_ISO = re.compile(r"^\d{4}-\d{2}-\d{2}$")
FINANCEURS_VIDES = {"", "non spécifié", "non specifie", "non spécifiée", "pas de mention", "inconnu", "n/a", "null"}
MOTS_VIDES = {"de", "du", "des", "la", "le", "les", "et", "en", "pour", "the", "d", "l", "une", "un"}

# Question fermée posée avant toute extraction : même forme que la qualification (où le modèle local
# a eu 83 % d'accord), pour qu'il ne fabrique plus une fiche à partir d'une page sans rapport.
SCHEMA_EST_AAP = {
    "type": "object",
    "properties": {"est_aap": {"type": "boolean"}, "raison": {"type": "string"}},
    "required": ["est_aap", "raison"],
}
CONSIGNE_EST_AAP = (
    "Tu lis le texte d'une page web d'un organisme français. Réponds en JSON. est_aap : true si la page "
    "est la fiche d'UN appel à projets, appel à candidatures, appel à manifestation d'intérêt, bourse ou "
    "prix auquel on peut candidater, avec son objet et ses conditions ou son calendrier ; false si c'est "
    "une liste de plusieurs appels, un calendrier, une page de résultats de recherche, une page "
    "d'information, de présentation, de tarifs, un communiqué, un article ou un formulaire sans appel. "
    "raison : une phrase en français."
)

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

# Numero de version de la consigne d'extraction : a incrementer a chaque modification de CONSIGNE ou de
# CONSIGNE_EST_AAP, pour savoir avec quelle consigne une fiche a ete produite (audit du 2026-10-14, M1).
VERSION_CONSIGNE = 3  # 1 : premier tour ; 2 : question fermee et controle des formats ; 3 : inchangee, numerotee

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


def nom_modele(modele: str) -> str:
    """mistral:7b-instruct -> mistral-7b-instruct (nom de fichier sûr)."""
    return re.sub(r"[^a-z0-9]+", "-", modele.lower()).strip("-")


def fichier_sortie(moteur: str, modele: str) -> Path:
    if moteur == "claude_code":
        return REFERENCE
    return RESULTS / f"echantillon_{moteur}_{nom_modele(modele)}.json"


def cle_controle(moteur: str, modele: str) -> str:
    """Clé de la grille de contrôle ; la colonne claude_code (relue à la main) n'est jamais écrasée."""
    return "claude_code_auto" if moteur == "claude_code" else f"{moteur}_{nom_modele(modele)}"


def _date_valide(valeur: str) -> bool:
    try:
        _date.fromisoformat(valeur)
        return True
    except ValueError:
        return False


def ecarts_format(brut: dict) -> list[str]:
    """Écarts de format d'une fiche brute, en français, pour les renvoyer au modèle."""
    ecarts = []
    for champ in ("date_ouverture", "date_cloture"):
        v = brut.get(champ)
        if v is not None and not (isinstance(v, str) and DATE_ISO.match(v) and _date_valide(v)):
            ecarts.append(f"{champ} doit être au format AAAA-MM-JJ ou null (reçu : {v!r})")
    for champ in ("montant_min", "montant_max"):
        v = brut.get(champ)
        if v is not None and (isinstance(v, bool) or not isinstance(v, int)):
            ecarts.append(f"{champ} doit être un entier en euros ou null (reçu : {v!r})")
    v = brut.get("enveloppe_globale")
    if v is not None and not (isinstance(v, str) and re.search(r"\d", v)):
        ecarts.append(f"enveloppe_globale doit contenir un montant chiffré ou être null (reçu : {v!r})")
    financeur = (brut.get("financeur") or "").strip()
    if financeur.lower() in FINANCEURS_VIDES:
        ecarts.append(f"financeur doit être le nom de l'organisme qui lance l'appel, tel qu'écrit dans le texte (reçu : {financeur!r})")
    return ecarts


def neutraliser(brut: dict, ecarts: list[str]) -> dict:
    """Met à null les champs encore en écart : une valeur absente vaut mieux qu'une valeur fausse."""
    corrige = dict(brut)
    for ecart in ecarts:
        champ = ecart.split(" ", 1)[0]
        corrige[champ] = "" if champ == "financeur" else None  # financeur vide -> nom de la rubrique (valider_fiche)
    return corrige


def normaliser_titre(texte: str | None) -> str:
    texte = unicodedata.normalize("NFKD", texte or "").encode("ascii", "ignore").decode().lower()
    return " ".join(re.sub(r"[^a-z0-9]+", " ", texte).split())


def _mots(texte: str | None) -> set[str]:
    return {m for m in normaliser_titre(texte).split() if m not in MOTS_VIDES}


def nombre_dans(texte: str | None) -> int | None:
    """Premier montant d'une chaîne ('10,5 millions d'euros' -> 10500000, '400 000 €' -> 400000)."""
    if not texte:
        return None
    m = re.search(r"(\d[\d  .]*(?:,\d+)?)\s*(millions?|M\s?(?:€|eur))?", str(texte), re.I)
    if not m:
        return None
    chiffre = m.group(1).replace(" ", "").replace(" ", "").replace(".", "").replace(",", ".")
    try:
        valeur = float(chiffre)
    except ValueError:
        return None
    return int(round(valeur * (1_000_000 if m.group(2) else 1)))


MOIS = ["janvier", "fevrier", "mars", "avril", "mai", "juin", "juillet", "aout", "septembre", "octobre", "novembre", "decembre"]


def date_dans_texte(date_iso: str | None, texte: str) -> bool:
    """La date (AAAA-MM-JJ) figure-t-elle dans le texte, en chiffres ou en toutes lettres ('23 septembre 2024') ?"""
    if not date_iso or not DATE_ISO.match(date_iso) or not texte:
        return False
    annee, mois, jour = date_iso.split("-")
    t = normaliser_titre(texte)
    formes = (f"{int(jour)} {MOIS[int(mois) - 1]} {annee}", f"{jour} {MOIS[int(mois) - 1]} {annee}",
              f"{jour} {mois} {annee}", f"{int(jour)} {mois} {annee}", f"{annee} {mois} {jour}")
    return any(f in t for f in formes)


def comparer_fiche(produite: dict, reference: dict, texte_page: str = "") -> dict:
    """Les quatre champs contrôlés d'une fiche produite, comparés à la fiche de référence de même adresse.

    Le texte de la page, s'il est donné, départage les cas où la référence a reformulé le titre ou retenu
    une autre échéance que le modèle (appels à deux dates) : une valeur confirmée par la page est juste.
    """
    tp, tr = normaliser_titre(produite.get("titre")), normaliser_titre(reference.get("titre"))
    mp, mr = _mots(produite.get("financeur")), _mots(reference.get("financeur"))
    page = normaliser_titre(texte_page)
    mots_tp, mots_tr = set(tp.split()), set(tr.split())
    titre = bool(tp) and (tp == tr or tp in tr or tr in tp
                          or (mots_tp and mots_tr and 2 * len(mots_tp & mots_tr) >= len(mots_tp | mots_tr))
                          or (len(tp) >= 15 and tp in page))
    dp, dr = produite.get("date_cloture") or None, reference.get("date_cloture") or None
    return {
        "titre": titre,
        "financeur": bool(mp and mr) and 2 * len(mp & mr) >= min(len(mp), len(mr)),
        "date_cloture": dp == dr or (dp is not None and date_dans_texte(dp, texte_page)),
        # Les montants cités doivent être les mêmes, quel que soit le champ (une enveloppe de 400 000 euros
        # et un montant maximal de 400 000 euros disent la même chose).
        "montant": montants_cites(produite) == montants_cites(reference),
    }


def montants_cites(fiche: dict) -> set[int]:
    return {v for v in (fiche.get("montant_min"), fiche.get("montant_max"), nombre_dans(fiche.get("enveloppe_globale")))
            if v is not None}


def verdict_seuil(justes: int, fabriquees: int) -> str:
    return "seuil atteint" if justes >= SEUIL_JUSTES and fabriquees <= SEUIL_FABRIQUEES else "seuil non atteint"


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


def appeler_ollama(modele: str, messages: list[dict], schema: dict) -> dict:
    corps = {"model": modele, "stream": False, "format": schema, "options": {"temperature": 0, "num_ctx": 16384},
             "messages": messages}
    requete = urllib.request.Request(OLLAMA_URL, data=json.dumps(corps).encode("utf-8"),
                                     headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(requete, timeout=600) as reponse:
        return json.loads(json.loads(reponse.read())["message"]["content"])


def _charger_liste(chemin: Path) -> list:
    return json.loads(chemin.read_text(encoding="utf-8")) if chemin.exists() else []


def _ecrire_json(chemin: Path, donnees) -> None:
    chemin.write_text(json.dumps(donnees, ensure_ascii=False, indent=2), encoding="utf-8")


def extraire(rubriques: list[dict], moteur: str, modele: str, limite: int | None,
             chemin_sortie: Path | None = None, metadonnees: dict | None = None) -> None:
    """Question fermée, extraction, contrôle des formats avec seconde chance ; écriture au fil de l'eau, reprise.

    chemin_sortie et metadonnees servent à l'extraction locale globale (extraction_locale.py) : un autre fichier
    de sortie que celui de l'échantillon, et des champs ajoutés à scrape_metadata (a_verifier).
    """
    fiches = fiches_disponibles(rubriques)[:limite]
    RESULTS.mkdir(exist_ok=True)
    chemin_sortie = chemin_sortie or fichier_sortie(moteur, modele)
    chemin_echecs = chemin_sortie.with_name(chemin_sortie.stem + ".errors.json")
    chemin_refus = chemin_sortie.with_name(chemin_sortie.stem + "_non_aap.json")
    sortie, echecs, refusees = _charger_liste(chemin_sortie), _charger_liste(chemin_echecs), _charger_liste(chemin_refus)
    deja = ({d["scrape_metadata"]["fichier"] for d in sortie} | {e["fichier"] for e in echecs} | {r["fichier"] for r in refusees})
    print(f"{sum(1 for _, c in fiches if str(c.relative_to(ICI)) in deja)} pages déjà traitées sur {len(fiches)}")
    debut, nouvelles = time.time(), 0
    for i, (rubrique, chemin) in enumerate(fiches, 1):
        rel = str(chemin.relative_to(ICI))
        if rel in deja:
            continue
        url, texte = lire_fiche(chemin)
        texte = texte.split("\n", 1)[1] if "\n" in texte else texte  # saute le texte du lien
        page = f"URL source : {url}\n\nTexte de la page :\n{texte}"
        t0 = time.time()
        try:
            avis = appeler_ollama(modele, [{"role": "system", "content": CONSIGNE_EST_AAP}, {"role": "user", "content": page}], SCHEMA_EST_AAP)
            if not avis.get("est_aap"):
                refusees.append({"fichier": rel, "url": url, "source": rubrique["id"], "raison": avis.get("raison", ""),
                                 "duree_s": round(time.time() - t0, 1)})
                _ecrire_json(chemin_refus, refusees)
                print(f"[{i}/{len(fiches)}] refusée {chemin.name} {avis.get('raison', '')[:70]}")
                continue
            messages = [{"role": "system", "content": CONSIGNE}, {"role": "user", "content": page}]
            brut = appeler_ollama(modele, messages, SCHEMA_FICHE)
            ecarts, a_relire = ecarts_format(brut), False
            if ecarts:
                messages += [{"role": "assistant", "content": json.dumps(brut, ensure_ascii=False)},
                             {"role": "user", "content": "Corrige ces écarts et renvoie la fiche complète : " + " ; ".join(ecarts)}]
                brut = appeler_ollama(modele, messages, SCHEMA_FICHE)
                ecarts = ecarts_format(brut)
                if ecarts:
                    brut, a_relire = neutraliser(brut, ecarts), True
            fiche = valider_fiche(brut, url, rubrique["nom"])
        except Exception as err:
            echecs.append({"fichier": rel, "erreur": type(err).__name__ + ": " + str(err).splitlines()[0][:160]})
            _ecrire_json(chemin_echecs, echecs)
            print(f"[{i}/{len(fiches)}] échec   {chemin.name} {echecs[-1]['erreur'][:80]}")
            continue
        duree = round(time.time() - t0, 1)
        d = fiche.model_dump()
        d["scrape_metadata"] = {"source": rubrique["id"], "moteur": moteur, "modele": modele, "duree_s": duree,
                                "fichier": rel, "a_relire": a_relire, "ecarts": ecarts,
                                "produite_le": time.strftime("%Y-%m-%dT%H:%M:%S"), "version_consigne": VERSION_CONSIGNE,
                                **(metadonnees or {})}
        sortie.append(d)
        nouvelles += 1
        _ecrire_json(chemin_sortie, sortie)  # écrit à chaque fiche : un arrêt ne perd rien, la relance reprend
        print(f"[{i}/{len(fiches)}] ok {duree:5.0f}s  {fiche.titre[:60]}" + ("  (à relire)" if a_relire else ""))
    print(f"\n{len(refusees)} pages refusées, {len(sortie)} réussites ({nouvelles} nouvelles), {len(echecs)} échecs, "
          f"{time.time() - debut:.0f} s pour ce passage ({modele}) -> {chemin_sortie.name}")


def controler(moteur: str, modele: str) -> None:
    """Compare les fiches produites aux fiches de référence et remplit la grille de contrôle sous la clé du modèle."""
    cle = cle_controle(moteur, modele)
    produites = _charger_liste(fichier_sortie(moteur, modele))
    reference = {f["url_source"]: f for f in _charger_liste(REFERENCE)}
    hors_sujet = {n["url"] for n in _charger_liste(NON_AAP)}
    controle = json.loads(CONTROLE.read_text(encoding="utf-8")) if CONTROLE.exists() else {}
    comparees = justes = fabriquees = sans_reference = 0
    for f in produites:
        url = f["url_source"]
        entree = controle.setdefault(url, {})
        if url in hors_sujet:
            entree[cle] = {champ: False for champ in CHAMPS_CONTROLES} | {"motif": "page hors sujet, fiche produite à tort"}
            fabriquees += 1
        elif url in reference:
            chemin_page = ICI / f.get("scrape_metadata", {}).get("fichier", "")
            texte_page = lire_fiche(chemin_page)[1] if chemin_page.is_file() else ""
            entree[cle] = comparer_fiche(f, reference[url], texte_page)
            comparees += 1
            justes += fiche_juste(entree[cle])
        else:
            sans_reference += 1
    CONTROLE.write_text(json.dumps(controle, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"{comparees} fiches comparées à la référence : {justes} justes sur les quatre champs ; "
          f"{fabriquees} fabriquées à tort ; {sans_reference} sans référence ; {verdict_seuil(justes, fabriquees)} "
          f"(au moins {SEUIL_JUSTES} justes, au plus {SEUIL_FABRIQUEES} fabriquées) -> clé « {cle} »")


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
    """Sorties par clé de contrôle : ollama (premier tour), claude_code, puis un fichier par modèle du second tour."""
    sorties = {}
    for cle, chemin in (("ollama", RESULTS / "echantillon_ollama.json"), ("claude_code", REFERENCE)):
        if chemin.exists():
            sorties[cle] = _charger_liste(chemin)
    for chemin in sorted(RESULTS.glob("echantillon_ollama_*.json")):
        if chemin.name.endswith(".errors.json") or chemin.stem.endswith("_non_aap"):
            continue
        sorties["ollama_" + chemin.stem[len("echantillon_ollama_"):]] = _charger_liste(chemin)
    return sorties


def rapport(sorties: dict[str, list[dict]], controle: dict, estimation: dict | None, non_aap: list[dict] | None = None) -> str:
    hors_sujet = {n["url"] for n in non_aap or []}
    lignes = ["# Extraction sur échantillon : comparaison des moteurs", "",
              "Généré par `python scraping/echantillon.py --rapport`. Contrôle : pour chaque fiche, titre, "
              "financeur, date de clôture et montant comparés à la page d'origine (`results/controle_echantillon.json`), "
              "à la main pour `ollama` (premier tour) et `claude_code`, automatiquement contre les fiches de référence "
              "pour les modèles du second tour (`--controler`).", "",
              f"Seuil fixé par Monsieur DUCOUT (2026-10-13) pour retenir un modèle local : au moins {SEUIL_JUSTES} fiches "
              f"justes sur les 24 de référence et au plus {SEUIL_FABRIQUEES} fiches fabriquées sur les 21 pages hors sujet.", "",
              "## Récapitulatif par moteur", "",
              "| Moteur | Fiches produites | Fiches contrôlées | Fiches justes (4/4) | Fabriquées à tort | Temps total | Coût | Seuil |",
              "|---|---|---|---|---|---|---|---|"]
    for moteur, fiches in sorties.items():
        controlees = [controle[f["url_source"]][moteur] for f in fiches
                      if f["url_source"] in controle and moteur in controle[f["url_source"]]]
        justes = sum(fiche_juste(c) for c in controlees)
        fabriquees = sum(1 for f in fiches if f["url_source"] in hors_sujet)
        temps = sum(f.get("scrape_metadata", {}).get("duree_s", 0) for f in fiches)
        cout = "0 euro"
        lignes.append(f"| {moteur} | {len(fiches)} | {len(controlees)} | {justes} | {fabriquees} | {temps:.0f} s | {cout} | "
                      f"{verdict_seuil(justes, fabriquees)} |")
    if estimation:
        lignes.append(f"| api_anthropic (estimation, aucun appel) | {estimation['nb_fiches']} | - | - | - | - | "
                      f"{estimation['euros']} euros ({estimation['euros_global']} euros pour {estimation['total_liens']} liens) | - |")
    if non_aap:
        lignes += ["", f"Pages lues par la session et jugées hors sujet (liste, présentation, page sans rapport) : {len(non_aap)}. "
                   "Le moteur Ollama, lui, produit une fiche pour chaque page, y compris celles-là : voir la colonne « hors sujet » ci-dessous."]
    lignes += ["", "## Détail par fiche", "", "T = titre, F = financeur, D = date de clôture, M = montant ; "
               "oui / non / vide = non contrôlé.", ""]
    urls = sorted({f["url_source"] for fiches in sorties.values() for f in fiches})
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
    parser.add_argument("--controler", action="store_true", help="comparer les fiches du modèle aux fiches de référence")
    parser.add_argument("--moteur", default="ollama", choices=["ollama", "claude_code"],
                        help="claude_code sert seulement à --controler (auto-contrôle du comparateur)")
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
    if args.controler:
        controler(args.moteur, args.modele)
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
    if not any([args.collecter, args.extraire, args.controler, args.verifier, args.estimer, args.rapport]):
        parser.print_help()
    return 0


if __name__ == "__main__":
    sys.exit(main())
