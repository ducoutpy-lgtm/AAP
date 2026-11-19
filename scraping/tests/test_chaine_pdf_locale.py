"""Tests de la chaîne locale des PDF (changement lecture-pdf-locale, 2026-11-19)."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import chaine_pdf_locale as c  # noqa: E402


def test_etapes_dans_l_ordre_et_toutes_locales():
    noms = [Path(e[0]).name for e in c.ETAPES]
    assert noms == ["extraction_locale.py", "verification.py", "qualifier_fiches.py", "import_to_firestore.py", "trier_file.py"]
    assert all("api" not in e for e in c.ETAPES)
    assert ["--moteur", "ollama"] == c.ETAPES[1][2:4] == c.ETAPES[2][2:4]


def test_demande_a_windows_de_rester_eveille(monkeypatch):
    appels = []
    monkeypatch.setattr(c, "_definir_etat", lambda drapeaux: appels.append(drapeaux))
    c.rester_eveille(True)
    c.rester_eveille(False)
    assert appels == [c.ES_CONTINUOUS | c.ES_SYSTEM_REQUIRED, c.ES_CONTINUOUS]
