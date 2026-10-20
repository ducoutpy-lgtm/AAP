"""Tests des financeurs canoniques (fonctions pures sur une petite table, sans fichier ni réseau)."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import financeurs as f  # noqa: E402

REGISTRE = [
    {"id": "ars-ile-de-france", "nom": "ARS Île-de-France", "categorie": "ars", "connecteur": "ars_idf, ars_idf_local"},
    {"id": "ars-normandie", "nom": "ARS Normandie", "categorie": "ars", "connecteur": ""},
    {"id": "portail-national-des-ars", "nom": "Portail national des ARS", "categorie": "ars", "connecteur": ""},
    {"id": "cnsa", "nom": "CNSA (Caisse nationale de solidarité pour l'autonomie)", "categorie": "caisse-nationale",
     "connecteur": "cnsa"},
    {"id": "msa-grand-est", "nom": "Mutualité sociale agricole (MSA) Grand Est - accueil de Sarrebourg",
     "categorie": "caisse-nationale", "connecteur": ""},
    {"id": "fhf-hdf", "nom": "FHF Hauts-de-France – appels à projets", "categorie": "autre", "connecteur": ""},
    {"id": "ville-de-paris-aap", "nom": "Ville de Paris – appels à projets", "categorie": "collectivite", "connecteur": ""},
    {"id": "ville-de-paris-pv", "nom": "Ville de Paris – politique de la ville", "categorie": "collectivite", "connecteur": ""},
    {"id": "essonne-cf", "nom": "Essonne – Commission des financeurs", "categorie": "collectivite", "connecteur": ""},
    {"id": "prefecture-essonne", "nom": "Préfecture - Essonne", "categorie": "ministere", "connecteur": ""},
    {"id": "fondation-de-france", "nom": "Fondation de France", "categorie": "fondation", "connecteur": ""},
    {"id": "conseil-departemental-gers", "nom": "Conseil départemental Gers", "categorie": "collectivite", "connecteur": ""},
    {"id": "ars-guadeloupe", "nom": "ARS Guadeloupe", "categorie": "ars", "connecteur": ""},
    {"id": "inserm", "nom": "Inserm", "categorie": "agence-nationale", "connecteur": ""},
]
TABLE = f.construire(REGISTRE)


def test_nom_canonique_retire_le_suffixe_de_page_seulement():
    assert f.nom_canonique("FHF Hauts-de-France – appels à projets") == "FHF Hauts-de-France"
    msa = "Mutualité sociale agricole (MSA) Grand Est - accueil de Sarrebourg"
    assert f.nom_canonique(msa) == "Mutualité sociale agricole (MSA) Grand Est"
    assert f.nom_canonique("Préfecture - Essonne") == "Préfecture - Essonne"  # le suffixe est un lieu, pas une page
    assert f.nom_canonique("Essonne – Commission des financeurs") == "Essonne – Commission des financeurs"
    assert f.nom_canonique("CNSA (Caisse nationale de solidarité pour l'autonomie)") == "CNSA"
    assert f.nom_canonique("Institut national du cancer (INCa)") == "Institut national du cancer (INCa)"


def test_alias_generes_sigle_parenthese_et_abreviations_de_region():
    alias = {f.cle(a) for a in f.alias_generes("CNSA (Caisse nationale de solidarité pour l'autonomie)")}
    assert f.cle("CNSA") in alias and f.cle("Caisse nationale de solidarité pour l'autonomie") in alias
    alias = {f.cle(a) for a in f.alias_generes("Mutualité sociale agricole (MSA) Grand Est - accueil de Sarrebourg")}
    assert f.cle("MSA Grand Est") in alias and f.cle("Mutualité sociale agricole Grand Est") in alias
    alias = {f.cle(a) for a in f.alias_generes("ARS Île-de-France")}
    assert f.cle("ARS IDF") in alias


def test_six_orthographes_un_seul_nom():
    for nom in ["ARS Île-de-France", "ARS Ile-de-France", "Agence régionale de santé Île-de-France", "ARS IDF",
                "Agence Régionale de Santé (ARS) Île-de-France", "Agence Régionale de Santé Île-de-France (ARS IDF)",
                "ARS Île-de-France – Délégation départementale de l'Essonne"]:
        assert f.canonique(nom, None, TABLE) == "ARS Île-de-France", nom


def test_ars_cofinanceur_et_ars_sans_region_par_l_emetteur():
    assert f.canonique("ARS Normandie et Conseil départemental du Calvados", None, TABLE) == "ARS Normandie"
    assert f.canonique("Agence régionale de santé et Conseil départemental", "ars-normandie", TABLE) == "ARS Normandie"
    assert f.canonique("ARS", "portail-national-des-ars", TABLE) is None  # le portail n'est pas une ARS
    assert f.canonique("ARS", "cnsa", TABLE) is None
    cofinanceur = "Conseil départemental du Calvados et la DD ARS 14"
    assert f.canonique(cofinanceur, "ars-normandie", TABLE) is None  # ne commence pas par ARS


def test_noms_inconnus_et_ambigus_restent_tels_quels():
    assert f.canonique("Département du Rhône", None, TABLE) is None  # pas de conseil départemental du Rhône dans la table
    assert f.canonique("Essonne", None, TABLE) is None  # deux émetteurs, deux noms différents
    assert f.canonique("Ville de Paris", None, TABLE) == "Ville de Paris"  # deux émetteurs, un seul nom
    assert f.canonique("", None, TABLE) is None


def test_construire_fusionne_sans_ecraser_la_main():
    existante = {"cnsa": {"nom": "CNSA", "categorie": "caisse-nationale",
                          "alias": ["Caisse nationale solidarité autonomie (CNSA)"]}}
    table = f.construire(REGISTRE, existante)
    assert table["cnsa"]["nom"] == "CNSA" and table["cnsa"]["alias"][0] == "Caisse nationale solidarité autonomie (CNSA)"
    assert f.cle("CNSA") in {f.cle(a) for a in table["cnsa"]["alias"]}
    assert list(table) == sorted(table)


def test_emetteur_de_et_non_rattaches():
    emetteurs = f.index_emetteurs(REGISTRE)
    local = {"scrape_metadata": {"source": "ars-normandie"}}
    assert f.emetteur_de(local, "extraction_locale", emetteurs)["id"] == "ars-normandie"
    assert f.emetteur_de({"scrape_metadata": {"source": "ars_idf"}}, "ars_idf", emetteurs)["id"] == "ars-ile-de-france"
    assert f.emetteur_de({}, "inconnu", emetteurs) is None
    fiches = [("extraction_locale", {"financeur": "ARS IDF", "scrape_metadata": {"source": "ars-ile-de-france"}}),
              ("extraction_locale", {"financeur": "Département du Rhône", "scrape_metadata": {"source": "x"}}),
              ("extraction_locale", {"financeur": "Département du Rhône", "scrape_metadata": {"source": "x"}})]
    assert f.non_rattaches(fiches, emetteurs, TABLE) == [("Département du Rhône", 2, "x")]


def test_cofinanceur_precision_parenthese_et_departement_ramenes_au_financeur_principal():
    """Retours de Monsieur DUCOUT du 2026-10-20 : trois écritures de la Fondation de France, deux de la Ville de Paris,
    deux de l'ARS Guadeloupe, « Département du Gers » à côté de « Conseil départemental Gers »."""
    assert f.canonique("Fondation de France / Fondation Jean Valade", None, TABLE) == "Fondation de France"
    assert f.canonique("Fondation de France (avec le soutien de la Fondation JM Bruneau)", None, TABLE) == "Fondation de France"
    assert f.canonique("Ville de Paris – Direction de la Santé Publique", None, TABLE) == "Ville de Paris"
    assert f.canonique("CNSA (Caisse nationale de solidarité pour l'autonomie) et Assurance retraite (CNAV)", None, TABLE) == "CNSA"
    assert f.canonique("Agence de Santé Guadeloupe, Saint-Martin et Saint-Barthélemy (ARS Guadeloupe)", None, TABLE) == "ARS Guadeloupe"
    assert f.canonique("Conseil départemental Gers (probable, non confirmé sur la page)", None, TABLE) == "Conseil départemental Gers"
    assert f.canonique("Département du Gers", None, TABLE) == "Conseil départemental Gers"
    assert f.canonique("Département du Gers (Conseil départemental Gers)", None, TABLE) == "Conseil départemental Gers"
    assert f.canonique("INSERM (membre du GIP Arronax)", None, TABLE) == "Inserm"
    assert f.canonique("Inserm, en partenariat avec le CNRS", None, TABLE) == "Inserm"
    # Un cofinanceur inconnu en tête reste tel quel : rien n'est inventé
    assert f.canonique("État et Banque des Territoires", None, TABLE) is None
    assert f.canonique("Fondation Inconnue / Fondation de France", None, TABLE) is None
