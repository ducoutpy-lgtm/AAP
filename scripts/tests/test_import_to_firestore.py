"""Tests des regles de l'import, sans Firestore reel : identifiant stable, decisions humaines protegees, verdicts,
statut de validation seule source de fiabilite, liste blanche des champs, fiches sans date, et ecriture sur un
faux Firestore en memoire (les cinq tests de l'audit du 2026-10-14 portent le nom de la regle qu'ils protegent).
Lancer depuis la racine : .venv/Scripts/python -m pytest scripts/tests -q"""
import re
import sys
from datetime import date, datetime, timezone
from pathlib import Path

import pytest

RACINE = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(RACINE / "scripts"))
sys.path.insert(0, str(RACINE / "scraping"))
import import_to_firestore as imp  # noqa: E402
import annuaires  # noqa: E402
import registre  # noqa: E402

MAINTENANT = datetime(2026, 10, 14, 12, 0, tzinfo=timezone.utc)
AUJOURDHUI = date(2026, 10, 14)


# ---------------------------------------------------------------- faux Firestore en memoire

class FauxInstantane:
    def __init__(self, donnees):
        self.exists = donnees is not None
        self._donnees = donnees

    def to_dict(self):
        return dict(self._donnees) if self._donnees is not None else None


class FauxRef:
    def __init__(self, magasin: dict, ident: str):
        self.magasin, self.id = magasin, ident

    def get(self):
        return FauxInstantane(self.magasin.get(self.id))


class FauxCollection:
    """Imite les seuls appels que l'import fait a une collection : document(id), ref.get().exists."""

    def __init__(self, documents: dict | None = None):
        self.magasin = {k: dict(v) for k, v in (documents or {}).items()}

    def document(self, ident: str) -> FauxRef:
        return FauxRef(self.magasin, ident)


class FauxBatch:
    """Imite batch.set(ref, donnees, merge) et batch.commit() : merge fusionne, sinon remplace."""

    def __init__(self):
        self.operations = []

    def set(self, ref: FauxRef, donnees: dict, merge: bool = False):
        self.operations.append((ref, donnees, merge))

    def commit(self):
        for ref, donnees, merge in self.operations:
            if merge and ref.id in ref.magasin:
                ref.magasin[ref.id].update(donnees)
            else:
                ref.magasin[ref.id] = dict(donnees)
        self.operations = []


def fiche(**extra) -> dict:
    base = {"titre": "Appel test", "financeur": "ARS Test", "description": "d", "url_source": "https://ars.fr/appel",
            "date_cloture": "2026-12-31", "scrape_metadata": {"moteur": "connecteur", "modele": "claude-sonnet-4-6"}}
    base.update(extra)
    return base


def document(verdict: dict | None = None, **extra) -> tuple[str, dict]:
    """Une fiche passee par le mapping et le verdict, comme dans main()."""
    doc = imp.to_app_aap(fiche(**extra), "ars_test", MAINTENANT)
    if "deadline" not in doc:
        doc = imp.sans_date_en_attente(doc, AUJOURDHUI)
    doc = imp.appliquer_verdict(doc, verdict)
    imp.verifier_champs(doc, "test")
    return imp.identifiant(doc["externalUrl"]), doc


# ---------------------------------------------------------------- les cinq tests de l'audit

def test_un_document_archive_reste_archive_apres_reimport():
    ident, doc = document()
    col = FauxCollection({ident: {"status": "archived", "title": "Ancien titre", "publishedAt": "2026-10-01"}})
    compteurs = imp.ecrire_documents(col, FauxBatch, [(ident, doc)], MAINTENANT)
    stocke = col.magasin[ident]
    assert compteurs == {"crees": 0, "mis_a_jour": 1, "envoyes": 0, "presents": 0}
    assert stocke["status"] == "archived" and stocke["publishedAt"] == "2026-10-01"
    assert stocke["title"] == "Appel test"  # la proposition de l'IA est rafraichie, la decision humaine non


def test_un_verdict_validee_protege_les_champs_metier():
    ident, doc = document({"verdict": "aap-juste", "commentaire": "", "date": "2026-10-14"}, titre="Nouveau titre")
    col = FauxCollection({ident: {"status": "published", "title": "Titre relu", "deadline": "D1", "tags": ["relu"],
                                  "validation": {"statut": "validee"}}})
    imp.ecrire_documents(col, FauxBatch, [(ident, doc)], MAINTENANT)
    stocke = col.magasin[ident]
    assert stocke["title"] == "Titre relu" and stocke["deadline"] == "D1" and stocke["tags"] == ["relu"]
    assert stocke["scrapeMetadata"]["importedAt"] == MAINTENANT  # la provenance, elle, est mise a jour


def test_un_verdict_rejetee_empeche_la_publication():
    ident, doc = document({"verdict": "pas-un-aap", "commentaire": "", "date": "2026-10-14"})
    col = FauxCollection()
    compteurs = imp.ecrire_documents(col, FauxBatch, [(ident, doc)], MAINTENANT)
    stocke = col.magasin[ident]
    assert compteurs["crees"] == 1
    assert stocke["status"] == "archived" and "publishedAt" not in stocke
    assert stocke["validation"]["statut"] == "rejetee" and stocke["validation"]["par"] == "Monsieur DUCOUT"


