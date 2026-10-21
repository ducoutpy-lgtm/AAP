"""Recopie du journal des couts de la chaine de collecte vers Firestore (changement suivi-couts-externes, 2026-10-21).

Pourquoi : Monsieur DUCOUT veut voir dans l'administration chaque appel aux services externes payants et son cout.
La chaine de collecte journalise ses appels dans scraping/logs/extraction_costs.jsonl ; l'application les ecrit dans
la collection coutsIa. Ce script verse le journal dans la meme collection, une ligne par appel, sans doublon
(identifiant derive du contenu de la ligne), relancable a volonte. Appele a la fin de veille.cmd.

Usage :
  python scripts/publier_couts.py --dry-run     # compte les lignes nouvelles, n'ecrit rien
  python scripts/publier_couts.py               # ecrit les lignes absentes
  python scripts/publier_couts.py --projet demo-aap   # vers l'emulateur (avec FIRESTORE_EMULATOR_HOST)
"""
from __future__ import annotations

import argparse
import hashlib
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

RACINE = Path(__file__).resolve().parent.parent
JOURNAL = RACINE / "scraping" / "logs" / "extraction_costs.jsonl"
CLE = RACINE / "scripts" / "serviceAccountKey.json"
EURO_PAR_DOLLAR = 0.92


def identifiant(ligne: str) -> str:
    """Identifiant stable d'une ligne du journal : empreinte de son texte (fonction pure)."""
    return "collecte-" + hashlib.sha1(ligne.strip().encode("utf-8")).hexdigest()[:20]


def document(ligne: str) -> dict | None:
    """Ligne JSON du journal -> document coutsIa, ou None si la ligne est vide ou illisible (fonction pure)."""
    ligne = ligne.strip()
    if not ligne:
        return None
    try:
        d = json.loads(ligne)
    except json.JSONDecodeError:
        return None
    quand = d.get("timestamp") or ""
    try:
        le = datetime.fromisoformat(quand.replace("Z", "+00:00")).astimezone(timezone.utc)
    except ValueError:
        le = datetime.now(timezone.utc)
    cout = d.get("cost_eur_approx")
    if cout is None and d.get("cost_usd") is not None:
        cout = float(d["cost_usd"]) * EURO_PAR_DOLLAR
    return {
        "source": "collecte",
        "fournisseur": "anthropic",
        "etape": d.get("etape") or ("extraction" if str(d.get("model", "")).startswith("claude-sonnet") else "inconnue"),
        "modele": d.get("model") or "",
        "origine": d.get("source") or "",
        "cible": d.get("url") or "",
        "tokensEntree": int(d.get("input_tokens") or 0),
        "tokensSortie": int(d.get("output_tokens") or 0),
        "tokensCacheLus": int(d.get("cache_read_tokens") or 0),
        "coutEuros": float(cout or 0.0),
        "le": le,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="Journal des couts de la collecte -> collection coutsIa.")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--projet", help="identifiant de projet force (emulateur : demo-aap)")
    parser.add_argument("--key", default=str(CLE))
    args = parser.parse_args()
    if not JOURNAL.exists():
        print(f"Journal introuvable : {JOURNAL}")
        return 1
    lignes = [l for l in JOURNAL.read_text(encoding="utf-8").splitlines() if l.strip()]
    docs = {identifiant(l): document(l) for l in lignes}
    docs = {k: v for k, v in docs.items() if v}
    print(f"{len(lignes)} lignes lues, {len(docs)} appels distincts")

    import firebase_admin
    from firebase_admin import credentials, firestore
    firebase_admin.initialize_app(credentials.Certificate(args.key), {"projectId": args.projet} if args.projet else None)
    col = firestore.client().collection("coutsIa")
    presents = {d.id for d in col.where("source", "==", "collecte").select([]).stream()}
    nouveaux = {k: v for k, v in docs.items() if k not in presents}
    print(f"{len(presents)} deja en base, {len(nouveaux)} a ecrire")
    if args.dry_run:
        print("Essai a blanc : rien n'est ecrit.")
        return 0
    batch, n = firestore.client().batch(), 0
    for ident, doc in nouveaux.items():
        batch.set(col.document(ident), doc)
        n += 1
        if n % 400 == 0:
            batch.commit()
            batch = firestore.client().batch()
    batch.commit()
    print(f"{n} appels ecrits dans coutsIa")
    return 0


if __name__ == "__main__":
    sys.exit(main())
