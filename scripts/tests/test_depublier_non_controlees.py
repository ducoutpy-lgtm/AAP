"""Question 43 (décision « Les garder, bloqués » du 2026-11-24) : depublier_non_controlees.py, déjà joué le 2026-10-20
(sauvegarde depublication_2026-10-20_1101.json), écrivait en base dès son lancement ; il n'écrit plus sans --reel."""
import sys
import types
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import depublier_non_controlees as dep  # noqa: E402


def test_sans_option_le_script_n_ecrit_rien(tmp_path, monkeypatch):
    ecritures = []
    fiche = types.SimpleNamespace(id="f1", to_dict=lambda: {"status": "published", "title": "T",
                                                            "validation": {"statut": "proposee", "par": ""}})
    requete = types.SimpleNamespace(stream=lambda: iter([fiche]))
    collection = types.SimpleNamespace(where=lambda *a: requete, document=lambda i: ecritures.append(i))
    client = types.SimpleNamespace(collection=lambda nom: collection, batch=lambda: ecritures.append("lot"))
    faux = types.SimpleNamespace(initialize_app=lambda *a: None, credentials=types.SimpleNamespace(Certificate=lambda k: k),
                                 firestore=types.SimpleNamespace(client=lambda: client))
    monkeypatch.setitem(sys.modules, "firebase_admin", faux)
    cle = tmp_path / "cle.json"
    cle.write_text("{}", encoding="utf-8")
    monkeypatch.setattr(dep, "SAUVEGARDES", tmp_path / "sauvegardes")
    monkeypatch.setattr(sys, "argv", ["depublier_non_controlees.py", "--key", str(cle)])
    assert dep.main() == 0
    assert ecritures == [] and not (tmp_path / "sauvegardes").exists()
