"""Tri automatique de la file « à valider » (changement OpenSpec tri-automatique-file, 2026-11-18).

Décision de Monsieur DUCOUT du 2026-11-18 : « tu dois me proposer uniquement les fiches où il y a un doute ». Pour chaque
fiche « Proposée » :
  - doublon d'une autre fiche (publiée ou dans la file) : rejetée, la fiche gardée est choisie par doublons.a_garder ;
  - aucun motif de doute : publiée, validation « validee » par « contrôle du modèle (tri automatique) » ;
  - au moins un motif : reste « Proposée », motifs écrits dans validation.commentaire (affichés dans /admin/aaps).
Une fiche relue par Monsieur DUCOUT n'est jamais touchée. Essai à blanc par défaut ; --reel écrit après sauvegarde.

    python scripts/trier_file.py           # essai à blanc : décompte et listes
    python scripts/trier_file.py --reel    # écriture, sauvegarde dans scripts/sauvegardes/tri_file_<date>.json
"""
from __future__ import annotations

import argparse
import json
import sys
from datetime import date, datetime, timezone
from pathlib import Path

ICI = Path(__file__).resolve().parent
sys.path.insert(0, str(ICI))
sys.path.insert(0, str(ICI.parent / "scraping"))
import doublons  # noqa: E402
from champ import DANS_LE_CHAMP  # noqa: E402
from import_to_firestore import DEFAULT_KEY, RELECTEUR, etiqueter  # noqa: E402

PAR = "contrôle du modèle (tri automatique)"
SAUVEGARDES = ICI / "sauvegardes"


def motifs_de_doute(f: dict, maintenant: datetime) -> list[str]:
    """Motifs qui envoient la fiche à Monsieur DUCOUT ; liste vide = fiche sûre (fonction pure). Un doute sur la seule
    description ne compte pas : la fiche renvoie toujours à l'annonce officielle."""
    sm = f.get("scrapeMetadata") or {}
    ver = sm.get("verification")
    motifs = []
    if not ver:
        motifs.append("jamais contrôlée")
    else:
        if ver.get("estUnAppel") is False:
            motifs.append("pas un appel selon le contrôle")
        douteux = sorted(x for x in (ver.get("douteux") or []) if x != "description")
        if douteux:
            motifs.append("doute du contrôle : " + ", ".join(douteux))
    champ = sm.get("champ")
    if champ not in DANS_LE_CHAMP:
        motifs.append("hors champ" if champ == "hors-champ" else "champ incertain")
    cloture = f.get("deadline")
    if cloture and cloture < maintenant:
        motifs.append("appel clos")
    return motifs


def decisions(file: list[tuple[str, dict]], groupes: list[list[tuple[str, dict]]], garder,
              maintenant: datetime) -> dict[str, tuple[str, str]]:
    """{identifiant: (action, motif)} pour les fiches de la file : « rejeter » (doublon), « publier » ou « laisser »
    (fonction pure ; garder(groupe) -> (identifiant gardé, raison))."""
    relue = lambda d: (d.get("validation") or {}).get("par") == RELECTEUR  # noqa: E731
    dans_la_file = {i for i, _ in file}
    resultat: dict[str, tuple[str, str]] = {}
    for groupe in groupes:
        garde, raison = garder(groupe)
        for i, d in groupe:
            if i != garde and i in dans_la_file and not relue(d):
                resultat[i] = ("rejeter", f"doublon de {garde} ({raison})")
    for i, d in file:
        if i in resultat or relue(d):
            continue
        motifs = motifs_de_doute(d, maintenant)
        resultat[i] = ("laisser", "À relire : " + " ; ".join(motifs)) if motifs else ("publier", "")
    return resultat


def selection(docs: list[tuple[str, dict]]) -> tuple[list[tuple[str, dict]], list[tuple[str, dict]]]:
    """(fiches comparées pour les doublons, file à trier) (fonction pure). La file : les fiches « Proposée » encore en
    brouillon ou publiées, jamais une fiche archivée ou clôturée à la main dans /admin/aaps, qui garde « Proposée » mais
    que le tri republiait (corrections-chaine-du-lundi 1.1, 2026-11-22). Les fiches publiées servent aux doublons."""
    proposee = lambda d: (d.get("validation") or {}).get("statut") == "proposee" and d.get("status") in ("draft", "published")
    fiches = [(i, d) for i, d in docs if proposee(d) or (d.get("status") == "published")]
    return fiches, [(i, d) for i, d in fiches if proposee(d)]


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--reel", action="store_true", help="écrire en base (sauvegarde d'abord)")
    parser.add_argument("--key", default=str(DEFAULT_KEY))
    parser.add_argument("--douter", default="", help="identifiants séparés par des virgules : fiches que la séance garde "
                                                       "dans la file après lecture de l'essai à blanc")
    args = parser.parse_args()

    import firebase_admin
    from firebase_admin import credentials, firestore

    import registre

    if not firebase_admin._apps:
        firebase_admin.initialize_app(credentials.Certificate(args.key))
    col = firestore.client().collection("aap")
    relais = {s["id"] for s in registre.charger() if s.get("relais")}
    fiches, file = selection([(doc.id, doc.to_dict()) for doc in col.stream()])
    maintenant = datetime.now(timezone.utc)
    dec = decisions(file, doublons.groupes_file(fiches), lambda g: doublons.a_garder(g, relais), maintenant)
    for i in filter(None, args.douter.split(",")):
        if dec.get(i, ("",))[0] == "publier":
            dec[i] = ("laisser", "À relire : doute de la séance à la lecture du tri (pas un appel de financement ouvert ?)")
    par_id = dict(file)
    for action in ("rejeter", "publier", "laisser"):
        ids = [i for i, (a, _) in dec.items() if a == action]
        print(f"\n{action} : {len(ids)}")
        for i in ids:
            print(f"  {i} | {(par_id[i].get('title') or '')[:70]} | {dec[i][1]}")
    if not args.reel:
        print("\nEssai à blanc : rien n'a été écrit.")
        return 0

    SAUVEGARDES.mkdir(exist_ok=True)
    sauvegarde = SAUVEGARDES / f"tri_file_{maintenant:%Y-%m-%d_%H%M}.json"
    sauvegarde.write_text(json.dumps({i: {"status": par_id[i].get("status"), "validation": par_id[i].get("validation"),
                                          "tags": par_id[i].get("tags")} for i in dec}, ensure_ascii=False, default=str),
                          encoding="utf-8")
    jour = date.today().isoformat()
    lot = firestore.client().batch()
    for n, (i, (action, motif)) in enumerate(dec.items(), 1):
        d = par_id[i]
        if action == "publier":
            changes = {"status": "published", "publishedAt": maintenant, "tags": etiqueter(d.get("tags") or [], "validee"),
                       "validation": {"statut": "validee", "par": PAR, "date": jour,
                                      "commentaire": "contrôlée par le modèle, aucun doute relevé"}}
        elif action == "rejeter":
            changes = {"status": "archived", "tags": etiqueter(d.get("tags") or [], "rejetee"),
                       "validation": {"statut": "rejetee", "par": PAR, "date": jour, "commentaire": motif}}
        else:
            changes = {"validation.commentaire": motif}
        lot.update(col.document(i), changes)
        if n % 400 == 0:
            lot.commit()
            lot = firestore.client().batch()
    lot.commit()
    print(f"\n{len(dec)} fiches écrites ; sauvegarde {sauvegarde}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
