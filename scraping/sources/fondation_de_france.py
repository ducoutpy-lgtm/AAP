"""Source : Fondation de France.

Modele de scraper source. Deux fonctions obligatoires :
  - list_aaps(page)       -> list[url]    : collecte les URLs des fiches AAP
  - fetch_detail(page, url, downloads_dir) -> dict avec :
        { "text": str, "fichiers_joints": list[dict], "financeur_hint": str }

Les selecteurs CSS sont volontairement larges : en cas de refonte du site,
l extraction Claude se debrouille a partir du innerText brut de la page.
"""
from __future__ import annotations

import os
from pathlib import Path
from urllib.parse import urlparse

import httpx

from utils import accept_cookies, DEFAULT_HTTP_HEADERS

LIST_URL = "https://www.fondationdefrance.org/fr/appels-a-projets"
FINANCEUR_HINT = "Fondation de France"

PAGE_SIZE = 15          # FDF affiche 15 AAP par page (pagination offset)
MAX_PAGES = 30          # garde-fou absolu (30 pages = 450 AAP max)
MAX_ATTACHMENTS = 6     # nb max de pieces jointes PDF/DOCX par AAP

_HTTP_HEADERS = DEFAULT_HTTP_HEADERS


async def _collect_links_on_current_page(page) -> list[str]:
    """Recupere les liens des fiches AAP sur la page de listing courante.

    Strategie : on cible les cartes de resultats dans le main content.
    On accepte tous les liens internes (meme URL custom type /fr/mayotte-foret).
    """
    return await page.evaluate(
        """
        () => {
          const root = document.querySelector('main, [role="main"]') || document.body;
          // Cartes d AAP : on cible les articles/cards/liens dans la zone de resultats.
          // Exclusion stricte des liens de pagination, menus, footer.
          const anchors = Array.from(root.querySelectorAll('article a[href], .card a[href], .views-row a[href], [class*="tile"] a[href], [class*="result"] a[href]'));
          const urls = anchors
            .map(a => a.href)
            .filter(h => h && h.startsWith('https://www.fondationdefrance.org/fr/'))
            .filter(h => !h.includes('#'))
            .filter(h => !/\\?page=/.test(h))
            .filter(h => !h.replace(/\\/$/, '').endsWith('/appels-a-projets'));
          // Fallback si selecteurs vides (refonte site) : on retombe sur l ancienne strategie.
          if (urls.length === 0) {
            return Array.from(document.querySelectorAll('a[href]'))
              .map(a => a.href)
              .filter(h => h && h.includes('/fr/appels-a-projets/'))
              .filter(h => !h.replace(/\\/$/, '').endsWith('/appels-a-projets'))
              .filter(h => !h.includes('#'));
          }
          return urls;
        }
        """
    )


async def list_aaps(page) -> list[str]:
    """Pagination FDF : offset-based via ?start=N (N = 0, 15, 30, 45...).

    Attention : le site IGNORE silencieusement ?page=N et renvoie toujours la
    page 1. Le bon parametre est ?start=<offset>.

    Strategie : on incremente start de PAGE_SIZE tant qu on decouvre des liens
    nouveaux. Arret des qu une page n apporte rien de neuf.
    """
    all_links: list[str] = []
    seen: set[str] = set()

    for page_num in range(MAX_PAGES):
        start = page_num * PAGE_SIZE
        url = LIST_URL if start == 0 else f"{LIST_URL}?start={start}"
        print(f"  [page {page_num} start={start}] {url}")
        try:
            await page.goto(url, wait_until="domcontentloaded", timeout=60000)
        except Exception as e:
            print(f"  [page {page_num}] echec navigation : {e}")
            break

        if page_num == 0:
            await accept_cookies(page)
        await page.wait_for_timeout(1500)

        # Scroll leger pour declencher lazy-loading eventuel
        for _ in range(3):
            await page.mouse.wheel(0, 3000)
            await page.wait_for_timeout(600)

        links = await _collect_links_on_current_page(page)
        new_links = [l for l in links if l not in seen]
        print(f"  [page {page_num}] {len(links)} liens, {len(new_links)} nouveaux")

        if not new_links:
            # Page vide ou deja vue : fin de pagination
            break

        for l in new_links:
            seen.add(l)
            all_links.append(l)

    return all_links


async def fetch_detail(page, url: str, downloads_dir: Path) -> dict:
    await page.goto(url, wait_until="domcontentloaded", timeout=60000)
    await accept_cookies(page)
    await page.wait_for_timeout(1500)

    # On tente d attendre un selecteur probable de contenu principal
    for sel in ["main", "article", "[role='main']", ".main-content"]:
        try:
            await page.wait_for_selector(sel, timeout=3000)
            break
        except Exception:
            continue

    # Nettoyage du DOM avant innerText : on retire nav/header/footer/menu/
    # bandeaux cookies, qui polluent le texte envoye a Claude (~30 % de bruit).
    text: str = await page.evaluate(
        """
        () => {
          const root = document.querySelector('main, article, [role="main"]') || document.body;
          const clone = root.cloneNode(true);
          clone.querySelectorAll(
            'nav, header, footer, aside, script, style, ' +
            '[class*="menu"], [class*="cookie"], [class*="breadcrumb"], ' +
            '[id*="menu"], [id*="cookie"]'
          ).forEach(el => el.remove());
          return clone.innerText || '';
        }
        """
    )

    # On restreint a la zone de contenu principal pour ignorer les pdf de
    # pied de page (charte, politique cookies, etc.) non specifiques a l AAP.
    pdf_urls: list[str] = await page.evaluate(
        r"""
        () => {
          const root = document.querySelector('main, article, [role="main"]') || document.body;
          const anchors = Array.from(root.querySelectorAll('a[href]'));
          const urls = anchors
            .map(a => a.href)
            .filter(h => /\.(pdf|docx?|xlsx?)(\?|$)/i.test(h))
            .filter(h => !/charte.*conduite|moderation|politique.*cookies|mentions.*legales/i.test(h));
          return urls;
        }
        """
    )

    fichiers: list[dict] = []
    seen: set[str] = set()

    # Un seul client HTTP pour tous les PDF de cette fiche : evite les
    # handshakes TLS repetes (~6x plus rapide sur un AAP avec 6 PJ).
    with httpx.Client(follow_redirects=True, timeout=45, headers=_HTTP_HEADERS) as client:
        for pdf_url in pdf_urls:
            if pdf_url in seen:
                continue
            seen.add(pdf_url)
            if len(fichiers) >= MAX_ATTACHMENTS:
                break
            filename = os.path.basename(urlparse(pdf_url).path) or "document.bin"
            target = downloads_dir / filename
            local_path: str | None = None

            # Cache disque : si le fichier existe deja, on ne le retelecharge pas.
            # Economise bande passante + temps (30-60 s / run en moyenne).
            if target.exists() and target.stat().st_size > 0:
                local_path = str(target)
                print(f"  [pdf cache] {filename} ({target.stat().st_size // 1024} Ko)")
            else:
                try:
                    r = client.get(pdf_url)
                    r.raise_for_status()
                    target.write_bytes(r.content)
                    local_path = str(target)
                    print(f"  [pdf] {filename} ({len(r.content) // 1024} Ko)")
                except (httpx.HTTPError, OSError) as e:
                    print(f"  [pdf echec] {pdf_url} : {e}")

            fichiers.append({"url": pdf_url, "filename": filename, "local_path": local_path})

    return {"text": text, "fichiers_joints": fichiers, "financeur_hint": FINANCEUR_HINT}
