"""Migration des identifiants Firestore des AAP scrapes (changement organisation-donnees-validees, 2026-10-14).

Pourquoi : l'identifiant etait derive de la signature (titre, financeur, cloture), c'est-a-dire du texte produit
par l'IA ; deux moteurs donnaient deux documents pour le meme appel. Le nouvel identifiant est derive de
l'adresse de l'appel (scripts/import_to_firestore.py, fonction identifiant). Decision de Monsieur DUCOUT :
migrer maintenant, tant qu'il n'y a pas d'utilisateur.

Ce que fait le script :
  1. sauvegarde tous les documents de la collection aap dont source == "scraped" dans
     scripts/sauvegardes/aap_<date>.json (jamais commite : dossier ignore par Git) ;
  2. supprime ceux dont l'identifiant n'est pas celui que donnerait identifiant(externalUrl) ;
  3. affiche le decompte. L'import (python scripts/import_to_firestore.py) recree ensuite les documents.

Usage :
  python scripts/migrer_identifiants.py --dry-run     # liste, n'ecrit rien
  python scripts/migrer_identifiants.py               # sauvegarde puis suppression
"""
from __future__ import annotations

import argparse
import json
import sys
from datetime import datetime
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from import_to_firestore import DEFAULT_KEY, identifiant  # noqa: E402

SAUVEGARDES = Path(__file__).resolve().parent / "sauvegardes"


def _serialisable(valeur):
    return valeur.isoformat() if hasattr(valeur, "isoformat") else valeur


def main() -> int:
    parser = argparse.ArgumentParser(description="Migration des identifiants des AAP scrapes.")
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
    docs = [(d.id, d.to_dict()) for d in col.where("source", "==", "scraped").stream()]
    a_supprimer = [(i, d) for i, d in docs if d.get("externalUrl") and i != identifiant(d["externalUrl"])]
    sans_adresse = [i for i, d in docs if not d.get("externalUrl")]
    print(f"{len(docs)} documents scrapes ; {len(a_supprimer)} sous l'ancien identifiant ; "
          f"{len(docs) - len(a_supprimer) - len(sans_adresse)} deja sous le nouveau ; {len(sans_adresse)} sans adresse (conserves)")
    if args.dry_run:
        for i, d in a_supprimer[:5]:
            print(f"  {i} -> {identifiant(d['externalUrl'])}  {d.get('title', '')[:60]}")
        return 0

    SAUVEGARDES.mkdir(exist_ok=True)
    chemin = SAUVEGARDES / f"aap_{datetime.now().strftime('%Y-%m-%d_%H%M')}.json"
    chemin.write_text(json.dumps({i: {k: _serialisable(v) for k, v in d.items()} for i, d in docs},
                                 ensure_ascii=False, indent=1, default=str), encoding="utf-8")
    print(f"Sauvegarde : {chemin} ({len(docs)} documents)")
    batch, pending, supprimes = col._client.batch(), 0, 0
    for i, _ in a_supprimer:
        batch.delete(col.document(i))
        pending += 1
        supprimes += 1
        if pending >= 400:
            batch.commit()
            batch, pending = col._client.batch(), 0
    if pending:
        batch.commit()
    print(f"Supprimes : {supprimes}. Relancer maintenant : python scripts/import_to_firestore.py")
    return 0


if __name__ == "__main__":
    sys.exit(main())