def test_url_validee_jamais_ecrite_par_annuaires_ni_registre(tmp_path):
    entree = {"id": "fondation-test", "nom": "Fondation Test", "categorie": "fondation", "url_aap": "https://origine.fr",
              "url_validee": "https://validee.fr", "validee_par": "Monsieur DUCOUT, validation à l'écran",
              "validee_le": "2026-10-13", "perimetre": "sante-et-medico-social", "statut": "a-faire", "connecteur": "",
              "notes": ""}
    sources = [dict(entree)]
    extrait = [{"titre": "FONDATION NOUVELLE", "site_trouve": "https://nouvelle.fr", "id_registre": "", "numero_rnf": "1",
                "type_organisme": "FRUP", "ville": "Paris", "domaine_interet_general": "santé"}]
    nouvelles = annuaires.integrer(extrait, sources)
    assert sources[0] == entree, "integrer ne touche pas une entree existante"
    assert len(nouvelles) == 1 and "url_validee" not in nouvelles[0]
    chemin = tmp_path / "registre.json"
    registre.sauver(sources, chemin)
    relu = registre.charger(chemin)
    assert relu[0]["url_validee"] == "https://validee.fr" and relu[0]["url_aap"] == "https://origine.fr"
    # Lecture du code source : aucune affectation du champ dans les deux modules automatiques.
    motif = re.compile(r"""\[["']url_validee["']\]\s*=[^=]|\burl_validee\s*=[^=]""")
    for module in (annuaires, registre):
        assert motif.search(Path(module.__file__).read_text(encoding="utf-8")) is None, module.__name__


def test_deux_moteurs_un_seul_document_pour_un_meme_url_source():
    url = "https://www.normandie.ars.sante.fr/appel-projet-esms-numerique-2026"
    connecteur = imp.to_app_aap(fiche(titre="Appel à projet ESMS Numérique 2026", url_source=url), "ars_normandie", MAINTENANT)
    local = imp.to_app_aap(fiche(titre="Appel à projet - ESMS Numérique 2026", url_source=url + "/",
                                 scrape_metadata={"moteur": "ollama", "modele": "qwen3:8b"}), "extraction_locale", MAINTENANT)
    assert imp.identifiant(connecteur["externalUrl"]) == imp.identifiant(local["externalUrl"])
    ident = imp.identifiant(url)
    assert imp.fusionner([(ident, local), (ident, connecteur)])[ident] is connecteur
    assert imp.fusionner([(ident, connecteur), (ident, local)])[ident] is connecteur
    assert len(imp.fusionner([(ident, connecteur), (ident, local)])) == 1


# ---------------------------------------------------------------- statut unique, liste blanche, fiches sans date

def test_identifiant_stable_et_independant_du_titre():
    a = imp.identifiant("https://www.Normandie.ars.sante.fr/appel-projet-esms-numerique-2026/")
    b = imp.identifiant("https://www.normandie.ars.sante.fr/appel-projet-esms-numerique-2026#haut")
    assert a == b and a.startswith("scraped-") and len(a) == len("scraped-") + 16
    assert imp.identifiant("https://autre.fr/x") != a


def test_document_existant_ne_reecrit_pas_les_champs_humains():
    doc = {"title": "T", "status": "published", "publishedAt": 1, "validation": {"statut": "proposee"}, "tags": ["a"]}
    assert imp.document_a_envoyer(doc, existe=False) == doc
    envoye = imp.document_a_envoyer(doc, existe=True)
    assert "status" not in envoye and "publishedAt" not in envoye and "validation" not in envoye
    assert envoye["title"] == "T" and envoye["tags"] == ["a"]


def test_une_fiche_validee_ne_porte_jamais_l_etiquette_a_verifier():
    doc = {"status": "published", "tags": ["a-verifier", "ars"]}
    juste = imp.appliquer_verdict(doc, {"verdict": "aap-juste", "commentaire": "", "date": "2026-10-14"})
    assert juste["tags"] == ["ars"] and juste["status"] == "published"
    assert juste["validation"] == {"statut": "validee", "commentaire": "", "date": "2026-10-14", "par": "Monsieur DUCOUT"}
    assert doc["tags"] == ["a-verifier", "ars"]  # fonction pure


def test_l_etiquette_a_verifier_decoule_du_statut_quel_que_soit_le_moteur():
    connecteur = imp.appliquer_verdict({"status": "published", "tags": ["ars"]}, None)
    assert connecteur["validation"]["statut"] == "proposee" and "a-verifier" in connecteur["tags"]
    assert connecteur["validation"]["par"] == ""
    corriger = imp.appliquer_verdict({"status": "published", "tags": ["ars"]},
                                     {"verdict": "aap-a-corriger", "commentaire": "date fausse", "date": "d"})
    assert corriger["validation"]["statut"] == "a_corriger" and "a-verifier" in corriger["tags"]
    assert corriger["validation"]["commentaire"] == "date fausse"
    assert imp.etiqueter(["x", "a-verifier", "a-verifier"], "validee") == ["x"]
    assert imp.etiqueter(["x"], "rejetee") == ["x"]
    # to_app_aap ne pose plus l'etiquette d'apres le moteur
    assert "a-verifier" not in imp.to_app_aap(fiche(scrape_metadata={"moteur": "ollama", "modele": "q"}), "s", MAINTENANT)["tags"]


