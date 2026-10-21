"""Connecteur du portail appelsprojetsrecherche.fr (changement connecteur-appelsprojetsrecherche, 2026-10-21).

Pourquoi : le portail commun des agences de recherche (ANR, Inserm, ANRS, Anses, INCa, ADEME et vingt autres)
liste 125 appels, dont une vingtaine en santé ; sa page charge la liste par script et la découverte n'y voit rien.
Le bouton « Exporter la recherche » donne un CSV complet (partenaire, titre, description, dates, lien) : une seule
requête, sans navigateur ni modèle, des dates structurées, aucune fabrication possible.

Usage :
  python portail_recherche.py            # écrit results/appelsprojetsrecherche.json
  python portail_recherche.py --fichier export.csv   # depuis un export déjà téléchargé (essai sans réseau)

Le classement du champ (champ.py, Haiku, après devis), le contrôle, la qualification et l'import suivent la chaîne
habituelle : ce script ne fait aucun appel payant.
"""
from __future__ import annotations

import argparse
import csv
import io
import json
import sys
from datetime import date, datetime, timezone
from pathlib import Path

import httpx

from schema import AapNormalized
from utils import DEFAULT_HTTP_HEADERS, ensure_utf8_stdout

ICI = Path(__file__).resolve().parent
EXPORT = "https://www.appelsprojetsrecherche.fr/export-csv"
SORTIE = ICI / "results" / "appelsprojetsrecherche.json"
SOURCE_ID = "appelsprojetsrecherche-fr"  # identifiant de la source au registre (scraping/sources/registre.json)
COLONNES = {"partenaire": "Partenaire", "titre": "Titre", "description": "Description", "publication": "Date de publication",
            "ouverture": "Date d'ouverture", "cloture": "Date de clôture", "lien": "Lien de l'appel à projets",
            "maj": "Date de mise à jour sur le portail"}


def date_iso(texte: str | None) -> str | None:
    """« 21/10/2026 11:00 » -> « 2026-10-21» ; vide ou illisible -> None (fonction pure)."""
    t = (texte or "").strip()
    if not t:
        return None
    try:
        return datetime.strptime(t[:10], "%d/%m/%Y").date().isoformat()
    except ValueError:
        return None


def _valeur(ligne: dict, cle: str) -> str:
    # Le portail met un marqueur d'ordre des octets (BOM) devant la première colonne et parfois devant la première
    # valeur : on le retire partout pour retrouver les colonnes et des textes propres.
    for k, v in ligne.items():
        if (k or "").replace("﻿", "").strip() == COLONNES[cle]:
            return (v or "").replace("﻿", "").strip()
    return ""


def fiche_depuis_ligne(ligne: dict, maintenant: str) -> dict | None:
    """Une ligne du CSV -> fiche AapNormalized (dict), ou None si le titre ou le lien manque (fonction pure)."""
    titre, lien = _valeur(ligne, "titre"), _valeur(ligne, "lien")
    if not titre or not lien.startswith("http"):
        return None
    fiche = AapNormalized(
        titre=titre,
        financeur=_valeur(ligne, "partenaire") or "Portail appelsprojetsrecherche.fr",
        description=_valeur(ligne, "description"),
        url_source=lien,
        date_ouverture=date_iso(_valeur(ligne, "ouverture")),
        date_cloture=date_iso(_valeur(ligne, "cloture")),
        scrape_metadata={
            "source": SOURCE_ID, "moteur": "csv", "modele": "", "scraped_at": maintenant, "collecte_le": maintenant,
            "produite_le": maintenant, "vue_rubrique_le": maintenant, "partenaire": _valeur(ligne, "partenaire"),
            "publie_le": date_iso(_valeur(ligne, "publication")), "mis_a_jour_le": date_iso(_valeur(ligne, "maj")),
        },
    )
    return fiche.model_dump()


def lignes_du_csv(texte: str) -> list[dict]:
    return list(csv.DictReader(io.StringIO(texte.replace("﻿", "", 1)), delimiter=";"))


def resume(fiches: list[dict], aujourdhui: date) -> dict:
    """Compteurs pour le terminal : fiches, ouvertes (clôture future ou absente), par partenaire (fonction pure)."""
    ouvertes = [f for f in fiches if not f.get("date_cloture") or f["date_cloture"] >= aujourdhui.isoformat()]
    par_partenaire: dict[str, int] = {}
    for f in fiches:
        par_partenaire[f["financeur"]] = par_partenaire.get(f["financeur"], 0) + 1
    return {"fiches": len(fiches), "ouvertes": len(ouvertes), "par_partenaire": dict(sorted(par_partenaire.items(), key=lambda x: -x[1]))}


def telecharger() -> str:
    with httpx.Client(follow_redirects=True, timeout=60, headers=DEFAULT_HTTP_HEADERS) as client:
        reponse = client.get(EXPORT)
    reponse.raise_for_status()
    if "csv" not in reponse.headers.get("content-type", ""):
        raise RuntimeError(f"réponse inattendue du portail : {reponse.headers.get('content-type')}")
    return reponse.text


def main() -> int:
    ensure_utf8_stdout()
    parser = argparse.ArgumentParser(description="Portail appelsprojetsrecherche.fr -> results/appelsprojetsrecherche.json")
    parser.add_argument("--fichier", help="export CSV déjà téléchargé (sinon téléchargement)")
    args = parser.parse_args()
    try:
        texte = Path(args.fichier).read_text(encoding="utf-8") if args.fichier else telecharger()
    except (httpx.HTTPError, RuntimeError, OSError) as err:
        print(f"Export du portail indisponible, fichier de résultats inchangé : {err}")
        return 1
    maintenant = datetime.now(timezone.utc).isoformat()
    lignes = lignes_du_csv(texte)
    fiches = [f for f in (fiche_depuis_ligne(l, maintenant) for l in lignes) if f]
    r = resume(fiches, date.today())
    SORTIE.parent.mkdir(exist_ok=True)
    SORTIE.write_text(json.dumps(fiches, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"{len(lignes)} lignes lues, {r['fiches']} fiches écrites ({len(lignes) - r['fiches']} ignorées), "
          f"{r['ouvertes']} encore ouvertes -> {SORTIE.relative_to(ICI)}")
    print("Par partenaire : " + ", ".join(f"{k} {v}" for k, v in list(r["par_partenaire"].items())[:12]))
    return 0


if __name__ == "__main__":
    sys.exit(main())
