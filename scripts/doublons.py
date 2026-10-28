"""Rapport des fiches publiees en double (changement nettoyage-financeurs-territoires, tache 4.1).

Pourquoi : deux pages differentes peuvent decrire le meme appel (page de liste et page de detail, deux sites qui relaient
le meme financeur). L'identifiant Firestore est l'adresse, donc la base garde deux fiches. Ce script les liste pour que
Monsieur DUCOUT decide laquelle garder dans la validation quotidienne ; il ne fusionne rien et n'ecrit rien.

Regle : meme titre (memes mots, sans accents, sans mots vides, dans n'importe quel ordre) et meme financeur canonique,
parmi les fiches publiees de la collection aap.

Option --file (changement doublons-file-a-valider, 2026-10-28) : lit aussi les brouillons « proposee » (file « a valider »
de Monsieur DUCOUT) et ajoute deux regles, parce qu'un relais garde le titre du financeur mais pas son nom : meme code de
programme europeen (HORIZON-..., EU4H-..., I3-...) dans le titre ou l'adresse ; meme date de cloture et au moins la
moitie des mots distinctifs du titre en commun. Propose la fiche a garder et ecrit docs/DOUBLONS.md ; rien en base.

Usage :
  python scripts/doublons.py           # fiches publiees, meme titre et meme financeur
  python scripts/doublons.py --file    # publiees et file « a valider », rapport docs/DOUBLONS.md
"""
from __future__ import annotations

import argparse
import re
import sys
from collections import defaultdict
from datetime import date
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "scraping"))
from financeurs import cle  # noqa: E402
from import_to_firestore import DEFAULT_KEY, RELECTEUR  # noqa: E402
from territoires import normaliser  # noqa: E402

RAPPORT = Path(__file__).resolve().parent.parent / "docs" / "DOUBLONS.md"
CODE = re.compile(r"\b((?:HORIZON|EU4H|I3|DIGITAL)-[A-Z0-9]+(?:-[A-Za-z0-9]+)+)")
# Mots qui ne distinguent pas deux appels (et mots vides) : retires avant de comparer deux titres
GENERIQUES = frozenset("""appel appels projet projets candidature candidatures aap ami manifestation interet france 2030
programme edition lance lancement nouvel nouvelle 2024 2025 2026 2027 2028 de des du la le les l d a au aux et en pour sur
un une par avec dans call calls for the of and""".split())


def groupes_de_doublons(fiches: list[tuple[str, dict]]) -> list[list[tuple[str, dict]]]:
    """Groupes de fiches (identifiant, document) de meme titre normalise et meme financeur (fonction pure)."""
    par_cle: dict[tuple[str, str], list[tuple[str, dict]]] = defaultdict(list)
    for ident, d in fiches:
        par_cle[(cle(d.get("title")), (d.get("financeurName") or "").strip())].append((ident, d))
    return [g for g in par_cle.values() if len(g) > 1]


def code_programme(d: dict) -> str | None:
    """Code d'appel europeen lu dans le titre ou l'adresse (HORIZON-HLTH-2027-01-DISEASE-08), sinon None."""
    for texte in (d.get("title") or "", d.get("externalUrl") or ""):
        m = CODE.search(texte)
        if m:
            return m.group(1).upper()
    return None


def mots_distinctifs(titre: str | None) -> frozenset[str]:
    return frozenset(m for m in normaliser(titre or "").split() if m not in GENERIQUES and len(m) > 1)


def _cloture(d: dict) -> date | None:
    v = d.get("deadline")
    return v.date() if hasattr(v, "date") else None


def meme_appel(a: dict, b: dict) -> bool:
    """Deux fiches decrivent-elles le meme appel ? Meme titre et financeur, meme code europeen, ou meme cloture et au
    moins la moitie des mots distinctifs (deux au moins) en commun (fonction pure)."""
    if cle(a.get("title")) == cle(b.get("title")) and (a.get("financeurName") or "") == (b.get("financeurName") or ""):
        return True
    ca, cb = code_programme(a), code_programme(b)
    if ca and cb:
        return ca == cb
    if _cloture(a) is None or _cloture(a) != _cloture(b):
        return False
    ma, mb = mots_distinctifs(a.get("title")), mots_distinctifs(b.get("title"))
    communs = ma & mb
    return len(communs) >= 2 and len(communs) >= 0.5 * min(len(ma), len(mb))


def groupes_file(fiches: list[tuple[str, dict]]) -> list[list[tuple[str, dict]]]:
    """Groupes de fiches qui decrivent le meme appel (union des paires appariees, fonction pure)."""
    parent = list(range(len(fiches)))

    def racine(i: int) -> int:
        while parent[i] != i:
            parent[i] = parent[parent[i]]
            i = parent[i]
        return i

    for i in range(len(fiches)):
        for j in range(i + 1, len(fiches)):
            if meme_appel(fiches[i][1], fiches[j][1]):
                parent[racine(i)] = racine(j)
    groupes: dict[int, list[tuple[str, dict]]] = defaultdict(list)
    for i, f in enumerate(fiches):
        groupes[racine(i)].append(f)
    return [g for g in groupes.values() if len(g) > 1]


