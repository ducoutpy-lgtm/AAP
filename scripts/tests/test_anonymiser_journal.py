"""Test du retrait de l'identifiant dans le journal (changement suppression-compte, 2026-11-19)."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import anonymiser_journal as a  # noqa: E402


def test_seules_les_lignes_d_un_compte_disparu_sont_anonymisees():
    lignes = [("l1", {"userId": "existe"}), ("l2", {"userId": "supprime"}), ("l3", {"userId": a.ANONYME}), ("l4", {})]
    assert a.lignes_a_anonymiser(lignes, {"existe"}) == ["l2"]
