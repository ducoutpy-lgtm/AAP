"""Appels publiés sans bloc de validation (changement securite-vues-messagerie, question 49 du 2026-11-26) : la règle de
lecture des listes exige validation.statut == 'validee' ; un appel saisi à la main avant la validation obligatoire du
2026-11-24 n'a pas de bloc et ne sortait plus des listes. Le script lui ajoute le bloc, à blanc par défaut ; Firestore
est remplacé par une doublure."""
import json
import sys
import types
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import valider_publiees_sans_bloc as vps  # noqa: E402


def test_seuls_les_appels_publies_ou_clotures_sans_bloc_sont_retenus():
    assert vps.a_valider({"status": "published"})
    assert vps.a_valider({"status": "closed", "validation": None})
    assert not vps.a_valider({"status": "published", "validation": {"statut": "proposee", "par": ""}})
    assert not vps.a_valider({"status": "published", "validation": {"statut": "validee", "par": "Monsieur DUCOUT"}})
    # Un bloc vide n'est pas visible (ni à l'écran ni par la règle) : ce n'est pas un appel « sans bloc »
    assert not vps.a_valider({"status": "published", "validation": {}})
    assert not vps.a_valider({"status": "draft"})
    assert not vps.a_valider({"status": "archived"})


def test_le_bloc_ajoute_suit_le_format_de_l_application():
    assert vps.bloc_validation("2026-11-26") == {
        "statut": "validee",
        "commentaire": "appel publié avant la validation obligatoire",
        "date": "2026-11-26",
        "par": "migration",
    }


class _FauxFirestore:
    """Doublure du client firebase_admin : la requête rend les documents, chaque écriture est notée dans l'ordre."""

    def __init__(self, documents, sauvegardes: Path):
        self.evenements: list = []
        self.statuts_lus: list = []
        self._docs = [types.SimpleNamespace(id=i, to_dict=lambda d=d: dict(d)) for i, d in documents]
        self._sauvegardes = sauvegardes

    def collection(self, nom):
        assert nom == "aap"
        faux = self

        class _Col:
            def where(self, champ, op, valeur):
                assert (champ, op) == ("status", "in")
                faux.statuts_lus = list(valeur)
                return types.SimpleNamespace(stream=lambda: iter(faux._docs))

            def document(self, i):
                return f"aap/{i}"

        return _Col()

    def batch(self):
        faux = self

        class _Lot:
            def update(self, ref, donnees):
                # La sauvegarde existe avant la première écriture
                faux.evenements.append(("update", ref, donnees, faux._sauvegardes.exists()))

            def commit(self):
                faux.evenements.append(("commit",))

        return _Lot()


def _lancer(tmp_path, monkeypatch, documents, *options):
    sauvegardes = tmp_path / "sauvegardes"
    faux = _FauxFirestore(documents, sauvegardes)
    module = types.SimpleNamespace(
        initialize_app=lambda *a: None,
        credentials=types.SimpleNamespace(Certificate=lambda k: k),
        firestore=types.SimpleNamespace(client=lambda: faux),
    )
    monkeypatch.setitem(sys.modules, "firebase_admin", module)
    cle = tmp_path / "cle.json"
    cle.write_text("{}", encoding="utf-8")
    monkeypatch.setattr(vps, "SAUVEGARDES", sauvegardes)
    monkeypatch.setattr(sys, "argv", ["valider_publiees_sans_bloc.py", "--key", str(cle), *options])
    return vps.main(), faux, sauvegardes


DOCUMENTS = [
    ("manuel-publie", {"status": "published", "title": "Saisi à la main", "financeurId": "f1", "source": "manual"}),
    ("manuel-clos", {"status": "closed", "title": "Clôturé", "financeurId": "f1", "validation": None}),
    ("propose", {"status": "published", "title": "Proposé", "validation": {"statut": "proposee", "par": ""}}),
    ("valide", {"status": "published", "title": "Validé", "validation": {"statut": "validee", "par": "x"}}),
]


def test_sans_option_le_script_n_ecrit_rien(tmp_path, monkeypatch, capsys):
    code, faux, sauvegardes = _lancer(tmp_path, monkeypatch, DOCUMENTS)
    assert code == 0
    assert faux.evenements == [] and not sauvegardes.exists()
    assert sorted(faux.statuts_lus) == ["closed", "published"]
    sortie = capsys.readouterr().out
    assert "sans bloc de validation : 2" in sortie
    assert "Essai a blanc" in sortie


def test_avec_reel_sauvegarde_puis_ajoute_le_bloc_aux_seuls_appels_sans_bloc(tmp_path, monkeypatch):
    code, faux, sauvegardes = _lancer(tmp_path, monkeypatch, DOCUMENTS, "--reel")
    assert code == 0
    ecritures = [e for e in faux.evenements if e[0] == "update"]
    assert [e[1] for e in ecritures] == ["aap/manuel-publie", "aap/manuel-clos"]
    assert all(e[3] for e in ecritures), "la sauvegarde doit précéder toute écriture"
    for _, _, donnees, _ in ecritures:
        assert set(donnees) == {"validation"}
        assert donnees["validation"]["statut"] == "validee" and donnees["validation"]["par"] == "migration"
    assert faux.evenements[-1] == ("commit",)
    (fichier,) = sauvegardes.iterdir()
    sauvegarde = json.loads(fichier.read_text(encoding="utf-8"))
    assert [s["id"] for s in sauvegarde] == ["manuel-publie", "manuel-clos"]
    assert all(s["validation"] is None for s in sauvegarde)


def test_avec_reel_et_rien_a_migrer_ni_sauvegarde_ni_ecriture(tmp_path, monkeypatch):
    code, faux, sauvegardes = _lancer(tmp_path, monkeypatch, DOCUMENTS[2:], "--reel")
    assert code == 0
    assert faux.evenements == [] and not sauvegardes.exists()