def test_un_champ_inconnu_fait_echouer_l_import_en_le_nommant():
    with pytest.raises(imp.ChampInconnu, match="champ_surprise"):
        imp.verifier_fiche({**fiche(), "champ_surprise": 1}, "ars_test.json")
    with pytest.raises(imp.ChampInconnu, match="inconnu"):
        imp.verifier_champs({"title": "T", "inconnu": 1}, "https://x.fr")
    imp.verifier_fiche(fiche(), "ars_test.json")  # une fiche conforme passe
    _, doc = document()  # un document complet passe la liste blanche (verifier_champs appele dans document())
    assert set(doc) <= imp.CHAMPS_ENVOYES
    assert set(imp.CHAMPS_HUMAINS) | set(imp.CHAMPS_METIER) | set(imp.CHAMPS_TECHNIQUES) == imp.CHAMPS_ENVOYES


def test_fiche_sans_date_publiee_deadline_nulle_a_verifier():
    # Decision de Monsieur DUCOUT du 2026-10-14 (nuit) : une fiche sans date est publiee, « Date de cloture non
    # precisee », badge « a verifier » ; aucune date inventee.
    ident, doc = document(date_cloture=None)
    assert doc["deadline"] is None and doc["status"] == "published" and "sans-date-cloture" in doc["tags"]
    assert doc["validation"]["statut"] == "proposee" and "a-verifier" in doc["tags"]
    col = FauxCollection()
    imp.ecrire_documents(col, FauxBatch, [(ident, doc)], MAINTENANT)
    assert col.magasin[ident]["deadline"] is None and col.magasin[ident]["status"] == "published"


def test_fiche_hors_champ_entre_en_brouillon_a_corriger():
    doc = {"status": "published", "tags": ["x"], "validation": {"statut": "proposee", "commentaire": "", "date": "", "par": ""},
           "scrapeMetadata": {"champ": "hors-champ"}}
    d = imp.champ_en_attente(doc, date(2026, 10, 14))
    assert d["status"] == "draft" and d["validation"]["statut"] == "a_corriger" and d["validation"]["par"] == "import (champ)"
    assert "hors-champ" in d["tags"] and "a-verifier" in d["tags"] and "x" in d["tags"]


def test_fiche_incertaine_garde_son_statut_avec_etiquette():
    doc = {"status": "published", "tags": [], "validation": {"statut": "proposee", "commentaire": "", "date": "", "par": ""},
           "scrapeMetadata": {"champ": "incertain"}}
    d = imp.champ_en_attente(doc, date(2026, 10, 14))
    assert d["status"] == "published" and "champ-incertain" in d["tags"] and "a-verifier" in d["tags"]


def test_verdict_humain_l_emporte_sur_le_champ_du_modele():
    doc = {"status": "published", "tags": [], "validation": {"statut": "validee", "commentaire": "", "date": "", "par": imp.RELECTEUR},
           "scrapeMetadata": {"champ": "hors-champ"}}
    d = imp.champ_en_attente(doc, date(2026, 10, 14))
    assert d["status"] == "published" and d["validation"]["statut"] == "validee"
    assert "hors-champ" not in d["tags"] and "a-verifier" not in d["tags"]


def test_verdict_hors_champ_rejette_et_archive():
    d = imp.appliquer_verdict({"status": "published", "tags": []}, {"verdict": "hors-champ", "commentaire": "agricole", "date": "2026-10-14"})
    assert d["validation"]["statut"] == "rejetee" and d["status"] == "archived"


def test_fusionner_prefere_le_connecteur_au_modele_local():
    c = {"title": "A", "scrapeMetadata": {"moteur": "connecteur"}}
    o = {"title": "A -", "scrapeMetadata": {"moteur": "ollama"}}
    assert imp.fusionner([("id1", c), ("id1", o)])["id1"] is c
    assert imp.fusionner([("id1", o), ("id1", c)])["id1"] is c
    assert imp.fusionner([("id1", o)])["id1"] is o


def test_load_results_ignore_les_sorties_de_la_comparaison(tmp_path, monkeypatch):
    # 2026-10-14 : les fichiers comparaison_*.json (mesure des moteurs) ne sont pas des fiches a publier ; sans ce
    # filtre l'import global les aurait lus et aurait echoue sur leurs fichiers de refus.
    (tmp_path / "ars_x.json").write_text('[{"titre": "a"}]', encoding="utf-8")
    (tmp_path / "comparaison_api_h.json").write_text('[{"titre": "b"}]', encoding="utf-8")
    (tmp_path / "comparaison_ollama_q_non_aap_collectivites.json").write_text('[{"fichier": "x"}]', encoding="utf-8")
    (tmp_path / "echantillon_x.json").write_text('[{"titre": "c"}]', encoding="utf-8")
    monkeypatch.setattr(imp, "RESULTS_DIR", tmp_path)
    assert [(s, i["titre"]) for s, i in imp.load_results(None)] == [("ars_x", "a")]


