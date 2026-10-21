"""Robot de decouverte des rubriques « appels a projets » (spec decouverte-rubriques-aap).

Pour chaque source du registre : ouvre la page enregistree avec un navigateur pilote, note les
liens qui evoquent un appel a projets, visite au plus trois pages candidates du meme site et retient
celle qui contient le plus de liens d'AAP. La page retenue et ses liens sont gardes en local
(decouverte/<id>/), le resultat dans decouverte/resultats.json. Sans IA, sans appel d'API.

  python decouverte.py --limite 10            # essai
  python decouverte.py --ids ars-bretagne     # une source
  python decouverte.py --parallele 4          # tout le registre (reprise automatique)
  python decouverte.py --rapport              # ecrit DECOUVERTE.md

Pourquoi un navigateur : les sites des ARS, d'ameli et des prefectures refusent les requetes
simples mais acceptent un navigateur (constate le 2026-10-09).
"""
from __future__ import annotations

import argparse
import asyncio
import json
import re
import sys
import unicodedata
from collections import Counter
from datetime import date
from pathlib import Path
from urllib.parse import urljoin, urlparse

from utils import accept_cookies, ensure_utf8_stdout, make_browser_context, utc_now_iso

ICI = Path(__file__).resolve().parent
REGISTRE = ICI / "sources" / "registre.json"
from registre import adresse_aap  # noqa: E402  (adresse validee a l'ecran, sinon adresse d'origine)
DOSSIER = ICI / "decouverte"
RESULTATS = DOSSIER / "resultats.json"
RAPPORT = ICI / "DECOUVERTE.md"

# Expressions (sans accents, minuscules) et points attribues a un lien qui les contient.
MOTS = [
    ("appel a projet", 3), ("appels a projet", 3), ("appel-a-projet", 3), ("appels-a-projet", 3),
    ("appel-projet", 3), ("appels-projet", 3), ("appel projet", 2), ("appels projets", 3), ("appelprojet", 3),
    ("appel a candidature", 3), ("appels a candidature", 3), ("appel-a-candidature", 3), ("appels-a-candidature", 3),
    ("manifestation d'interet", 3), ("manifestation d interet", 3), ("manifestation-d-interet", 3), ("manifestations d'interet", 3),
    ("appel d'offre", 1), ("appel a communication", -3), ("appel a contribution", 1),
    ("subvention", 1), ("financement", 1), ("aides", 1), ("bourse", 1), ("prix ", 1),
    # Changement decouverte-mots-cles (2026-10-21) : libelles anglais (HaDEA, portails europeens) et codes de programmes
    ("call for proposal", 3), ("calls for proposal", 3), ("call-for-proposal", 3), ("calls-proposal", 3),
    ("funding opportunit", 1), ("grant", 1), ("horizon-hlth", 3), ("eu4h", 3),
]
# Jetons cherches comme mot entier dans le texte, ou comme segment d'adresse (/appel/, -call-) : un lien « Lire la
# suite » vers /appel/<id> (appelsprojetsrecherche.fr) ou /detail/call/ (ANR) compte ainsi comme un appel.
TOKENS = {"aap": 3, "ami": 2, "aac": 2, "appel": 3, "appels": 3, "call": 3, "calls": 3}
EXCLUS = ("mailto:", "javascript:", "tel:", "#")
EXTENSIONS_FICHIERS = (".pdf", ".doc", ".docx", ".xls", ".xlsx", ".zip")


def normaliser(texte: str) -> str:
    texte = unicodedata.normalize("NFKD", texte or "").encode("ascii", "ignore").decode().lower()
    return re.sub(r"\s+", " ", texte).strip()


def score_lien(texte: str, href: str) -> int:
    """Points d'un lien selon son texte et son adresse (0 = sans rapport avec un AAP)."""
    t = normaliser(texte)
    h = normaliser(href).replace("_", "-")
    score = 0
    for mot, points in MOTS:
        if mot in t or mot in h:
            score += points
    for token, points in TOKENS.items():
        if re.search(rf"\b{token}\b", t) or re.search(rf"[/-]{token}[/-]", h):
            score += points
    return max(score, 0)


