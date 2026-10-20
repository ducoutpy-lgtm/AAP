"""Rejeu de la collecte et veille des appels (changement OpenSpec rejeu-collecte-veille, lot 2, 2026-10-20).

Pourquoi : la liste des appels doit rester vraie dans le temps. Le rejeu relit la page validée de chaque rubrique
confirmée (adresse de decouverte/<source>/liens.json), compare les liens lus aux liens connus, tient sur chaque lien
apparu_le, vu_le et absences (rejeux consécutifs sans le voir), journalise, collecte le texte des liens nouveaux, marque
les fiches et écrit le rapport VEILLE.md. Zéro euro : aucun appel au modèle ici ; l'extraction des textes nouveaux passe
par extraction_locale.py --extraire --moteur api, avec son devis et l'accord de Monsieur DUCOUT.

Usage (depuis scraping/, environnement ../.venv) :
  python rejeu.py --relire [--ids a,b] [--limite N]     # relit les pages, met à jour liens.json et rejeux.json
  python rejeu.py --collecter [--ids a,b] [--limite N]  # texte des liens nouveaux (les textes existants sont gardés)
  python rejeu.py --marquer                             # vue_rubrique_le et absences sur les fiches des résultats
  python rejeu.py --rapport                             # VEILLE.md
  python rejeu.py --relire --collecter --marquer --rapport   # la veille complète (veille.cmd)

Garde-fous : une page en erreur ou sans lien d'appel lisible ne touche pas aux compteurs de ses liens ; une page déjà
relue le jour même est sautée (sinon une relance compterait une absence de trop) ; une page à la fois, deux secondes de
pause (règle réseau du projet).
"""
from __future__ import annotations

import argparse
import asyncio
import json
import shutil
import sys
import time
from datetime import datetime
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import decouverte  # noqa: E402
import echantillon  # noqa: E402
import extraction_locale  # noqa: E402
from utils import accept_cookies, ensure_utf8_stdout, make_browser_context  # noqa: E402

ICI = Path(__file__).resolve().parent
DOSSIER = ICI / "decouverte"
RESULTS = ICI / "results"
RAPPORT = ICI / "VEILLE.md"
SAUVEGARDES = ICI.parent / "scripts" / "sauvegardes"
SEUIL_PEREMPTION = 2  # rejeux consécutifs sans voir le lien avant de proposer la fiche « à corriger »
IGNORES = ("echantillon_", "controle_", "validation_", "comparaison_")


# ---------------------------------------------------------------- fonctions pures (testées)

def comparer_liens(anciens: list[dict], relus: list[dict] | None, jour: str) -> tuple[list[dict], dict]:
    """Fusion des liens connus et des liens relus, et bilan du rejeu.

    relus vide ou None : page en erreur ou sans lien lisible, les anciens sont rendus tels quels et le bilan est marqué
    « ignore ». Sinon : un lien revu reprend absences = 0 et vu_le = jour ; un lien nouveau est ajouté (apparu_le = jour) ;
    un lien connu non revu voit absences augmenter de 1, vu_le inchangé. Ordre : la page relue, puis les disparus."""
    if not relus:
        return anciens, {"nouveaux": [], "disparus": [], "vus": 0, "ignore": True}
    par_href: dict[str, dict] = {l["href"]: dict(l) for l in anciens}
    vus = {l["href"] for l in relus}
    nouveaux, disparus = [], []
    for l in relus:
        if l["href"] in par_href:
            e = par_href[l["href"]]
            e.setdefault("apparu_le", "")
            e.update({"vu_le": jour, "absences": 0, "texte": l.get("texte") or e.get("texte", ""),
                      "score": l.get("score", e.get("score", 0))})
        else:
            par_href[l["href"]] = {"texte": l.get("texte", ""), "href": l["href"], "score": l.get("score", 0),
                                   "apparu_le": jour, "vu_le": jour, "absences": 0}
            nouveaux.append(l["href"])
    for href, e in par_href.items():
        if href not in vus:
            e.setdefault("apparu_le", "")
            e.setdefault("vu_le", "")
            e["absences"] = int(e.get("absences") or 0) + 1
            disparus.append(href)
    fusion = [par_href[l["href"]] for l in relus] + [par_href[h] for h in disparus]
    return fusion, {"nouveaux": nouveaux, "disparus": disparus, "vus": len(relus), "ignore": False}


