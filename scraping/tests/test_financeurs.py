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
    assert f.canonique(cofinanceur, "ars-normandie", TABLE) == "Conseil départemental Calvados"  # la tête, pas l'ARS


def test_noms_inconnus_et_ambigus_restent_tels_quels():
    assert f.canonique("Département du Rhône", None, TABLE) == "Conseil départemental Rhône"  # construit même hors table
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
              ("extraction_locale", {"financeur": "Marseille", "scrape_metadata": {"source": "x"}}),
              ("extraction_locale", {"financeur": "Marseille", "scrape_metadata": {"source": "x"}})]
    assert f.non_rattaches(fiches, emetteurs, TABLE) == [("Marseille", 2, "x")]


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
    assert f.canonique("État et Banque des Territoires", None, TABLE) == "État"  # famille État (règle du 2026-10-20 soir)
    assert f.canonique("Fondation Inconnue / Fondation de France", None, TABLE) is None


def test_familles_hors_registre_un_nom_par_organisme():
    """Retour de Monsieur DUCOUT du 2026-10-20 soir : un seul Bpifrance, une seule DREETS, un seul État, un seul FSE,
    une seule écriture pour les villes, les régions, les ministères et les préfectures."""
    assert f.canonique("Bpifrance – France 2030", None, TABLE) == "Bpifrance"
    assert f.canonique("Bpifrance (financement français, dans le cadre du programme Eureka Clusters / France 2030)", None, TABLE) == "Bpifrance"
    assert f.canonique("Direction régionale de l'économie, de l'emploi, du travail et des solidarités (DREETS) - Pays de la Loire", None, TABLE) == "DREETS"
    assert f.canonique("Dreets PACA", None, TABLE) == "DREETS"
    assert f.canonique("DDETS PP 46", None, TABLE) == "DREETS"
    assert f.canonique("Bretagne.dreets.gouv.fr", None, TABLE) == "DREETS"
    assert f.canonique("DRAAF Bourgogne-Franche-Comté", None, TABLE) == "DRAAF"
    assert f.canonique("Direction de l'alimentation, de l'agriculture et de la forêt (Daaf) - Martinique", None, TABLE) == "DRAAF"
    assert f.canonique("Etat", None, TABLE) == "État"
    assert f.canonique("État, la Banque des Territoires, ESS France et le Mouvement Associatif", None, TABLE) == "État"
    assert f.canonique("FSE.gouv.fr", None, TABLE) == "Fonds social européen (FSE+)"
    assert f.canonique("Fonds Social Européen + (FSE+)", None, TABLE) == "Fonds social européen (FSE+)"
    assert f.canonique("ministère de l'Agriculture et de l'Alimentation", None, TABLE) == "Ministère de l'Agriculture"
    assert f.canonique("Ministère de l’Agriculture, de l’Agro-alimentaire et de la Souveraineté alimentaire", None, TABLE) == "Ministère de l'Agriculture"
    assert f.canonique("Mairie de Toulon", None, TABLE) == "Ville de Toulon"
    assert f.canonique("Commune de Toulon", None, TABLE) == "Ville de Toulon"
    assert f.canonique("La Ville d’Amiens", None, TABLE) == "Ville d'Amiens"
    assert f.canonique("Région Occitanie", None, TABLE) == "Conseil régional Occitanie"
    assert f.canonique("Région", None, TABLE) is None  # région inconnue : nom gardé tel quel par l'import
    assert f.canonique("PREFET DE L'ESSONNE", None, TABLE) == "Préfecture - Essonne"
    assert f.canonique("Préfecture de l'Essonne (service de l'État) - financeur probable", None, TABLE) == "Préfecture - Essonne"
    assert f.canonique("Collectivité départementale du Corrèze", None, TABLE) is None or f.canonique("Département de la Gironde", None, TABLE) == "Conseil départemental Gironde"
    assert f.canonique("Marseille", None, TABLE) is None  # une ville nue n'est pas devinée
    assert f.canonique("Fondation de France Grand Est", None, TABLE) == "Fondation de France"
    assert f.canonique("Le Département des Pyrénées-Orientales", None, TABLE) == "Conseil départemental Pyrénées-Orientales"
    assert f.canonique("Collectivité Départementale de la Guadeloupe", None, TABLE) == "Conseil départemental Guadeloupe"


