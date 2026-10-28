"""Financeur réel des fiches de relais déjà en base (changement financeur-reel-des-relais, 2026-10-28).

Pourquoi : 46 des 113 fiches de la file « à valider » affichaient le relais (Lyonbiopôle, cancéropôles…) comme financeur,
alors que le modèle avait souvent écrit le vrai financeur entre parenthèses. L'import le lit désormais
(`financeurs.financeur_reel_du_relais`) ; ce script applique la même règle aux fiches déjà en base.

Garde-fous : seulement les brouillons « proposee » (jamais une fiche relue ou publiée), seulement le champ financeurName,
sauvegarde dans scripts/sauvegardes/ avant écriture, essai à blanc par défaut.

Usage (depuis la racine) :
  python scripts/corriger_financeur_relais.py          # essai à blanc : corrections et fiches sans information
  python scripts/corriger_financeur_relais.py --reel   # sauvegarde puis écriture
"""
from __future__ import annotations

import argparse
import json
import sys
from datetime import datetime
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "scraping"))
import financeurs  # noqa: E402
import registre  # noqa: E402
from doublons import financeur_est_le_relais  # noqa: E402
from import_to_firestore import DEFAULT_KEY  # noqa: E402

SAUVEGARDES = Path(__file__).resolve().parent / "sauvegardes"


def corrections(fiches: list[tuple[str, dict]], relais: set[str], table: dict) -> tuple[list[tuple[str, str, str]], list[tuple[str, str]]]:
    """([(identifiant, ancien, nouveau)], [(identifiant, financeur resté le relais)]) pour les brouillons « proposee »
    d'une source relais (fonction pure)."""
    a_corriger, sans_info = [], []
    for ident, d in fiches:
        source = (d.get("scrapeMetadata") or {}).get("source") or ""
        if d.get("status") != "draft" or (d.get("validation") or {}).get("statut") != "proposee" or source not in relais:
            continue
        extrait = (d.get("scrapeMetadata") or {}).get("financeurExtrait") or d.get("financeurName") or ""
        reel = financeurs.financeur_reel_du_relais(extrait, source, table)
        nouveau = (financeurs.canonique(reel, None, table) or reel) if reel else None
        if nouveau and nouveau != d.get("financeurName"):
            a_corriger.append((ident, d.get("financeurName") or "", nouveau))
        elif not nouveau and financeur_est_le_relais(d, relais):
            sans_info.append((ident, d.get("financeurName") or ""))
    return a_corriger, sans_info


def main() -> int:
    parser = argparse.ArgumentParser(description="Financeur réel des fiches de relais de la file « à valider ».")
    parser.add_argument("--reel", action="store_true", help="sauvegarde puis écriture (sinon essai à blanc)")
    args = parser.parse_args()

    import firebase_admin
    from firebase_admin import credentials, firestore

    firebase_admin.initialize_app(credentials.Certificate(str(DEFAULT_KEY)))
    col = firestore.client().collection("aap")
    fiches = [(doc.id, doc.to_dict()) for doc in col.stream()]
    relais = {s["id"] for s in registre.charger() if s.get("relais")}
    titres = {i: (d.get("title") or "")[:70] for i, d in fiches}
    a_corriger, sans_info = corrections(fiches, relais, financeurs.charger())
    print(f"{len(a_corriger)} fiches à corriger, {len(sans_info)} restent au nom du relais (aucun financeur connu cité)")
    for ident, ancien, nouveau in a_corriger:
        print(f"  {ident} | {titres[ident]} | {ancien[:50]} -> {nouveau}")
    print("Restent au nom du relais :")
    for ident, nom in sans_info:
        print(f"  {ident} | {titres[ident]} | {nom[:60]}")
    if not args.reel:
        print("Essai à blanc : rien d'écrit.")
        return 0
    SAUVEGARDES.mkdir(exist_ok=True)
    sauvegarde = SAUVEGARDES / f"financeur_relais_{datetime.now().strftime('%Y-%m-%d_%H%M')}.json"
    sauvegarde.write_text(json.dumps({i: a for i, a, _ in a_corriger}, ensure_ascii=False, indent=1), encoding="utf-8")
    batch = firestore.client().batch()
    for ident, _, nouveau in a_corriger:
        batch.update(col.document(ident), {"financeurName": nouveau})
    batch.commit()
    relus = {i: col.document(i).get().to_dict()["financeurName"] for i, _, _ in a_corriger}
    justes = sum(1 for i, _, n in a_corriger if relus[i] == n)
    print(f"Sauvegarde : {sauvegarde} ; {justes} / {len(a_corriger)} fiches relues avec le nouveau financeur")
    return 0


if __name__ == "__main__":
    sys.exit(main())
