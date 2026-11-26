"""Nettoyage du changement selection-des-appels (2026-11-26) : pages bloquées, marchés publics et relais.

Local (par défaut) : les textes collectés qui sont des pages bloquées sont mis de côté dans `_bloquees/` (la collecte
suivante relit l'adresse) et leurs entrées sont retirées des fichiers de résultats (fiches et refus), sinon le texte
relu serait sauté comme « déjà traité ». Base (--base) : fiches de marchés publics et de pages bloquées rejetées et
archivées ; financeur des fiches de relais corrigé (France 2030, ou « Financeur à préciser »). Les fiches relues par
Monsieur DUCOUT ne sont jamais touchées : elles sont listées.

Essai à blanc par défaut ; --reel écrit après une sauvegarde dans scripts/sauvegardes/.

    python scripts/nettoyer_selection.py                 # essai à blanc local
    python scripts/nettoyer_selection.py --reel          # local : sauvegarde, puis déplacement et réécriture
    python scripts/nettoyer_selection.py --base          # essai à blanc sur la base (une lecture de la collection aap)
    python scripts/nettoyer_selection.py --base --reel   # base : sauvegarde, puis écriture (accord de Monsieur DUCOUT)
"""
from __future__ import annotations

import argparse
import json
import shutil
import sys
from datetime import datetime
from pathlib import Path

ICI = Path(__file__).resolve().parent
SCRAPING = ICI.parent / "scraping"
sys.path.insert(0, str(ICI))
sys.path.insert(0, str(SCRAPING))
import filtres_pages  # noqa: E402
import financeurs  # noqa: E402
import import_to_firestore as imp  # noqa: E402

PAR = imp.PAR_NETTOYAGE  # même libellé que l'import, qui lève le rejet « page bloquée » quand la page est relue
RESULTATS = ("extraction_api.json", "extraction_api_non_aap.json", "extraction_locale.json", "extraction_locale_non_aap.json")
MOTIFS = {"marché public": "marché public", "page bloquée": imp.COMMENTAIRE_PAGE_BLOQUEE}


def _rel(chemin: str) -> str:
    return (chemin or "").replace("\\", "/")


def textes_bloques(decouverte: Path) -> list[Path]:
    """Textes collectés (hors `_bloquees/`) dont le contenu est un écran anti-robot ou « accès refusé »."""
    return sorted(p for p in decouverte.glob("*/fiches/*.txt")
                  if filtres_pages.page_bloquee(p.read_text(encoding="utf-8", errors="replace")))


def sans_entrees(entrees: list[dict], fichiers: set[str]) -> list[dict]:
    """Entrées d'un fichier de résultats sauf celles des textes donnés (chemins « decouverte/... », séparateur libre)."""
    def fichier(e: dict) -> str:
        return _rel((e.get("scrape_metadata") or {}).get("fichier") or e.get("fichier") or "")
    return [e for e in entrees if fichier(e) not in fichiers]


def plan_base(docs: list[tuple[str, dict]], emetteurs: dict, table: dict, jour: str,
              corrections: dict | None = None) -> tuple[list[dict], list[str]]:
    """(plan, relues) : changements à écrire par document, et identifiants des fiches relues par Monsieur DUCOUT qui
    auraient été touchées (jamais écrites ici). Un financeur corrigé par la relecture (corrections_fiches.json) n'est
    jamais recalculé (contre-vérification du 2026-11-26 : « EIT Health » aurait été remplacé)."""
    corrections = corrections or {}
    plan, relues = [], []
    for ident, d in docs:
        v = d.get("validation") or {}
        motif = filtres_pages.fiche_a_exclure(d.get("externalUrl") or "", d.get("description") or "")
        changements: dict = {}
        if motif and not (d.get("status") == "archived" and v.get("statut") == "rejetee"):
            changements = {"status": "archived", "validation": {"statut": "rejetee", "par": PAR, "date": jour,
                                                                  "commentaire": MOTIFS[motif]}}
        meta = d.get("scrapeMetadata") or {}
        emetteur = emetteurs.get(meta.get("source") or "")
        if not changements and emetteur and emetteur.get("relais") and not (corrections.get(ident) or {}).get("financeur"):
            nom = financeurs.financeur_d_un_relais(meta.get("financeurExtrait") or d.get("financeurName"),
                                                   d.get("title"), emetteur, table)
            if nom and nom != d.get("financeurName"):
                changements = {"financeurName": nom}
        if not changements:
            continue
        if v.get("par") == imp.RELECTEUR:
            relues.append(ident)
            continue
        plan.append({"id": ident, "titre": d.get("title"), "changements": changements})
    return plan, relues


