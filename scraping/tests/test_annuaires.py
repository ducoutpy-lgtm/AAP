"""Tests de annuaires.py (spec registre-sources, changement registre-par-annuaires)."""
import csv

import annuaires


def _ligne(**kw):
    base = {"numero_rnf": "075-FRUP-00001", "titre": "Fondation Test", "type_organisme": "FRUP", "objet_social": "aide aux malades",
            "domaine_interet_general": "Social", "etat": "Active", "siret": "12345678900011", "code_postal": "75001", "ville": "Paris"}
    base.update(kw)
    return base


def test_filtre_vague_1_types_etat_et_domaine():
    lignes = [
        _ligne(),                                                            # FRUP active, social : retenue
        _ligne(numero_rnf="2", type_organisme="FE", domaine_interet_general="Culturel", objet_social="handicap et culture"),  # objet : retenue
        _ligne(numero_rnf="3", type_organisme="FDD"),                        # fonds de dotation : vague 2
        _ligne(numero_rnf="4", etat="Dissoute"),                             # dissoute
        _ligne(numero_rnf="5", domaine_interet_general="Sportif", objet_social="promotion du rugby"),  # hors champ
    ]
    retenues = annuaires.filtrer_vague_1(lignes)
    assert [l["numero_rnf"] for l in retenues] == ["075-FRUP-00001", "2"]
    assert retenues[0]["site_trouve"] == "" and retenues[0]["id_registre"] == ""  # colonnes à remplir, jamais devinées
    assert "objet_social" not in retenues[0]  # l'extrait ne garde que les colonnes utiles


def test_lire_rnf_csv_point_virgule(tmp_path):
    f = tmp_path / "rnf.csv"
    f.write_text("numero_rnf;titre;type_organisme;etat\n1;A;FRUP;Active\n", encoding="utf-8-sig")
    lignes = annuaires.lire_rnf(f)
    assert lignes == [{"numero_rnf": "1", "titre": "A", "type_organisme": "FRUP", "etat": "Active"}]


def test_normaliser_nom():
    assert annuaires.normaliser_nom("Fondation APICIL") == "apicil"
    assert annuaires.normaliser_nom("FONDATION D'ENTREPRISE MÉDÉRIC ALZHEIMER") == "mederic alzheimer"
    assert annuaires.normaliser_nom("Fondation de l'Avenir") == "avenir"


def test_rapprocher_sures_et_douteuses():
    extrait = [{"titre": "FONDATION APICIL"}, {"titre": "FONDATION ALZHEIMER"}, {"titre": "FONDATION INCONNUE XYZ"}]
    registre = [{"id": "fondation-apicil", "nom": "Fondation APICIL"}, {"id": "fondation-mederic-alzheimer", "nom": "Fondation Médéric Alzheimer"}]
    sures, douteuses = annuaires.rapprocher(extrait, registre)
    assert [(l["titre"], s["id"]) for l, s in sures] == [("FONDATION APICIL", "fondation-apicil")]
    assert [(l["titre"], s["id"]) for l, s in douteuses] == [("FONDATION ALZHEIMER", "fondation-mederic-alzheimer")]  # contenu, pas égal : à trancher


def test_inscrire_sites_verifie_et_n_ecrase_pas():
    extrait = [{"numero_rnf": "1", "titre": "A", "site_trouve": "", "id_registre": ""},
               {"numero_rnf": "2", "titre": "B", "site_trouve": "https://deja.fr/", "id_registre": ""}]
    sonde = lambda url, titre="": None if "ok" in url else "code 404"
    inscrits, refus = annuaires.inscrire_sites(extrait, {"1": "https://ok.fr/", "2": "https://ok2.fr/", "3": "https://ok3.fr/", "4": "ftp://x"}, sonde)
    assert inscrits == 1 and extrait[0]["site_trouve"] == "https://ok.fr/"
    assert extrait[1]["site_trouve"] == "https://deja.fr/"  # jamais écrasé
    assert [r[0] for r in refus] == ["2", "3", "4"]


def test_integrer_cree_une_entree_par_site_trouve():
    extrait = [{"numero_rnf": "075-FRUP-1", "titre": "FONDATION TEST SANTÉ", "type_organisme": "FRUP", "ville": "Paris",
                "domaine_interet_general": "Social", "site_trouve": "https://test.fr/", "id_registre": ""},
               {"numero_rnf": "075-FRUP-2", "titre": "SANS SITE", "type_organisme": "FE", "ville": "Lyon",
                "domaine_interet_general": "Social", "site_trouve": "", "id_registre": ""},
               {"numero_rnf": "075-FRUP-3", "titre": "DEJA", "type_organisme": "FE", "ville": "Lyon",
                "domaine_interet_general": "Social", "site_trouve": "https://deja.fr/", "id_registre": "deja"}]
    registre = [{"id": "fondation-test-sante", "nom": "Homonyme"}]
    nouvelles = annuaires.integrer(extrait, registre)
    assert len(nouvelles) == 1 and len(registre) == 2
    assert nouvelles[0]["id"] == "fondation-test-sante-2"  # identifiant déjà pris : suffixe
    assert nouvelles[0]["statut"] == "identifiee" and nouvelles[0]["url_aap"] == "https://test.fr/" and "RNF 075-FRUP-1" in nouvelles[0]["notes"]
    assert extrait[0]["id_registre"] == "fondation-test-sante-2"
    assert extrait[1]["id_registre"] == "" and extrait[2]["id_registre"] == "deja"