# ---------------------------------------------------------------- nettoyage : source reelle, financeur canonique, territoire
# (changement nettoyage-financeurs-territoires, 2026-10-14) : petit registre et petite table, pour ne pas dependre du vrai.

import financeurs  # noqa: E402

REGISTRE_TEST = [
    {"id": "ars-normandie", "nom": "ARS Normandie", "categorie": "ars", "connecteur": ""},
    {"id": "ars-ile-de-france", "nom": "ARS Île-de-France", "categorie": "ars", "connecteur": "ars_idf, ars_idf_local"},
    {"id": "cnsa", "nom": "CNSA (Caisse nationale de solidarité pour l'autonomie)", "categorie": "caisse-nationale",
     "connecteur": "cnsa"},
]


@pytest.fixture
def petit_registre(monkeypatch):
    monkeypatch.setattr(imp, "EMETTEURS", financeurs.index_emetteurs(REGISTRE_TEST))
    monkeypatch.setattr(imp, "FINANCEURS", financeurs.construire(REGISTRE_TEST))


def test_source_reelle_emetteur_du_registre_et_fichier_conserve(petit_registre):
    local = fiche(financeur="ARS Normandie", scrape_metadata={"moteur": "ollama", "modele": "q", "source": "ars-normandie"})
    doc = imp.to_app_aap(local, "extraction_locale", MAINTENANT)
    m = doc["scrapeMetadata"]
    assert (m["source"], m["sourceNom"], m["fichier"]) == ("ars-normandie", "ARS Normandie", "extraction_locale")
    assert doc["territoriesEligible"] == ["normandie"]  # la fiche ne dit rien : territoire de l'emetteur
    doc = imp.to_app_aap(fiche(financeur="ARS Île-de-France"), "ars_idf", MAINTENANT)  # connecteur connu du registre
    assert doc["scrapeMetadata"]["source"] == "ars-ile-de-france" and doc["scrapeMetadata"]["fichier"] == "ars_idf"
    doc = imp.to_app_aap(fiche(), "ars_test", MAINTENANT)  # fichier inconnu du registre : le nom du fichier reste
    assert doc["scrapeMetadata"]["source"] == "ars_test" and doc["scrapeMetadata"]["sourceNom"] == "ars_test"
    imp.verifier_champs(doc, "test")  # les nouveaux champs sont dans scrapeMetadata, la liste blanche ne bouge pas


def test_six_orthographes_un_financeur_nom_extrait_conserve(petit_registre):
    noms = ["ARS Île-de-France", "ARS Ile-de-France", "Agence régionale de santé Île-de-France", "ARS IDF",
            "Agence Régionale de Santé (ARS) Île-de-France", "ARS Île-de-France – Délégation départementale de l'Essonne"]
    docs = [imp.to_app_aap(fiche(financeur=n), "ars_idf", MAINTENANT) for n in noms]
    assert {d["financeurName"] for d in docs} == {"ARS Île-de-France"}
    assert [d["scrapeMetadata"]["financeurExtrait"] for d in docs] == noms
    inconnu = imp.to_app_aap(fiche(financeur="Département du Rhône"), "ars_test", MAINTENANT)
    assert inconnu["financeurName"] == "Département du Rhône"  # rien ne le rattache : garde tel quel


def test_territoire_deduit_jamais_france_par_defaut(petit_registre):
    assert imp.to_app_aap(fiche(territoire="Calvados et Manche"), "ars_test", MAINTENANT)["territoriesEligible"] == ["normandie"]
    assert imp.to_app_aap(fiche(territoire="National"), "ars_test", MAINTENANT)["territoriesEligible"] == ["france"]
    assert imp.to_app_aap(fiche(territoire="Grand Ouest"), "ars_test", MAINTENANT)["territoriesEligible"] == ["non-precise"]
    assert imp.to_app_aap(fiche(), "ars_test", MAINTENANT)["territoriesEligible"] == ["non-precise"]
    cnsa = imp.to_app_aap(fiche(financeur="CNSA", scrape_metadata={"moteur": "ollama", "modele": "q", "source": "cnsa"}),
                          "extraction_locale", MAINTENANT)
    assert cnsa["territoriesEligible"] == ["france"] and cnsa["financeurName"] == "CNSA"  # emetteur national


def test_groupes_de_doublons_meme_titre_normalise_et_meme_financeur():
    import doublons

    fiches = [("a", {"title": "Appel à projets ESMS numérique 2026", "financeurName": "ARS Normandie"}),
              ("b", {"title": "ESMS Numérique 2026 : appel à projets", "financeurName": "ARS Normandie"}),
              ("c", {"title": "Appel à projets ESMS numérique 2026", "financeurName": "ARS Bretagne"}),
              ("d", {"title": "Autre appel", "financeurName": "ARS Normandie"})]
    groupes = doublons.groupes_de_doublons(fiches)
    assert [[i for i, _ in g] for g in groupes] == [["a", "b"]]