def deja_relue(donnees: dict, jour: str) -> bool:
    """Vrai si la page a déjà été relue ce jour : une seconde relecture le même jour compterait une absence de trop
    aux liens disparus (garde-fou pour la veille planifiée et les relances à la main)."""
    return donnees.get("dernier_rejeu") == jour


def marquer_fiches(fiches: list[dict], liens_par_source: dict[str, dict[str, dict]]) -> int:
    """Reporte vu_le et absences du lien de même adresse sur scrape_metadata (vue_rubrique_le, absences).
    Retourne le nombre de fiches marquées. Une fiche sans lien connu n'est pas touchée."""
    marquees = 0
    for f in fiches:
        meta = f.setdefault("scrape_metadata", {})
        lien = liens_par_source.get(meta.get("source") or "", {}).get(f.get("url_source") or "")
        if not lien or not lien.get("vu_le"):
            continue
        meta["vue_rubrique_le"] = lien["vu_le"]
        meta["absences"] = int(lien.get("absences") or 0)
        marquees += 1
    return marquees


def fiches_perimables(fiches: list[dict], seuil: int = SEUIL_PEREMPTION) -> list[dict]:
    """Fiches dont le lien a manqué au moins `seuil` rejeux consécutifs."""
    return [f for f in fiches if int((f.get("scrape_metadata") or {}).get("absences") or 0) >= seuil]


def rapport_markdown(journaux: dict[str, list[dict]], perimables: list[dict], aujourdhui: str) -> str:
    """VEILLE.md : dernier rejeu par source (vus, nouveaux, disparus, erreur), liens nouveaux et disparus détaillés,
    fiches à péremption."""
    derniers = {sid: bilans[-1] for sid, bilans in journaux.items() if bilans}
    relues = [b for b in derniers.values() if not b.get("ignore")]
    erreurs = [b for b in derniers.values() if b.get("ignore")]
    lignes = [
        "# Veille des appels : rejeu des pages validées", "",
        f"Changement OpenSpec `rejeu-collecte-veille`. Rapport du {aujourdhui}. Zéro euro : relecture des pages seulement.", "",
        "## Dernier rejeu par source", "",
        f"- Sources relues : {len(relues)} ; en erreur ou sans lien lisible (compteurs inchangés) : {len(erreurs)}",
        f"- Liens vus : {sum(b.get('vus', 0) for b in relues)} ; nouveaux : {sum(len(b.get('nouveaux', [])) for b in relues)} ; "
        f"disparus : {sum(len(b.get('disparus', [])) for b in relues)}", "",
        "| Source | Date | Liens vus | Nouveaux | Disparus | Erreur |", "|---|---|---|---|---|---|",
    ]
    for sid, b in sorted(derniers.items()):
        lignes.append(f"| {b.get('nom', sid)} | {b.get('date', '')[:16]} | {b.get('vus', 0)} | {len(b.get('nouveaux', []))} | "
                      f"{len(b.get('disparus', []))} | {b.get('erreur') or ''} |")
    lignes += ["", "## Liens nouveaux au dernier rejeu", ""]
    nouveaux = [(b.get("nom", sid), h) for sid, b in sorted(derniers.items()) for h in b.get("nouveaux", [])]
    lignes += [f"- {nom} : {h}" for nom, h in nouveaux] or ["Aucun."]
    lignes += ["", "## Liens disparus au dernier rejeu", ""]
    disparus = [(b.get("nom", sid), h) for sid, b in sorted(derniers.items()) for h in b.get("disparus", [])]
    lignes += [f"- {nom} : {h}" for nom, h in disparus] or ["Aucun."]
    lignes += ["", f"## Fiches absentes de leur page depuis au moins {SEUIL_PEREMPTION} rejeux", "",
               "À passer « à corriger » par `scripts/perimer_fiches.py` (essai à blanc, sauvegarde, accord de Monsieur DUCOUT).", ""]
    lignes += [f"- {(f.get('titre') or '')[:80]} ({(f.get('scrape_metadata') or {}).get('source', '')}, {(f.get('scrape_metadata') or {}).get('absences')} absences, "
               f"vue le {(f.get('scrape_metadata') or {}).get('vue_rubrique_le', '')[:10]}) : {f.get('url_source', '')}" for f in perimables] or ["Aucune."]
    return "\n".join(lignes) + "\n"


