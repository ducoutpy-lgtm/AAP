"""Reprise sur erreur de l'API (principe 6 de CLAUDE.md, plan niveau A, lot 4.3, 2026-11-25), jamais testée jusqu'ici.

Un appel surchargé (529) ou limité (429) est retenté avec une attente croissante ; une erreur définitive (400) remonte
aussitôt ; après quatre échecs, l'appel s'arrête avec un message clair. Faux client : aucun appel réel, aucun coût, et le
journal des coûts écrit dans un dossier temporaire.
"""
from types import SimpleNamespace

import extractor
import httpx
import pytest
from anthropic import APIStatusError

OUTIL = {"name": "fiche", "input_schema": {"type": "object", "properties": {}}}
MODELE = "claude-haiku-5-5"
REUSSITE = SimpleNamespace(usage=SimpleNamespace(input_tokens=10, output_tokens=5),
                           content=[SimpleNamespace(type="tool_use", name="fiche", input={"titre": "AAP test"})])


def _erreur(code: int) -> APIStatusError:
    requete = httpx.Request("POST", "https://api.anthropic.com/v1/messages")
    return APIStatusError(f"erreur {code}", response=httpx.Response(code, request=requete), body=None)


class FauxClient:
    def __init__(self, reponses):
        self.reponses = list(reponses)
        self.appels = 0
        self.messages = SimpleNamespace(create=self._creer)

    def _creer(self, **_):
        self.appels += 1
        reponse = self.reponses.pop(0)
        if isinstance(reponse, Exception):
            raise reponse
        return reponse


@pytest.fixture
def poser_client(monkeypatch, tmp_path):
    attentes: list[float] = []
    monkeypatch.setattr(extractor.time, "sleep", attentes.append)
    monkeypatch.setattr(extractor, "COST_LOG_FILE", tmp_path / "couts.jsonl")

    def poser(reponses):
        client = FauxClient(reponses)
        monkeypatch.setattr(extractor, "_get_client", lambda: client)
        return client, attentes, tmp_path / "couts.jsonl"
    return poser


def _appel():
    return extractor._appeler(MODELE, "consigne", OUTIL, "texte", 100, "source", "https://x.fr", "test")


def test_deux_surcharges_puis_reussite_trois_appels_et_attente_croissante(poser_client):
    client, attentes, journal = poser_client([_erreur(529), _erreur(529), REUSSITE])
    assert _appel() == {"titre": "AAP test"}
    assert client.appels == 3
    assert attentes == [3, 6]
    assert len(journal.read_text(encoding="utf-8").splitlines()) == 1


def test_erreur_definitive_remonte_sans_nouvel_essai(poser_client):
    client, attentes, _ = poser_client([_erreur(400), REUSSITE])
    with pytest.raises(APIStatusError):
        _appel()
    assert client.appels == 1
    assert attentes == []


def test_quatre_limites_arret_avec_message_clair(poser_client):
    client, attentes, journal = poser_client([_erreur(429)] * 4)
    with pytest.raises(RuntimeError, match="Echec apres 4 tentatives"):
        _appel()
    assert client.appels == 4
    assert attentes == [3, 6, 12, 24]
    assert not journal.exists()