def _fiche(titre, financeur, source, cloture=None, url="https://x.fr/a", par=""):
    return {"title": titre, "financeurName": financeur, "externalUrl": url, "scrapeMetadata": {"source": source},
            "deadline": datetime(*cloture, tzinfo=timezone.utc) if cloture else None,
            "validation": {"statut": "proposee", "par": par}}


RELAIS = {"lyonbiopole", "medicen-paris-region"}


def test_doublons_file_appel_repris_par_plusieurs_relais():
    """Changement doublons-file-a-valider : même date de clôture et mêmes mots distinctifs, financeurs différents."""
    import doublons

    fiches = [("bpi", _fiche("Appel à projets « Première Usine »", "Bpifrance", "bpifrance", (2027, 4, 6))),
              ("lyon", _fiche("France 2030 Première Usine", "Lyonbiopôle", "lyonbiopole", (2027, 4, 6))),
              ("medicen", _fiche("Appel A Projets France 2030 : « Première Usine »", "Medicen", "medicen-paris-region", (2026, 12, 15)))]
    groupes = doublons.groupes_file(fiches)
    assert [sorted(i for i, _ in g) for g in groupes] == [["bpi", "lyon"]]
    assert doublons.a_garder(groupes[0], RELAIS)[0] == "bpi"
    # Fiche du financeur lue en suivant le lien d'un relais (source = le relais) : gardée pour son vrai financeur
    via_relais = [("bpi", _fiche("Appel à projets « Première Usine »", "Bpifrance", "medicen-paris-region", (2027, 4, 6))),
                  ("lyon", _fiche("France 2030 Première Usine", "Lyonbiopôle Auvergne-Rhône-Alpes – appels à projets", "lyonbiopole", (2027, 4, 6)))]
    assert doublons.a_garder(via_relais, RELAIS) == ("bpi", "financeur réel (lu en suivant un relais)")


def test_doublons_file_appel_europeen_relaye():
    import doublons

    url = "https://ec.europa.eu/info/funding-tenders/opportunities/portal/screen/opportunities/topic-details/HORIZON-HLTH-2027-01-DISEASE-08"
    fiches = [("relais", _fiche("HORIZON-HLTH-2027-01-DISEASE-08: Development of innovative antimicrobials", "Lyonbiopôle",
                                "lyonbiopole", (2027, 2, 17))),
              ("portail", _fiche("Development of innovative antimicrobials against pathogens", "Commission européenne",
                                 "portail-funding-tenders-commission-europeenne", (2027, 2, 17), url=url))]
    assert doublons.code_programme(fiches[1][1]) == "HORIZON-HLTH-2027-01-DISEASE-08"
    groupes = doublons.groupes_file(fiches)
    assert len(groupes) == 1 and doublons.a_garder(groupes[0], RELAIS)[0] == "portail"


def test_doublons_file_titres_proches_dates_differentes():
    import doublons

    fiches = [("a", _fiche("Appel à Projets 2027 « Soutien à l'émergence »", "Cancéropôle Nord-Ouest", "canceropole-nord-ouest", (2026, 10, 30))),
              ("b", _fiche("Appel à projets 2027 Soutien à l'émergence", "Cancéropôle Est", "canceropole-est", (2027, 1, 15)))]
    assert doublons.groupes_file(fiches) == []


def test_doublons_file_garde_la_fiche_relue():
    import doublons

    g = [("relue", _fiche("Challenge prévention", "Lyonbiopôle", "lyonbiopole", (2028, 12, 31), par=imp.RELECTEUR)),
         ("officielle", _fiche("Challenge prévention", "Bpifrance", "bpifrance", (2028, 12, 31)))]
    assert doublons.a_garder(g, RELAIS)[0] == "relue"


def test_financeur_reel_d_un_relais_a_l_import():
    """Changement financeur-reel-des-relais : une fiche de Lyonbiopôle (relais) affiche le financeur cité entre parenthèses."""
    extrait = ("Lyonbiopôle Auvergne-Rhône-Alpes – appels à projets (appel émis par la Commission européenne, programme "
               "HORIZON EUROPE - CLUSTER SANTE)")
    item = {"titre": "HORIZON-HLTH-2027-01-DISEASE-08: Development of innovative antimicrobials", "financeur": extrait,
            "description": "Appel européen.", "url_source": "https://lyonbiopole.com/appel/x", "date_cloture": "2027-02-17",
            "scrape_metadata": {"source": "lyonbiopole", "moteur": "api"}}
    doc = imp.to_app_aap(item, "extraction_api", MAINTENANT)
    assert doc["financeurName"] == "Commission européenne"
    assert doc["scrapeMetadata"]["financeurExtrait"] == extrait


def test_profil_admin_impose_le_role_et_garde_le_reste():
    import creer_admin

    neuf = creer_admin.profil_admin("a@b.fr", None, "T0")
    assert neuf["userType"] == "admin" and neuf["profileComplete"] is True and neuf["createdAt"] == "T0"
    assert neuf["subscriptionStatus"] == "active" and neuf["subscriptionPlan"] is None
    existant = {"userType": "porteur", "createdAt": "T-1", "notificationPreferences": {"email": False}, "profileComplete": False}
    promu = creer_admin.profil_admin("a@b.fr", existant, "T0")
    assert promu["userType"] == "admin" and promu["createdAt"] == "T-1" and promu["notificationPreferences"] == {"email": False}
    assert promu["profileComplete"] is True and promu["email"] == "a@b.fr"


