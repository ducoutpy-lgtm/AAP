"""Tests de la vérification assistée (fonctions pures, sans réseau ni appel API)."""
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import verification as v  # noqa: E402


def reponse(**verdicts):
    champs = {nom: {"verdict": "juste", "raison": "ok"} for nom in v.CHAMPS_VERIFIES}
    for nom, (verdict, correction) in verdicts.items():
        champs[nom] = {"verdict": verdict, "correction": correction, "raison": "lu sur la page"}
    return {"est_un_appel": True, "remarque": "", "champs": champs}


def test_normaliser_verification_ramene_les_verdicts_inconnus_a_incertain():
    r = reponse(date_cloture=("faux", "2026-11-30"), montant_max=("fabrique", None))
    r["champs"]["titre"]["verdict"] = "bizarre"
    del r["champs"]["territoire"]
    n = v.normaliser_verification(r, "claude-haiku-5-5", "page", "2026-10-15T10:00:00")
    assert n["champs"]["titre"]["verdict"] == "incertain" and n["champs"]["territoire"]["verdict"] == "incertain"
    assert n["champs"]["date_cloture"] == {"verdict": "faux", "correction": "2026-11-30", "raison": "lu sur la page"}
    assert n["champs"]["montant_max"]["correction"] is None
    assert n["douteux"] == ["date_cloture", "montant_max"] and n["est_un_appel"] is True
    assert n["modele"] == "claude-haiku-5-5" and n["version_consigne"] == v.VERSION_CONSIGNE
    # Reponse degradee : verdict donne comme simple texte, ou bloc champs qui n'est pas un objet (cas vu le 2026-10-15)
    degrade = v.normaliser_verification({"champs": {"titre": "faux", "financeur": "n'importe quoi", "territoire": 3}}, "m", "page", "t")
    assert degrade["champs"]["titre"]["verdict"] == "faux" and degrade["champs"]["financeur"]["verdict"] == "incertain"
    assert degrade["champs"]["territoire"]["verdict"] == "incertain" and degrade["douteux"] == ["titre"]
    assert v.normaliser_verification({"champs": "rien"}, "m", "page", "t")["douteux"] == []
    vide = v.normaliser_verification(None, "m", "fiche", "t")
    assert all(c["verdict"] == "incertain" for c in vide["champs"].values()) and vide["douteux"] == [] and vide["est_un_appel"] is None


def test_a_verifier_champ_ouverture_et_deja_verifiee():
    fiches = [
        {"titre": "a", "date_cloture": "2026-12-31", "scrape_metadata": {"champ": "sante"}},
        {"titre": "b", "scrape_metadata": {"champ": "medico-social"}},  # sans date : ouverte
        {"titre": "c", "date_cloture": "2026-01-01", "scrape_metadata": {"champ": "sante"}},  # close
        {"titre": "d", "scrape_metadata": {"champ": "hors-champ"}},
        {"titre": "e", "scrape_metadata": {"champ": "incertain", "verification": {"version_consigne": v.VERSION_CONSIGNE}}},
        {"titre": "f", "scrape_metadata": {"champ": "incertain", "verification": {"version_consigne": 0}}},  # ancienne consigne
        {"titre": "g", "scrape_metadata": {}},
    ]
    assert [f["titre"] for f in v.a_verifier(fiches, "2026-10-15")] == ["a", "b", "f"]


def test_estimation_et_douteux():
    assert 0 < v.estimation_euros(2700, "claude-haiku-5-5") < 0.001
    with pytest.raises(ValueError):
        v.estimation_euros(2700, "modele-inconnu")
    assert v.douteux({"scrape_metadata": {"verification": {"douteux": ["titre"]}}}) == ["titre"]
    assert v.douteux({"scrape_metadata": {}}) == [] and v.douteux({}) == []
    assert v.fiche_resumee({"titre": "T", "financeur": "F", "autre": 1}) == {nom: ("T" if nom == "titre" else "F" if nom == "financeur" else None)
                                                                            for nom in v.CHAMPS_VERIFIES}


