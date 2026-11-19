"""Retrait de l'identifiant des comptes supprimés dans le journal des actions (changement suppression-compte, 2026-11-19).

Le journal (collection `journal`) n'est lisible que par l'administrateur : un compte qui se supprime ne peut pas y
retirer lui-même son identifiant. Ce script remplace par « compte-supprime » le `userId` des lignes dont le compte
n'existe plus dans `users`. Essai à blanc par défaut ; --reel écrit après sauvegarde.

    python scripts/anonymiser_journal.py
    python scripts/anonymiser_journal.py --reel
"""
from __future__ import annotations

import argparse
import json
import sys
from datetime import datetime
from pathlib import Path

ICI = Path(__file__).resolve().parent
sys.path.insert(0, str(ICI))
from import_to_firestore import DEFAULT_KEY  # noqa: E402

ANONYME = "compte-supprime"


def lignes_a_anonymiser(lignes: list[tuple[str, dict]], uids_existants: set[str]) -> list[str]:
    """Identifiants des lignes dont le compte n'existe plus (fonction pure)."""
    return [i for i, d in lignes if d.get("userId") and d["userId"] != ANONYME and d["userId"] not in uids_existants]


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--reel", action="store_true")
    args = parser.parse_args()

    import firebase_admin
    from firebase_admin import credentials, firestore

    firebase_admin.initialize_app(credentials.Certificate(str(DEFAULT_KEY)))
    db = firestore.client()
    uids = {d.id for d in db.collection("users").stream()}
    lignes = [(d.id, d.to_dict()) for d in db.collection("journal").stream()]
    a_faire = lignes_a_anonymiser(lignes, uids)
    print(f"{len(lignes)} lignes de journal, {len(a_faire)} d'un compte supprimé")
    if not args.reel or not a_faire:
        print("Essai à blanc : rien n'a été écrit." if not args.reel else "Rien à faire.")
        return 0
    sauvegarde = ICI / "sauvegardes" / f"journal_anonymise_{datetime.now():%Y-%m-%d_%H%M}.json"
    sauvegarde.parent.mkdir(exist_ok=True)
    par_id = dict(lignes)
    sauvegarde.write_text(json.dumps({i: par_id[i].get("userId") for i in a_faire}, ensure_ascii=False), encoding="utf-8")
    for n in range(0, len(a_faire), 400):
        lot = db.batch()
        for i in a_faire[n:n + 400]:
            lot.update(db.collection("journal").document(i), {"userId": ANONYME})
        lot.commit()
    print(f"{len(a_faire)} lignes anonymisées ; sauvegarde {sauvegarde}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
