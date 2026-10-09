"""Tests du registre des sources (spec registre-sources), sans réseau."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
import registre  # noqa: E402


def source(**modifs):
    base = {"id": "ars-test", "nom": "ARS Test", "categorie": "ars", "url_aap": "https://exemple.fr/aap",
            "perimetre": "sante-et-medico-social", "statut": "identifiee", "connecteur": "", "notes": "",
            "derniere_verification": "", "code_http": ""}
    return {**base, **modifs}


def test_registre_valide():
    assert registre.erreurs_format([source(), source(id="cnsa", nom="CNSA", categorie="caisse-nationale")]) == []


def test_source_incomplete_refusee():
    erreurs = registre.erreurs_format([source(url_aap=""), source(id="x", categorie="inconnue")])
    assert any("url_aap" in e for e in erreurs)
    assert any("catégorie inconnue" in e for e in erreurs)


def test_identifiant_en_double():
    assert any("double" in e for e in registre.erreurs_format([source(), source()]))


def test_verification_pages_change_le_statut():
    sources = [source(), source(id="b", nom="B", url_aap="https://exemple.fr/403", statut="operationnelle")]
    codes = {"https://exemple.fr/aap": 200, "https://exemple.fr/403": 403}
    en_erreur = registre.verifier_pages(sources, "2026-10-09", pause=0, sonde=lambda url: codes[url])
    assert sources[0]["statut"] == "page-verifiee" and sources[0]["code_http"] == 200
    assert sources[1]["statut"] == "operationnelle"  # une erreur ne retrograde jamais un statut
    assert [s["id"] for s in en_erreur] == ["b"]


def test_tableau_avec_decompte():
    sources = [source(statut="operationnelle", connecteur="ars_test"), source(id="f", nom="Fondation X", categorie="fondation")]
    texte = registre.tableau(sources, "2026-10-09")
    assert "2 sources : 1 opérationnelle, 1 identifiée" in texte
    assert "## ARS régionales (1)" in texte and "## Fondations et fonds privés (1)" in texte
    assert "[page](https://exemple.fr/aap)" in texte


def test_registre_du_projet_est_valide():
    assert registre.erreurs_format(registre.charger()) == []