def meme_site(url: str, base: str) -> bool:
    a, b = urlparse(url).netloc.lower(), urlparse(base).netloc.lower()
    a, b = a.replace("www.", ""), b.replace("www.", "")
    return a == b or a.endswith("." + b) or b.endswith("." + a)


def liens_aap(liens: list[dict], base: str, url_page: str = "") -> list[dict]:
    """Liens d'une page qui ressemblent a des AAP (score >= 3), dedoublonnes par adresse.
    Les ancres vers la page elle-meme (#menu...) sont ignorees : sur une page dont l'adresse contient
    « appels-projet », elles obtiendraient toutes la note maximale."""
    vus: set[str] = set()
    sortie = []
    for l in liens:
        href = (l.get("href") or "").split("#")[0]
        if not href.startswith("http") or href.lower().startswith(EXCLUS) or href.rstrip("/") == url_page.rstrip("/"):
            continue
        if normaliser(l.get("texte", "")).startswith("aller a"):
            continue
        s = score_lien(l.get("texte", ""), href)
        if s >= 3 and href not in vus and meme_site(href, base):
            vus.add(href)
            sortie.append({"texte": (l.get("texte") or "").strip()[:200], "href": href, "score": s})
    return sortie


def candidats(liens: list[dict], base: str, maximum: int = 3) -> list[str]:
    """Pages candidates a visiter : liens bien notes du meme site, hors fichiers, les mieux notes d'abord."""
    notes: dict[str, int] = {}
    for l in liens:
        href = l.get("href") or ""
        if not href.startswith("http") or href.lower().endswith(EXTENSIONS_FICHIERS) or not meme_site(href, base):
            continue
        s = score_lien(l.get("texte", ""), href)
        if s >= 2:
            notes[href] = max(notes.get(href, 0), s)
    return [h for h, _ in sorted(notes.items(), key=lambda x: -x[1])[:maximum]]


def liens_contenu(liens: list[dict], base: str, url_page: str) -> list[dict]:
    """Sur une page dont l'adresse est elle-meme une rubrique AAP (ex. /liste-appels-projet-candidature),
    les fiches d'AAP ont souvent des titres sans le mot « appel » : on garde alors tous les liens du
    contenu principal (hors menus), du meme site, qui ne sont pas la page elle-meme."""
    vus: set[str] = set()
    sortie = []
    for l in liens:
        href = (l.get("href") or "").split("#")[0]
        if not href.startswith("http") or not meme_site(href, base) or href.rstrip("/") == url_page.rstrip("/"):
            continue
        texte = (l.get("texte") or "").strip()
        if len(texte) < 12 or href in vus:  # un titre d'AAP fait plus de 12 caracteres
            continue
        vus.add(href)
        sortie.append({"texte": texte[:200], "href": href, "score": score_lien(texte, href)})
    return sortie


def choisir_rubrique(pages: list[tuple[str, list[dict], list[dict]]], base: str) -> tuple[str | None, list[dict]]:
    """Parmi (url, liens, liens du contenu principal) des pages visitees, retient la page la plus riche
    en liens d'AAP (au moins 2). Une page dont l'adresse est une rubrique AAP compte ses liens de contenu."""
    meilleur: tuple[str | None, list[dict]] = (None, [])
    for url, liens, contenu in pages:
        trouves = liens_aap(liens, base, url)
        if score_lien("", url) >= 3:
            # Page de liste : ses liens de contenu sont les fiches d'AAP, meme sans le mot « appel »
            dans_contenu = liens_contenu(contenu, base, url)
            if len(dans_contenu) >= 2:
                trouves = dans_contenu
        if len(trouves) >= 2 and len(trouves) > len(meilleur[1]):
            meilleur = (url, trouves)
    return meilleur


