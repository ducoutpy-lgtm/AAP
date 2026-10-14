"""Recherche web sans clé, pour trouver le site ou la page des appels d'un organisme.

Pourquoi : les annuaires (RNF) ne donnent pas les sites web, et la découverte ne trouve pas toujours la page des
appels ; Monsieur DUCOUT la trouve en quelques secondes par une recherche web. Moteur : la version HTML de
DuckDuckGo, gratuite et sans compte. Son usage automatique n'est pas garanti : une requête toutes les dix secondes,
et en cas de refus (code 403, 429, page de défi) l'appelant doit s'arrêter et le dire, pas insister.

Les annuaires et réseaux sociaux sont écartés des résultats : on cherche le site de l'organisme lui-même.
"""
from __future__ import annotations

import html
import re
import time
from urllib.parse import parse_qs, unquote, urlparse

import requests

MOTEUR = "https://html.duckduckgo.com/html/"
ENTETES = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130 Safari/537.36",
           "Accept-Language": "fr-FR,fr;q=0.9"}
PAUSE = 10.0  # secondes entre deux requêtes
DOMAINES_ECARTES = ("duckduckgo.com", "societe.com", "pappers.fr", "infogreffe.fr", "annuaire-entreprises", "linkedin.com",
                    "facebook.com", "instagram.com", "twitter.com", "x.com", "youtube.com", "wikipedia.org", "data.gouv.fr",
                    "journal-officiel.gouv.fr", "legifrance.gouv.fr", "centre-francais-fondations.org", "fondationdefrance.org",
                    "helloasso.com", "carenews.com", "admical.org", "verif.com", "manageo.fr", "kompass.com", "bodacc.fr",
                    "dirigeant.societe.com", "lefigaro.fr", "lemonde.fr", "ouest-france.fr", "pagesjaunes.fr", "google.com")


class RefusMoteur(RuntimeError):
    """Le moteur refuse ou défie la requête : s'arrêter et le signaler."""


def _cles_tavily() -> list[str]:
    """Clés TAVILY_API_KEY, TAVILY_API_KEY_2... lues dans l'environnement puis dans scraping/.env (python-dotenv absent)."""
    import os
    from pathlib import Path
    valeurs = {}
    env = Path(__file__).resolve().parent / ".env"
    if env.is_file():
        for ligne in env.read_text(encoding="utf-8").splitlines():
            if ligne.strip().startswith("TAVILY_API_KEY") and "=" in ligne:
                nom, val = ligne.split("=", 1)
                valeurs[nom.strip()] = val.strip().strip('"').strip("'")
    for nom in ("TAVILY_API_KEY", "TAVILY_API_KEY_2", "TAVILY_API_KEY_3"):
        valeurs[nom] = os.environ.get(nom) or valeurs.get(nom, "")
    return [v for v in (valeurs.get(n) for n in ("TAVILY_API_KEY", "TAVILY_API_KEY_2", "TAVILY_API_KEY_3")) if v]


def chercher_tavily(requete: str, nombre: int = 8) -> list[dict]:
    """Recherche par l'API Tavily (clé TAVILY_API_KEY dans scraping/.env ; 1 000 crédits par mois sans carte au 2026-10-13).

    Pourquoi Tavily : le moteur gratuit sans clé refuse les requêtes automatiques, l'API Google est fermée aux nouveaux
    clients, Brave exige une carte bancaire. Une recherche simple coûte un crédit. Format de réponse à confirmer à la
    première utilisation (documentation Tavily, point d'accès /search).
    """
    import os
    from pathlib import Path
    cles = _cles_tavily()
    if not cles:
        raise RefusMoteur("TAVILY_API_KEY absente de scraping/.env")
    for i, cle in enumerate(cles):
        reponse = requests.post("https://api.tavily.com/search", json={"query": requete, "max_results": nombre, "search_depth": "basic"},
                                headers={"Authorization": f"Bearer {cle}", "Content-Type": "application/json"}, timeout=30)
        if reponse.status_code == 432 and i + 1 < len(cles):  # limite du plan atteinte : clé suivante
            continue
        if reponse.status_code in (401, 403, 429, 432, 433):
            raise RefusMoteur(f"code {reponse.status_code} : {reponse.text[:200]}")
        reponse.raise_for_status()
        break
    return [{"url": r.get("url", ""), "titre": r.get("title", "")} for r in reponse.json().get("results", []) if r.get("url", "").startswith("http")]


