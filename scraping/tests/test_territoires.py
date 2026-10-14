"""Tests du territoire déduit (fonctions pures, table sources/departements.json)."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import territoires as t  # noqa: E402


def test_normaliser_sans_accents_ni_mots_vides_et_ars():
    assert t.normaliser("Agence Régionale de Santé d'Île-de-France") == "ars ile france"
    assert t.normaliser("ARS de la Normandie") == "ars normandie"
    assert t.normaliser("") == "" and t.normaliser(None) == ""


def test_regions_departements_villes_les_plus_longs_d_abord():
    assert t.regions_dans("Pays de la Loire") == {"pays-de-la-loire"}
    assert t.regions_dans("Centre-Val-de-Loire") == {"centre-val-de-loire"}
    assert t.regions_dans("Loire-Atlantique") == {"pays-de-la-loire"}
    assert t.regions_dans("Haute-Loire") == {"auvergne-rhone-alpes"}
    assert t.regions_dans("Coeur de Loire") == set()  # le nom nu « Loire » n'est pas lu (fleuve)
    assert t.regions_dans("Hauts-de-Seine") == {"ile-de-france"}
    assert t.regions_dans("Hauts de France") == {"hauts-de-france"}
    assert t.regions_dans("Métropole de Lyon") == {"auvergne-rhone-alpes"}
    assert t.regions_dans("Paris (75) – 17e, 18e arrondissements") == {"ile-de-france"}
    assert t.regions_dans("Interrégion PACA Corse") == {"provence-alpes-cote-d-azur", "corse"}
    assert t.regions_dans("Carsat Nord-Est") == {"grand-est"}
    assert t.regions_dans("Département du Nord") == {"hauts-de-france"}
    assert t.regions_dans("Lorraine, Picardie, Languedoc-Roussillon") == {"grand-est", "hauts-de-france", "occitanie"}
    assert t.regions_dans("ARS IDF / FHF-HDF / ARS NA") == {"ile-de-france", "hauts-de-france", "nouvelle-aquitaine"}
    assert t.regions_dans("La Réunion") == {"la-reunion"} and t.regions_dans("Mayotte") == {"mayotte"}


def test_mention_nationale_sans_region():
    assert t.reconnaitre("National (France)") == (set(), True)
    assert t.reconnaitre("France et étranger") == (set(), True)
    assert t.reconnaitre("Île-de-France") == ({"ile-de-france"}, False)  # « France » dans le nom de la région ne compte pas
    assert t.reconnaitre("Rural") == (set(), False)


def test_territoire_depuis_texte_puis_emetteur_jamais_france_par_defaut():
    ars = {"nom": "ARS Normandie", "categorie": "ars"}
    assert t.territoire_depuis("", ars) == ["normandie"]
    assert t.territoire_depuis("Calvados, La Manche, l'Orne", ars) == ["normandie"]
    assert t.territoire_depuis("France", ars) == ["france"]  # mention nationale explicite dans la fiche
    cnsa = {"nom": "CNSA (Caisse nationale de solidarité pour l'autonomie)", "categorie": "caisse-nationale"}
    assert t.territoire_depuis(None, cnsa) == ["france"]
    girci = {"nom": "Cancéropôle Grand Ouest – appels à projets", "categorie": "etablissement"}
    assert t.territoire_depuis("Grand Ouest", girci) == ["non-precise"]
    assert t.territoire_depuis(None, {"nom": "Loiret – appels à projets", "categorie": "collectivite"}) == ["centre-val-de-loire"]
    assert t.territoire_depuis("Inconnu", None) == ["non-precise"]
    assert t.territoire_depuis("Essonne (91) – Île-de-France", None) == ["ile-de-france"]


def test_table_complete():
    tab = t.table()
    assert len(tab["departements"]) == 101
    assert {d["region"] for d in tab["departements"]} <= set(tab["regions"].values())
    assert len(tab["regions"]) == 18