def charger_resultats() -> dict:
    if RESULTATS.exists():
        return json.loads(RESULTATS.read_text(encoding="utf-8"))
    return {}


def sauver_resultats(resultats: dict) -> None:
    DOSSIER.mkdir(exist_ok=True)
    RESULTATS.write_text(json.dumps(resultats, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")


async def extraire_liens(page, selecteur: str = "a[href]") -> list[dict]:
    # Le moteur de selection de Playwright (page.locator) traverse les shadow DOM ouverts, contrairement a
    # document.querySelectorAll : les sites Salesforce (ANAP) y placent leurs liens (changement decouverte-shadow-dom).
    # a.href est un objet (SVGAnimatedString) pour les liens dans un SVG : on passe par getAttribute + URL absolue.
    return await page.locator(selecteur).evaluate_all(
        "els => els.map(a => { let h = ''; try { h = new URL(a.getAttribute('href') || '', location.href).href } catch (e) {} "
        "return {texte: (a.innerText || a.getAttribute('title') || '').slice(0, 300), href: h} })"
    )


# Liens de navigation (en-tete, menus, pied de page, fil d'Ariane, liens d'evitement) : le contenu
# principal est tout le reste. Plus fiable que chercher <main>, absent sur beaucoup de sites.
SELECTEUR_NAVIGATION = ("header a[href], nav a[href], footer a[href], [role=navigation] a[href], [role=banner] a[href], "
                        "[role=contentinfo] a[href], .menu a[href], .navbar a[href], .breadcrumb a[href], .skip-link a[href], "
                        "#header a[href], #footer a[href], .footer a[href], .header a[href], .sidebar a[href], aside a[href]")


def sans_navigation(tous: list[dict], navigation: list[dict]) -> list[dict]:
    exclus = {l.get("href") for l in navigation}
    return [l for l in tous if l.get("href") not in exclus and not normaliser(l.get("texte", "")).startswith("aller a")]


async def lire_page(page) -> tuple[str, list[dict], list[dict]]:
    tous = await extraire_liens(page)
    navigation = await extraire_liens(page, SELECTEUR_NAVIGATION)
    return page.url.split("#")[0], tous, sans_navigation(tous, navigation)


async def ouvrir(page, url: str) -> tuple[int | None, str | None]:
    """Charge une page ; retourne (code HTTP, erreur)."""
    try:
        reponse = await page.goto(url, wait_until="domcontentloaded", timeout=30000)
        try:
            await page.wait_for_load_state("networkidle", timeout=8000)
        except Exception:
            pass
        return (reponse.status if reponse else None), None
    except Exception as err:  # timeout, DNS, TLS...
        return None, type(err).__name__ + ": " + str(err).splitlines()[0][:160]


async def traiter_source(browser, source: dict, semaphore: asyncio.Semaphore, garder_depart: bool = False) -> dict:
    resultat = {"id": source["id"], "nom": source["nom"], "categorie": source["categorie"], "url_depart": adresse_aap(source),
                "statut": "erreur", "url_rubrique": None, "nb_liens_aap": 0, "candidats_visites": [], "erreur": None,
                "date": utc_now_iso()}
    async with semaphore:
        contexte = await make_browser_context(browser)
        await contexte.route("**/*", lambda route: route.abort() if route.request.resource_type in ("image", "media", "font") else route.continue_())
        page = await contexte.new_page()
        try:
            code, erreur = await ouvrir(page, adresse_aap(source))
            if erreur or code is None or code >= 400:
                resultat["statut"] = "bloque" if code in (401, 403, 429, 503) else "erreur"
                resultat["erreur"] = erreur or f"HTTP {code}"
                return resultat
            await accept_cookies(page)
            base = page.url.split("#")[0]
            pages = [await lire_page(page)]
            # garder_depart : adresse donnée par Monsieur DUCOUT à l'écran (spec decouverte-rubriques-aap,
            # « Redécouverte d'une source corrigée ») ; on ne cherche pas une autre page, on relit celle-là.
            for url in ([] if garder_depart else candidats(pages[0][1], base)):
                await asyncio.sleep(1.0)
                code, erreur = await ouvrir(page, url)
                if erreur or code is None or code >= 400:
                    continue
                resultat["candidats_visites"].append(url)
                pages.append(await lire_page(page))
            url_rubrique, trouves = choisir_rubrique(pages, base)
            if url_rubrique is None:
                resultat["statut"] = "aucune-rubrique"
                return resultat
            resultat.update({"statut": "rubrique-trouvee", "url_rubrique": url_rubrique, "nb_liens_aap": len(trouves)})
            dossier = DOSSIER / source["id"]
            dossier.mkdir(parents=True, exist_ok=True)
            if page.url.split("#")[0] != url_rubrique:
                await ouvrir(page, url_rubrique)
            dossier.joinpath("rubrique.html").write_text(await page.content(), encoding="utf-8")
            dossier.joinpath("liens.json").write_text(json.dumps({"url": url_rubrique, "liens": trouves}, ensure_ascii=False, indent=1), encoding="utf-8")
            return resultat
        except Exception as err:
            resultat["erreur"] = type(err).__name__ + ": " + str(err).splitlines()[0][:160]
            return resultat
        finally:
            await contexte.close()


async def avec_delai_maximal(browser, source: dict, semaphore: asyncio.Semaphore, maximum: float = 180.0, garder_depart: bool = False) -> dict:
    """Garde-fou : une source ne peut pas bloquer le passage plus de 3 minutes (page qui ne finit
    jamais de charger, fermeture de contexte qui pend)."""
    try:
        return await asyncio.wait_for(traiter_source(browser, source, semaphore, garder_depart), timeout=maximum)
    except asyncio.TimeoutError:
        return {"id": source["id"], "nom": source["nom"], "categorie": source["categorie"], "url_depart": adresse_aap(source),
                "statut": "erreur", "url_rubrique": None, "nb_liens_aap": 0, "candidats_visites": [],
                "erreur": f"délai maximal de {int(maximum)} s dépassé", "date": utc_now_iso()}


async def lancer(sources: list[dict], parallele: int, garder_depart: bool = False) -> None:
    from playwright.async_api import async_playwright

    resultats = charger_resultats()
    semaphore = asyncio.Semaphore(parallele)
    async with async_playwright() as p:
        # --disable-http2 : les sites des prefectures (*.gouv.fr) coupent les connexions HTTP/2 du navigateur
        # pilote (ERR_HTTP2_PROTOCOL_ERROR sur 99 sources le 2026-10-09) ; en HTTP/1.1 ils repondent.
        browser = await p.chromium.launch(headless=True, args=["--disable-http2"])
        try:
            taches = [asyncio.create_task(avec_delai_maximal(browser, s, semaphore, garder_depart=garder_depart)) for s in sources]
            for i, tache in enumerate(asyncio.as_completed(taches), 1):
                r = await tache
                resultats[r["id"]] = r
                sauver_resultats(resultats)
                detail = r["url_rubrique"] + f" ({r['nb_liens_aap']} liens)" if r["url_rubrique"] else (r["erreur"] or "")
                print(f"[{i}/{len(sources)}] {r['statut']:17} {r['nom'][:50]:50} {detail}")
        finally:
            await browser.close()


LIBELLES = {"rubrique-trouvee": "rubrique trouvée", "aucune-rubrique": "aucune rubrique", "bloque": "bloqué", "erreur": "erreur"}


def rapport(resultats: dict, registre: list[dict]) -> str:
    par_id = {s["id"]: s for s in registre}
    statuts = Counter(r["statut"] for r in resultats.values())
    liens = sum(r["nb_liens_aap"] for r in resultats.values())
    lignes = ["# Découverte des rubriques appels à projets", "",
              f"Généré le {date.today().isoformat()} par `python scraping/decouverte.py --rapport`.", "",
              f"**{len(resultats)} sources traitées sur {len(registre)} : "
              + ", ".join(f"{statuts.get(k, 0)} {v}" for k, v in LIBELLES.items() if statuts.get(k))
              + f" ; {liens} liens d'AAP collectés.**", "",
              "## Par famille", "", "| Famille | Traitées | Rubrique trouvée | Aucune rubrique | Bloquées | Erreurs | Liens d'AAP |", "|---|---|---|---|---|---|---|"]
    familles: dict[str, Counter] = {}
    for r in resultats.values():
        c = familles.setdefault(r["categorie"], Counter())
        c[r["statut"]] += 1
        c["liens"] += r["nb_liens_aap"]
        c["total"] += 1
    for cat, c in sorted(familles.items(), key=lambda x: -x[1]["total"]):
        lignes.append(f"| {cat} | {c['total']} | {c['rubrique-trouvee']} | {c['aucune-rubrique']} | {c['bloque']} | {c['erreur']} | {c['liens']} |")
    lignes += ["", "## Rubriques trouvées", "", "| Source | Famille | Rubrique | Liens d'AAP |", "|---|---|---|---|"]
    for r in sorted((r for r in resultats.values() if r["statut"] == "rubrique-trouvee"), key=lambda x: -x["nb_liens_aap"]):
        lignes.append(f"| {r['nom'][:70]} | {r['categorie']} | [page]({r['url_rubrique']}) | {r['nb_liens_aap']} |")
    lignes += ["", "## Sites bloqués ou en erreur", "", "| Source | Statut | Motif |", "|---|---|---|"]
    for r in sorted((r for r in resultats.values() if r["statut"] in ("bloque", "erreur")), key=lambda x: x["nom"]):
        lignes.append(f"| {r['nom'][:70]} | {LIBELLES[r['statut']]} | {(r['erreur'] or '')[:90]} |")
    for s in registre:
        par_id.setdefault(s["id"], s)
    return "\n".join(lignes) + "\n"


def main() -> int:
    ensure_utf8_stdout()
    parser = argparse.ArgumentParser(description="Découverte des rubriques appels à projets des sources du registre.")
    parser.add_argument("--limite", type=int, help="ne traiter que N sources (essai)")
    parser.add_argument("--ids", help="identifiants de sources séparés par des virgules")
    parser.add_argument("--categorie", help="ne traiter qu'une famille du registre")
    parser.add_argument("--parallele", type=int, default=4, help="pages ouvertes en parallèle (défaut 4)")
    parser.add_argument("--forcer", action="store_true", help="retraiter les sources déjà faites")
    parser.add_argument("--rapport", action="store_true", help="écrire DECOUVERTE.md et s'arrêter")
    parser.add_argument("--garder-depart", action="store_true",
                        help="garder la page de départ comme rubrique sans visiter d'autres candidats (adresse donnée à l'écran)")
    args = parser.parse_args()

    registre = json.loads(REGISTRE.read_text(encoding="utf-8"))
    if args.rapport:
        RAPPORT.write_text(rapport(charger_resultats(), registre), encoding="utf-8")
        print(f"Rapport écrit : {RAPPORT.name}")
        return 0

    sources = registre
    if args.ids:
        voulus = {i.strip() for i in args.ids.split(",")}
        sources = [s for s in sources if s["id"] in voulus]
    if args.categorie:
        sources = [s for s in sources if s["categorie"] == args.categorie]
    if not args.forcer:
        faits = charger_resultats()
        sources = [s for s in sources if s["id"] not in faits]
    if args.limite:
        sources = sources[: args.limite]
    if not sources:
        print("Rien à traiter (tout est déjà fait ; --forcer pour recommencer).")
        return 0
    print(f"{len(sources)} sources à traiter, {args.parallele} en parallèle.")
    asyncio.run(lancer(sources, args.parallele, args.garder_depart))
    return 0


if __name__ == "__main__":
    sys.exit(main())
