"""Tirage au sort de fiches qualifiées à relire par Monsieur DUCOUT (changement qualification-appels, tâche 2.6).

Pourquoi : la spec demande qu'il confirme les destinataires d'au moins dix-huit fiches sur vingt. Le tirage est
reproductible (graine fixe) et écrit un tableau Markdown à cocher.

Usage : python tirage_qualification.py [--nombre 20] [--graine 2026]  -> TIRAGE_QUALIFICATION.md
"""
from __future__ import annotations

import argparse
import random
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import echantillon  # noqa: E402
from champ import fichiers_de_l_import  # noqa: E402

ICI = Path(__file__).resolve().parent
LIBELLES = {"public": "Établissements publics", "prive-non-lucratif": "Privé non lucratif", "prive-lucratif": "Privé lucratif",
            "collectivites": "Collectivités", "recherche": "Recherche", "tous": "Toute structure"}


def tirer(fiches: list[dict], nombre: int, graine: int) -> list[dict]:
    """Fiches qualifiées, tirées sans remise, ordre reproductible (fonction pure)."""
    qualifiees = [f for f in fiches if (f.get("scrape_metadata") or {}).get("qualification")]
    rnd = random.Random(graine)
    return rnd.sample(qualifiees, min(nombre, len(qualifiees)))


def tableau(fiches: list[dict]) -> str:
    lignes = ["# Vingt fiches à relire : à qui s'adresse l'appel ?", "",
              "Cochez « Juste » si les destinataires lus par le modèle correspondent à l'annonce, sinon notez la bonne réponse.", "",
              "| N | Appel | Financeur | Destinataires (modèle) | Type | Juste ? | Correction |", "|---|---|---|---|---|---|---|"]
    for i, f in enumerate(fiches, 1):
        q = f["scrape_metadata"]["qualification"]
        dest = ", ".join(LIBELLES.get(d, d) for d in q.get("destinataires") or []) or "(aucun)"
        lignes.append(f"| {i} | [{(f.get('titre') or '')[:70]}]({f.get('url_source', '')}) | {f.get('financeur', '')} | {dest} | {q.get('type_appel', '')} | [ ] | |")
    return "\n".join(lignes) + "\n"


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--nombre", type=int, default=20)
    parser.add_argument("--graine", type=int, default=2026)
    args = parser.parse_args()
    fiches = [f for chemin in fichiers_de_l_import() for f in echantillon._charger_liste(chemin)]
    tirage = tirer(fiches, args.nombre, args.graine)
    (ICI / "TIRAGE_QUALIFICATION.md").write_text(tableau(tirage), encoding="utf-8")
    print(f"{len(tirage)} fiches tirées -> TIRAGE_QUALIFICATION.md")
    return 0


if __name__ == "__main__":
    sys.exit(main())
