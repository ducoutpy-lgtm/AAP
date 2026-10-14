"""Tests des fonctions pures de l'import (sans Firestore) : identifiant stable, protection des decisions humaines,
verdicts, fiches sans date. Lancer depuis la racine : .venv/Scripts/python -m pytest scripts/tests -q"""
import sys
from datetime import date, datetime
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
import import_to_firestore as imp  # noqa: E402


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


def test_fiche_validee_protege_les_champs_metier():
    doc = {"title": "T", "deadline": 1, "tags": ["x"], "status": "published", "validation": {"statut": "validee"},
           "scrapeMetadata": {"importedAt": 2}, "updatedAt": 3}
    envoye = imp.document_a_envoyer(doc, existe=True)
    assert set(envoye) == {"scrapeMetadata", "updatedAt"}


def test_appliquer_verdict():
    doc = {"status": "published", "tags": ["a-verifier", "ars"]}
    assert imp.appliquer_verdict(doc, None)["validation"]["statut"] == "proposee"
    juste = imp.appliquer_verdict(doc, {"verdict": "aap-juste", "commentaire": "", "date": "2026-10-14"})
    assert juste["validation"]["statut"] == "validee" and juste["tags"] == ["ars"] and juste["status"] == "published"
    corriger = imp.appliquer_verdict(doc, {"verdict": "aap-a-corriger", "commentaire": "date fausse", "date": "d"})
    assert corriger["validation"] == {"statut": "a_corriger", "commentaire": "date fausse", "date": "d"}
    assert "a-verifier" in corriger["tags"]
    rejet = imp.appliquer_verdict(doc, {"verdict": "pas-un-aap", "commentaire": "", "date": "d"})
    assert rejet["status"] == "archived" and rejet["validation"]["statut"] == "rejetee"
    assert doc["tags"] == ["a-verifier", "ars"]  # fonction pure


def test_sans_date_en_attente():
    d = imp.sans_date_en_attente({"tags": ["t"]}, date(2026, 10, 14))
    assert d["status"] == "draft" and d["validation"]["statut"] == "a_corriger"
    assert d["deadline"] == datetime(2027, 10, 14, tzinfo=d["deadline"].tzinfo) and "sans-date-cloture" in d["tags"]


def test_fusionner_prefere_le_connecteur_au_modele_local():
    c = {"title": "A", "scrapeMetadata": {"moteur": "connecteur"}}
    o = {"title": "A -", "scrapeMetadata": {"moteur": "ollama"}}
    assert imp.fusionner([("id1", c), ("id1", o)])["id1"] is c
    assert imp.fusionner([("id1", o), ("id1", c)])["id1"] is c
    assert imp.fusionner([("id1", o)])["id1"] is o
