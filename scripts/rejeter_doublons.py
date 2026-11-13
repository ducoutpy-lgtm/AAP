"""Rejet des doublons proposes par docs/DOUBLONS.md (changement rejet-des-doublons, question 3 bis de docs/A_VALIDER.md,
decision de Monsieur DUCOUT du 2026-11-13 : « La seance, avec sauvegarde »).

Pourquoi un script a part : doublons.py ne fait que lire et proposer ; ecrire en base est une autre responsabilite, avec
essai a blanc par defaut, sauvegarde et accord de Monsieur DUCOUT dans la conversation avant --reel.

Regles : memes groupes et meme fiche gardee que docs/DOUBLONS.md (doublons.groupes_file, doublons.a_garder) ; une fiche
relue par Monsieur DUCOUT n'est jamais rejetee (listee a part, pour sa decision) ; chaque fiche rejetee recoit
status = archived et une validation « rejetee » au nom de la seance, l'identifiant de la fiche gardee en commentaire.
Rien d'autre n'est touche.

Usage :
  python scripts/rejeter_doublons.py          # essai a blanc : liste, rien n'est ecrit
  python scripts/rejeter_doublons.py --reel   # sauvegarde JSON dans scripts/sauvegardes/, puis ecriture et relecture
"""
from __future__ import annotations

import argparse
import json
import sys
from collections import Counter
from datetime import date, datetime
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "scraping"))
import doublons  # noqa: E402
from import_to_firestore import DEFAULT_KEY, RELECTEUR  # noqa: E402

SAUVEGARDES = Path(__file__).resolve().parent / "sauvegardes"
PAR = "session (doublon, decision de Monsieur DUCOUT du 2026-11-13)"


def rejets(groupes: list[list[tuple[str, dict]]], relais: set[str], jour: str) -> tuple[list[tuple[str, dict, dict]], list[tuple[str, dict]]]:
    """(fiches a rejeter : identifiant, document, mise a jour) et fiches relues par Monsieur DUCOUT laissees a sa
    decision (fonction pure)."""
    a_ecrire, relues = [], []
    for g in groupes:
        garde, raison = doublons.a_garder(g, relais)
        for ident, d in g:
            if ident == garde:
                continue
            if (d.get("validation") or {}).get("par") == RELECTEUR:
                relues.append((ident, d))
                continue
            a_ecrire.append((ident, d, {"status": "archived",
                                        "validation": {"statut": "rejetee", "commentaire": f"doublon de {garde} ({raison})",
                                                       "date": jour, "par": PAR}}))
    return a_ecrire, relues


def _serialisable(valeur):
    return valeur.isoformat() if hasattr(valeur, "isoformat") else valeur


def main() -> int:
    parser = argparse.ArgumentParser(description="Rejet des doublons de docs/DOUBLONS.md, avec sauvegarde.")
    parser.add_argument("--reel", action="store_true", help="ecrire en base (sinon essai a blanc)")
    parser.add_argument("--key", default=str(DEFAULT_KEY))
    args = parser.parse_args()
    if not Path(args.key).exists():
        print(f"Cle de compte de service introuvable : {args.key}", file=sys.stderr)
        return 1

    import firebase_admin
    import registre
    from firebase_admin import credentials, firestore

    firebase_admin.initialize_app(credentials.Certificate(args.key))
    col = firestore.client().collection("aap")
    relais = {s["id"] for s in registre.charger() if s.get("relais")}
    fiches = [(doc.id, d) for doc in col.stream() for d in [doc.to_dict()]
              if d.get("status") == "published" or (d.get("status") == "draft" and (d.get("validation") or {}).get("statut") == "proposee")]
    a_ecrire, relues = rejets(doublons.groupes_file(fiches), relais, date.today().isoformat())
    par_statut = Counter(f"{d.get('status')} / {(d.get('validation') or {}).get('statut', '')}" for _, d, _ in a_ecrire)
    print(f"{len(fiches)} fiches comparées ; {len(a_ecrire)} à rejeter (" + ", ".join(f"{k} : {v}" for k, v in sorted(par_statut.items())) + ")")
    for ident, d, maj in a_ecrire:
        print(f"  {ident}  {d.get('status'):9s}  {(d.get('title') or '')[:60]}  -> {maj['validation']['commentaire'][:60]}")
    print(f"Relues par Monsieur DUCOUT, à trancher par lui : {len(relues)}")
    for ident, d in relues:
        print(f"  {ident}  {(d.get('title') or '')[:80]}")
    if not args.reel:
        print("Essai à blanc : rien n'a été écrit.")
        return 0
    if not a_ecrire:
        return 0
    SAUVEGARDES.mkdir(exist_ok=True)
    chemin = SAUVEGARDES / f"doublons_{datetime.now().strftime('%Y-%m-%d_%H%M')}.json"
    chemin.write_text(json.dumps({i: {k: _serialisable(v) for k, v in d.items()} for i, d, _ in a_ecrire},
                                 ensure_ascii=False, indent=1, default=str), encoding="utf-8")
    print(f"Sauvegarde : {chemin} ({len(a_ecrire)} fiches)")
    batch = col._client.batch()
    for ident, _, maj in a_ecrire:
        batch.update(col.document(ident), maj)
    batch.commit()
    relu = Counter((col.document(i).get().to_dict() or {}).get("status") for i, _, _ in a_ecrire)
    print(f"Relecture en base : {dict(relu)} sur {len(a_ecrire)} fiches rejetées.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