def test_nom_generique_remplace_par_l_emetteur():
    """« Région », « Département », « Autres », « Le64 », « Aveyron » : le financeur est l'émetteur de la fiche quand il
    est une collectivité, une ARS ou une caisse ; jamais pour un relais (Appelaprojets.org, FHF)."""
    table = dict(TABLE)
    table["conseil-regional-occitanie"] = {"nom": "Conseil régional Occitanie", "categorie": "collectivite", "alias": []}
    table["conseil-departemental-pyrenees-atlantiques"] = {"nom": "Conseil départemental Pyrénées-Atlantiques", "categorie": "collectivite", "alias": []}
    table["prefecture-aveyron"] = {"nom": "Préfecture - Aveyron", "categorie": "ministere", "alias": []}
    table["appelaprojets"] = {"nom": "Appelaprojets.org", "categorie": "autre", "alias": []}
    assert f.canonique("Région", "conseil-regional-occitanie", table) == "Conseil régional Occitanie"
    assert f.canonique("Le64", "conseil-departemental-pyrenees-atlantiques", table) == "Conseil départemental Pyrénées-Atlantiques"
    assert f.canonique("Département", "conseil-departemental-pyrenees-atlantiques", table) == "Conseil départemental Pyrénées-Atlantiques"
    assert f.canonique("Aveyron", "prefecture-aveyron", table) == "Préfecture - Aveyron"
    assert f.canonique("Autres", "appelaprojets", table) is None
    assert f.canonique("Conseil départemental", "appelaprojets", table) is None


# Changement financeur-reel-des-relais (2026-10-28) : le vrai financeur lu entre parenthèses quand la fiche vient d'un relais
TABLE_RELAIS = {
    "commission-europeenne-financement-sante": {"nom": "Commission européenne", "categorie": "europe",
                                                "alias": ["Commission européenne", "Commission européenne – financement santé"]},
    "institut-national-du-cancer-inca": {"nom": "Institut national du cancer (INCa)", "categorie": "agence-nationale",
                                         "alias": ["INCa", "Institut national du cancer", "Institut national du cancer (INCa)"]},
    "ligue-contre-le-cancer": {"nom": "Ligue contre le cancer", "categorie": "fondation", "alias": ["Ligue contre le cancer"]},
    "region-bretagne": {"nom": "Région Bretagne", "categorie": "collectivite", "alias": ["Région Bretagne", "Conseil régional de Bretagne"]},
}


def test_financeur_reel_lu_entre_parentheses():
    nom = ("Lyonbiopôle Auvergne-Rhône-Alpes – appels à projets (appel émis par la Commission européenne, programme "
           "HORIZON EUROPE - CLUSTER SANTE)")
    assert f.financeur_reel_du_relais(nom, "lyonbiopole", TABLE_RELAIS) == "Commission européenne"
    inca = "Cancéropôle Lyon Auvergne Rhône-Alpes (CLARA) – appels à projets (appel émis par l'INCa, Institut national du cancer)"
    assert f.financeur_reel_du_relais(inca, "canceropole-clara", TABLE_RELAIS) == "Institut national du cancer (INCa)"
    ligue = "Cancéropôle Lyon Auvergne Rhône-Alpes (CLARA) - appels à projets (appel relayé pour la Ligue nationale contre le cancer)"
    assert f.financeur_reel_du_relais(ligue, "canceropole-clara", TABLE_RELAIS) == "Ligue contre le cancer"


def test_financeur_du_relais_garde():
    assert f.financeur_reel_du_relais("Cancéropôle Nord-Ouest – appels à projets", "canceropole-nord-ouest", TABLE_RELAIS) is None
    territoires_seuls = "Atlanpole Biotherapies – appels à projets régionaux (Pays de la Loire, Bretagne, Centre-Val de Loire)"
    assert f.financeur_reel_du_relais(territoires_seuls, "atlanpole-biotherapies-regionaux", TABLE_RELAIS) is None
    # Le nom ne commence pas par le relais : ce n'est pas un nom de relais, rien n'est changé
    assert f.financeur_reel_du_relais("Bpifrance (Commission européenne)", "lyonbiopole", TABLE_RELAIS) is None


def test_nom_de_lieu_d_un_seul_mot_ecarte():
    """« financé par la Région Auvergne-Rhône-Alpes » ne doit pas donner le département du Rhône (alias « Rhône »)."""
    table = dict(TABLE_RELAIS, **{"conseil-departemental-rhone": {"nom": "Conseil départemental Rhône", "categorie": "collectivite",
                                                                   "alias": ["Conseil départemental Rhône", "Rhône"]}})
    nom = "Lyonbiopôle Auvergne-Rhône-Alpes (appel à projets du Plan AURA 2022-2028, financé par la Région Auvergne-Rhône-Alpes)"
    assert f.financeur_reel_du_relais(nom, "lyonbiopole", table) is None
