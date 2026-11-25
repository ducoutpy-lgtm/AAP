"""Tests du rejeu de la collecte et de la veille (fonctions pures, sans navigateur)."""
import asyncio
import json
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import rejeu  # noqa: E402

A = {"texte": "Appel A", "href": "https://x/a", "score": 3}
B = {"texte": "Appel B", "href": "https://x/b", "score": 4}
C = {"texte": "Appel C", "href": "https://x/c", "score": 3}


def test_comparer_liens_nouveau_disparu_revu():
    fusion, bilan = rejeu.comparer_liens([A, B], [A, C], "2026-10-20")
    assert bilan == {"nouveaux": ["https://x/c"], "disparus": ["https://x/b"], "vus": 2, "ignore": False}
    par = {l["href"]: l for l in fusion}
    assert par["https://x/a"]["vu_le"] == "2026-10-20" and par["https://x/a"]["absences"] == 0 and par["https://x/a"]["apparu_le"] == ""
    assert par["https://x/c"]["apparu_le"] == "2026-10-20" and par["https://x/c"]["absences"] == 0
    assert par["https://x/b"]["absences"] == 1 and par["https://x/b"]["vu_le"] == ""
    # Second rejeu : B toujours absent -> 2 ; A revu reste a 0 ; C revu
    fusion2, bilan2 = rejeu.comparer_liens(fusion, [A, C], "2026-10-27")
    par2 = {l["href"]: l for l in fusion2}
    assert par2["https://x/b"]["absences"] == 2 and bilan2["nouveaux"] == [] and bilan2["disparus"] == ["https://x/b"]
    # B revient : compteur remis a zero, apparu_le reste vide (connu avant le rejeu)
    fusion3, _ = rejeu.comparer_liens(fusion2, [A, B, C], "2026-11-03")
    assert {l["href"]: l for l in fusion3}["https://x/b"]["absences"] == 0


def test_comparer_liens_page_en_erreur_ne_touche_rien():
    anciens = [{**A, "absences": 1, "vu_le": "2026-10-13"}]
    fusion, bilan = rejeu.comparer_liens(anciens, None, "2026-10-20")
    assert fusion == anciens and bilan["ignore"] is True
    fusion, bilan = rejeu.comparer_liens(anciens, [], "2026-10-20")
    assert fusion == anciens and bilan["ignore"] is True


def test_marquer_fiches_et_perimables():
    fiches = [
        {"titre": "a", "url_source": "https://x/a", "scrape_metadata": {"source": "s"}},
        {"titre": "b", "url_source": "https://x/b", "scrape_metadata": {"source": "s"}},
        {"titre": "z", "url_source": "https://y/z", "scrape_metadata": {"source": "autre"}},
    ]
    liens = {"s": {"https://x/a": {**A, "vu_le": "2026-10-20", "absences": 0}, "https://x/b": {**B, "vu_le": "2026-10-13", "absences": 2}}}
    assert rejeu.marquer_fiches(fiches, liens) == 2
    assert fiches[0]["scrape_metadata"]["vue_rubrique_le"] == "2026-10-20" and fiches[0]["scrape_metadata"]["absences"] == 0
    assert fiches[1]["scrape_metadata"]["absences"] == 2 and "absences" not in fiches[2]["scrape_metadata"]
    assert [f["titre"] for f in rejeu.fiches_perimables(fiches)] == ["b"]


def test_rapport_markdown_sections():
    journaux = {"s": [{"id": "s", "nom": "Source S", "date": "2026-10-20T09:00:00", "vus": 2, "nouveaux": ["https://x/c"],
                       "disparus": ["https://x/b"], "ignore": False, "erreur": None}],
                "t": [{"id": "t", "nom": "Source T", "date": "2026-10-20T09:01:00", "vus": 0, "nouveaux": [], "disparus": [],
                       "ignore": True, "erreur": "HTTP 403"}]}
    perimables = [{"titre": "Appel B", "url_source": "https://x/b", "scrape_metadata": {"source": "s", "absences": 2, "vue_rubrique_le": "2026-10-13"}}]
    texte = rejeu.rapport_markdown(journaux, perimables, "2026-10-20")
    assert "Sources relues : 1 ; en erreur ou sans lien lisible (compteurs inchangés) : 1" in texte
    assert "- Source S : https://x/c" in texte and "- Source S : https://x/b" in texte and "HTTP 403" in texte
    assert "Appel B (s, 2 absences, vue le 2026-10-13)" in texte


def test_deja_relue_le_jour_meme():
    assert rejeu.deja_relue({"url": "u", "dernier_rejeu": "2026-10-20"}, "2026-10-20") is True
    assert rejeu.deja_relue({"url": "u", "dernier_rejeu": "2026-10-13"}, "2026-10-20") is False
    assert rejeu.deja_relue({"url": "u"}, "2026-10-20") is False


class _FauxPlaywright:
    """Remplace Playwright dans relire() : aucun navigateur n'est lancé."""

    def __init__(self):
        self.chromium = self

    async def launch(self, **_k):
        return self

    async def close(self):
        return None

    async def __aenter__(self):
        return self

    async def __aexit__(self, *_a):
        return False


