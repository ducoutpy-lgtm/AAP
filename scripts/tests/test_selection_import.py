"""Tests de l'import pour le changement selection-des-appels (2026-11-26) : marchés publics et pages bloquées ignorés,
hors champ écarté d'office, relais jamais affichés comme financeurs, corrections de la relecture conservées.
Registre et référentiel réels (Medicen, Biotech Santé Bretagne, Cancéropôle CLARA y figurent). Aucun Firestore."""
import json
import sys
from datetime import date, datetime, timezone
from pathlib import Path

RACINE = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(RACINE / "scripts"))
sys.path.insert(0, str(RACINE / "scraping"))
import import_to_firestore as imp  # noqa: E402

MAINTENANT = datetime(2026, 11, 26, 12, 0, tzinfo=timezone.utc)
AUJOURDHUI = date(2026, 11, 26)


def _item(titre, financeur, url, source, **meta):
    return {"titre": titre, "financeur": financeur, "description": "Appel relayé.", "url_source": url,
            "date_cloture": "2027-03-01", "scrape_metadata": {"source": source, "moteur": "api", **meta}}


# ---------------------------------------------------------------- hors champ écarté d'office

def test_hors_champ_du_modele_rejete_et_archive_d_office():
    doc = {"status": "published", "tags": ["x"], "validation": {"statut": "proposee", "commentaire": "", "date": "", "par": ""},
           "scrapeMetadata": {"champ": "hors-champ"}}
    d = imp.champ_en_attente(doc, AUJOURDHUI)
    assert d["status"] == "archived" and d["validation"]["statut"] == "rejetee"
    assert d["validation"]["commentaire"] == "hors champ (modèle), écartée d'office" and d["validation"]["par"] == "import (champ)"
    assert "hors-champ" in d["tags"] and "a-verifier" not in d["tags"]


def test_hors_champ_de_la_qualification_rejete_et_archive_d_office():
    item = {"scrape_metadata": {"qualification": {"destinataires": ["tous"], "type_appel": "mecenat", "objets": [],
                                                  "date_ouverture": None, "pieces_attendues": [], "champ": "hors-champ",
                                                  "modele": "m", "le": "2026-11-26"}}}
    d = imp.appliquer_qualification({"status": "published", "tags": []}, item, AUJOURDHUI)
    assert d["status"] == "archived" and d["validation"]["statut"] == "rejetee" and "hors-champ" in d["tags"]
    humain = {"status": "published", "tags": [], "validation": {"statut": "validee", "par": imp.RELECTEUR, "commentaire": "", "date": ""}}
    assert imp.appliquer_qualification(humain, item, AUJOURDHUI)["status"] == "published"


# ---------------------------------------------------------------- relais

def test_premiere_usine_relayee_par_medicen_affiche_france_2030():
    item = _item("Appel A Projets France 2030 : « Première Usine »",
                 "Medicen Paris Region – appels à projets (dans le cadre du plan France 2030)",
                 "https://medicen.org/appels%20%C3%A0%20projet/aap-france-2030-premiere-usine/", "medicen-paris-region")
    doc = imp.to_app_aap(item, "extraction_api", MAINTENANT)
    assert doc["financeurName"] == "France 2030 (État)"


def test_relais_sans_financeur_cite_a_preciser_statut_inchange():
    # Contre-vérification du 2026-11-26 : la fiche nouvelle passait « à corriger » mais la fiche déjà en base restait
    # publiée ; règle unique depuis : le nom est honnête, le statut ne change pas (la file ne grossit pas)
    item = _item("Appel à projets innovation en santé", "Biotech Santé Bretagne – appels à projets",
                 "https://www.biotech-sante-bretagne.fr/appel/x", "biotech-sante-bretagne")
    doc = imp.to_app_aap(item, "extraction_api", MAINTENANT)
    assert doc["financeurName"] == "Financeur à préciser (relayé par Biotech Santé Bretagne)"
    assert doc["status"] == "published" and not hasattr(imp, "relais_a_preciser")


def test_un_financeur_cite_par_un_relais_n_est_pas_pris_pour_le_relais():
    # « region » est contenu dans « atlanpolebiotherapiesregionaux » : le nom lu « Région Bretagne » était pris pour le relais
    item = _item("i-Démo régionalisé", "Région Bretagne (France 2030 régionalisé)",
                 "https://www.inno-avenir.bretagne.bzh/i-demo-regionalise", "atlanpole-biotherapies-regionaux")
    nom = imp.to_app_aap(item, "extraction_api", MAINTENANT)["financeurName"]
    assert "Bretagne" in nom and "France 2030" not in nom and "préciser" not in nom


def test_financeur_cite_apres_finance_par():
    item = _item("Partenariats d'innovation - Prototype",
                 "Lyonbiopôle Auvergne-Rhône-Alpes (appel à projets du Plan AURA 2022-2028, financé par la Région "
                 "Auvergne-Rhône-Alpes)", "https://lyonbiopole.com/appel/prototype", "lyonbiopole")
    assert imp.to_app_aap(item, "extraction_api", MAINTENANT)["financeurName"] == "Conseil régional Auvergne-Rhône-Alpes"


