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


def test_page_validee_retenue_des_un_lien():
    """Changement pages-a-un-seul-appel : une page validée à la main (url_validee) n'exige qu'un lien d'appel."""
    liens = [{"texte": "Ouverture de l'appel à innovations 2026", "href": BASE + "appel-candidatures-2026/"}]
    assert decouverte.reglages({"url_validee": BASE}) == {"seuil": 1, "page_appel": False, "hors_site": False}
    assert decouverte.reglages({}) == {"seuil": 2, "page_appel": False, "hors_site": False}
    url, trouves = decouverte.retenir([(BASE, liens, liens)], BASE, seuil=1)
    assert url == BASE and [l["href"] for l in trouves] == [BASE + "appel-candidatures-2026/"]
    assert decouverte.retenir([(BASE, liens, liens)], BASE) == (None, [])


def test_page_qui_est_elle_meme_l_appel():
    """page_appel : la page devient son propre lien, titre de la page pour texte, même sans aucun lien d'appel."""
    url = BASE + "appel-%C3%A0-projet-tubbe"
    liens = [{"texte": "Je candidate", "href": "https://fr.surveymonkey.com/r/7LMR8RW"}]
    choisie, trouves = decouverte.retenir([(url, liens, liens)], BASE, seuil=1, page_appel=True, titre="  Appel à projet Tubbe ")
    assert choisie == url and trouves == [{"texte": "Appel à projet Tubbe", "href": url, "score": 3}]


def test_relais_garde_les_liens_vers_les_financeurs():
    """Changement familles-relais-regionaux : un relais (relais: true) garde les liens d'appel vers d'autres sites,
    sur une page ordinaire comme sur une page dont l'adresse est une rubrique d'appels ; une source ordinaire non."""
    externe = {"texte": "https://fondationdomicile.fr/les-trophees/appel-a-projets-2026/",
               "href": "https://fondationdomicile.fr/les-trophees/appel-a-projets-2026/"}
    interne = {"texte": "Appel à projets transition alimentaire en EHPAD", "href": BASE + "ami-alimentation"}
    liens = [externe, interne]
    assert decouverte.reglages({"url_validee": BASE, "relais": True})["hors_site"] is True
    _, ordinaire = decouverte.retenir([(BASE + "actualites", liens, liens)], BASE, seuil=1)
    assert [l["href"] for l in ordinaire] == [interne["href"]]
    _, relais = decouverte.retenir([(BASE + "actualites", liens, liens)], BASE, seuil=1, hors_site=True)
    assert [l["href"] for l in relais] == [externe["href"], interne["href"]]
    liste = BASE + "appels-a-projets/"
    _, relais_liste = decouverte.retenir([(liste, liens, liens)], BASE, seuil=1, hors_site=True)
    assert externe["href"] in [l["href"] for l in relais_liste]


def test_page_validee_sans_appel_gardee_pour_la_veille():
    """Une page validée sans lien d'appel ce jour-là (Turenne) garde un liens.json vide ; un fichier existant est gardé."""
    reglage = {"seuil": 1, "page_appel": False}
    assert decouverte.fichier_de_liens(None, [], BASE, reglage) == {"url": BASE, "liens": [], "seuil": 1, "page_appel": False}
    assert decouverte.fichier_de_liens(None, [], BASE, {"seuil": 2, "page_appel": False}) is None
    existant = {"url": BASE + "aap", "liens": [{"href": BASE + "a"}]}
    assert decouverte.fichier_de_liens(None, [], BASE, reglage, existant) == {**existant, **reglage}
    trouves = [{"href": BASE + "b"}]
    assert decouverte.fichier_de_liens(BASE + "aap", trouves, BASE, reglage, existant) == {"url": BASE + "aap", "liens": trouves, **reglage}


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


def test_extraire_liens_lit_le_shadow_dom():
    """Changement decouverte-shadow-dom (2026-10-21) : les sites Salesforce (ANAP) placent leurs liens dans un shadow
    DOM ; la lecture doit les voir comme les liens ordinaires. Page locale, sans réseau."""
    import asyncio

    html = """<html><body><a href="/ordinaire">Appel à projets ordinaire</a><div id="hote"></div>
    <script>const r = document.getElementById('hote').attachShadow({mode: 'open'});
    r.innerHTML = '<a href="/s/article/appel-a-projets-achats-innovants">Appel à projets : Achats innovants</a>';</script>
    </body></html>"""

    async def lire():
        from playwright.async_api import async_playwright
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            page = await browser.new_page()
            # La page est servie sous une vraie adresse (pas set_content) pour que les liens relatifs se resolvent
            await page.route("https://exemple.test/**", lambda route: route.fulfill(status=200, content_type="text/html; charset=utf-8", body=html))
            await page.goto("https://exemple.test/accueil")
            try:
                return await decouverte.extraire_liens(page)
            finally:
                await browser.close()

    liens = asyncio.run(lire())
    hrefs = [l["href"] for l in liens]
    assert "https://exemple.test/ordinaire" in hrefs
    assert "https://exemple.test/s/article/appel-a-projets-achats-innovants" in hrefs
    assert any(l["texte"].startswith("Appel à projets : Achats innovants") for l in liens)


def test_score_lien_anglais_et_adresses():
    """Changement decouverte-mots-cles (2026-10-21) : libellés anglais, codes européens, adresses /appel/ et /call/."""
    assert decouverte.score_lien("Call for proposals: EU4Health 2026", "https://hadea.ec.europa.eu/calls-proposals/eu4h-2026") >= 3
    assert decouverte.score_lien("HORIZON-HLTH-2027-01-CARE-02", "https://www.horizon-europe.gouv.fr/personalised-approaches") >= 3
    assert decouverte.score_lien("Lire la suite", "https://www.appelsprojetsrecherche.fr/appel/1-anr-2002") >= 3
    assert decouverte.score_lien("Lire la suite", "https://anr.fr/fr/detail/call/aapg-2027/") >= 3
    assert decouverte.score_lien("Appel à communication congrès", "https://x.fr/appel-a-communication") == 0
    assert decouverte.score_lien("Nos actualités", "https://x.fr/actualites") == 0


def test_extraire_liens_respecte_la_balise_base():
    """FIRAH (2026-10-21) : <base href="/"> et liens relatifs « fr/appel-...html » ; resolus depuis l'adresse de la page,
    ils donnaient /fr/fr/... (404). Le navigateur, lui, suit la balise base : l'outil doit faire pareil."""
    import asyncio

    html = """<html><head><base href="/"></head><body><a href="fr/appel-a-projets-general-2026.html">Appel à projets général 2026</a></body></html>"""

    async def lire():
        from playwright.async_api import async_playwright
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            page = await browser.new_page()
            await page.route("https://exemple.test/**", lambda route: route.fulfill(status=200, content_type="text/html; charset=utf-8", body=html))
            await page.goto("https://exemple.test/fr/deposer-un-projet.html")
            try:
                return await decouverte.extraire_liens(page)
            finally:
                await browser.close()

    assert [l["href"] for l in asyncio.run(lire())] == ["https://exemple.test/fr/appel-a-projets-general-2026.html"]
