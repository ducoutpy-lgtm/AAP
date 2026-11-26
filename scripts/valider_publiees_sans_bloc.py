"""Bloc de validation ajoute aux appels publies ou clotures qui n'en ont pas (changement securite-vues-messagerie,
question 49, decision « maintenant » de Monsieur DUCOUT du 2026-11-26).

Pourquoi : la regle de lecture des listes d'appels (app/firestore.rules, « allow list ») exige desormais
validation.statut == 'validee' ; Firestore ne filtre pas, il refuse toute requete qui pourrait renvoyer un appel non
visible. Un appel saisi a la main avant la validation obligatoire du 2026-11-24 n'a pas de bloc de validation : il reste
lisible par son adresse, mais ne sort plus de la recherche, du tableau de bord du candidat, des recommandations ni du
calendrier. Ce script lui ajoute le bloc { statut: 'validee', commentaire, date, par: 'migration' }, au format ecrit par
l'application (app/src/types/index.ts, AapValidation). Aucun autre champ n'est touche.

Usage :
  python scripts/valider_publiees_sans_bloc.py           # compte et exemples, n'ecrit rien
  python scripts/valider_publiees_sans_bloc.py --reel    # sauvegarde dans scripts/sauvegardes/, puis ecriture

L'ecriture reelle attend l'accord de Monsieur DUCOUT.
"""
from __future__ import annotations

import argparse
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from import_to_firestore import DEFAULT_KEY  # noqa: E402

SAUVEGARDES = Path(__file__).resolve().parent / "sauvegardes"
STATUTS_LISIBLES = ("published", "closed")


def _serialisable(valeur):
    return valeur.isoformat() if hasattr(valeur, "isoformat") else valeur


def a_valider(doc: dict) -> bool:
    """Publie ou cloture, sans bloc de validation (absent ou nul) ; un bloc vide n'est pas visible et reste tel quel."""
    return doc.get("status") in STATUTS_LISIBLES and doc.get("validation", None) is None


def bloc_validation(jour: str) -> dict:
    """Bloc ajoute, jour au format AAAA-MM-JJ comme l'ecrit l'application."""
    return {"statut": "validee", "commentaire": "appel publié avant la validation obligatoire", "date": jour,
            "par": "migration"}


def main() -> int:
    parser = argparse.ArgumentParser(description="Appels publies ou clotures sans bloc de validation -> bloc 'validee'.")
    parser.add_argument("--reel", action="store_true", help="ecrire (sinon essai a blanc)")
    parser.add_argument("--key", default=str(DEFAULT_KEY))
    args = parser.parse_args()
    if not Path(args.key).exists():
        print(f"Cle de compte de service introuvable : {args.key}", file=sys.stderr)
        return 1

    import firebase_admin
    from firebase_admin import credentials, firestore

    firebase_admin.initialize_app(credentials.Certificate(args.key))
    client = firestore.client()
    col = client.collection("aap")
    lisibles = [(d.id, d.to_dict()) for d in col.where("status", "in", list(STATUTS_LISIBLES)).stream()]
    cibles = [(i, d) for i, d in lisibles if a_valider(d)]
    par_statut = {s: sum(1 for _, d in cibles if d.get("status") == s) for s in STATUTS_LISIBLES}
    print(f"Appels publies ou clotures : {len(lisibles)} ; sans bloc de validation : {len(cibles)} ({par_statut})")
    for i, d in cibles[:10]:
        print(f"  - {i} | {str(d.get('title', ''))[:70]} | {d.get('status')} | {d.get('financeurName', '')}"
              f" | source {d.get('source', '')}")
    if not args.reel:
        print("Essai a blanc : rien n'est ecrit (option --reel pour ecrire).")
        return 0
    if not cibles:
        return 0

    SAUVEGARDES.mkdir(exist_ok=True)
    maintenant = datetime.now(timezone.utc)
    chemin = SAUVEGARDES / f"validation_sans_bloc_{maintenant.strftime('%Y-%m-%d_%H%M')}.json"
    chemin.write_text(json.dumps([{"id": i, "status": d.get("status"), "title": d.get("title"),
                                   "financeurId": d.get("financeurId"),
                                   "publishedAt": _serialisable(d.get("publishedAt")),
                                   "validation": d.get("validation")} for i, d in cibles],
                                 ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Sauvegarde : {chemin}")
    bloc = bloc_validation(maintenant.date().isoformat())
    batch = client.batch()
    n = 0
    for i, _ in cibles:
        batch.update(col.document(i), {"validation": bloc})
        n += 1
        if n % 400 == 0:
            batch.commit()
            batch = client.batch()
    batch.commit()
    print(f"{n} appels recoivent le bloc de validation.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
