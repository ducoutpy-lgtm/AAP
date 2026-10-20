"""Peremption : les fiches publiees absentes de leur page source depuis au moins deux rejeux passent « a corriger »
(changement OpenSpec rejeu-collecte-veille, lot 2 du rapport de critique).

Pourquoi : un appel retire de la page de son financeur est probablement clos ou deplace ; sans verdict, la fiche
resterait publiee comme vraie. La regle du rapport est « non revue apres deux rejeux -> a_corriger » : la fiche reste
visible avec la mention « Non relue » et sa date de derniere vue, et Monsieur DUCOUT tranche (archiver ou garder).
Une fiche portant son verdict n'est jamais touchee ; l'import ne reecrit pas validation sur un document existant, d'ou
cette migration a part, avec essai a blanc et sauvegarde.

Usage :
  python scripts/perimer_fiches.py --dry-run
  python scripts/perimer_fiches.py
"""
from __future__ import annotations

import argparse
import json
import sys
from datetime import date, datetime
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import import_to_firestore as imp  # noqa: E402

SAUVEGARDES = Path(__file__).resolve().parent / "sauvegardes"
SEUIL = 2
PAR = "rejeu"


def peremption(doc: dict, today: date, seuil: int = SEUIL) -> dict | None:
    """Ce qui serait ecrit pour un document perime, ou None (fonction pure) : publie, sans verdict humain, absences
    >= seuil, pas deja marque pour ce nombre d'absences."""
    absences = int((doc.get("scrapeMetadata") or {}).get("absences") or 0)
    val = doc.get("validation") or {}
    if doc.get("status") != "published" or absences < seuil or val.get("par") == imp.RELECTEUR:
        return None
    commentaire = f"absente de sa page source depuis {absences} rejeux"
    if val.get("statut") == "a_corriger" and val.get("commentaire") == commentaire:
        return None
    return {"validation": {"statut": "a_corriger", "commentaire": commentaire, "date": today.isoformat(), "par": PAR},
            "tags": imp.etiqueter(doc.get("tags") or [], "a_corriger")}


def _serialisable(valeur):
    return valeur.isoformat() if hasattr(valeur, "isoformat") else valeur


def main() -> int:
    parser = argparse.ArgumentParser(description="Fiches absentes de leur page depuis deux rejeux -> a corriger.")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--key", default=str(imp.DEFAULT_KEY))
    args = parser.parse_args()
    if not Path(args.key).exists():
        print(f"Cle de compte de service introuvable : {args.key}", file=sys.stderr)
        return 1

    import firebase_admin
    from firebase_admin import credentials, firestore

    firebase_admin.initialize_app(credentials.Certificate(args.key))
    col = firestore.client().collection("aap")
    today = date.today()
    a_ecrire, humains = [], 0
    for snap in col.where("status", "==", "published").stream():
        d = snap.to_dict()
        if int((d.get("scrapeMetadata") or {}).get("absences") or 0) >= SEUIL and (d.get("validation") or {}).get("par") == imp.RELECTEUR:
            humains += 1
        maj = peremption(d, today)
        if maj:
            a_ecrire.append((snap.id, d, maj))
    print(f"{len(a_ecrire)} fiches publiees a passer « a corriger » ; {humains} absentes mais avec verdict humain, conservees")
    for ident, d, maj in a_ecrire[:10]:
        print(f"  {ident}  {(d.get('title') or '')[:60]}  | {maj['validation']['commentaire']}")
    if args.dry_run:
        print("Essai a blanc : rien n'a ete ecrit.")
        return 0
    if not a_ecrire:
        return 0
    SAUVEGARDES.mkdir(exist_ok=True)
    chemin = SAUVEGARDES / f"peremption_{datetime.now().strftime('%Y-%m-%d_%H%M')}.json"
    chemin.write_text(json.dumps({i: {k: _serialisable(v) for k, v in d.items()} for i, d, _ in a_ecrire},
                                 ensure_ascii=False, indent=1, default=str), encoding="utf-8")
    print(f"Sauvegarde : {chemin} ({len(a_ecrire)} fiches)")
    batch, pending = col._client.batch(), 0
    for ident, _, maj in a_ecrire:
        batch.update(col.document(ident), maj)
        pending += 1
        if pending >= 400:
            batch.commit()
            batch, pending = col._client.batch(), 0
    if pending:
        batch.commit()
    print(f"Mises a jour : {len(a_ecrire)} fiches.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
