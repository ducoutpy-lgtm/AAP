"""Applique la relecture du champ du 2026-11-26 (docs/RELECTURE_CHAMP_2026-11-26.md), acceptée par Monsieur DUCOUT
(« Oui, applique » ; les fiches « à décider » restent à relire).

Décisions lues dans scripts/relecture_champ_2026-11-26.json : « ecarter » (archivée, rejetée « hors champ »),
« garder » (champ corrigé ; une fiche « à corriger » repasse « Proposée » pour le tri), « doublon » (archivée,
rejetée « doublon de ... »), « financeur » (nom du financeur corrigé). Essai à blanc par défaut ; --reel écrit après
une sauvegarde complète des fiches touchées dans scripts/sauvegardes/relecture_champ_<date>.json.

    python scripts/appliquer_relecture_champ.py          # essai à blanc : décompte
    python scripts/appliquer_relecture_champ.py --reel   # sauvegarde, puis écriture
"""
from __future__ import annotations

import argparse
import json
from datetime import datetime
from pathlib import Path

ICI = Path(__file__).resolve().parent
DECISIONS = ICI / "relecture_champ_2026-11-26.json"
PAR = "relecture de la session, accord de Monsieur DUCOUT"


def changements(decision: dict, fiche: dict, jour: str) -> dict:
    """Champs à écrire pour une décision (fonction pure)."""
    action = decision["action"]
    if action in ("ecarter", "doublon"):
        motif = "hors champ (relecture du 2026-11-26)" if action == "ecarter" else f"doublon de {decision['garde']}"
        return {"status": "archived", "validation": {"statut": "rejetee", "par": PAR, "date": jour, "commentaire": motif}}
    if action == "garder":
        champ = {"scrapeMetadata.champ": decision["champ"]}
        if (fiche.get("validation") or {}).get("statut") == "a_corriger":
            champ["validation"] = {"statut": "proposee", "par": "", "date": jour,
                                   "commentaire": "dans le champ après relecture du 2026-11-26"}
        return champ
    if action == "financeur":
        return {"financeurName": decision["financeur"]}
    raise ValueError(f"action inconnue : {action}")


def main() -> int:
    p = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    p.add_argument("--reel", action="store_true", help="écrire (sinon essai à blanc)")
    args = p.parse_args()
    import firebase_admin
    from firebase_admin import credentials, firestore

    decisions = json.loads(DECISIONS.read_text(encoding="utf-8"))
    firebase_admin.initialize_app(credentials.Certificate(str(ICI / "serviceAccountKey.json")))
    db = firestore.client()
    jour = datetime.now().date().isoformat()
    plan, sauvegarde = [], {}
    for d in decisions:
        snap = db.collection("aap").document(d["id"]).get()
        if not snap.exists:
            print(f"absente, ignorée : {d['id']}")
            continue
        fiche = snap.to_dict()
        sauvegarde[d["id"]] = fiche
        plan.append((d, changements(d, fiche, jour)))
    compte: dict[str, int] = {}
    for d, _ in plan:
        compte[d["action"]] = compte.get(d["action"], 0) + 1
    print(f"Décisions : {len(decisions)} ; fiches trouvées : {len(plan)} ; par action : {compte}")
    if not args.reel:
        print("Essai à blanc : rien n'est écrit (option --reel pour écrire).")
        return 0
    (ICI / "sauvegardes").mkdir(exist_ok=True)
    chemin = ICI / "sauvegardes" / f"relecture_champ_{datetime.now():%Y-%m-%d_%H%M}.json"
    chemin.write_text(json.dumps(sauvegarde, ensure_ascii=False, default=str, indent=1), encoding="utf-8")
    print(f"Sauvegarde : {chemin}")
    for debut in range(0, len(plan), 400):
        lot = db.batch()
        for d, ch in plan[debut:debut + 400]:
            lot.update(db.collection("aap").document(d["id"]), ch)
        lot.commit()
    print(f"Écrit : {len(plan)} fiches.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
