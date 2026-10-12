"""Tests des fonctions pures du robot de découverte (sans réseau)."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
import decouverte  # noqa: E402

BASE = "https://www.bretagne.ars.sante.fr/"


def test_score_lien():
    assert decouverte.score_lien("Appels à projets et à candidatures", "https://x.fr/liste-appels-projet-candidature") >= 3
    assert decouverte.score_lien("Nos actualités", "https://x.fr/actualites") == 0
    assert decouverte.score_lien("AMI 2026", "https://x.fr/page") >= 2
    assert decouverte.score_lien("Appel à communication congrès", "https://x.fr/congres") == 0  # exclu


def test_liens_aap_filtre_et_dedoublonne():
    liens = [{"texte": "Appel à projets EHPAD 2026", "href": "https://www.bretagne.ars.sante.fr/aap-ehpad"},
             {"texte": "Appel à projets EHPAD 2026", "href": "https://www.bretagne.ars.sante.fr/aap-ehpad"},
             {"texte": "Appel à projets ailleurs", "href": "https://autre-site.fr/aap"},
             {"texte": "Contact", "href": "https://www.bretagne.ars.sante.fr/contact"}]
    trouves = decouverte.liens_aap(liens, BASE)
    assert [l["href"] for l in trouves] == ["https://www.bretagne.ars.sante.fr/aap-ehpad"]


def test_candidats_les_mieux_notes_du_meme_site():
    liens = [{"texte": "Subventions", "href": "https://www.bretagne.ars.sante.fr/subventions"},
             {"texte": "Appels à projets", "href": "https://www.bretagne.ars.sante.fr/appels-a-projets"},
             {"texte": "Appels à projets", "href": "https://autre.fr/appels-a-projets"},
             {"texte": "Règlement", "href": "https://www.bretagne.ars.sante.fr/reglement.pdf"}]
    assert decouverte.candidats(liens, BASE) == ["https://www.bretagne.ars.sante.fr/appels-a-projets"]


def test_choisir_rubrique_prend_la_page_la_plus_riche():
    accueil = [{"texte": "Appel à projets A", "href": BASE + "a"}]
    rubrique = [{"texte": f"Appel à projets {i}", "href": BASE + f"aap-{i}"} for i in range(5)]
    url, trouves = decouverte.choisir_rubrique([(BASE, accueil, accueil), (BASE + "appels-a-projets", rubrique, rubrique)], BASE)
    assert url == BASE + "appels-a-projets" and len(trouves) == 5


def test_choisir_rubrique_exige_deux_liens():
    liens = [{"texte": "Appel à projets A", "href": BASE + "a"}]
    assert decouverte.choisir_rubrique([(BASE, liens, liens)], BASE) == (None, [])


def test_page_de_liste_compte_les_liens_du_contenu():
    """Sur /liste-appels-projet-candidature, les titres d'AAP ne contiennent pas le mot « appel »."""
    url = BASE + "liste-appels-projet-candidature"
    contenu = [{"texte": "Création de 15 lits halte soins santé en Finistère", "href": BASE + "creation-lhss"},
               {"texte": "Équipes mobiles d'hygiène en EHPAD", "href": BASE + "emh-ehpad"},
               {"texte": "Accueil", "href": BASE}]
    menus = contenu + [{"texte": "Nous contacter", "href": BASE + "contact"}]
    choisie, trouves = decouverte.choisir_rubrique([(url, menus, contenu)], BASE)
    assert choisie == url and [l["href"] for l in trouves] == [BASE + "creation-lhss", BASE + "emh-ehpad"]


def test_sans_navigation():
    tous = [{"texte": "Aller au contenu", "href": BASE + "#main"}, {"texte": "Nous contacter", "href": BASE + "contact"},
            {"texte": "Création de 15 lits halte soins santé", "href": BASE + "lhss"}]
    navigation = [{"texte": "Nous contacter", "href": BASE + "contact"}]
    assert [l["href"] for l in decouverte.sans_navigation(tous, navigation)] == [BASE + "lhss"]


def test_rapport_decompte():
    resultats = {"a": {"id": "a", "nom": "A", "categorie": "ars", "statut": "rubrique-trouvee", "url_rubrique": "https://a.fr/aap", "nb_liens_aap": 4, "erreur": None},
                 "b": {"id": "b", "nom": "B", "categorie": "ars", "statut": "bloque", "url_rubrique": None, "nb_liens_aap": 0, "erreur": "HTTP 403"}}
    texte = decouverte.rapport(resultats, [{"id": "a", "nom": "A", "categorie": "ars"}, {"id": "b", "nom": "B", "categorie": "ars"}, {"id": "c", "nom": "C", "categorie": "ars"}])
    assert "2 sources traitées sur 3 : 1 rubrique trouvée, 1 bloqué ; 4 liens d'AAP collectés" in texte
    assert "| ars | 2 | 1 | 0 | 1 | 0 | 4 |" in texte