def nettoyer_local(reel: bool) -> None:
    bloques = textes_bloques(SCRAPING / "decouverte")
    fichiers = {_rel(str(p.relative_to(SCRAPING))) for p in bloques}
    print(f"Textes bloqués : {len(bloques)}")
    for p in bloques:
        print(f"  {_rel(str(p.relative_to(SCRAPING)))}")
    retraits = {}
    for nom in RESULTATS:
        chemin = SCRAPING / "results" / nom
        if chemin.exists():
            entrees = json.loads(chemin.read_text(encoding="utf-8"))
            restent = sans_entrees(entrees, fichiers)
            retraits[nom] = (entrees, restent)
            print(f"{nom} : {len(entrees) - len(restent)} entrées retirées sur {len(entrees)}")
    if not reel:
        print("Essai à blanc : rien n'est déplacé ni réécrit (option --reel).")
        return
    sauvegarde = ICI / "sauvegardes" / f"selection_local_{datetime.now():%Y-%m-%d_%H%M}"
    sauvegarde.mkdir(parents=True)
    for nom, (_, restent) in retraits.items():
        shutil.copy2(SCRAPING / "results" / nom, sauvegarde / nom)
        (SCRAPING / "results" / nom).write_text(json.dumps(restent, ensure_ascii=False, indent=1), encoding="utf-8")
    for p in bloques:
        (p.parent / "_bloquees").mkdir(exist_ok=True)
        p.replace(p.parent / "_bloquees" / p.name)
    print(f"Sauvegarde des résultats : {sauvegarde} ; {len(bloques)} textes mis de côté.")


def nettoyer_base(reel: bool) -> None:
    import firebase_admin
    from firebase_admin import credentials, firestore

    firebase_admin.initialize_app(credentials.Certificate(str(ICI / "serviceAccountKey.json")))
    db = firestore.client()
    docs = [(s.id, s.to_dict()) for s in db.collection("aap").stream()]  # une seule lecture de la collection
    corrections = json.loads(imp.CORRECTIONS.read_text(encoding="utf-8")) if imp.CORRECTIONS.exists() else {}
    plan, relues = plan_base(docs, imp.EMETTEURS, imp.FINANCEURS, datetime.now().date().isoformat(), corrections)
    print(f"Fiches lues : {len(docs)} ; à modifier : {len(plan)} ; relues par Monsieur DUCOUT, laissées : {len(relues)}")
    for p in plan:
        print(f"  {p['id']} | {str(p['titre'])[:70]} | {json.dumps(p['changements'], ensure_ascii=False)[:120]}")
    for ident in relues:
        print(f"  RELUE, non touchée : {ident}")
    if not reel:
        print("Essai à blanc : rien n'est écrit (option --reel).")
        return
    (ICI / "sauvegardes").mkdir(exist_ok=True)
    chemin = ICI / "sauvegardes" / f"selection_base_{datetime.now():%Y-%m-%d_%H%M}.json"
    touches = {p["id"] for p in plan}
    chemin.write_text(json.dumps({i: d for i, d in docs if i in touches}, ensure_ascii=False, default=str, indent=1),
                      encoding="utf-8")
    print(f"Sauvegarde : {chemin}")
    for debut in range(0, len(plan), 400):
        lot = db.batch()
        for p in plan[debut:debut + 400]:
            lot.update(db.collection("aap").document(p["id"]), p["changements"])
        lot.commit()
    print(f"Écrit : {len(plan)} fiches.")


def main() -> int:
    p = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    p.add_argument("--base", action="store_true", help="la base Firestore au lieu des fichiers locaux")
    p.add_argument("--reel", action="store_true", help="écrire (sinon essai à blanc)")
    args = p.parse_args()
    nettoyer_base(args.reel) if args.base else nettoyer_local(args.reel)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