def test_appel_propre_d_un_canceropole_garde_son_nom():
    item = _item("Appel à projets Émergence 2027", "Cancéropôle Lyon Auvergne Rhône-Alpes (CLARA)",
                 "https://www.canceropole-clara.com/appel/emergence", "canceropole-clara")
    doc = imp.to_app_aap(item, "extraction_api", MAINTENANT)
    assert doc["financeurName"].startswith("Cancéropôle Lyon") and "préciser" not in doc["financeurName"]


# ---------------------------------------------------------------- corrections de la relecture

def test_corrections_de_la_relecture_appliquees():
    doc = {"financeurName": "Biotech Santé Bretagne – appels à projets", "tags": [],
           "scrapeMetadata": {"champ": "hors-champ", "champRaison": "modèle"}}
    d = imp.appliquer_relecture(doc, {"champ": "sante", "financeur": "EIT Health", "par": "relecture", "date": "2026-11-26"})
    assert d["scrapeMetadata"]["champ"] == "sante" and d["financeurName"] == "EIT Health"
    assert d["scrapeMetadata"]["champRaison"] == "corrigé par la relecture du 2026-11-26"
    assert doc["scrapeMetadata"]["champ"] == "hors-champ"  # fonction pure
    assert imp.appliquer_relecture(doc, None) is doc
    # Champ corrigé avant la règle du champ : la fiche gardée n'est pas écartée
    assert imp.champ_en_attente({**d, "status": "published"}, AUJOURDHUI)["status"] == "published"


def test_correction_du_champ_resiste_a_la_qualification_hors_champ():
    # Contre-vérification : la qualification lisait son propre champ et écartait la fiche gardée par la relecture
    item = {"scrape_metadata": {"qualification": {"destinataires": ["tous"], "type_appel": "aap", "objets": [],
                                                  "date_ouverture": None, "pieces_attendues": [], "champ": "hors-champ",
                                                  "modele": "m", "le": "2026-11-26"}}}
    doc = {"status": "published", "tags": [], "validation": {"statut": "proposee", "commentaire": "", "date": "", "par": ""},
           "scrapeMetadata": {"champ": "hors-champ"}}
    d = imp.appliquer_relecture(doc, {"champ": "sante", "date": "2026-11-26"})
    d = imp.appliquer_qualification(imp.champ_en_attente(d, AUJOURDHUI), item, AUJOURDHUI)
    assert d["status"] == "published" and d["validation"]["statut"] == "proposee" and "hors-champ" not in d["tags"]


def test_rejet_page_bloquee_du_nettoyage_leve_quand_la_page_est_relue():
    # Contre-vérification : une fiche archivée « page bloquée à la collecte » ne revenait jamais après une bonne relecture
    neuf = {"title": "t", "status": "draft", "validation": {"statut": "proposee", "par": "", "commentaire": "", "date": ""}}
    bloque = {"validation": {"statut": "rejetee", "par": imp.PAR_NETTOYAGE, "commentaire": imp.COMMENTAIRE_PAGE_BLOQUEE}}
    envoi = imp.document_a_envoyer(neuf, True, bloque)
    assert envoi["validation"]["statut"] == "proposee" and envoi["status"] == "draft"
    autre_rejet = {"validation": {"statut": "rejetee", "par": imp.PAR_NETTOYAGE, "commentaire": "marché public"}}
    assert "validation" not in imp.document_a_envoyer(neuf, True, autre_rejet)


def test_fichier_des_corrections_couvre_la_relecture_du_26_novembre():
    corrections = json.loads((RACINE / "scraping" / "sources" / "corrections_fiches.json").read_text(encoding="utf-8"))
    relecture = json.loads((RACINE / "scripts" / "relecture_champ_2026-11-26.json").read_text(encoding="utf-8"))
    attendues = {d["id"] for d in relecture if d["action"] in ("garder", "financeur")}
    assert attendues and attendues <= set(corrections)


# ---------------------------------------------------------------- import complet à blanc