# ---------------------------------------------------------------- navigateur

async def relire_source(browser, url: str) -> tuple[list[dict] | None, str | None]:
    """Relit une page validée ; retourne (liens d'appels, None) ou (None, erreur)."""
    contexte = await make_browser_context(browser)
    await contexte.route("**/*", lambda route: route.abort() if route.request.resource_type in ("image", "media", "font") else route.continue_())
    page = await contexte.new_page()
    try:
        code, erreur = await decouverte.ouvrir(page, url)
        if erreur or code is None or code >= 400:
            return None, erreur or f"HTTP {code}"
        await accept_cookies(page)
        base = page.url.split("#")[0]
        _, trouves = decouverte.choisir_rubrique([await decouverte.lire_page(page)], base)
        return (trouves or None), (None if trouves else "aucun lien d'appel lisible (moins de deux)")
    except Exception as err:  # noqa: BLE001 - toute erreur de navigation : la source est ignorée ce rejeu
        return None, type(err).__name__ + ": " + str(err).splitlines()[0][:120]
    finally:
        await contexte.close()


async def relire(sources: list[dict]) -> list[dict]:
    from playwright.async_api import async_playwright

    jour = time.strftime("%Y-%m-%d")
    bilans = []
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        try:
            for s in sources:
                dossier, chemin = DOSSIER / s["id"], DOSSIER / s["id"] / "liens.json"
                bilan = {"id": s["id"], "nom": s["nom"], "date": time.strftime("%Y-%m-%dT%H:%M:%S"), "url": None, "erreur": None,
                         "vus": 0, "nouveaux": [], "disparus": [], "ignore": True}
                if not chemin.exists():
                    bilan["erreur"] = "pas de liens.json (source jamais découverte)"
                else:
                    donnees = json.loads(chemin.read_text(encoding="utf-8"))
                    bilan["url"] = donnees.get("url")
                    if deja_relue(donnees, jour):
                        bilan["erreur"] = "déjà relue aujourd'hui, compteurs inchangés"
                        bilans.append(bilan)
                        print(f"{s['id'][:40]:40} {bilan['erreur']}")
                        continue
                    relus, erreur = await relire_source(browser, donnees["url"])
                    fusion, b = comparer_liens(donnees.get("liens", []), relus, jour)
                    bilan.update(b, erreur=erreur)
                    if not b["ignore"]:
                        donnees.update(liens=fusion, dernier_rejeu=jour)
                        chemin.write_text(json.dumps(donnees, ensure_ascii=False, indent=1), encoding="utf-8")
                    journal = dossier / "rejeux.json"
                    liste = json.loads(journal.read_text(encoding="utf-8")) if journal.exists() else []
                    liste.append(bilan)
                    journal.write_text(json.dumps(liste, ensure_ascii=False, indent=1), encoding="utf-8")
                    await asyncio.sleep(2.0)  # rythme humain
                bilans.append(bilan)
                etat = f"erreur : {bilan['erreur']}" if bilan["ignore"] else f"{bilan['vus']} liens, {len(bilan['nouveaux'])} nouveaux, {len(bilan['disparus'])} disparus"
                print(f"{s['id'][:40]:40} {etat}")
        finally:
            await browser.close()
    return bilans


