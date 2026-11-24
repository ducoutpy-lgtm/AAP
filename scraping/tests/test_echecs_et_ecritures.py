"""Plan niveau A, lot 2.2 (2026-11-24) : un texte en échec (panne passagère d'Ollama) était écarté pour toujours ; un
fichier de résultats coupé pendant son écriture bloquait la veille suivante."""
import json
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import echantillon as e  # noqa: E402


def test_un_echec_est_retente_jusqu_a_trois_fois():
    echecs = []
    e.noter_echec(echecs, "a.txt", "TimeoutError: timed out")
    e.noter_echec(echecs, "a.txt", "TimeoutError: timed out")
    assert echecs == [{"fichier": "a.txt", "erreur": "TimeoutError: timed out", "tentatives": 2}]
    assert "a.txt" not in e.echecs_definitifs(echecs)
    e.noter_echec(echecs, "a.txt", "URLError: refused")
    assert "a.txt" in e.echecs_definitifs(echecs)
    # Échecs enregistrés avant cette règle (sans compteur) : une tentative, donc retentés
    assert e.echecs_definitifs([{"fichier": "ancien.txt", "erreur": "x"}]) == set()


def test_textes_restants_reprend_les_echecs_non_definitifs(tmp_path, monkeypatch):
    import extraction_locale as x
    monkeypatch.setattr(x, "ICI", tmp_path)
    fiches = tmp_path / "decouverte" / "s" / "fiches"
    fiches.mkdir(parents=True)
    a, b = fiches / "a.txt", fiches / "b.txt"
    a.write_text("https://x/a\ntexte", encoding="utf-8")
    b.write_text("https://x/b\ntexte", encoding="utf-8")
    sortie = tmp_path / "results" / "sortie.json"
    sortie.parent.mkdir()
    (tmp_path / "results" / "sortie.errors.json").write_text(json.dumps([
        {"fichier": str(a.relative_to(tmp_path)), "erreur": "TimeoutError", "tentatives": 1},
        {"fichier": str(b.relative_to(tmp_path)), "erreur": "TimeoutError", "tentatives": 3}]), encoding="utf-8")
    assert [c for _, c in x.textes_restants([({}, a), ({}, b)], sortie)] == [a]


def test_ecriture_sans_fichier_coupe(tmp_path, monkeypatch):
    chemin = tmp_path / "fiches.json"
    e._ecrire_json(chemin, [{"ancien": True}])

    def coupure(*_a, **_k):
        raise OSError("coupure de courant simulée")
    monkeypatch.setattr(e.os, "replace", coupure)
    with pytest.raises(OSError):
        e._ecrire_json(chemin, [{"nouveau": True}])
    assert json.loads(chemin.read_text(encoding="utf-8")) == [{"ancien": True}]


def test_fichier_illisible_arrete_avec_un_message_clair(tmp_path):
    chemin = tmp_path / "fiches.json"
    chemin.write_text('[{"titre": "coup', encoding="utf-8")
    with pytest.raises(ValueError, match="illisible"):
        e._charger_liste(chemin)


def test_un_seul_journal_des_couts_quel_que_soit_le_dossier_de_lancement():
    """Plan niveau A, lot 2.3 (2026-11-24) : extractor écrivait dans logs/ relatif au dossier de lancement, le plafond
    lisait scraping/logs/ : une dépense lancée d'ailleurs échappait au plafond."""
    import analyze_costs
    import extractor
    assert extractor.COST_LOG_FILE.is_absolute()
    assert extractor.COST_LOG_FILE == e.JOURNAL_COUTS == analyze_costs.LOG_FILE