def financeur_est_le_relais(d: dict, relais: set[str]) -> bool:
    """Le financeur affiché est-il le relais lui-même (« Lyonbiopôle … ») ? Premier mot significatif du financeur lu
    dans l'identifiant de la source relais (fonction pure)."""
    source = (d.get("scrapeMetadata") or {}).get("source") or ""
    mots = [m for m in normaliser(d.get("financeurName") or "").split() if len(m) > 3]
    return source in relais and bool(mots) and mots[0] in source.replace("-", "")


def a_garder(groupe: list[tuple[str, dict]], relais: set[str]) -> tuple[str, str]:
    """(identifiant, raison) de la fiche a garder : relue par Monsieur DUCOUT, puis publiee, puis financeur reel plutot
    que relais, puis source officielle, puis datee (fonction pure)."""
    def rang(f: tuple[str, dict]) -> tuple:
        d = f[1]
        return ((d.get("validation") or {}).get("par") != RELECTEUR, d.get("status") != "published",
                financeur_est_le_relais(d, relais), (d.get("scrapeMetadata") or {}).get("source") in relais,
                _cloture(d) is None, f[0])
    ident, d = min(groupe, key=rang)
    if (d.get("validation") or {}).get("par") == RELECTEUR:
        return ident, "relue par Monsieur DUCOUT"
    if d.get("status") == "published":
        return ident, "déjà publiée"
    if (d.get("scrapeMetadata") or {}).get("source") not in relais:
        return ident, "source officielle (connecteur ou site du financeur)"
    if not financeur_est_le_relais(d, relais):
        return ident, "financeur réel (lu en suivant un relais)"
    return ident, "relais, mais la mieux renseignée"


def rapport_markdown(groupes: list[list[tuple[str, dict]]], relais: set[str], n_fiches: int, jour: str) -> str:
    lignes = ["# Doublons de la file « à valider »", "",
              f"Généré le {jour} par `python scripts/doublons.py --file` (lecture seule, rien n'est modifié en base).", "",
              f"**{n_fiches} fiches comparées (publiées et « Proposée, non relue ») ; {len(groupes)} groupes, "
              f"{sum(len(g) for g in groupes)} fiches, {sum(len(g) - 1 for g in groupes)} à rejeter si la proposition convient.**",
              "", "Dans `/admin/aaps`, chercher le titre, garder la fiche marquée « garder » et rejeter les autres.", ""]
    for g in sorted(groupes, key=lambda g: (g[0][1].get("title") or "")):
        garde, raison = a_garder(g, relais)
        lignes += [f"## {(g[0][1].get('title') or '')[:100]}", "", "| | Financeur | Clôture | Statut | Identifiant | Adresse |",
                   "|---|---|---|---|---|---|"]
        for ident, d in sorted(g, key=lambda f: f[0] != garde):
            choix = f"garder ({raison})" if ident == garde else "rejeter"
            lignes.append(f"| {choix} | {d.get('financeurName') or ''} | {_cloture(d) or 'non précisée'} | "
                          f"{d.get('status')} / {(d.get('validation') or {}).get('statut', '')} | {ident} | {d.get('externalUrl') or ''} |")
        lignes.append("")
    return "\n".join(lignes)


def main() -> int:
    parser = argparse.ArgumentParser(description="Fiches publiees en double (titre et financeur identiques).")
    parser.add_argument("--key", default=str(DEFAULT_KEY))
    parser.add_argument("--file", action="store_true", help="publiees et file « a valider », rapport docs/DOUBLONS.md")
    args = parser.parse_args()
    if not Path(args.key).exists():
        print(f"Cle de compte de service introuvable : {args.key}", file=sys.stderr)
        return 1

    import firebase_admin
    from firebase_admin import credentials, firestore

    firebase_admin.initialize_app(credentials.Certificate(args.key))
    col = firestore.client().collection("aap")
    if args.file:
        import registre

        relais = {s["id"] for s in registre.charger() if s.get("relais")}
        fiches = [(doc.id, d) for doc in col.stream() for d in [doc.to_dict()]
                  if d.get("status") == "published" or (d.get("status") == "draft" and (d.get("validation") or {}).get("statut") == "proposee")]
        groupes = groupes_file(fiches)
        RAPPORT.write_text(rapport_markdown(groupes, relais, len(fiches), date.today().isoformat()) + "\n", encoding="utf-8")
        print(f"{len(fiches)} fiches comparées ; {len(groupes)} groupes ({sum(len(g) for g in groupes)} fiches) -> {RAPPORT}")
        return 0
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
