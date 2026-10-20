"""Tests du rejeu de la collecte et de la veille (fonctions pures, sans navigateur)."""
import sys
from pathlib import Path

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