def _resultats(page: str) -> list[dict]:
    """Liens et titres des résultats de la page HTML du moteur (les liens passent par une redirection /l/?uddg=)."""
    resultats = []
    for m in re.finditer(r'<a[^>]+class="result__a"[^>]+href="([^"]+)"[^>]*>(.*?)</a>', page, flags=re.S):
        href, titre = m.group(1), re.sub(r"<[^>]+>", "", m.group(2))
        if "uddg=" in href:
            href = unquote(parse_qs(urlparse(html.unescape(href)).query).get("uddg", [""])[0])
        if href.startswith("http"):
            resultats.append({"url": href, "titre": html.unescape(titre).strip()})
    return resultats


def chercher(requete: str, pause: float = PAUSE) -> list[dict]:
    """Résultats du moteur pour une requête ; attend `pause` secondes avant la requête (respect du moteur)."""
    time.sleep(pause)
    reponse = requests.post(MOTEUR, data={"q": requete, "kl": "fr-fr"}, headers=ENTETES, timeout=30)
    if reponse.status_code in (403, 429) or "anomaly" in reponse.text[:3000].lower() or "challenge" in reponse.text[:3000].lower():
        raise RefusMoteur(f"code {reponse.status_code}")
    reponse.raise_for_status()
    return _resultats(reponse.text)


DOMAINES_ECARTES = DOMAINES_ECARTES + ("tousbenevoles.org", "inclusion.gouv.fr", "fisaf.asso.fr", "francetravail.fr", "bonobos.org", "img.banquepopulaire.fr", "banquepopulaire.fr", "indeed.com", "hellowork.com",
                                       "fundraiso.com", "fundit.fr", "motherbase.ai", "hellodarwin.com", "annuaire-entreprises", "api.gouv.fr",
                                       "sante.fr", "etablissementsdesante.fr", "capretraite.fr", "santeenfrance.fr", "openagenda.com", "pappers",
                                       "aef.info", "carenews", "lejournaldesentreprises.com", "service-public.fr", "gouv.fr")


GENERIQUES = {"fondation", "entreprise", "pour", "fonds", "groupe", "france", "francaise", "francais", "recherche", "sante", "sociale",
             "social", "plus", "paris", "cite", "internationale", "universitaire", "universite", "ecole", "centre", "institut",
             "association", "foundation", "union", "service", "services", "maison", "hopital", "hospitalier", "fondations",
             "nationale", "national", "regionale", "regional", "action", "aide", "enfance", "famille", "handicap", "autonomie",
             "solidarite", "medicale", "medical", "recherche", "sciences", "science", "avenir", "espoir", "vie", "soins", "soin",
             # mots géographiques : un domaine régional (ex. auvergne-rhone-alpes.ambition-ess.org) n'est pas le site d'une fondation
             "alpes", "rhone", "auvergne", "loire", "provence", "bretagne", "normandie", "aquitaine", "occitanie", "lorraine",
             "alsace", "picardie", "champagne", "bourgogne", "savoie", "pyrenees", "corse", "nord", "ouest", "ile", "lyon",
             "marseille", "lille", "toulouse", "nantes", "bordeaux", "strasbourg", "montpellier", "rennes", "grenoble", "bonobo",
             "manche", "mediterranee", "atlantique", "europe", "centre", "touraine", "poitou", "anjou", "vendee", "gascogne",
             "languedoc", "roussillon", "limousin", "berry", "beauce", "sologne", "ardennes", "flandre", "artois", "franche",
             "comte", "jura", "vosges", "ariege", "aveyron", "cantal", "correze", "creuse", "dordogne", "gironde", "landes",
             "herault", "isere", "drome", "ardeche", "allier", "nievre", "yonne", "aube", "marne", "meuse", "moselle",
             "somme", "oise", "aisne", "eure", "orne", "sarthe", "mayenne", "morbihan", "finistere", "cotes", "armor",
             "charente", "maritime", "sevres", "vienne", "indre", "cher", "loiret", "essonne", "yvelines", "seine", "oise", "var",
             "vaucluse", "gard", "lozere", "tarn", "garonne", "lot", "gers", "bearn", "basque", "roussillon", "guadeloupe",
             "martinique", "guyane", "reunion", "mayotte", "caledonie", "polynesie", "monde", "international", "mondiale"}


def _mots_nom(nom: str) -> list[str]:
    """Mots distinctifs du nom (cinq lettres au moins, hors mots génériques et géographiques, listés dans GENERIQUES)."""
    import unicodedata
    texte = unicodedata.normalize("NFKD", nom or "").encode("ascii", "ignore").decode().lower()
    texte = re.sub(r"(?:\b[a-z]\.)+[a-z]\b", lambda m: m.group().replace(".", ""), texte)  # A.R.C.A.D -> arcad
    return [m for m in re.split(r"[^a-z0-9]+", texte) if len(m) >= 5 and m not in GENERIQUES]


