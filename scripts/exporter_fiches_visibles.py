"""Export en lecture seule des fiches visibles par le public (changement recommandations-profil, tâche 5.0, 2026-11-16).

Sert au tirage de vingt recommandations (`app/scripts/tirage_recommandations.ts`). Écrit
`scripts/sauvegardes/fiches_visibles.json` (dossier ignoré par Git) ; aucune écriture en base.

    python scripts/exporter_fiches_visibles.py
"""
import json
import sys
from pathlib import Path

import firebase_admin
from firebase_admin import credentials, firestore

ICI = Path(__file__).resolve().parent
sys.path.insert(0, str(ICI.parent / "scraping"))
from alertes import visible  # noqa: E402  (règle « visible du public », la même que le courriel du lundi)

SORTIE = ICI / "sauvegardes" / "fiches_visibles.json"
CHAMPS = ("title", "financeurName", "territoriesEligible", "qualification", "structureTypeEligible", "externalUrl")


def main() -> int:
    firebase_admin.initialize_app(credentials.Certificate(str(ICI / "serviceAccountKey.json")))
    db = firestore.client()
    fiches = []
    for d in db.collection("aap").where("status", "==", "published").stream():
        f = d.to_dict()
        if not visible(f):
            continue
        sortie = {"id": d.id, **{c: f.get(c) for c in CHAMPS}}
        sortie["deadline"] = f["deadline"].isoformat() if f.get("deadline") else None
        sortie["scrapeMetadata"] = {"champ": (f.get("scrapeMetadata") or {}).get("champ")}
        sortie["validation"] = f.get("validation")
        fiches.append(sortie)
    SORTIE.parent.mkdir(exist_ok=True)
    SORTIE.write_text(json.dumps(fiches, ensure_ascii=False, default=str), encoding="utf-8")
    print(f"{len(fiches)} fiches visibles -> {SORTIE}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