def test_import_reporte_le_resume_du_controle_du_modele():
    # verification-assistee-haiku : le resume (champs douteux) part dans scrapeMetadata, le detail reste dans les fichiers.
    v = {"modele": "claude-haiku-5-5", "le": "2026-10-15T11:00:00", "douteux": ["date_cloture"], "est_un_appel": True,
         "champs": {"date_cloture": {"verdict": "faux", "correction": "2026-11-30", "raison": "page"}}}
    doc = imp.to_app_aap(fiche(scrape_metadata={"moteur": "ollama", "modele": "q", "verification": v}), "x", MAINTENANT)
    assert doc["scrapeMetadata"]["verification"] == {"modele": "claude-haiku-5-5", "le": "2026-10-15T11:00:00",
                                                     "douteux": ["date_cloture"], "estUnAppel": True}
    assert "champs" not in doc["scrapeMetadata"]["verification"]
    imp.verifier_champs(doc, "test")
    assert "verification" not in imp.to_app_aap(fiche(), "x", MAINTENANT)["scrapeMetadata"]


def test_le_controle_du_modele_vaut_relecture_sauf_verdict_humain():
    # Demande de Monsieur DUCOUT du 2026-10-15 (midi) : Haiku valide a sa place ; son verdict a lui l'emporte toujours.
    import verification  # noqa: E402
    ver = {"modele": "claude-haiku-5-5", "le": "2026-10-15T11:00:00", "douteux": ["date_cloture"], "est_un_appel": True,
           "champs": {"date_cloture": {"verdict": "manquant", "correction": "2026-11-30", "raison": "page"}}}
    item = fiche(date_cloture=None, scrape_metadata={"moteur": "ollama", "modele": "q", "champ": "sante", "verification": ver})
    decision = verification.decision_du_modele(item)
    doc = imp.to_app_aap(verification.appliquer_corrections(item, decision), "x", MAINTENANT)
    doc = imp.appliquer_verdict(doc, None)
    doc = imp.appliquer_decision_du_modele(imp.champ_en_attente(doc, AUJOURDHUI), decision)
    assert doc["deadline"].date().isoformat() == "2026-11-30"
    assert doc["validation"]["statut"] == "validee" and doc["validation"]["par"] == "claude-haiku-5-5"
    assert "a-verifier" not in doc["tags"] and doc["status"] == "published"
    imp.verifier_champs(doc, "test")
    # Rejet par le modele : archive
    ver_non = {**ver, "est_un_appel": False, "douteux": []}
    item_non = fiche(scrape_metadata={"moteur": "ollama", "modele": "q", "champ": "sante", "verification": ver_non})
    d_non = verification.decision_du_modele(item_non)
    doc_non = imp.appliquer_decision_du_modele(imp.appliquer_verdict(imp.to_app_aap(item_non, "x", MAINTENANT), None), d_non)
    assert doc_non["validation"]["statut"] == "rejetee" and doc_non["status"] == "archived"
    # Verdict humain existant : rien ne bouge
    humain = imp.appliquer_verdict(imp.to_app_aap(item, "x", MAINTENANT), {"verdict": "aap-a-corriger", "commentaire": "c"})
    assert imp.appliquer_decision_du_modele(humain, decision)["validation"]["par"] == imp.RELECTEUR
    # Fiche hors champ : le brouillon hors champ reste
    hors = imp.champ_en_attente(imp.appliquer_verdict(imp.to_app_aap(
        fiche(scrape_metadata={"moteur": "ollama", "modele": "q", "champ": "hors-champ", "verification": ver}), "x", MAINTENANT), None), AUJOURDHUI)
    assert imp.appliquer_decision_du_modele(hors, decision)["validation"]["statut"] == "a_corriger"


def test_appliquer_controle_modifications_n_ecrit_que_le_necessaire():
    # Migration appliquer_controle.py : validation au nom du modele, tags, champs corriges ; status seulement si rejetee.
    import appliquer_controle as ac  # noqa: E402
    import verification  # noqa: E402
    ver = {"modele": "claude-haiku-5-5", "le": "2026-10-15T11:00:00", "douteux": ["date_cloture", "enveloppe_globale"],
           "est_un_appel": True, "champs": {"date_cloture": {"verdict": "manquant", "correction": "2026-11-30"},
                                            "enveloppe_globale": {"verdict": "manquant", "correction": "910000"}}}
    item = fiche(date_cloture=None, scrape_metadata={"moteur": "ollama", "modele": "q", "champ": "sante", "verification": ver})
    maj = ac.modifications(item, "x", verification.decision_du_modele(item), MAINTENANT, AUJOURDHUI)
    assert set(maj) == {"validation", "tags", "deadline", "budgetTotal", "scrapeMetadata.enveloppeGlobale"}
    assert maj["validation"]["statut"] == "validee" and maj["deadline"].date().isoformat() == "2026-11-30"
    assert maj["budgetTotal"] == 910000 and "a-verifier" not in maj["tags"] and "sans-date-cloture" not in maj["tags"]
    rejet = fiche(scrape_metadata={"moteur": "ollama", "modele": "q", "champ": "sante", "verification": {**ver, "est_un_appel": False, "douteux": []}})
    assert ac.modifications(rejet, "x", verification.decision_du_modele(rejet), MAINTENANT, AUJOURDHUI)["status"] == "archived"


