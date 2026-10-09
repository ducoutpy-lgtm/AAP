"""Source : CNSA (Caisse Nationale de Solidarite pour l Autonomie).

Page de listing : /appels-projets
  - Pagination Drupal classique via ?page=N (N=0,1,2... ~4 pages, 20 AAP/page).
  - Attention : les parametres de filtre (?open=today, ?type[0]=126) renvoient
    "Aucun resultat trouve" en navigation directe (filtres geres cote JS,
    inutilisables via simple ?query). On liste donc TOUS les AAP sans filtre
    et on laisse Claude/le tri aval decider de la pertinence.
  - URLs de type slug : /appels-projets/<slug> (friendly URLs).

Pieces jointes : servies directement en PDF/DOCX depuis /sites/default/files/,
pas de redirection /media/<id>/download comme sur ARS IDF.
"""
from __future__ import annotations

import os
from pathlib import Path
from urllib.parse import urlparse

import httpx

from utils import accept_cookies, DEFAULT_HTTP_HEADERS

BASE_URL = "https://www.cnsa.fr"
LIST_URL = f"{BASE_URL}/appels-projets"
FINANCEUR_HINT = "CNSA"

MAX_PAGES = 10          # garde-fou (site annonce 4 pages actuellement)
MAX_ATTACHMENTS = 6

_HTTP_HEADERS = DEFAULT_HTTP_HEADERS


async def _collect_links_on_current_page(page) -> list[str]:
    """Recupere les liens des fiches AAP sur la page de listing courante.

    Les cartes AAP sont des <article class="project h-entry card"> ; le lien
    de la fiche est le <a class="whole" href="..."> dans le titre (h2.p-name).
    """
    return await page.evaluate(
        f"""
        () => {{
          const base = "{BASE_URL}";
          const anchors = Array.from(
            document.querySelectorAll('article.project a.whole[href], .cards-list article a[href]')
          );
          const seen = new Set();
          const results = [];
          for (const a of anchors) {{
            let href = a.href;
            if (!href) continue;
            if (!href.startsWith(base)) href = base + href;
            if (!href.includes('/appels-projets/')) continue;
            if (href.includes('#')) continue;
            if (seen.has(href)) continue;
            seen.add(href);
            results.push(href);
          }}
          return results;
        }}
        """
    )


async def list_aaps(page) -> list[str]:
    """Pagination CNSA : Drupal standard via ?page=N (0-indexed).

    Strategie : on incremente page tant qu on decouvre des liens nouveaux.
    Arret des qu une page n apporte rien de neuf (fin de pagination atteinte).
    """
    all_links: list[str] = []
    seen: set[str] = set()

    for page_num in range(MAX_PAGES):
        url = LIST_URL if page_num == 0 else f"{LIST_URL}?page={page_num}"
        print(f"  [page {page_num}] {url}")
        try:
            await page.goto(url, wait_until="domcontentloaded", timeout=60000)
        except Exception as e:
            print(f"  [page {page_num}] echec navigation : {e}")
            break

        if page_num == 0:
            await accept_cookies(page)
        await page.wait_for_timeout(1500)

        links = await _collect_links_on_current_page(page)
        new_links = [l for l in links if l not in seen]
        print(f"  [page {page_num}] {len(links)} liens, {len(new_links)} nouveaux")

        if not new_links:
            break

        for l in new_links:
            seen.add(l)
            all_links.append(l)

    return all_links


async def fetch_detail(page, url: str, downloads_dir: Path) -> dict:
    await page.goto(url, wait_until="domcontentloaded", timeout=60000)
    await accept_cookies(page)
    await page.wait_for_timeout(1500)

    for sel in ["main#page-body", "article.h-entry", "main", "article", "[role='main']"]:
        try:
            await page.wait_for_selector(sel, timeout=3000)
            break
        except Exception:
            continue

    text: str = await page.evaluate(
        """
        () => {
          const root = document.querySelector('main#page-body, article.h-entry, main, article, [role="main"]') || document.body;
          const clone = root.cloneNode(true);
          clone.querySelectorAll(
            'nav, header, footer, aside, script, style, ' +
            '[class*="menu"], [class*="cookie"], [class*="breadcrumb"], ' +
            '[id*="menu"], [id*="cookie"], [class*="pager"], [class*="tarteaucitron"]'
          ).forEach(el => el.remove());
          return clone.innerText || '';
        }
        """
    )

    pdf_urls: list[str] = await page.evaluate(
        r"""
        () => {
          const root = document.querySelector('main#page-body, article.h-entry, main, article, [role="main"]') || document.body;
          const anchors = Array.from(root.querySelectorAll('a[href]'));
          const urls = anchors
            .map(a => a.href)
            .filter(h => /\.(pdf|docx?|xlsx?)(\?|$)/i.test(h));
          return urls;
        }
        """
    )

    fichiers: list[dict] = []
    seen: set[str] = set()

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
