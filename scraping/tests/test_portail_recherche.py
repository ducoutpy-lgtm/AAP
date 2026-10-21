"""Tests des fonctions pures du connecteur appelsprojetsrecherche.fr (sans réseau)."""
import sys
from datetime import date
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
import portail_recherche as pr  # noqa: E402

CSV = (
    '﻿Partenaire;Titre;Description;"Date de publication";"Date d\'ouverture";"Date de clôture";"Lien de l\'appel à projets";"Date de mise à jour sur le portail"\n'
    '﻿INCa;ZEROEXPO;"Appel à projets sur l\'exposition";21/10/2026 11:00;26/10/2026 10:00;24/11/2026 17:00;https://www.appelsprojetsrecherche.fr/appel/zeroexpo;21/10/2026 11:00\n'
    'ANR;;"Ligne sans titre";21/10/2026 11:00;;;https://www.appelsprojetsrecherche.fr/appel/x;\n'
    'Anses;"Radiofréquences et santé";"Sans dates";;;;https://www.appelsprojetsrecherche.fr/appel/rf;\n'
)


def test_fiche_depuis_ligne_dates_et_bom():
    lignes = pr.lignes_du_csv(CSV)
    fiche = pr.fiche_depuis_ligne(lignes[0], "2026-10-21T15:00:00+00:00")
    assert fiche["titre"] == "ZEROEXPO" and fiche["financeur"] == "INCa"
    assert fiche["date_ouverture"] == "2026-10-26" and fiche["date_cloture"] == "2026-11-24"
    assert fiche["url_source"] == "https://www.appelsprojetsrecherche.fr/appel/zeroexpo"
    assert fiche["scrape_metadata"]["source"] == "appelsprojetsrecherche-fr" and fiche["scrape_metadata"]["moteur"] == "csv"


def test_ligne_sans_titre_ignoree_et_dates_vides():
    lignes = pr.lignes_du_csv(CSV)
    assert pr.fiche_depuis_ligne(lignes[1], "x") is None
    sans_dates = pr.fiche_depuis_ligne(lignes[2], "x")
    assert sans_dates["date_cloture"] is None and sans_dates["date_ouverture"] is None


def test_resume_compte_les_ouvertes():
    lignes = pr.lignes_du_csv(CSV)
    fiches = [f for f in (pr.fiche_depuis_ligne(l, "x") for l in lignes) if f]
    r = pr.resume(fiches, date(2026, 12, 1))
    assert r["fiches"] == 2 and r["ouvertes"] == 1  # ZEROEXPO close le 24 novembre, la fiche sans date reste ouverte
    assert r["par_partenaire"] == {"INCa": 1, "Anses": 1}
    assert pr.date_iso("n'importe quoi") is None