def test_import_pose_la_date_d_extraction():
    # mention-relecture-fiches : extraitLe = produite_le (local, API), sinon scraped_at (connecteur), sinon vide.
    assert imp.to_app_aap(fiche(scrape_metadata={"moteur": "api", "modele": "h", "produite_le": "2026-10-19T10:12:00"}), "x", MAINTENANT)["scrapeMetadata"]["extraitLe"] == "2026-10-19T10:12:00"
    assert imp.to_app_aap(fiche(scrape_metadata={"scraped_at": "2026-10-09T08:00:00"}), "x", MAINTENANT)["scrapeMetadata"]["extraitLe"] == "2026-10-09T08:00:00"
    assert imp.to_app_aap(fiche(), "x", MAINTENANT)["scrapeMetadata"]["extraitLe"] == ""


def test_reporter_valeurs_api_ne_retient_que_les_ecarts():
    # extraction-api-v4 2.3 : les champs metier d'une fiche validee par le modele prennent les valeurs API qui different.
    import reporter_valeurs_api as rva  # noqa: E402
    item = fiche(date_cloture="2026-11-30", montant_max=36000, scrape_metadata={"moteur": "api", "modele": "h", "champ": "sante",
                 "produite_le": "2026-10-19T10:00:00", "verification": {"modele": "h", "le": "2026-10-19T11:00:00", "douteux": [],
                                                                        "est_un_appel": True, "champs": {}}})
    nouveau = rva.document_api(item, "extraction_api", MAINTENANT, AUJOURDHUI)
    assert nouveau["validation"]["statut"] == "validee" and nouveau["budgetMax"] == 36000
    existant = {**nouveau, "budgetMax": 21000, "deadline": nouveau["deadline"], "validation": dict(nouveau["validation"])}
    maj = rva.ecarts(existant, nouveau)
    assert maj == {"budgetMax": 36000}
    assert rva.ecarts(nouveau, nouveau) == {}


def test_import_pose_collecte_le_et_derniere_vue_meme_sur_une_fiche_validee():
    # fraicheur-dates-collecte : collecteLe depuis collecte_le (sinon scraped_at), derniereVueLe = date de l'import,
    # champs techniques donc envoyes aussi sur un document existant valide.
    d = imp.to_app_aap(fiche(scrape_metadata={"moteur": "ollama", "modele": "q", "collecte_le": "2026-10-13T16:58:00", "produite_le": "2026-10-19T10:00:00"}), "x", MAINTENANT)
    assert d["scrapeMetadata"]["collecteLe"] == "2026-10-13T16:58:00" and d["scrapeMetadata"]["derniereVueLe"] == MAINTENANT.isoformat()
    assert imp.to_app_aap(fiche(scrape_metadata={"scraped_at": "2026-10-09T08:00:00"}), "x", MAINTENANT)["scrapeMetadata"]["collecteLe"] == "2026-10-09T08:00:00"
    valide = imp.appliquer_verdict(d, {"verdict": "aap-juste", "commentaire": "", "date": "2026-10-19"})
    envoye = imp.document_a_envoyer(valide, existe=True)
    assert "scrapeMetadata" in envoye and "title" not in envoye and envoye["validation"]["par"] == imp.RELECTEUR


def test_un_verdict_humain_atteint_un_document_existant():
    # Constat du 2026-10-19 : validation etait protegee meme quand un verdict humain venait d'etre donne.
    doc = imp.appliquer_verdict({"title": "T", "status": "published", "publishedAt": 1, "tags": ["a-verifier"]},
                                {"verdict": "aap-juste", "commentaire": "", "date": "2026-10-19"})
    envoye = imp.document_a_envoyer(doc, existe=True)
    assert envoye["validation"]["par"] == imp.RELECTEUR and "publishedAt" not in envoye
    assert "title" not in envoye and "tags" not in envoye  # validee : les champs metier, tags compris, restent proteges
    rejet = imp.appliquer_verdict({"title": "T", "status": "published", "publishedAt": 1, "tags": []},
                                  {"verdict": "hors-champ", "commentaire": "", "date": "2026-10-19"})
    assert imp.document_a_envoyer(rejet, existe=True)["status"] == "archived"


