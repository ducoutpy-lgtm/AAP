"""Tests de la qualification des fiches (fonctions pures, sans réseau ni appel API)."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import qualifier_fiches as q  # noqa: E402


def test_normaliser_qualification_ecarte_les_valeurs_hors_liste_et_les_dates_invalides():
    r = {"destinataires": ["public", "martiens", "prive-non-lucratif"], "type_appel": "truc", "objets": ["immobilier", "x"],
         "date_ouverture": "le 3 mars", "pieces_attendues": ["Dossier", "", "  Budget "], "champ": "sante", "raison": "ok"}
    n = q.normaliser_qualification(r, "claude-haiku-5-5", "2026-10-20T20:00:00", "page")
    assert n["destinataires"] == ["public", "prive-non-lucratif"]
    assert n["type_appel"] == "autre"
    assert n["objets"] == ["immobilier"]
    assert n["date_ouverture"] is None
    assert n["pieces_attendues"] == ["Dossier", "Budget"]
    assert n["champ"] == "sante" and n["version_consigne"] == q.VERSION_CONSIGNE


def test_tous_absorbe_les_autres_destinataires_et_la_reponse_vide_reste_sure():
    n = q.normaliser_qualification({"destinataires": ["public", "tous"], "type_appel": "ami", "objets": [], "champ": "medico-social",
                                    "date_ouverture": "2026-11-02"}, "m", "t", "page")
    assert n["destinataires"] == ["tous"] and n["date_ouverture"] == "2026-11-02" and n["type_appel"] == "ami"
    vide = q.normaliser_qualification(None, "m", "t", "fiche")
    assert vide["destinataires"] == [] and vide["type_appel"] == "autre" and vide["champ"] == "incertain"


def test_a_qualifier_meme_perimetre_que_le_controle():
    fiches = [
        {"titre": "a", "scrape_metadata": {"champ": "sante"}, "date_cloture": "2027-01-01"},
        {"titre": "b", "scrape_metadata": {"champ": "hors-champ"}, "date_cloture": "2027-01-01"},
        {"titre": "c", "scrape_metadata": {"champ": "medico-social"}, "date_cloture": "2026-01-01"},
        {"titre": "d", "scrape_metadata": {"champ": "incertain"}, "date_cloture": None},
        {"titre": "e", "scrape_metadata": {"champ": "sante", "qualification": {"version_consigne": q.VERSION_CONSIGNE}}},
    ]
    assert [f["titre"] for f in q.a_qualifier(fiches, "2026-10-20")] == ["a", "d"]
    # Une fiche locale dont l'adresse est déjà portée par le fichier API n'est pas qualifiée deux fois
    fiches[0]["url_source"] = "https://exemple.fr/a"
    assert [f["titre"] for f in q.a_qualifier(fiches, "2026-10-20", {"https://exemple.fr/a"})] == ["d"]


def test_bilan_compte_par_destinataire_et_type():
    fiches = [
        {"scrape_metadata": {"qualification": {"destinataires": ["public", "prive-non-lucratif"], "type_appel": "appel-a-projets", "champ": "sante", "date_ouverture": "2026-11-01", "pieces_attendues": ["x"]}}},
        {"scrape_metadata": {"qualification": {"destinataires": [], "type_appel": "mecenat", "champ": "hors-champ", "date_ouverture": None, "pieces_attendues": []}}},
        {"scrape_metadata": {}},
    ]
    b = q.bilan(fiches)
    assert b["qualifiees"] == 2 and b["hors_champ"] == 1 and b["avec_date_ouverture"] == 1 and b["avec_pieces"] == 1
    assert b["par_destinataire"] == {"public": 1, "prive-non-lucratif": 1, "(vide)": 1}
    assert b["par_type"] == {"appel-a-projets": 1, "mecenat": 1}


def test_estimation_connue_et_positive():
    assert 0 < q.estimation_euros(10_000, "claude-haiku-5-5") < 0.01
