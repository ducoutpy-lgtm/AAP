"""Tests des fonctions pures du connecteur Funding & Tenders (sans réseau), changement connecteur-funding-tenders."""
import json
import sys
from datetime import date
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
import funding_tenders as ft  # noqa: E402

AUJOURDHUI = date(2026, 10, 28)
BUDGET = json.dumps({"budgetYearsColumns": ["2027"], "budgetTopicActionMap": {
    "113105": [{"action": "HORIZON-HLTH-2027-01-CARE-02 - HORIZON-RIA HORIZON  Research and Innovation Actions",
                "minContribution": 6000000, "maxContribution": 8000000, "budgetYearMap": {"2027": "24000000"}}],
    "113106": [{"action": "HORIZON-HLTH-2027-01-DISEASE-08 - HORIZON-RIA", "minContribution": 8000000,
                "maxContribution": 10000000, "budgetYearMap": {"2027": "44200000"}}]}})


def resultat(identifiant, **meta):
    base = {"identifier": [identifiant], "title": ["Personalised approaches to reduce risks from Adverse Drug Reactions"],
            "status": ["31094501"], "startDate": ["2026-10-29T00:00:00.000+0000"],
            "deadlineDate": ["2027-02-17T00:00:00.000+0000"], "callTitle": ["Cluster 1 - Health (Single stage - 2027/1)"],
            "typesOfAction": ["HORIZON  Research and Innovation Actions"],
            "descriptionByte": ["<p>Expected Outcome:</p><p>Proposals should   contribute to <b>safer</b> care.</p>"],
            "budgetOverview": [BUDGET],
            "url": [f"https://ec.europa.eu/info/funding-tenders/opportunities/portal/screen/opportunities/topic-details/{identifiant}"]}
    base.update(meta)
    return {"metadata": base}


def test_conversion_d_un_appel():
    fiche = ft.fiche_depuis_resultat(resultat("HORIZON-HLTH-2027-01-CARE-02"), "2026-10-28T10:00:00+00:00", AUJOURDHUI)
    assert fiche["titre"] == "Personalised approaches to reduce risks from Adverse Drug Reactions"
    assert fiche["financeur"] == "Commission européenne – Horizon Europe, pôle Santé"
    assert fiche["date_ouverture"] == "2026-10-29" and fiche["date_cloture"] == "2027-02-17"
    assert fiche["url_source"].endswith("/topic-details/HORIZON-HLTH-2027-01-CARE-02")
    assert fiche["montant_min"] == 6000000 and fiche["montant_max"] == 8000000
    assert "safer care" in fiche["description"] and "<b>" not in fiche["description"]
    m = fiche["scrape_metadata"]
    assert m["source"] == "portail-funding-tenders-commission-europeenne" and m["moteur"] == "api-portail"
    assert m["champ"] == "sante" and m["identifiant_portail"] == "HORIZON-HLTH-2027-01-CARE-02"


def test_premiere_date_a_venir():
    deux_etapes = resultat("HORIZON-HLTH-2026-02-TOOL-01-two-stage",
                           deadlineDate=["2026-09-16T00:00:00.000+0000", "2027-04-13T00:00:00.000+0000"])
    fiche = ft.fiche_depuis_resultat(deux_etapes, "x", AUJOURDHUI)
    assert fiche["date_cloture"] == "2027-04-13"


def test_programmes_retenus_et_ecartes():
    assert ft.retenu("HORIZON-HLTH-2027-01-CARE-02") and ft.retenu("EU4H-2026-PJ-03")
    assert ft.retenu("HORIZON-JU-IHI-2026-12-01") and ft.retenu("HORIZON-JU-GH-EDCTP3-2026-02-01")
    assert ft.retenu("HORIZON-MISS-2027-02-CANCER-05")
    assert not ft.retenu("HORIZON-MISS-2027-01-CLIMA-02") and not ft.retenu("HORIZON-CL5-2027-01-D3-04")
    assert not ft.retenu("I3-2026-INV2a")


def test_tri_et_doublons():
    resultats = [resultat("HORIZON-HLTH-2027-01-CARE-02"), resultat("HORIZON-HLTH-2027-01-CARE-02"),
                 resultat("HORIZON-CL5-2027-01-D3-04"), {"metadata": {"identifier": ["HORIZON-HLTH-X"], "title": []}}]
    fiches = ft.fiches_de_sante(resultats, "x", AUJOURDHUI)
    assert [f["scrape_metadata"]["identifiant_portail"] for f in fiches] == ["HORIZON-HLTH-2027-01-CARE-02"]


def test_statut_perime_ecarte():
    """Le portail laisse « ouvert » ou « à venir » des appels clos depuis 2023-2024 : écartés."""
    perime = resultat("HORIZON-HLTH-2024-IND-06-08", deadlineDate=["2024-04-11T00:00:00.000+0000"])
    assert ft.fiches_de_sante([perime, resultat("HORIZON-HLTH-2027-01-CARE-02")], "x", AUJOURDHUI)[0]["scrape_metadata"][
        "identifiant_portail"] == "HORIZON-HLTH-2027-01-CARE-02"
    assert len(ft.fiches_de_sante([perime], "x", AUJOURDHUI)) == 0


def test_relance_conserve_qualification_et_controle():
    """Le connecteur réécrit son fichier à chaque veille : qualification et contrôle déjà payés sont repris."""
    ancienne = ft.fiche_depuis_resultat(resultat("HORIZON-HLTH-2027-01-CARE-02"), "x", AUJOURDHUI)
    ancienne["scrape_metadata"].update(qualification={"type_appel": "appel-a-projets"}, verification={"douteux": []})
    nouvelles = ft.fiches_de_sante([resultat("HORIZON-HLTH-2027-01-CARE-02"), resultat("HORIZON-HLTH-2027-01-DISEASE-08")], "y", AUJOURDHUI)
    fusion = ft.conserver_enrichissements(nouvelles, [ancienne])
    assert fusion[0]["scrape_metadata"]["qualification"] == {"type_appel": "appel-a-projets"}
    assert fusion[0]["scrape_metadata"]["verification"] == {"douteux": []}
    assert "qualification" not in fusion[1]["scrape_metadata"]


def test_lecture_triee_par_identifiant():
    assert ft.TRI == {"field": "identifier", "order": "ASC"}


def test_budget_absent_ou_illisible():
    fiche = ft.fiche_depuis_resultat(resultat("HORIZON-HLTH-2027-01-DISEASE-09", budgetOverview=["pas du json"]), "x", AUJOURDHUI)
    assert fiche["montant_min"] is None and fiche["montant_max"] is None
