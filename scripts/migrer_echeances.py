"""Migration des echeances fictives (changement lot-0-assainissement, rapport du 2026-10-14, instruction 9).

Pourquoi : jusqu'au lot 0, une fiche sans date de cloture recevait une echeance fictive a un an pour satisfaire le
type AAP de l'application. Decision de Monsieur DUCOUT (reponse Q4) : deadline devient nullable, une donnee
inventee ne doit plus figurer en base. Les documents portant l'etiquette sans-date-cloture recoivent deadline = null.

Ce que fait le script :
  1. lit les documents de la collection aap dont tags contient "sans-date-cloture" ;
  2. --dry-run : affiche le compte et cinq exemples, n'ecrit rien ;
  3. sinon : sauvegarde ces documents dans scripts/sauvegardes/echeances_<date>.json (dossier ignore par Git),
     puis ecrit deadline = null sur chacun (mise a jour d'un seul champ, rien d'autre n'est touche).

Usage :
  python scripts/migrer_echeances.py --dry-run     # compte, n'ecrit rien
  python scripts/migrer_echeances.py               # sauvegarde puis mise a jour
"""
from __future__ import annotations

import argparse
import json
import sys
from datetime import datetime
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from import_to_firestore import DEFAULT_KEY  # noqa: E402

SAUVEGARDES = Path(__file__).resolve().parent / "sauvegardes"
ETIQUETTE = "sans-date-cloture"


def _serialisable(valeur):
    return valeur.isoformat() if hasattr(valeur, "isoformat") else valeur


def main() -> int:
    parser = argparse.ArgumentParser(description="Migration des echeances fictives vers deadline = null.")
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
    docs = [(d.id, d.to_dict()) for d in col.where("tags", "array_contains", ETIQUETTE).stream()]
    a_migrer = [(i, d) for i, d in docs if d.get("deadline") is not None]
    deja = len(docs) - len(a_migrer)
    print(f"{len(docs)} documents portent l'etiquette {ETIQUETTE} ; {len(a_migrer)} avec une echeance fictive a migrer ; "
          f"{deja} deja a null")
    for i, d in a_migrer[:5]:
        print(f"  {i}  cloture fictive {_serialisable(d.get('deadline'))}  {d.get('status', '')}  {d.get('title', '')[:60]}")
    if args.dry_run:
        print("Essai a blanc : rien n'a ete ecrit.")
        return 0
    if not a_migrer:
        return 0

    SAUVEGARDES.mkdir(exist_ok=True)
    chemin = SAUVEGARDES / f"echeances_{datetime.now().strftime('%Y-%m-%d_%H%M')}.json"
    chemin.write_text(json.dumps({i: {k: _serialisable(v) for k, v in d.items()} for i, d in a_migrer},
                                 ensure_ascii=False, indent=1, default=str), encoding="utf-8")
    print(f"Sauvegarde : {chemin} ({len(a_migrer)} documents)")
    batch, pending, migres = col._client.batch(), 0, 0
    for i, _ in a_migrer:
        batch.update(col.document(i), {"deadline": None})
        pending += 1
        migres += 1
        if pending >= 400:
            batch.commit()
            batch, pending = col._client.batch(), 0
    if pending:
        batch.commit()
    print(f"Migres : {migres} documents, deadline = null.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
