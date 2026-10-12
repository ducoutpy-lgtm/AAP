"""Tests des fonctions pures de la qualification (sans Ollama)."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
import qualification  # noqa: E402


def test_texte_sans_balises_retire_navigation_et_scripts():
    page = ("<html><head><style>a{}</style><script>var x=1;</script></head><body><nav><a href='/'>Menu</a></nav>"
            "<main><h1>Appels &agrave; projets</h1><p>AAP   2026</p><ul><li>Un</li><li>Deux</li></ul></main>"
            "<footer>Contact</footer></body></html>")
    assert qualification.texte_sans_balises(page) == "Appels à projets\nAAP 2026\nUn\nDeux"
    assert len(qualification.texte_sans_balises("<p>" + "x" * 100 + "</p>", maximum=10)) == 10


def test_calculer_verdict():
    base = {"liste_aap": True, "nb_aap": 3, "forme": "html", "sante_medico_social": True}
    assert qualification.calculer_verdict(base) == "rubrique-confirmee"
    assert qualification.calculer_verdict({**base, "forme": "pdf"}) == "pdf-seulement"
    assert qualification.calculer_verdict({**base, "sante_medico_social": False}) == "hors-sante"
    assert qualification.calculer_verdict({**base, "liste_aap": False}, nb_liens_notes=2) == "pas-d-aap"
    assert qualification.calculer_verdict({**base, "liste_aap": False}, nb_liens_notes=50) == "a-verifier"


def test_appliquer_registre():
    sources = [{"id": "a", "nom": "A"}, {"id": "b", "nom": "B"}]
    q = {"a": {"verdict": "rubrique-confirmee", "date": "2026-10-12", "justification": "liste de 5 AAP"}}
    assert qualification.appliquer_registre(sources, q, "2026-10-13") == 1
    assert sources[0]["qualification"]["verdict"] == "rubrique-confirmee"
    assert sources[1]["qualification"] == {"verdict": "a-verifier", "date": "2026-10-13", "justification": "pas de page gardée par la découverte"}


def test_rapport_decompte_et_sondage():
    sources = [{"id": "a", "nom": "A", "categorie": "ars"}, {"id": "b", "nom": "B", "categorie": "ars"}, {"id": "c", "nom": "C", "categorie": "ars"}]
    q = {"a": {"verdict": "rubrique-confirmee", "url": "https://a.fr", "nb_aap": 4, "forme": "html", "date": "2026-10-12"},
         "b": {"verdict": "pas-d-aap", "url": "https://b.fr", "nb_aap": 0, "forme": "html", "date": "2026-10-12"}}
    sondage = {"a": {"accord": True}, "b": {"accord": False, "verdict_relu": "rubrique-confirmee"}}
    texte = qualification.rapport(q, sources, sondage, "2026-10-12")
    assert "2 sources qualifiées sur 3 : 1 rubrique confirmée, 0 PDF seulement, 0 hors santé, 1 pas d'AAP, 0 à vérifier ; 1 sources sans page gardée" in texte
    assert "2 verdicts relus sur la page d'origine : 1 accords, 1 désaccords (50 % d'accord)" in texte
    assert "| ars | 2 | 1 | 0 | 0 | 1 | 0 | 1 |" in texte
    assert "| A | ars | html | 4 | [page](https://a.fr) |" in texte
