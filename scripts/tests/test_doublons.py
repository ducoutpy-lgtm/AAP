"""Tests des règles de doublon (scripts/doublons.py), sans réseau ni Firestore."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import doublons as d  # noqa: E402


def test_meme_titre_meme_financeur_mais_deux_editions_datees():
    """corrections-chaine-du-lundi 1.7 (2026-11-22) : même titre sans année et même financeur, mais deux clôtures
    connues et différentes : deux éditions, pas un doublon (la nouvelle, ouverte, était rejetée au profit de l'ancienne)."""
    from datetime import datetime, timezone
    ancienne = {"title": "Appel à projets Bien vieillir à domicile", "financeurName": "CFPPA du Nord",
                "deadline": datetime(2025, 12, 31, tzinfo=timezone.utc)}
    nouvelle = {**ancienne, "deadline": datetime(2026, 12, 31, tzinfo=timezone.utc)}
    assert not d.meme_appel(ancienne, nouvelle)
    assert d.meme_appel(ancienne, {**ancienne})  # même date : toujours un doublon
    assert d.meme_appel(ancienne, {**ancienne, "deadline": None})  # une seule datée : comme avant
