"""Publication des brouillons sans date de cloture (decision de Monsieur DUCOUT du 2026-10-14, nuit).

Pourquoi : jusqu'ici une fiche sans date de cloture entrait en brouillon, invisible, en attente de validation ;
Monsieur DUCOUT veut les voir dans l'application (« Date de cloture non precisee », badge « a verifier »). L'import
ne reecrit jamais status ni validation d'une fiche deja enregistree : les 141 brouillons existants sont publies par
cette operation unique, apres sauvegarde et accord. Sont laissees de cote : les fiches avec un verdict humain, et les
fiches classees hors champ par le modele (fichiers de resultats ou scrapeMetadata.champ).

Usage :
  python scripts/publier_sans_date.py --dry-run     # compte et exemples, n'ecrit rien
  python scripts/publier_sans_date.py               # sauvegarde puis publication
"""
from __future__ import annotations

import argparse
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from import_to_firestore import DEFAULT_KEY, RELECTEUR, identifiant, load_results  # noqa: E402

SAUVEGARDES = Path(__file__).resolve().parent / "sauvegardes"
ETIQUETTE = "sans-date-cloture"


def _serialisable(valeur):
    return valeur.isoformat() if hasattr(valeur, "isoformat") else valeur


def identifiants_hors_champ() -> set[str]:
    return {identifiant(item["url_source"]) for _, item in load_results(None)
            if (item.get("scrape_metadata") or {}).get("champ") == "hors-champ" and item.get("url_source")}


def main() -> int:
    parser = argparse.ArgumentParser(description="Brouillons sans date de cloture -> publies, a verifier.")
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
    hors_champ = identifiants_hors_champ()
    docs = [(d.id, d.to_dict()) for d in col.where("tags", "array_contains", ETIQUETTE).stream()]
    brouillons = [(i, d) for i, d in docs if d.get("status") == "draft"]
    a_publier, verdict_humain, ecartes = [], 0, 0
    for i, d in brouillons:
        if (d.get("validation") or {}).get("par") == RELECTEUR:
            verdict_humain += 1
            continue
        if i in hors_champ or (d.get("scrapeMetadata") or {}).get("champ") == "hors-champ":
            ecartes += 1
            continue
        a_publier.append((i, d))
    print(f"{len(docs)} fiches portent l'etiquette {ETIQUETTE} ; {len(brouillons)} en brouillon ; {len(a_publier)} a publier ; "
          f"{verdict_humain} avec verdict humain, conservees ; {ecartes} hors champ, conservees en brouillon")
    for i, d in a_publier[:5]:
        print(f"  {i}  {(d.get('title') or '')[:70]}")
    if args.dry_run:
        print("Essai a blanc : rien n'a ete ecrit.")
        return 0
    if not a_publier:
        return 0

    SAUVEGARDES.mkdir(exist_ok=True)
    chemin = SAUVEGARDES / f"sans_date_publiees_{datetime.now().strftime('%Y-%m-%d_%H%M')}.json"
    chemin.write_text(json.dumps({i: {k: _serialisable(v) for k, v in d.items()} for i, d in a_publier},
                                 ensure_ascii=False, indent=1, default=str), encoding="utf-8")
    print(f"Sauvegarde : {chemin} ({len(a_publier)} fiches)")
    now = datetime.now(timezone.utc)
    batch, pending, publies = col._client.batch(), 0, 0
    for i, d in a_publier:
        tags = list(d.get("tags") or [])
        if "a-verifier" not in tags:
            tags.append("a-verifier")
        batch.update(col.document(i), {
            "status": "published",
            "publishedAt": now,
            "validation": {"statut": "proposee", "commentaire": "", "date": "", "par": ""},
            "tags": tags,
        })
        pending += 1
        publies += 1
        if pending >= 400:
            batch.commit()
            batch, pending = col._client.batch(), 0
    if pending:
        batch.commit()
    print(f"Publiees : {publies} fiches sans date, a verifier.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