def test_bilan_et_rapport_markdown():
    ok = v.normaliser_verification(reponse(), "m", "page", "t")
    douteuse = v.normaliser_verification(reponse(date_cloture=("faux", "2026-11-30"), financeur=("manquant", "ARS Normandie")), "m", "page", "t")
    pas_appel = v.normaliser_verification({**reponse(), "est_un_appel": False}, "m", "page", "t")
    fiches = [{"titre": "Fiche sûre", "url_source": "https://a", "scrape_metadata": {"source": "ars-normandie", "verification": ok}},
              {"titre": "Fiche douteuse | pipe", "url_source": "https://b", "scrape_metadata": {"source": "ars-normandie", "verification": douteuse}},
              {"titre": "Liste", "url_source": "https://c", "scrape_metadata": {"source": "cnsa", "verification": pas_appel}},
              {"titre": "Non vérifiée", "url_source": "https://d", "scrape_metadata": {"source": "cnsa"}}]
    b = v.bilan(fiches)
    assert (b["verifiees"], b["douteuses"], b["sans_doute"], b["pas_un_appel"]) == (3, 1, 2, 1)
    assert b["par_champ"]["date_cloture"]["faux"] == 1 and b["par_source"]["ars-normandie"] == {"verifiees": 2, "douteuses": 1}
    md = v.rapport_markdown(fiches, "2026-10-15")
    assert "Fiches vérifiées : 3 ; sans doute : 2 ; douteuses : 1" in md
    assert "| date_cloture | 2 | 1 | 0 | 0 | 0 | 0 |" in md
    assert "| ars-normandie | 2 | 1 | 50 % |" in md
    assert "Fiche douteuse / pipe" in md and "date_cloture (faux, page : 2026-11-30)" in md and "financeur (manquant, page : ARS Normandie)" in md
    assert "Fiche sûre" not in md.split("## Fiches douteuses")[1]


def controlee(douteux=(), est_un_appel=True, champ="sante", **champs):
    ver = {"modele": "m", "le": "2026-10-15T11:00:00", "est_un_appel": est_un_appel, "douteux": list(douteux),
           "champs": {nom: {"verdict": verdict, "correction": correction} for nom, (verdict, correction) in champs.items()}}
    return {"titre": "t", "date_ouverture": "2026-01-01", "date_cloture": None, "montant_max": 5000,
            "scrape_metadata": {"champ": champ, "verification": ver}}


def test_decision_du_modele_valide_corrige_ou_laisse_a_relire():
    # Demande du 2026-10-15 : le contrôle vaut relecture, les corrections lisibles sont appliquées
    assert v.decision_du_modele({"titre": "t"}) is None  # fiche non contrôlée
    assert v.decision_du_modele(controlee())["statut"] == "validee"
    assert v.decision_du_modele(controlee(["description"], description=("faux", None)))["statut"] == "validee"
    d = v.decision_du_modele(controlee(["date_cloture", "date_ouverture", "montant_max", "enveloppe_globale"],
                                       date_cloture=("manquant", "2026-04-30"), date_ouverture=("fabrique", None),
                                       montant_max=("faux", "36 000"), enveloppe_globale=("manquant", "910000")))
    assert d["statut"] == "validee"
    assert d["corrections"] == {"date_cloture": "2026-04-30", "date_ouverture": None, "montant_max": 36000,
                                "enveloppe_globale": "910000"}
    assert "corrigé d'après la page" in d["commentaire"] and "contrôle du modèle" in d["commentaire"]
    corrigee = v.appliquer_corrections(controlee(), d)
    assert corrigee["date_cloture"] == "2026-04-30" and corrigee["date_ouverture"] is None and corrigee["montant_max"] == 36000
    # Doute sur le titre ou montant « incertain » : Monsieur DUCOUT relit
    d2 = v.decision_du_modele(controlee(["titre", "montant_min"], titre=("faux", "autre"), montant_min=("faux", "incertain")))
    assert d2["statut"] == "a_corriger" and d2["a_relire"] == ["titre"] and d2["corrections"] == {"montant_min": None}
    # Page qui ne décrit pas un appel : rejetée
    assert v.decision_du_modele(controlee(est_un_appel=False))["statut"] == "rejetee"


def test_restantes_a_relire_ecarte_hors_champ_et_fiches_tranchees():
    fiches = [controlee(champ="hors-champ"), controlee(), controlee(est_un_appel=False),
              controlee(["titre"], titre=("faux", "x")), {"titre": "jamais contrôlée", "scrape_metadata": {"champ": "sante"}}]
    restantes = v.restantes_a_relire(fiches)
    assert [f["titre"] for f in restantes] == ["t", "jamais contrôlée"] and restantes[0]["scrape_metadata"]["verification"]["douteux"] == ["titre"]


def test_decision_du_modele_garde_les_dates_d_un_csv():
    """Connecteur appelsprojetsrecherche.fr (2026-10-21) : les dates viennent d'une colonne du CSV, pas du texte lu par
    le modèle ; un verdict « fabriqué » sur une date ne doit pas la retirer."""
    fiche = controlee(["date_cloture", "date_ouverture"], date_cloture=("fabrique", None), date_ouverture=("fabrique", None))
    fiche["scrape_metadata"]["moteur"] = "csv"
    d = v.decision_du_modele(fiche)
    assert d["statut"] == "validee" and d["corrections"] == {}
    fiche["scrape_metadata"]["moteur"] = "api"
    assert v.decision_du_modele(fiche)["corrections"] == {"date_cloture": None, "date_ouverture": None}