def test_import_a_blanc_ignore_marches_publics_et_pages_bloquees(tmp_path, monkeypatch, capsys):
    resultats = tmp_path / "results"
    resultats.mkdir()
    fiches = [
        _item("APPEL A MANIFESTATION D'INTERET OUVERT - 24 AVENUE DU PRADO = 2026K19", "Métropole Aix-Marseille Provence",
              "https://marchespublics.ampmetropole.fr/?page=Entreprise.EntrepriseAdvancedSearch&AllCons&id=510860",
              "metropole-aix-marseille-provence-contrat-de-ville"),
        {**_item("Pacte Enseignement Supérieur et Compétences 2025-2029", "Conseil régional Grand Est",
                 "https://www.grandest.fr/appel-a-projet/pacte-enseignement-superieur-competence/", "conseil-regional-grand-est"),
         "description": "Vérification de sécurité en cours. Ce site utilise un service de sécurité pour se protéger contre "
                        "les bots malveillants."},
        _item("Appel à projets soins palliatifs", "ARS Bretagne", "https://www.bretagne.ars.sante.fr/appel-palliatif",
              "ars-bretagne"),
    ]
    (resultats / "extraction_api.json").write_text(json.dumps(fiches, ensure_ascii=False), encoding="utf-8")
    # Même page bloquée lue par le modèle local, sans marque dans la description : exclue avec sa version de l'API
    locale = [{**fiches[1], "description": "L'appel vise à renforcer les compétences de l'enseignement supérieur."}]
    (resultats / "extraction_locale.json").write_text(json.dumps(locale, ensure_ascii=False), encoding="utf-8")
    monkeypatch.setattr(imp, "RESULTS_DIR", resultats)
    monkeypatch.setattr(imp, "VERDICTS", tmp_path / "absent.json")
    monkeypatch.setattr(imp, "CORRECTIONS", tmp_path / "absent2.json")
    monkeypatch.setattr(sys, "argv", ["import_to_firestore.py", "--dry-run"])
    assert imp.main() == 0
    sortie = capsys.readouterr().out
    assert "a importer : 1 " in sortie and "'marche-public': 1" in sortie and "'page-bloquee': 2" in sortie


# ---------------------------------------------------------------- seconde contre-vérification (2026-11-26)

def test_fiche_relue_apres_page_bloquee_repart_avec_son_nouveau_contenu():
    # Sans cela, la fiche validée par le modèle était republiée avec l'ancienne description de l'écran anti-robot
    neuf = {"title": "AMI Territoires pilotes", "description": "Accompagner les territoires pilotes de l'urbanisme favorable.",
            "status": "published", "views": 0, "validation": {"statut": "validee", "par": "claude-haiku-5-5", "commentaire": "", "date": ""}}
    bloque = {"description": "La page source affichait un écran de vérification de sécurité.", "views": 12,
              "validation": {"statut": "rejetee", "par": imp.PAR_NETTOYAGE, "commentaire": imp.COMMENTAIRE_PAGE_BLOQUEE}}
    envoi = imp.document_a_envoyer(neuf, True, bloque)
    assert envoi["description"].startswith("Accompagner") and envoi["status"] == "published"
    assert "views" not in envoi  # les compteurs restent ceux de la base


def test_relais_d_une_meme_famille_distingues():
    import financeurs
    aura = imp.EMETTEURS["gerontopole-aura"]
    assert financeurs.financeur_d_un_relais("Gérontopôle Sud", "Appel à projets", aura, imp.FINANCEURS) is None
    bfc = imp.EMETTEURS["pole-gerontologie-innovation-bfc"]
    assert financeurs.financeur_d_un_relais("Pôle emploi Bourgogne-Franche-Comté", "Appel", bfc, imp.FINANCEURS) is None
    kozh = imp.EMETTEURS["kozh-ensemble-gerontopole-bretagne"]
    assert financeurs.est_le_relais("Gérontopôle de Bretagne Kozh Ensemble", "kozh-ensemble-gerontopole-bretagne", kozh["nom"])


def test_porte_par_ne_fabrique_pas_de_financeur():
    eura = imp.EMETTEURS["eurasante"]
    import financeurs
    nom = financeurs.financeur_d_un_relais(
        "Eurasanté – appels à projets (appel porté par le département de recherche clinique du CHU de Lille)",
        "Appel à projets", eura, imp.FINANCEURS)
    assert nom == "Financeur à préciser (relayé par Eurasanté)"


def test_l_import_ne_donne_pas_financeur_a_preciser_a_une_fiche_relue():
    neuf = {"title": "t", "financeurName": "Financeur à préciser (relayé par Biotech Santé Bretagne)", "status": "published",
            "validation": {"statut": "proposee", "par": "", "commentaire": "", "date": ""}}
    relue = {"financeurName": "Biotech Santé Bretagne", "validation": {"statut": "validee", "par": imp.RELECTEUR}}
    assert "financeurName" not in imp.document_a_envoyer(neuf, True, relue)
    assert "financeurName" in imp.document_a_envoyer(neuf, True, {"validation": {"statut": "validee", "par": "claude-haiku-5-5"}})


def test_tete_du_nom_coupee_a_la_virgule():
    import financeurs
    lyon = imp.EMETTEURS["lyonbiopole"]
    nom = "Lyonbiopôle Auvergne-Rhône-Alpes (appels à projets), dans le cadre du Programme régional FEDER/FSE+"
    assert financeurs.est_le_relais(nom, "lyonbiopole", lyon["nom"])
    assert financeurs.financeur_d_un_relais(nom, "Projets collaboratifs", lyon, imp.FINANCEURS).startswith("Financeur à préciser")
