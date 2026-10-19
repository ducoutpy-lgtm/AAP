"""Extraction locale globale : toutes les pages des rubriques validées, par le modèle local, fiches « à vérifier ».

Changement OpenSpec extraction-locale-globale (décision de Monsieur DUCOUT du 2026-10-13 : zéro euro, risque
d'erreurs de l'échantillon accepté). Réutilise la chaîne d'echantillon.py (question fermée « est-ce un appel ? »,
extraction JSON contrainte, contrôle des formats, écriture fiche par fiche avec reprise) sur les sources du registre
en « rubrique confirmée », au lieu des 10 rubriques de l'échantillon.

Usage (depuis scraping/, environnement .venv) :
  python extraction_locale.py --bilan                      # avancement, sans appel au modèle
  python extraction_locale.py --collecter [--ids a,b]      # texte de chaque lien web (navigateur), une adresse une fois
  python extraction_locale.py --extraire --modele qwen3:8b [--limite N] [--ids a,b]
                                                           # fiches -> results/extraction_locale.json (reprise)
  python extraction_locale.py --extraire --moteur api --dry-run
                                                           # V4 : devis (textes restants, coût estimé, cumul, plafond), aucun appel
  python extraction_locale.py --extraire --moteur api [--modele claude-haiku-5-5] [--plafond 5] [--limite N]
                                                           # V4, après accord écrit : fiches -> results/extraction_api.json

V4 (changement extraction-api-v4, décision de Monsieur DUCOUT du 2026-10-19) : même chaîne, moteur API payant ; le
devis est écrit avant tout appel, le plafond cumulé arrête l'outil avant l'appel qui le dépasserait. Sans --moteur api,
aucun appel à l'API Anthropic n'est fait par ce script.
"""
from __future__ import annotations

import argparse
import asyncio
import json
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import echantillon  # noqa: E402
from echantillon import DOSSIER, FICHIERS_IGNORES, ICI, RESULTS, JS_TEXTE, lire_fiche, nettoyer_texte, nom_fiche  # noqa: E402

REGISTRE = ICI / "sources" / "registre.json"
SORTIE = RESULTS / "extraction_locale.json"
SORTIE_API = RESULTS / "extraction_api.json"  # V4 : fiches du moteur API, fichier à part (la V3 reste intacte)
MOTEUR, MODELE_DEFAUT = "ollama", "qwen3:8b"
MODELE_API_DEFAUT, PLAFOND_DEFAUT = "claude-haiku-5-5", 5.0
# Familles du registre dans l'ordre de traitement : les plus proches du champ santé d'abord, les collectivités
# (listes mixtes, 1 528 liens) en dernier (design, décision 4).
ORDRE_FAMILLES = ["ars", "caisse-nationale", "fondation", "agence-nationale", "ministere", "societe-savante",
                  "etablissement", "europe", "autre", "collectivite"]
# Durées constatées sur l'échantillon avec qwen3:8b (ECHANTILLON.md), pour estimer le temps restant.
DUREE_REFUS_S, DUREE_FICHE_S = 22, 69


# ---------------------------------------------------------------- fonctions pures (testées)

def textes_restants(fiches: list[tuple[dict, Path]], chemin_sortie: Path) -> list[tuple[dict, Path]]:
    """Textes pas encore traités par le fichier de sortie donné (fiches, refus, échecs) : ce que le devis compte."""
    deja = {d["scrape_metadata"]["fichier"] for d in echantillon._charger_liste(chemin_sortie)}
    deja |= {e["fichier"] for e in echantillon._charger_liste(chemin_sortie.with_name(chemin_sortie.stem + ".errors.json"))}
    deja |= {r["fichier"] for r in echantillon._charger_liste(chemin_sortie.with_name(chemin_sortie.stem + "_non_aap.json"))}
    return [(r, c) for r, c in fiches if str(c.relative_to(ICI)) not in deja]


def devis(caracteres: list[int], modele: str, tarifs: dict, cumul: float, plafond: float, euro_par_dollar: float) -> str:
    """Texte du devis écrit avant tout appel payant (règle de Monsieur DUCOUT) : hypothèse prudente de trois appels par
    texte (question fermée, extraction, champ), donc un maximum ; le coût réel se lit ensuite dans le journal."""
    estime = sum(echantillon.estimation_appel_euros(c, tarifs, euro_par_dollar) for c in caracteres)
    return (f"Devis : {len(caracteres)} textes restants, {sum(caracteres):,} caractères ; modèle {modele}, tarif "
            f"{tarifs['entree']} USD entrée et {tarifs['sortie']} USD sortie par million de jetons ; coût estimé "
            f"{estime:.2f} euros au plus (trois appels par texte) ; déjà dépensé pour ce modèle {cumul:.3f} euros ; "
            f"plafond {plafond:.2f} euros" + (" : DÉPASSEMENT possible, l'outil s'arrêtera avant" if cumul + estime > plafond else ""))


