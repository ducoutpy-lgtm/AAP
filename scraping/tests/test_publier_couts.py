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


# Changement lectures-publier-couts (décision 5b du 2026-11-27) : le script relisait toute la collection coutsIa à
# chaque veille (8 512 lectures le 26/11, quota gratuit de 50 000 par jour) ; une liste locale des lignes recopiées
# évite cette lecture.
import types  # noqa: E402

import pytest  # noqa: E402


class _Lot:
    def __init__(self, base):
        self.base = base

    def set(self, ref, doc):
        self.base.ecrits[ref] = doc

    def commit(self):
        pass


class _Collection:
    def __init__(self, base):
        self.base = base

    def where(self, *a, **k):
        self.base.lectures += 1
        return self

    def select(self, champs):
        return self

    def stream(self):
        return [types.SimpleNamespace(id=i) for i in self.base.presents]

    def document(self, ident):
        return ident


class _Base:
    def __init__(self, presents=()):
        self.presents, self.ecrits, self.lectures = set(presents), {}, 0

    def collection(self, nom):
        return _Collection(self)

    def batch(self):
        return _Lot(self)


def _lancer(monkeypatch, tmp_path, lignes, base, marque=None, options=()):
    journal = tmp_path / "extraction_costs.jsonl"
    journal.write_text("\n".join(lignes) + "\n", encoding="utf-8")
    liste = tmp_path / "couts_publies.txt"
    if marque is not None:
        liste.write_text("".join(i + "\n" for i in marque), encoding="utf-8")
    faux = types.ModuleType("firebase_admin")
    faux.initialize_app = lambda *a, **k: None
    faux.credentials = types.SimpleNamespace(Certificate=lambda chemin: chemin)
    faux.firestore = types.SimpleNamespace(client=lambda: base)
    monkeypatch.setitem(sys.modules, "firebase_admin", faux)
    monkeypatch.setitem(sys.modules, "firebase_admin.credentials", faux.credentials)
    monkeypatch.setitem(sys.modules, "firebase_admin.firestore", faux.firestore)
    monkeypatch.setattr(pc, "JOURNAL", journal)
    monkeypatch.setattr(pc, "LISTE_PUBLIES", liste)
    monkeypatch.setattr(sys, "argv", ["publier_couts.py", *options])
    assert pc.main() == 0
    return liste


def test_liste_presente_aucune_lecture_de_la_base(monkeypatch, tmp_path):
    base = _Base()
    liste = _lancer(monkeypatch, tmp_path, [LIGNE, ANCIENNE], base, marque=[pc.identifiant(LIGNE)])
    assert base.lectures == 0
    assert set(base.ecrits) == {pc.identifiant(ANCIENNE)}
    assert set(liste.read_text(encoding="utf-8").split()) == {pc.identifiant(LIGNE), pc.identifiant(ANCIENNE)}


@pytest.mark.parametrize("marque, options", [(None, ()), ([], ("--relire-base",))])
def test_premier_passage_ou_relecture_demandee(monkeypatch, tmp_path, marque, options):
    base = _Base(presents=[pc.identifiant(LIGNE)])
    liste = _lancer(monkeypatch, tmp_path, [LIGNE, ANCIENNE], base, marque=marque, options=options)
    assert base.lectures == 1
    assert set(base.ecrits) == {pc.identifiant(ANCIENNE)}
    assert set(liste.read_text(encoding="utf-8").split()) == {pc.identifiant(LIGNE), pc.identifiant(ANCIENNE)}


def test_essai_a_blanc_n_ecrit_rien(monkeypatch, tmp_path):
    base = _Base()
    liste = _lancer(monkeypatch, tmp_path, [LIGNE, ANCIENNE], base, marque=[pc.identifiant(LIGNE)], options=("--dry-run",))
    assert base.ecrits == {} and base.lectures == 0
    assert liste.read_text(encoding="utf-8").split() == [pc.identifiant(LIGNE)]
