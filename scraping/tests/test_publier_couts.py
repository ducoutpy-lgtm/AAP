"""Tests de la conversion du journal des couts vers coutsIa (changement suivi-couts-externes, tache 6.1)."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "scripts"))
import publier_couts as pc  # noqa: E402

LIGNE = ('{"timestamp": "2026-10-20T18:05:12.123456", "source": "ars_idf", "url": "https://x/y", '
         '"model": "claude-haiku-5-5", "etape": "qualification", "input_tokens": 1200, "output_tokens": 80, '
         '"cache_creation_tokens": 0, "cache_read_tokens": 900, "cost_usd": 0.0003, "cost_eur_approx": 0.000276}')
ANCIENNE = '{"timestamp": "2026-04-21T10:00:00", "source": "cnsa", "url": "u", "model": "claude-sonnet-4-6", "input_tokens": 10, "output_tokens": 5, "cost_usd": 0.01}'


def test_document_complet():
    d = pc.document(LIGNE)
    assert d["source"] == "collecte" and d["etape"] == "qualification" and d["modele"] == "claude-haiku-5-5"
    assert d["origine"] == "ars_idf" and d["cible"] == "https://x/y"
    assert (d["tokensEntree"], d["tokensSortie"], d["tokensCacheLus"]) == (1200, 80, 900)
    assert abs(d["coutEuros"] - 0.000276) < 1e-9
    assert d["le"].year == 2026 and d["le"].month == 10


def test_ancienne_ligne_sonnet_sans_etape():
    d = pc.document(ANCIENNE)
    assert d["etape"] == "extraction"
    assert abs(d["coutEuros"] - 0.0092) < 1e-9  # cost_usd * 0,92


def test_identifiant_stable_et_lignes_vides():
    assert pc.identifiant(LIGNE) == pc.identifiant(LIGNE + "\n")
    assert pc.identifiant(LIGNE) != pc.identifiant(ANCIENNE)
    assert pc.document("") is None and pc.document("pas du json") is None
