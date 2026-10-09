"""Source : ARS Corse.

Meme CMS Drupal que l ARS IDF — selecteurs CSS identiques.
Page de listing : /liste-appels-projet-candidature
Documents joints : telecharges via httpx avec User-Agent navigateur.
"""
from __future__ import annotations

from pathlib import Path
from urllib.parse import urlparse

import httpx

from utils import accept_cookies, DEFAULT_HTTP_HEADERS

BASE_URL = "https://www.corse.ars.sante.fr"
LIST_URL = f"{BASE_URL}/liste-appels-projet-candidature"
FINANCEUR_HINT = "ARS Corse"

MAX_ATTACHMENTS = 6

_HTTP_HEADERS = {**DEFAULT_HTTP_HEADERS, "Referer": BASE_URL + "/"}


async def list_aaps(page) -> list[str]:
    await page.goto(LIST_URL, wait_until="domcontentloaded", timeout=60000)
    await accept_cookies(page)
    await page.wait_for_timeout(2000)

    links: list[str] = await page.evaluate(
        f"""
        () => {{
          const base = "{BASE_URL}";
          const anchors = Array.from(
            document.querySelectorAll('.accueil-appels-projets--item-titre a[href], .accueil-appels-projets--item a[href]')
          );
          const seen = new Set();
          const results = [];
          for (const a of anchors) {{
            const href = a.href;
            if (!href || !href.startsWith(base)) continue;
            if (href.includes('#')) continue;
            if (seen.has(href)) continue;
            seen.add(href);
            results.push(href);
          }}
          return results;
        }}
        """
    )

    print(f"  [ars_corse] {len(links)} AAP trouves sur la page de listing")
    return links


async def fetch_detail(page, url: str, downloads_dir: Path) -> dict:
    await page.goto(url, wait_until="domcontentloaded", timeout=60000)
    await accept_cookies(page)
    await page.wait_for_timeout(1500)

    for sel in ["main", "article", "[role='main']", ".main-content", ".node"]:
        try:
            await page.wait_for_selector(sel, timeout=3000)
            break
        except Exception:
            continue

    text: str = await page.evaluate(
        """
        () => {
          const root = document.querySelector('main, article, [role="main"], .main-content') || document.body;
          const clone = root.cloneNode(true);
          clone.querySelectorAll(
            'nav, header, footer, aside, script, style, ' +
            '[class*="menu"], [class*="cookie"], [class*="breadcrumb"], ' +
            '[id*="menu"], [id*="cookie"], [class*="sidebar"], [class*="social"]'
          ).forEach(el => el.remove());
          return clone.innerText || '';
        }
        """
    )

    doc_urls: list[str] = await page.evaluate(
        r"""
        () => {
          const root = document.querySelector('main, article, [role="main"], .main-content') || document.body;
          const anchors = Array.from(root.querySelectorAll('a[href]'));
          return anchors
            .map(a => a.href)
            .filter(h => h && (
              /\.(pdf|docx?|xlsx?)(\?|$)/i.test(h) ||
              h.includes('/media/') && h.includes('/download')
            ));
        }
        """
    )

    fichiers: list[dict] = []
    seen: set[str] = set()

    with httpx.Client(follow_redirects=True, timeout=45, headers=_HTTP_HEADERS) as client:
        for doc_url in doc_urls:
            if doc_url in seen:
                continue
            seen.add(doc_url)
            if len(fichiers) >= MAX_ATTACHMENTS:
                break

            path_parts = [p for p in urlparse(doc_url).path.split("/") if p]
            if "media" in path_parts:
                media_idx = path_parts.index("media")
                media_id = path_parts[media_idx + 1] if media_idx + 1 < len(path_parts) else "doc"
                filename = f"media_{media_id}.pdf"
            else:
                filename = path_parts[-1] if path_parts else "document.bin"
                if "." not in filename:
                    filename = f"{filename}.pdf"

            target = downloads_dir / filename
            local_path: str | None = None

            if target.exists() and target.stat().st_size > 1024:
                local_path = str(target)
                print(f"  [doc cache] {filename} ({target.stat().st_size // 1024} Ko)")
            else:
                try:
                    r = client.get(doc_url)
                    r.raise_for_status()
                    ct = r.headers.get("content-type", "")
                    if "wordprocessingml" in ct or "msword" in ct:
                        target = target.with_suffix(".docx")
                        filename = target.name
                    target.write_bytes(r.content)
                    local_path = str(target)
                    print(f"  [doc] {filename} ({len(r.content) // 1024} Ko)")
                except Exception as e:
                    print(f"  [doc echec] {doc_url} : {e}")

            fichiers.append({"url": doc_url, "filename": filename, "local_path": local_path})

    return {"text": text, "fichiers_joints": fichiers, "financeur_hint": FINANCEUR_HINT}