TLD_ADMIS = (".fr", ".org", ".eu", ".com", ".net", ".coop", ".paris", ".bzh", ".alsace", ".corsica", ".re", ".gp", ".mq", ".gf", ".yt", ".nc", ".pf", ".ch", ".be")


SOUS_DOMAINES_ECARTES = ("www", "careers", "carrieres", "recrutement", "jobs", "emploi", "sustainability", "pro", "extranet", "shop",
                         "boutique", "blog", "news", "presse", "press", "media", "img", "cdn", "static", "en", "fr", "corporate", "group")
STOP = {"fondation", "fondations", "foundation", "entreprise", "d", "de", "la", "le", "les", "du", "des", "et", "pour", "groupe", "l", "a", "en"}


def _tokens(nom: str) -> list[str]:
    import unicodedata
    texte = unicodedata.normalize("NFKD", nom or "").encode("ascii", "ignore").decode().lower()
    texte = re.sub(r"(?:\b[a-z]\.)+[a-z]\b", lambda m: m.group().replace(".", ""), texte)
    return [m for m in re.split(r"[^a-z0-9]+", texte) if len(m) >= 2 and m not in STOP]


def _racine(url: str) -> str:
    """Schéma + hôte, en remplaçant un sous-domaine technique (careers, recrutement, img...) par www."""
    u = urlparse(url)
    parties = u.netloc.lower().split(".")
    if len(parties) >= 3 and parties[0] in SOUS_DOMAINES_ECARTES:
        parties = ["www"] + parties[1:]
    return f"{u.scheme}://{'.'.join(parties)}/"


def site_officiel(resultats: list[dict], nom: str = "") -> str | None:
    """Racine du site de l'organisme, seulement si le domaine porte son nom ; sinon None (« incertain »).

    Trois preuves admises, dans cet ordre, sur les résultats hors annuaires et réseaux sociaux :
    (a) le domaine contient le nom compact (ex. « airfrance » dans corporate.airfrance.com) ;
    (b) le domaine contient « fondation » ou « foundation » et un mot du nom, même court (ex. fondation-ey.com,
        fondation.ca-norddefrance.fr pour Crédit Agricole Nord de France) ;
    (c) le domaine contient un mot distinctif du nom (cinq lettres au moins, hors mots génériques et géographiques).
    Pourquoi : les premiers résultats sont souvent des annuaires ou des homonymes ; sans ces preuves on n'inscrit rien.
    """
    distinctifs = _mots_nom(nom)
    tokens = _tokens(nom)
    compact_nom = "".join(tokens)
    initiales = "".join(t[0] for t in tokens)
    meilleur, meilleur_score = None, 0
    for r in resultats:
        domaine = urlparse(r["url"]).netloc.lower()
        if _ecarte(domaine) or not domaine.endswith(TLD_ADMIS):
            continue
        if not nom:
            return _racine(r["url"])
        compact = domaine.replace("-", "").replace(".", "")
        porte_fondation = "fondation" in compact or "foundation" in compact
        score = 0
        if porte_fondation and any(len(t) >= 2 and t in compact for t in tokens):  # (b) fondation-ey.com, projetsfondationm6.com
            score = 3
        elif len(tokens) >= 2 and len(compact_nom) >= 6 and compact_nom in compact:  # (a) nom compact : airfrance
            score = 2
        elif len(tokens) == 1 and len(tokens[0]) >= 4 and tokens[0] not in GENERIQUES and tokens[0] in compact:  # nom d'un seul mot
            score = 2
        elif any(m in compact for m in distinctifs):  # (c) mot distinctif
            score = 1
        else:
            for k in range(len(initiales), 2, -1):  # (d) sigle ou début de sigle : ciup.fr, fondation-bms.fr
                ini = initiales[:k]
                if compact.startswith(ini) or compact.startswith("www" + ini) or (porte_fondation and ini in compact):
                    score = 3 if porte_fondation else 1
                    break
        if score > meilleur_score:  # le meilleur résultat l'emporte sur le premier (ex. fondation-bms.fr avant bms.com)
            meilleur, meilleur_score = _racine(r["url"]), score
    return meilleur


def _ecarte(domaine: str) -> bool:
    """Vrai si le domaine est un annuaire, un réseau social ou un site écarté (correspondance exacte ou par sous-domaine)."""
    return any(domaine == d or domaine.endswith("." + d) for d in DOMAINES_ECARTES)