# ---------------------------------------------------------------- fichiers

def fichiers_de_resultats() -> list[Path]:
    return sorted(c for c in RESULTS.glob("*.json")
                  if not c.name.startswith(IGNORES) and not c.name.endswith(("_non_aap.json", ".errors.json")))


def liens_connus() -> dict[str, dict[str, dict]]:
    """source -> {href: lien} pour toutes les sources découvertes."""
    resultat: dict[str, dict[str, dict]] = {}
    for chemin in DOSSIER.glob("*/liens.json"):
        donnees = json.loads(chemin.read_text(encoding="utf-8"))
        resultat[chemin.parent.name] = {l["href"]: l for l in donnees.get("liens", []) if l.get("href")}
    return resultat


def marquer() -> int:
    liens = liens_connus()
    dossier = SAUVEGARDES / f"rejeu_{datetime.now().strftime('%Y-%m-%d_%H%M')}"
    total = 0
    for chemin in fichiers_de_resultats():
        fiches = echantillon._charger_liste(chemin)
        if not fiches or not isinstance(fiches[0], dict) or "url_source" not in fiches[0]:
            continue
        n = marquer_fiches(fiches, liens)
        if n:
            dossier.mkdir(parents=True, exist_ok=True)
            shutil.copy2(chemin, dossier / chemin.name)
            echantillon._ecrire_json(chemin, fiches)
        print(f"{chemin.name} : {n} fiches marquées sur {len(fiches)}")
        total += n
    print(f"{total} fiches marquées" + (f" ; sauvegardes dans {dossier}" if total else ""))
    return 0


def rapport() -> int:
    journaux = {}
    for chemin in DOSSIER.glob("*/rejeux.json"):
        journaux[chemin.parent.name] = json.loads(chemin.read_text(encoding="utf-8"))
    perimables = []
    for chemin in fichiers_de_resultats():
        fiches = echantillon._charger_liste(chemin)
        if fiches and isinstance(fiches[0], dict) and "url_source" in fiches[0]:
            perimables += fiches_perimables(fiches)
    RAPPORT.write_text(rapport_markdown(journaux, perimables, time.strftime("%Y-%m-%d")), encoding="utf-8")
    print(f"Rapport écrit : {RAPPORT.name} ({len(journaux)} sources avec journal, {len(perimables)} fiches à péremption)")
    return 0


def main() -> int:
    ensure_utf8_stdout()
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--relire", action="store_true")
    parser.add_argument("--collecter", action="store_true")
    parser.add_argument("--marquer", action="store_true")
    parser.add_argument("--rapport", action="store_true")
    parser.add_argument("--ids", help="identifiants de sources séparés par des virgules")
    parser.add_argument("--limite", type=int, help="les N premières sources confirmées seulement")
    args = parser.parse_args()
    ids = {i.strip() for i in args.ids.split(",")} if args.ids else None
    sources = extraction_locale.rubriques(ids)[: args.limite]
    if args.relire:
        bilans = asyncio.run(relire(sources))
        relues = [b for b in bilans if not b["ignore"]]
        print(f"\n{len(relues)} sources relues, {len(bilans) - len(relues)} ignorées (erreur ou aucun lien), "
              f"{sum(len(b['nouveaux']) for b in relues)} liens nouveaux, {sum(len(b['disparus']) for b in relues)} disparus")
    if args.collecter:
        asyncio.run(extraction_locale.collecter(sources))
    if args.marquer:
        marquer()
    if args.rapport:
        rapport()
    if not any([args.relire, args.collecter, args.marquer, args.rapport]):
        parser.print_help()
    return 0


if __name__ == "__main__":
    sys.exit(main())
