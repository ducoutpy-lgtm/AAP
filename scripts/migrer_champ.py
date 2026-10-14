"""Migration des fiches publiees classees hors champ (changement filtre-champ-sante, instruction 26).

Pourquoi : l'import ne reecrit jamais status ni validation d'une fiche deja enregistree (lot 0) ; les fiches
publiees avant le filtre du champ et classees « hors-champ » par le modele doivent donc etre repassees en brouillon
par une operation unique, apres sauvegarde et accord de Monsieur DUCOUT. Un verdict humain existant l'emporte.

Ce que fait le script :
  1. lit les fiches classees hors-champ dans les fichiers de resultats que lit l'import (scrape_metadata.champ) ;
  2. retrouve dans la collection aap les fiches publiees correspondantes (identifiant derive de l'adresse) ;
  3. --dry-run : affiche le compte et cinq exemples, n'ecrit rien ;
  4. sinon : sauvegarde JSON dans scripts/sauvegardes/champ_publiees_<date>.json, puis status = draft,
     validation = a_corriger « hors champ (modele) », etiquette hors-champ (rien d'autre n'est touche).

Usage :
  python scripts/migrer_champ.py --dry-run
  python scripts/migrer_champ.py
"""
from __future__ import annotations

import argparse
import json
import sys
from datetime import date, datetime
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from import_to_firestore import DEFAULT_KEY, RELECTEUR, identifiant, load_results  # noqa: E402

SAUVEGARDES = Path(__file__).resolve().parent / "sauvegardes"


def fiches_hors_champ() -> dict[str, dict]:
    """identifiant -> fiche, pour les fiches classees hors-champ des fichiers lus par l'import."""
    return {identifiant(item["url_source"]): item for _, item in load_results(None)
            if (item.get("scrape_metadata") or {}).get("champ") == "hors-champ" and item.get("url_source")}


def _serialisable(valeur):
    return valeur.isoformat() if hasattr(valeur, "isoformat") else valeur


def main() -> int:
    parser = argparse.ArgumentParser(description="Fiches publiees classees hors champ -> brouillon a corriger.")
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
    candidates = fiches_hors_champ()
    print(f"{len(candidates)} fiches classees hors champ dans les fichiers de resultats")
    a_migrer, verdict_humain = [], 0
    for ident, fiche in candidates.items():
        doc = col.document(ident).get()
        if not doc.exists:
            continue
        d = doc.to_dict()
        if d.get("status") != "published":
            continue
        if (d.get("validation") or {}).get("par") == RELECTEUR:
            verdict_humain += 1  # decision humaine : on n'y touche pas
            continue
        a_migrer.append((ident, d, fiche))
    print(f"{len(a_migrer)} fiches publiees a repasser en brouillon ; {verdict_humain} publiees avec verdict humain, conservees")
    for ident, d, fiche in a_migrer[:5]:
        print(f"  {ident}  {(d.get('title') or '')[:60]}  | {(fiche.get('scrape_metadata') or {}).get('champ_raison', '')[:60]}")
    if args.dry_run:
        print("Essai a blanc : rien n'a ete ecrit.")
        return 0
    if not a_migrer:
        return 0

    SAUVEGARDES.mkdir(exist_ok=True)
    chemin = SAUVEGARDES / f"champ_publiees_{datetime.now().strftime('%Y-%m-%d_%H%M')}.json"
    chemin.write_text(json.dumps({i: {k: _serialisable(v) for k, v in d.items()} for i, d, _ in a_migrer},
                                 ensure_ascii=False, indent=1, default=str), encoding="utf-8")
    print(f"Sauvegarde : {chemin} ({len(a_migrer)} fiches)")
    batch, pending, migres = col._client.batch(), 0, 0
    for ident, d, _ in a_migrer:
        tags = [t for t in (d.get("tags") or []) if t not in ("hors-champ",)]
        if "a-verifier" not in tags:
            tags.append("a-verifier")
        batch.update(col.document(ident), {
            "status": "draft",
            "validation": {"statut": "a_corriger", "commentaire": "hors champ (modele)", "date": date.today().isoformat(),
                           "par": "import (champ)"},
            "tags": tags + ["hors-champ"],
        })
        pending += 1
        migres += 1
        if pending >= 400:
            batch.commit()
            batch, pending = col._client.batch(), 0
    if pending:
        batch.commit()
    print(f"Migrees : {migres} fiches, brouillon a corriger « hors champ (modele) ».")
    return 0


if __name__ == "__main__":
    sys.exit(main())
