"""Tests des fonctions pures de l'extraction locale globale (sans réseau, sans Ollama)."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
import extraction_locale  # noqa: E402


def _src(id_, categorie, verdict="rubrique-confirmee"):
    return {"id": id_, "nom": id_, "categorie": categorie, "qualification": {"verdict": verdict}}


def test_sources_confirmees_ordre_des_familles_puis_du_registre():
    registre = [_src("cd-gard", "collectivite"), _src("fdf", "fondation"), _src("ars-bzh", "ars"),
                _src("cd-aude", "collectivite"), _src("hors", "ars", verdict="hors-sante"), _src("cnsa", "caisse-nationale")]
    assert [s["id"] for s in extraction_locale.sources_confirmees(registre)] == ["ars-bzh", "cnsa", "fdf", "cd-gard", "cd-aude"]
    assert [s["id"] for s in extraction_locale.sources_confirmees(registre, {"fdf", "hors"})] == ["fdf"]


def test_liens_web_uniques_sans_fichiers():
    vus = set()
    liens = [{"href": "https://a.fr/p1"}, {"href": "https://a.fr/p1"}, {"href": "https://a.fr/cahier.PDF?v=2"},
             {"href": "https://a.fr/p2"}]
    assert [l["href"] for l in extraction_locale.liens_web(liens, vus)] == ["https://a.fr/p1", "https://a.fr/p2"]
    # une adresse déjà vue par une autre source n'est pas reprise
    assert extraction_locale.liens_web([{"href": "https://a.fr/p2"}, {"href": "https://b.fr/x"}], vus) == [{"href": "https://b.fr/x"}]


def test_bilan_compteurs_et_estimation():
    fiches = [{"scrape_metadata": {"duree_s": 60, "a_relire": True}}, {"scrape_metadata": {"duree_s": 60}}]
    refusees = [{"duree_s": 20}]
    texte = extraction_locale.bilan(3, 10, 8, fiches, refusees, [])
    assert "Sources en rubrique confirmée : 3" in texte
    assert "Pages web candidates (adresses uniques) : 10" in texte
    assert "Textes collectés : 8" in texte
    assert "Fiches produites : 2 (dont 1 à relire)" in texte
    assert "Pages refusées (pas la fiche d'un appel) : 1" in texte
    assert "Textes restant à traiter : 5" in texte
    assert "h estimées" in texte


def test_textes_restants_et_devis(tmp_path, monkeypatch):
    # V4 (extraction-api-v4) : le devis compte les textes non traités par le fichier de sortie API et écrit un maximum.
    import json
    import echantillon
    monkeypatch.setattr(extraction_locale, "ICI", tmp_path)
    a, b = tmp_path / "decouverte" / "s" / "fiches" / "a.txt", tmp_path / "decouverte" / "s" / "fiches" / "b.txt"
    a.parent.mkdir(parents=True)
    a.write_text("https://x/a\nlien\n\ntexte", encoding="utf-8")
    b.write_text("https://x/b\nlien\n\ntexte", encoding="utf-8")
    sortie = tmp_path / "results" / "extraction_api.json"
    sortie.parent.mkdir()
    sortie.write_text(json.dumps([{"scrape_metadata": {"fichier": str(a.relative_to(tmp_path))}}]), encoding="utf-8")
    restants = extraction_locale.textes_restants([({"id": "s"}, a), ({"id": "s"}, b)], sortie)
    assert [c for _, c in restants] == [b]
    tarifs = {"entree": 0.10, "sortie": 0.50}
    texte = extraction_locale.devis([3400] * 1808, "claude-haiku-5-5", tarifs, 0.519, 5.0, 0.95)
    assert texte.startswith("Devis : 1808 textes restants") and "claude-haiku-5-5" in texte and "déjà dépensé pour ce modèle 0.519" in texte
    attendu = sum(echantillon.estimation_appel_euros(3400, tarifs, 0.95) for _ in range(1808))
    assert f"{attendu:.2f} euros au plus" in texte and "DÉPASSEMENT" not in texte
    assert "DÉPASSEMENT" in extraction_locale.devis([3400] * 1808, "m", tarifs, 4.9, 5.0, 0.95)
