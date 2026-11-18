"""Tests du tri automatique de la file « à valider » (changement tri-automatique-file, 2026-11-18)."""
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import trier_file as t  # noqa: E402

MAINTENANT = datetime(2026, 11, 18, tzinfo=timezone.utc)


def fiche(**kw):
    base = {"status": "draft", "validation": {"statut": "proposee", "par": "claude-haiku-5-5"},
            "deadline": MAINTENANT + timedelta(days=30),
            "scrapeMetadata": {"champ": "sante", "verification": {"estUnAppel": True, "douteux": ["description"]}}}
    base.update(kw)
    return base


def test_fiche_sure_sans_motif():
    assert t.motifs_de_doute(fiche(), MAINTENANT) == []
    assert t.motifs_de_doute(fiche(deadline=None), MAINTENANT) == []  # sans date : publiée avec la mention habituelle


def test_motifs_de_doute():
    sm = lambda **k: {"champ": "sante", "verification": {"estUnAppel": True, "douteux": []}, **k}  # noqa: E731
    assert t.motifs_de_doute(fiche(scrapeMetadata={"champ": "sante"}), MAINTENANT) == ["jamais contrôlée"]
    assert t.motifs_de_doute(fiche(scrapeMetadata=sm(verification={"estUnAppel": False, "douteux": []})), MAINTENANT) == ["pas un appel selon le contrôle"]
    assert t.motifs_de_doute(fiche(scrapeMetadata=sm(verification={"estUnAppel": True, "douteux": ["date_cloture", "description"]})), MAINTENANT) == ["doute du contrôle : date_cloture"]
    assert t.motifs_de_doute(fiche(scrapeMetadata=sm(champ="incertain")), MAINTENANT) == ["champ incertain"]
    assert t.motifs_de_doute(fiche(scrapeMetadata=sm(champ="hors-champ")), MAINTENANT) == ["hors champ"]
    assert t.motifs_de_doute(fiche(deadline=MAINTENANT - timedelta(days=1)), MAINTENANT) == ["appel clos"]


def test_decisions_doublons_puis_tri():
    file = [("garde", fiche()), ("double", fiche()), ("douteuse", fiche(scrapeMetadata={"champ": "incertain"})),
            ("relue", fiche(validation={"statut": "proposee", "par": "Monsieur DUCOUT"}))]
    groupes = [[file[0], file[1]]]
    d = t.decisions(file, groupes, lambda g: ("garde", "source officielle"), MAINTENANT)
    assert d["double"] == ("rejeter", "doublon de garde (source officielle)")
    assert d["garde"] == ("publier", "")
    assert d["douteuse"][0] == "laisser" and "champ incertain" in d["douteuse"][1]
    assert "relue" not in d