def test_derniere_vue_depuis_le_rejeu_et_peremption():
    # rejeu-collecte-veille : derniereVueLe = vue_rubrique_le quand le rejeu l'a posee, absences reporte ;
    # perimer_fiches : publiee, deux absences, sans verdict humain -> a corriger ; verdict humain intouche.
    import perimer_fiches as pf  # noqa: E402
    d = imp.to_app_aap(fiche(scrape_metadata={"moteur": "api", "modele": "h", "vue_rubrique_le": "2026-10-27", "absences": 1}), "x", MAINTENANT)
    assert d["scrapeMetadata"]["derniereVueLe"] == "2026-10-27" and d["scrapeMetadata"]["absences"] == 1
    assert imp.to_app_aap(fiche(), "x", MAINTENANT)["scrapeMetadata"]["absences"] == 0
    perime = {"status": "published", "tags": ["x"], "validation": {"statut": "validee", "par": "claude-haiku-5-5", "commentaire": "", "date": ""},
              "scrapeMetadata": {"absences": 2}}
    maj = pf.peremption(perime, AUJOURDHUI)
    assert maj["validation"]["statut"] == "a_corriger" and "2 rejeux" in maj["validation"]["commentaire"] and "a-verifier" in maj["tags"]
    assert pf.peremption({**perime, "scrapeMetadata": {"absences": 1}}, AUJOURDHUI) is None
    assert pf.peremption({**perime, "validation": {"statut": "validee", "par": imp.RELECTEUR}}, AUJOURDHUI) is None
    assert pf.peremption({**perime, "status": "draft"}, AUJOURDHUI) is None
    deja = {**perime, "validation": maj["validation"]}
    assert pf.peremption(deja, AUJOURDHUI) is None


# ---------------------------------------------------------------- administration-controle (2026-10-20)

def test_une_fiche_non_validee_entre_en_brouillon():
    """Decision du 2026-10-20 : seules les fiches controlees sont publiees ; proposee ou a_corriger -> brouillon,
    validee (humain ou modele) -> publiee, verdict humain a corriger laisse tel quel."""
    base = {"status": "published", "tags": []}
    proposee = {**base, "validation": {"statut": "proposee", "par": "", "commentaire": "", "date": ""}}
    assert imp.publication_selon_controle(proposee)["status"] == "draft"
    a_corriger_modele = {**base, "validation": {"statut": "a_corriger", "par": "claude-haiku-5-5", "commentaire": "", "date": ""}}
    assert imp.publication_selon_controle(a_corriger_modele)["status"] == "draft"
    validee = {**base, "validation": {"statut": "validee", "par": "claude-haiku-5-5", "commentaire": "", "date": ""}}
    assert imp.publication_selon_controle(validee)["status"] == "published"
    humain = {**base, "validation": {"statut": "a_corriger", "par": imp.RELECTEUR, "commentaire": "", "date": ""}}
    assert imp.publication_selon_controle(humain)["status"] == "published"
    assert proposee["status"] == "published"  # fonction pure : l'entree n'est pas modifiee


# ---------------------------------------------------------------- qualification-appels (jour 2 du plan MVP, 2026-10-20)

def test_la_qualification_est_portee_sur_le_document():
    item = {"scrape_metadata": {"qualification": {"destinataires": ["public", "prive-non-lucratif"], "type_appel": "ami",
                                                  "objets": ["immobilier"], "date_ouverture": "2026-11-02",
                                                  "pieces_attendues": ["Dossier", "Budget"], "champ": "sante",
                                                  "modele": "claude-haiku-5-5", "le": "2026-10-20T21:00:00"}}}
    doc = {"status": "published", "tags": [], "requiredDocuments": []}
    d = imp.appliquer_qualification(doc, item, AUJOURDHUI)
    assert d["qualification"] == {"destinataires": ["public", "prive-non-lucratif"], "typeAppel": "ami", "objets": ["immobilier"],
                                  "dateOuverture": "2026-11-02", "par": "claude-haiku-5-5", "le": "2026-10-20"}
    assert d["startDate"].date().isoformat() == "2026-11-02"
    assert d["requiredDocuments"] == ["Dossier", "Budget"]
    assert d["status"] == "published"
    assert doc.get("qualification") is None  # fonction pure


def test_hors_champ_par_la_qualification_passe_en_brouillon_sauf_verdict_humain():
    item = {"scrape_metadata": {"qualification": {"destinataires": ["tous"], "type_appel": "mecenat", "objets": [],
                                                  "date_ouverture": None, "pieces_attendues": [], "champ": "hors-champ",
                                                  "modele": "m", "le": "2026-10-20"}}}
    d = imp.appliquer_qualification({"status": "published", "tags": []}, item, AUJOURDHUI)
    assert d["status"] == "draft" and d["validation"]["statut"] == "a_corriger" and "hors-champ" in d["tags"]
    humain = {"status": "published", "tags": [], "validation": {"statut": "validee", "par": imp.RELECTEUR, "commentaire": "", "date": ""}}
    assert imp.appliquer_qualification(humain, item, AUJOURDHUI)["status"] == "published"


def test_une_qualification_humaine_en_base_n_est_pas_ecrasee():
    doc = {"title": "t", "qualification": {"destinataires": ["public"], "par": "claude-haiku-5-5"}, "status": "published",
           "validation": {"statut": "validee", "par": "claude-haiku-5-5", "commentaire": "", "date": ""}}
    existant = {"qualification": {"destinataires": ["prive-lucratif"], "par": imp.RELECTEUR}}
    assert "qualification" not in imp.document_a_envoyer(doc, True, existant)
    assert "qualification" in imp.document_a_envoyer(doc, True, {"qualification": {"par": "claude-haiku-5-5"}})