def _sources(tmp_path, monkeypatch, contenus):
    """Une source par contenu brut de liens.json ; chaque page relue donne les liens A et C, sans navigateur ni pause."""
    async def relire_source(*_a, **_k):
        return [A, C], None

    async def sans_pause(_duree):
        return None
    monkeypatch.setattr(rejeu, "DOSSIER", tmp_path)
    monkeypatch.setattr("playwright.async_api.async_playwright", _FauxPlaywright)
    monkeypatch.setattr(rejeu, "relire_source", relire_source)
    monkeypatch.setattr(rejeu.asyncio, "sleep", sans_pause)
    for i, contenu in enumerate(contenus):
        (tmp_path / f"s{i}").mkdir()
        (tmp_path / f"s{i}" / "liens.json").write_text(contenu, encoding="utf-8")
    return [{"id": f"s{i}", "nom": f"Source {i}"} for i in range(len(contenus))]


COUPE = '{"url": "https://x", "liens": [{"hr'


def test_une_coupure_pendant_l_ecriture_laisse_liens_json_intact(tmp_path, monkeypatch):
    # Relecture du plan niveau A (notation, chaîne du lundi) : liens.json et rejeux.json étaient réécrits sans fichier
    # temporaire ; un arrêt pendant l'écriture (arrêt du poste à 10 h 13 le 23/11) laissait un fichier coupé.
    ancien = {"url": "https://x", "liens": [A, B]}
    sources = _sources(tmp_path, monkeypatch, [json.dumps(ancien)])
    vraie_ecriture = Path.write_text

    def coupure(self, texte, *a, **k):
        vraie_ecriture(self, texte[: len(texte) // 2], *a, **k)
        raise OSError("coupure de courant simulée")
    monkeypatch.setattr(Path, "write_text", coupure)
    with pytest.raises(OSError):
        asyncio.run(rejeu.relire(sources))
    assert json.loads((tmp_path / "s0" / "liens.json").read_text(encoding="utf-8")) == ancien


def test_un_fichier_coupe_n_arrete_pas_la_relecture_des_autres_sources(tmp_path, monkeypatch):
    # Même relecture : liens.json et rejeux.json étaient relus sans garde ; un seul fichier coupé arrêtait toute la
    # relecture du lundi. Désormais la source est signalée et sautée, le fichier coupé laissé tel quel pour être réparé.
    sources = _sources(tmp_path, monkeypatch, [COUPE, json.dumps({"url": "https://y", "liens": [A, B]}),
                                               json.dumps({"url": "https://z", "liens": [A]})])
    (tmp_path / "s1" / "rejeux.json").write_text('[{"id": "s1", "da', encoding="utf-8")
    bilans = asyncio.run(rejeu.relire(sources))
    assert [b["ignore"] for b in bilans] == [True, False, False] and "illisible" in bilans[0]["erreur"]
    assert (tmp_path / "s0" / "liens.json").read_text(encoding="utf-8") == COUPE
    liens_s1 = json.loads((tmp_path / "s1" / "liens.json").read_text(encoding="utf-8"))["liens"]
    assert [l["href"] for l in liens_s1] == ["https://x/a", "https://x/c", "https://x/b"]
    assert (tmp_path / "s1" / "rejeux.json").read_text(encoding="utf-8") == '[{"id": "s1", "da'
    assert [b["id"] for b in json.loads((tmp_path / "s2" / "rejeux.json").read_text(encoding="utf-8"))] == ["s2"]


def test_marquer_et_rapport_sautent_un_fichier_coupe(tmp_path, monkeypatch):
    # Les étapes suivantes de la même commande (--marquer, --rapport) relisaient aussi ces fichiers sans garde.
    monkeypatch.setattr(rejeu, "DOSSIER", tmp_path / "decouverte")
    monkeypatch.setattr(rejeu, "RESULTS", tmp_path / "results")
    monkeypatch.setattr(rejeu, "RAPPORT", tmp_path / "VEILLE.md")
    (tmp_path / "results").mkdir()
    journal_s1 = [{"id": "s1", "nom": "Source 1", "date": "2026-11-23T08:00:00", "vus": 1, "nouveaux": [], "disparus": [],
                   "ignore": False, "erreur": None}]
    for sid, liens, journal in [("s0", COUPE, "[]"), ("s1", json.dumps({"liens": [A]}), json.dumps(journal_s1)),
                                ("s2", json.dumps({"liens": [B]}), '[{"id": "s2", "da')]:
        (tmp_path / "decouverte" / sid).mkdir(parents=True)
        (tmp_path / "decouverte" / sid / "liens.json").write_text(liens, encoding="utf-8")
        (tmp_path / "decouverte" / sid / "rejeux.json").write_text(journal, encoding="utf-8")
    assert set(rejeu.liens_connus()) == {"s1", "s2"}
    assert rejeu.rapport() == 0
    assert "| Source 1 | 2026-11-23T08:00 | 1 |" in (tmp_path / "VEILLE.md").read_text(encoding="utf-8")
