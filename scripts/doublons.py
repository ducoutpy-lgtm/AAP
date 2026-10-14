"""Rapport des fiches publiees en double (changement nettoyage-financeurs-territoires, tache 4.1).

Pourquoi : deux pages differentes peuvent decrire le meme appel (page de liste et page de detail, deux sites qui relaient
le meme financeur). L'identifiant Firestore est l'adresse, donc la base garde deux fiches. Ce script les liste pour que
Monsieur DUCOUT decide laquelle garder dans la validation quotidienne ; il ne fusionne rien et n'ecrit rien.

Regle : meme titre (memes mots, sans accents, sans mots vides, dans n'importe quel ordre) et meme financeur canonique,
parmi les fiches publiees de la collection aap.

Usage :
  python scripts/doublons.py
"""
from __future__ import annotations

import argparse
import sys
from collections import defaultdict
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "scraping"))
from financeurs import cle  # noqa: E402
from import_to_firestore import DEFAULT_KEY  # noqa: E402


def groupes_de_doublons(fiches: list[tuple[str, dict]]) -> list[list[tuple[str, dict]]]:
    """Groupes de fiches (identifiant, document) de meme titre normalise et meme financeur (fonction pure)."""
    par_cle: dict[tuple[str, str], list[tuple[str, dict]]] = defaultdict(list)
    for ident, d in fiches:
        par_cle[(cle(d.get("title")), (d.get("financeurName") or "").strip())].append((ident, d))
    return [g for g in par_cle.values() if len(g) > 1]


def main() -> int:
    parser = argparse.ArgumentParser(description="Fiches publiees en double (titre et financeur identiques).")
    parser.add_argument("--key", default=str(DEFAULT_KEY))
    args = parser.parse_args()
    if not Path(args.key).exists():
        print(f"Cle de compte de service introuvable : {args.key}", file=sys.stderr)
        return 1

    import firebase_admin
    from firebase_admin import credentials, firestore

    firebase_admin.initialize_app(credentials.Certificate(args.key))
    col = firestore.client().collection("aap")
    fiches = [(doc.id, doc.to_dict()) for doc in col.where("status", "==", "published").stream()]
    groupes = groupes_de_doublons(fiches)
    print(f"{len(fiches)} fiches publiees ; {len(groupes)} groupes de doublons ({sum(len(g) for g in groupes)} fiches)")
    for g in sorted(groupes, key=lambda g: g[0][1].get("title") or ""):
        print(f"\n{g[0][1].get('financeurName')} | {(g[0][1].get('title') or '')[:90]}")
        for ident, d in g:
            print(f"  {ident}  {d.get('externalUrl')}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