def test_site_officiel_exige_le_nom_dans_le_domaine():
    import recherche_web
    res = [{"url": "https://www.tousbenevoles.org/x", "titre": "annuaire"}, {"url": "https://www.fisaf.asso.fr/item/delta-plus", "titre": "Delta Plus"},
           {"url": "https://www.fondationdeltaplus.fr/accueil", "titre": "Fondation Delta Plus"}]
    assert recherche_web.site_officiel(res, "FONDATION DELTA PLUS") == "https://www.fondationdeltaplus.fr/"
    assert recherche_web.site_officiel(res[:2], "FONDATION DELTA PLUS") is None  # annuaires écartés, rien d'autre : incertain
    assert recherche_web.site_officiel([{"url": "https://www.fondationarcad.org/", "titre": ""}], "FONDATION A.R.C.A.D, AIDE ET RECHERCHE") == "https://www.fondationarcad.org/"
    # (a) nom compact : « airfrance » ; sous-domaine technique remplacé par www
    assert recherche_web.site_officiel([{"url": "https://corporate.airfrance.com/fr/fondation", "titre": ""}], "FONDATION D'ENTREPRISE AIR FRANCE") == "https://www.airfrance.com/"
    # (b) domaine « fondation » + mot court du nom
    assert recherche_web.site_officiel([{"url": "https://fondation.ca-norddefrance.fr/", "titre": ""}], "FONDATION D'ENTREPRISE CREDIT AGRICOLE NORD DE FRANCE") == "https://fondation.ca-norddefrance.fr/"
    assert recherche_web.site_officiel([{"url": "https://www.fondationdentreprisehermes.org/", "titre": ""}], "FONDATION D'ENTREPRISE DU GROUPE M6") is None  # autre fondation
    # mots géographiques insuffisants : « manche », « mediterranee »
    assert recherche_web.site_officiel([{"url": "https://pro.attitude-manche.fr/", "titre": ""}], "FONDATION BON SAUVEUR DE LA MANCHE") is None
    assert recherche_web.site_officiel([{"url": "https://www.centrale-mediterranee.fr/", "titre": ""}], "FONDATION D'ENTREPRISE CLUB MÉDITERRANÉE") is None
    assert recherche_web.site_officiel([{"url": "https://recrutement.fondationbonsauveur.com/x", "titre": ""}], "FONDATION BON SAUVEUR DE BÉGARD") == "https://www.fondationbonsauveur.com/"
    # (d) sigle ; .coop admis ; nom d'un seul mot générique refusé
    assert recherche_web.site_officiel([{"url": "https://www.ciup.fr/", "titre": ""}], "CITÉ INTERNATIONALE UNIVERSITAIRE DE PARIS") == "https://www.ciup.fr/"
    assert recherche_web.site_officiel([{"url": "https://fondation-bms.fr/", "titre": ""}], "FONDATION D'ENTREPRISE BRISTOL-MYERS SQUIBB POUR LES MICROBIOTES") == "https://fondation-bms.fr/"
    assert recherche_web.site_officiel([{"url": "https://fondation.credit-cooperatif.coop/", "titre": ""}], "FONDATION CREDIT COOPERATIF") == "https://fondation.credit-cooperatif.coop/"
    assert recherche_web.site_officiel([{"url": "https://www.bonobos.org/", "titre": ""}], "BONOBO FOUNDATION") is None
    assert recherche_web.site_officiel([{"url": "https://www.fondationuniversitaire.be/", "titre": ""}], "FONDATION BIERMANS-LAPÔTRE - MAISON DES ETUDIANTS BELGES") is None


def test_ecrire_extrait_trie_par_titre(tmp_path):
    chemin = tmp_path / "extrait.csv"
    annuaires.ecrire_extrait(annuaires.filtrer_vague_1([_ligne(titre="Zeta"), _ligne(numero_rnf="2", titre="Alpha")]), chemin)
    lignes = list(csv.DictReader(chemin.open(encoding="utf-8"), delimiter=";"))
    assert [l["titre"] for l in lignes] == ["Alpha", "Zeta"]
    assert list(lignes[0].keys()) == list(annuaires.COLONNES_EXTRAIT)
