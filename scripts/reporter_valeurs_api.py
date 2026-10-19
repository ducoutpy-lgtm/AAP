"""Migration : les fiches validees par le modele prennent les valeurs lues par l'API (changement extraction-api-v4,
tache 2.3, accord de Monsieur DUCOUT du 2026-10-19 : « 1 ok »).

Pourquoi : l'import protege les champs metier (titre, description, dates, montants...) d'une fiche dont
validation.statut vaut « validee » (lot 0 : une fiche validee ne bouge que par un nouveau verdict). Les fiches validees
au nom du modele le 2026-10-15 a partir de l'extraction locale gardent donc leurs valeurs locales, alors que la V4 a relu
les memes pages avec l'API, mieux notee a la comparaison du 2026-10-14. Un verdict de Monsieur DUCOUT reste intouchable.

Ce que fait le script, pour chaque fiche de results/extraction_api.json presente dans la base :
  1. recalcule le document comme l'import le ferait (corrections du controle, champ, decision du modele) ;
  2. passe si la fiche porte un verdict humain, si elle est en brouillon hors champ, ou si la fiche API n'a pas
     ete controlee par le modele (close) : une fiche validee ne redescend jamais en « proposee » ;
  3. compare les champs metier et la validation ; ne retient que ce qui change ;
  4. --dry-run : comptes par champ et cinq exemples, rien d'ecrit ;
  5. sinon : sauvegarde JSON dans scripts/sauvegardes/valeurs_api_<date>.json, puis ecriture des seuls champs changes.

Usage :
  python scripts/reporter_valeurs_api.py --dry-run
  python scripts/reporter_valeurs_api.py
"""
from __future__ import annotations

import argparse
import json
import sys
from collections import Counter
from datetime import date, datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import import_to_firestore as imp  # noqa: E402
import verification  # noqa: E402

SAUVEGARDES = Path(__file__).resolve().parent / "sauvegardes"
FICHIER_API = "extraction_api"


def _comparable(valeur):
    """Forme comparable d'une valeur Firestore ou Python : les dates par leur jour, le reste tel quel."""
    if hasattr(valeur, "isoformat"):
        return valeur.isoformat()[:10]
    if hasattr(valeur, "to_datetime"):  # DatetimeWithNanoseconds de Firestore
        return valeur.to_datetime().isoformat()[:10]
    return valeur


def document_api(item: dict, source_name: str, now: datetime, today: date) -> dict:
    """Le document tel que l'import l'ecrirait pour une fiche API neuve (fonction pure)."""
    decision = verification.decision_du_modele(item)
    doc = imp.to_app_aap(verification.appliquer_corrections(item, decision), source_name, now)
    if "deadline" not in doc:
        doc = imp.sans_date_en_attente(doc, today)
    doc = imp.champ_en_attente(imp.appliquer_verdict(doc, None), today)
    return imp.appliquer_decision_du_modele(doc, decision)


def ecarts(existant: dict, nouveau: dict) -> dict:
    """Champs metier et validation dont la valeur API differe de la valeur en base (fonction pure)."""
    maj = {}
    for champ in imp.CHAMPS_METIER:
        if _comparable(existant.get(champ)) != _comparable(nouveau.get(champ)):
            maj[champ] = nouveau.get(champ)
    if (existant.get("validation") or {}).get("statut") != nouveau["validation"]["statut"] \
            or (existant.get("validation") or {}).get("commentaire") != nouveau["validation"]["commentaire"]:
        maj["validation"] = nouveau["validation"]
    if nouveau["validation"]["statut"] == "rejetee" and existant.get("status") != "archived":
        maj["status"] = "archived"
    return maj


def main() -> int:
    parser = argparse.ArgumentParser(description="Valeurs de l'API reportees sur les fiches validees par le modele.")
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
    now, today = datetime.now(timezone.utc), date.today()
    a_ecrire, bilan, par_champ = [], Counter(), Counter()
    for source_name, item in imp.load_results(FICHIER_API):
        if not item.get("url_source"):
            continue
        ident = imp.identifiant(item["url_source"])
        snap = col.document(ident).get()
        if not snap.exists:
            bilan["absente de la base"] += 1
            continue
        d = snap.to_dict()
        if (d.get("validation") or {}).get("par") == imp.RELECTEUR:
            bilan["verdict humain, conservee"] += 1
            continue
        if "hors-champ" in (d.get("tags") or []):
            bilan["brouillon hors champ, conservee"] += 1
            continue
        if verification.decision_du_modele(item) is None:
            # Fiche API close ou non controlee : ses valeurs n'ont pas ete relues, la fiche en base (validee d'apres
            # le controle de la V3) reste telle quelle plutot que de redescendre en « proposee ».
            bilan["fiche API non controlee, conservee"] += 1
            continue
        nouveau = document_api(item, source_name, now, today)
        if "hors-champ" in nouveau["tags"]:
            bilan["hors champ selon l'API, laissee a migrer_champ"] += 1
            continue
        maj = ecarts(d, nouveau)
        if not maj:
            bilan["identique"] += 1
            continue
        bilan["a mettre a jour"] += 1
        par_champ.update(maj.keys())
        a_ecrire.append((ident, d, maj))
    print("Bilan : " + ", ".join(f"{k} {v}" for k, v in sorted(bilan.items())))
    print("Champs changes : " + ", ".join(f"{k} {v}" for k, v in par_champ.most_common()))
    for ident, d, maj in a_ecrire[:5]:
        detail = "; ".join(f"{k}: {_comparable(d.get(k))!s:.40} -> {_comparable(v)!s:.40}" for k, v in maj.items()
                           if k not in ("validation", "tags", "description"))
        print(f"  {ident}  {(d.get('title') or '')[:50]}  | {detail[:150]}")
    if args.dry_run:
        print("Essai a blanc : rien n'a ete ecrit.")
        return 0
    if not a_ecrire:
        return 0

    SAUVEGARDES.mkdir(exist_ok=True)
    chemin = SAUVEGARDES / f"valeurs_api_{datetime.now().strftime('%Y-%m-%d_%H%M')}.json"
    chemin.write_text(json.dumps({i: {k: _comparable(v) if hasattr(v, "isoformat") or hasattr(v, "to_datetime") else v
                                      for k, v in d.items()} for i, d, _ in a_ecrire},
                                 ensure_ascii=False, indent=1, default=str), encoding="utf-8")
    print(f"Sauvegarde : {chemin} ({len(a_ecrire)} fiches)")
    batch, pending, ecrites = col._client.batch(), 0, 0
    for ident, _, maj in a_ecrire:
        batch.update(col.document(ident), maj)
        pending += 1
        ecrites += 1
        if pending >= 400:
            batch.commit()
            batch, pending = col._client.batch(), 0
    if pending:
        batch.commit()
    print(f"Mises a jour : {ecrites} fiches.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