def sources_confirmees(registre: list[dict], ids: set[str] | None = None) -> list[dict]:
    """Sources en rubrique confirmée, dans l'ordre des familles puis du registre ; limitées à ids si donné."""
    rang = {f: i for i, f in enumerate(ORDRE_FAMILLES)}
    retenues = [s for s in registre if (s.get("qualification") or {}).get("verdict") == "rubrique-confirmee"
                and (ids is None or s["id"] in ids)]
    return sorted(retenues, key=lambda s: rang.get(s.get("categorie"), len(ORDRE_FAMILLES)))


def liens_web(liens: list[dict], vus: set[str]) -> list[dict]:
    """Liens de pages web (pas de fichier à télécharger), jamais vus ; vus est complété au passage."""
    retenus = []
    for lien in liens:
        href = lien["href"]
        if href in vus or href.split("?")[0].lower().endswith(FICHIERS_IGNORES):
            continue
        vus.add(href)
        retenus.append(lien)
    return retenus


def bilan(nb_sources: int, nb_liens: int, nb_textes: int, fiches: list[dict], refusees: list[dict], echecs: list[dict]) -> str:
    """Compteurs d'avancement et temps restant estimé d'après les durées constatées."""
    traitees = len(fiches) + len(refusees) + len(echecs)
    temps = sum(f.get("scrape_metadata", {}).get("duree_s", 0) for f in fiches) + sum(r.get("duree_s", 0) for r in refusees)
    restantes = max(nb_textes - traitees, 0)
    if traitees:
        part_fiches = len(fiches) / traitees
        par_page = part_fiches * DUREE_FICHE_S + (1 - part_fiches) * DUREE_REFUS_S
    else:
        par_page = (DUREE_FICHE_S + DUREE_REFUS_S) / 2
    return "\n".join([
        f"Sources en rubrique confirmée : {nb_sources}",
        f"Pages web candidates (adresses uniques) : {nb_liens}",
        f"Textes collectés : {nb_textes}",
        f"Fiches produites : {len(fiches)} (dont {sum(1 for f in fiches if f.get('scrape_metadata', {}).get('a_relire'))} à relire)",
        f"Pages refusées (pas la fiche d'un appel) : {len(refusees)}",
        f"Échecs : {len(echecs)}",
        f"Temps de calcul cumulé : {temps / 3600:.1f} h",
        f"Textes restant à traiter : {restantes}, soit environ {restantes * par_page / 3600:.1f} h estimées",
    ])


# ---------------------------------------------------------------- collecte (navigateur)

def rubriques(ids: set[str] | None = None) -> list[dict]:
    registre = json.loads(REGISTRE.read_text(encoding="utf-8"))
    return [{"id": s["id"], "nom": s["nom"], "categorie": s.get("categorie", "")} for s in sources_confirmees(registre, ids)]


def liens_par_source(sources: list[dict]) -> dict[str, list[dict]]:
    """Liens web uniques de chaque source, dans l'ordre de traitement (une adresse va à la première source)."""
    vus, resultat = set(), {}
    for s in sources:
        chemin = DOSSIER / s["id"] / "liens.json"
        liens = json.loads(chemin.read_text(encoding="utf-8"))["liens"] if chemin.exists() else []
        resultat[s["id"]] = liens_web(liens, vus)
    return resultat


