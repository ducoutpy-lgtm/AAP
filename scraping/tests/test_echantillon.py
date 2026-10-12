"""Tests des fonctions pures de l'échantillon d'extraction (sans réseau, sans Ollama)."""
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
import echantillon  # noqa: E402


def test_choisir_rubriques_une_par_famille_la_plus_riche():
    resultats = {"a": {"id": "a", "categorie": "ars", "statut": "rubrique-trouvee", "nb_liens_aap": 5},
                 "b": {"id": "b", "categorie": "ars", "statut": "rubrique-trouvee", "nb_liens_aap": 9},
                 "c": {"id": "c", "categorie": "fondation", "statut": "aucune-rubrique", "nb_liens_aap": 0},
                 "d": {"id": "d", "categorie": "europe", "statut": "rubrique-trouvee", "nb_liens_aap": 1}}
    assert [r["id"] for r in echantillon.choisir_rubriques(resultats, ["ars", "fondation", "europe"])] == ["b", "d"]


def test_liens_a_lire_mieux_notes_sans_doublon():
    liens = [{"href": "u1", "score": 1}, {"href": "u2", "score": 4}, {"href": "u2", "score": 4}, {"href": "u3", "score": 2},
             {"href": "https://x.fr/cahier.PDF?v=1", "score": 9}]
    assert [l["href"] for l in echantillon.liens_a_lire(liens, maximum=2)] == ["u2", "u3"]


def test_nettoyer_texte_compacte_et_borne():
    assert echantillon.nettoyer_texte("  a  \n\n\n\n b \n") == "a\n\nb"
    assert len(echantillon.nettoyer_texte("x" * 100, maximum=10)) == 10


def test_valider_fiche_complete_url_et_financeur():
    brut = {"titre": "AAP test", "financeur": "", "description": "d", "eligibilite": [], "pieces_attendues": [],
            "categories_etablissement": [], "date_cloture": "2026-12-31"}
    fiche = echantillon.valider_fiche(brut, "https://x.fr/aap", "ARS Test")
    assert fiche.url_source == "https://x.fr/aap" and fiche.financeur == "ARS Test"


def test_valider_fiche_refuse_un_montant_texte():
    brut = {"titre": "AAP", "financeur": "F", "description": "d", "montant_max": "dix mille"}
    with pytest.raises(Exception):
        echantillon.valider_fiche(brut, "https://x.fr", "F")


def test_estimer_cout():
    e = echantillon.estimer_cout(caracteres=4_000_000, nb_fiches=1000)  # 1 M tokens d'entrée
    attendu = (3.0 + 1000 * 1662 / 1e6 * 15.0) * 0.95
    assert e["tokens_entree"] == 1_000_000 and e["euros"] == round(attendu, 2)


def test_rapport_compte_les_fiches_justes():
    sorties = {"ollama": [{"url_source": "https://a.fr/1", "scrape_metadata": {"source": "a", "duree_s": 12}},
                          {"url_source": "https://a.fr/2", "scrape_metadata": {"source": "a", "duree_s": 8}}]}
    controle = {"https://a.fr/1": {"ollama": {"titre": True, "financeur": True, "date_cloture": True, "montant": True}},
                "https://a.fr/2": {"ollama": {"titre": True, "financeur": False, "date_cloture": True, "montant": True}}}
    texte = echantillon.rapport(sorties, controle, None, [{"url": "https://a.fr/2", "raison": "liste"}])
    assert "| ollama | 2 | 2 | 1 | 20 s | 0 euro |" in texte
    assert "| a | [page](https://a.fr/2) | oui | oui non oui oui |" in texte
    assert "jugées hors sujet" in texte and ": 1." in texte
