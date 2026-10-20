"""Depublication des fiches publiees sans controle (decision de Monsieur DUCOUT du 2026-10-20, changement
administration-controle).

Pourquoi : la decision du 2026-10-14 publiait les fiches « proposees » avec un badge « a verifier » ; Monsieur DUCOUT
refuse desormais qu'une fiche non controlee soit visible des candidats. L'import ne reecrit jamais status ni
validation d'une fiche deja enregistree : les fiches concernees sont repassees en brouillon par cette operation
unique, apres sauvegarde et accord. Le bloc validation n'est pas touche ; un verdict humain (validation.par =
Monsieur DUCOUT) est toujours laisse tel quel.

Usage :
  python scripts/depublier_non_controlees.py --dry-run     # compte et exemples, n'ecrit rien
  python scripts/depublier_non_controlees.py               # sauvegarde puis depublication
"""
from __future__ import annotations

import argparse
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from import_to_firestore import DEFAULT_KEY, RELECTEUR, STATUTS_A_VERIFIER  # noqa: E402

SAUVEGARDES = Path(__file__).resolve().parent / "sauvegardes"


def _serialisable(valeur):
    return valeur.isoformat() if hasattr(valeur, "isoformat") else valeur


def a_depublier(doc: dict) -> bool:
    """Publiee, validation proposee ou a corriger, sans verdict humain (fonction pure)."""
    v = doc.get("validation") or {}
    return doc.get("status") == "published" and v.get("statut") in STATUTS_A_VERIFIER and v.get("par") != RELECTEUR


def main() -> int:
    parser = argparse.ArgumentParser(description="Fiches publiees sans controle -> brouillon.")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--key", default=str(DEFAULT_KEY))
    args = parser.parse_args()
    if not Path(args.key).exists():
        print(f"Cle de compte de service introuvable : {args.key}", file=sys.stderr)
        return 1

    import firebase_admin
    from firebase_admin import credentials, firestore

    firebase_admin.initialize_app(credentials.Certificate(args.key))
    col = firestore.client().collection("aap")
    publiees = [(d.id, d.to_dict()) for d in col.where("status", "==", "published").stream()]
    cibles = [(i, d) for i, d in publiees if a_depublier(d)]
    par_statut = {s: sum(1 for _, d in cibles if d["validation"]["statut"] == s) for s in STATUTS_A_VERIFIER}
    print(f"Publiees : {len(publiees)} ; a depublier : {len(cibles)} ({par_statut})")
    for i, d in cibles[:5]:
        print(f"  - {i} | {d.get('title', '')[:70]} | {d['validation']['statut']} | {d.get('financeurName', '')}")
    if args.dry_run:
        print("Essai a blanc : rien n'est ecrit.")
        return 0
    if not cibles:
        return 0

    SAUVEGARDES.mkdir(exist_ok=True)
    horodatage = datetime.now(timezone.utc).strftime("%Y-%m-%d_%H%M")
    chemin = SAUVEGARDES / f"depublication_{horodatage}.json"
    chemin.write_text(json.dumps([{"id": i, "status": d.get("status"), "publishedAt": _serialisable(d.get("publishedAt")),
                                    "validation": d.get("validation")} for i, d in cibles],
                                 ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Sauvegarde : {chemin}")
    batch = firestore.client().batch()
    n = 0
    for i, _ in cibles:
        batch.update(col.document(i), {"status": "draft"})
        n += 1
        if n % 400 == 0:
            batch.commit()
            batch = firestore.client().batch()
    batch.commit()
    print(f"{n} fiches repassees en brouillon.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
