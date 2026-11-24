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



def test_extraction_de_nuit_bornee():
    """corrections-chaine-du-lundi 1.5 (2026-11-22) : la tâche de nuit est coupée à 12 h ; au plus 60 PDF par nuit
    (environ 5 h au rythme mesuré de 12 PDF par heure), pour que contrôle, qualification et import passent chaque nuit."""
    extraction = c.ETAPES[0]
    assert extraction[extraction.index("--limite") + 1] == str(c.PDF_PAR_NUIT) == "60"



def test_les_etapes_de_nuit_ecrivent_sans_tampon(monkeypatch):
    """corrections-chaine-du-lundi 1.9 (2026-11-22) : sortie des étapes écrite au journal au fil de l'eau (-u)."""
    lances = []
    monkeypatch.setattr(c, "_definir_etat", lambda drapeaux: None)
    import types
    # La chaîne lit le code de retour depuis le lot 2.4 du plan niveau A
    monkeypatch.setattr(c.subprocess, "run", lambda args, **kw: lances.append(args) or types.SimpleNamespace(returncode=0))
    c.main()
    assert len(lances) == len(c.ETAPES) and all("-u" in a for a in lances)


def test_la_chaine_rend_compte_de_sa_fin_et_de_ses_echecs(monkeypatch, capsys):
    """Plan niveau A, lot 2.4 (2026-11-24) : les codes de retour étaient ignorés et le journal ne disait jamais si la
    chaîne avait fini. Une étape en échec n'arrête pas les suivantes (le contrôle et l'import traitent ce qui a été
    extrait), mais la chaîne le dit et rend un code d'erreur."""
    import types
    monkeypatch.setattr(c, "_definir_etat", lambda drapeaux: None)
    codes = iter([1, 0, 0, 0, 0])
    monkeypatch.setattr(c.subprocess, "run", lambda args, **kw: types.SimpleNamespace(returncode=next(codes)))
    assert c.main() == 1
    sortie = capsys.readouterr().out
    assert "terminée" in sortie and "extraction_locale.py (code 1)" in sortie
    codes = iter([0] * 5)
    monkeypatch.setattr(c.subprocess, "run", lambda args, **kw: types.SimpleNamespace(returncode=next(codes)))
    assert c.main() == 0 and "5 étapes réussies" in capsys.readouterr().out
