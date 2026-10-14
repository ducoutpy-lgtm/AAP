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