async def collecter(sources: list[dict]) -> None:
    """Même méthode que echantillon.collecter, sur tous les liens web ; une adresse n'est lue qu'une fois."""
    from playwright.async_api import async_playwright
    from utils import accept_cookies, make_browser_context

    par_source = liens_par_source(sources)
    total_lues = 0
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        try:
            for s in sources:
                liens = par_source[s["id"]]
                if not liens:
                    continue
                dossier_fiches = DOSSIER / s["id"] / "fiches"
                dossier_fiches.mkdir(parents=True, exist_ok=True)
                contexte = await make_browser_context(browser)
                page = await contexte.new_page()
                presentes = lues = 0
                for lien in liens:
                    chemin = dossier_fiches / nom_fiche(lien["href"])
                    if chemin.exists():
                        presentes += 1
                        continue
                    try:
                        await page.goto(lien["href"], wait_until="domcontentloaded", timeout=30000)
                        await accept_cookies(page)
                        texte = nettoyer_texte(await page.evaluate(JS_TEXTE))
                    except Exception as err:
                        print(f"  {s['id']} : {lien['href']} -> {type(err).__name__}")
                        continue
                    if len(texte) < 200:
                        print(f"  {s['id']} : {lien['href']} -> texte trop court, ignoré")
                        continue
                    chemin.write_text(echantillon.en_tete_collecte() + f"{lien['href']}\n{lien['texte']}\n\n{texte}", encoding="utf-8")
                    lues += 1
                    await asyncio.sleep(2.0)  # rythme humain
                await contexte.close()
                total_lues += lues
                print(f"{s['categorie']:16} {s['nom'][:45]:45} {presentes} déjà présentes, {lues} lues sur {len(liens)}")
        finally:
            await browser.close()
    print(f"\n{total_lues} pages lues à ce passage.")


# ---------------------------------------------------------------- entrée

def main() -> int:
    from utils import ensure_utf8_stdout
    ensure_utf8_stdout()
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--collecter", action="store_true")
    parser.add_argument("--extraire", action="store_true")
    parser.add_argument("--bilan", action="store_true")
    parser.add_argument("--modele", help=f"{MODELE_DEFAUT} en local, {MODELE_API_DEFAUT} avec --moteur api")
    parser.add_argument("--moteur", choices=["ollama", "api"], default=MOTEUR, help="ollama (V3, défaut) ou api (V4, payant)")
    parser.add_argument("--plafond", type=float, default=PLAFOND_DEFAUT, help="avec --moteur api : dépense cumulée maximale en euros")
    parser.add_argument("--dry-run", action="store_true", help="avec --moteur api : écrire le devis, n'appeler rien")
    parser.add_argument("--limite", type=int, help="n'extraire que les N premiers textes (essai)")
    parser.add_argument("--ids", help="identifiants de sources séparés par des virgules")
    args = parser.parse_args()
    modele = args.modele or (MODELE_API_DEFAUT if args.moteur == "api" else MODELE_DEFAUT)

    ids = {i.strip() for i in args.ids.split(",")} if args.ids else None
    sources = rubriques(ids)

    if args.collecter:
        asyncio.run(collecter(sources))
    if args.extraire and args.moteur == "api":
        import extractor
        if modele not in extractor.TARIFS_USD_PAR_MTOK:
            print(f"Tarif inconnu pour {modele} : l'ajouter à extractor.TARIFS_USD_PAR_MTOK avant tout appel.", file=sys.stderr)
            return 1
        fiches = textes_restants(echantillon.fiches_disponibles(sources), SORTIE_API)[:args.limite]
        caracteres = []
        for _, chemin in fiches:
            _, texte = lire_fiche(chemin)
            caracteres.append(len(texte.split("\n", 1)[1] if "\n" in texte else texte))
        print(devis(caracteres, modele, extractor.TARIFS_USD_PAR_MTOK[modele], echantillon.cout_cumule(modele), args.plafond,
                    extractor.EURO_PAR_DOLLAR))
        if args.dry_run:
            print("Essai à blanc : aucun appel, rien d'écrit.")
            return 0
        echantillon.extraire_api({}, modele, args.limite, args.plafond, chemin_sortie=SORTIE_API,
                                 fiches=echantillon.fiches_disponibles(sources), metadonnees={"a_verifier": True})
    elif args.extraire:
        echantillon.extraire(sources, MOTEUR, modele, args.limite, chemin_sortie=SORTIE,
                             metadonnees={"a_verifier": True})
    if args.bilan:
        nb_liens = sum(len(l) for l in liens_par_source(sources).values())
        nb_textes = len(echantillon.fiches_disponibles(sources))
        fiches = echantillon._charger_liste(SORTIE)
        refusees = echantillon._charger_liste(SORTIE.with_name(SORTIE.stem + "_non_aap.json"))
        echecs = echantillon._charger_liste(SORTIE.with_name(SORTIE.stem + ".errors.json"))
        print(bilan(len(sources), nb_liens, nb_textes, fiches, refusees, echecs))
    if not any([args.collecter, args.extraire, args.bilan]):
        parser.print_help()
    return 0


if __name__ == "__main__":
    sys.exit(main())
