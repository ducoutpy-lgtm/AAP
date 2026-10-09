"""Source : ARS Ile-de-France — version locale HTTrack.

Ce scraper est identique a ars_idf.py pour la navigation web (list_aaps,
fetch_detail), MAIS il cherche les PDF directement sur le disque local
dans le dossier aspire par WinHTTrack, au lieu de les telecharger depuis
le serveur ARS (qui les protege derriere une authentification).

AVANT D UTILISER CE SCRAPER :
1. Lancer WinHTTrack sur https://www.iledefrance.ars.sante.fr
2. Attendre la fin du telechargement
3. Renseigner HTTRACK_ARS_DIR ci-dessous avec le chemin du dossier aspire
   Ex: C:/Users/pierr/Documents/Mes sites Web/www.iledefrance.ars.sante.fr

LANCEMENT :
   .\.venv\Scripts\python.exe run.py --source ars_idf_local
"""
from __future__ import annotations

import os
from pathlib import Path
from urllib.parse import urlparse

import httpx

from utils import accept_cookies

BASE_URL = "https://www.iledefrance.ars.sante.fr"
LIST_URL = f"{BASE_URL}/liste-appels-projet-candidature"
FINANCEUR_HINT = "ARS Ile-de-France"

MAX_ATTACHMENTS = 6

# [A RENSEIGNER] Chemin vers le dossier WinHTTrack de l ARS IDF.
# Exemple : r"C:\Users\pierr\Documents\Mes sites Web\www.iledefrance.ars.sante.fr"
# Laisser None pour utiliser la variable d environnement HTTRACK_ARS_DIR.
HTTRACK_ARS_DIR: str | None = r"C:\Users\pierr\Documents\Arcadia\HTTrack\ARS IDF FULL\www.iledefrance.ars.sante.fr"

_HTTP_HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; AAPSanteBot/0.1)",
    "Accept": "application/pdf, */*",
}


def _get_httrack_dir() -> Path | None:
    """Retourne le dossier HTTrack configure, ou None si non configure."""
    d = HTTRACK_ARS_DIR or os.environ.get("HTTRACK_ARS_DIR")
    if d:
        return Path(d)
    return None


def _find_local_pdf(pdf_url: str, httrack_dir: Path) -> Path | None:
    """Cherche le fichier PDF correspondant a l URL dans le dossier HTTrack.

    WinHTTrack reproduit la structure d URL en dossiers locaux.
    Ex: /media/160654/download  ->  <httrack_dir>/media/160654/download03fd
    HTTrack ajoute parfois un suffixe hexadecimal quand il ne peut pas
    determiner l extension. On cherche donc aussi tous les fichiers du
    dossier parent dont le nom commence par le segment final de l URL.
    """
    url_path = urlparse(pdf_url).path.lstrip("/")
    candidates = [
        httrack_dir / url_path,
        httrack_dir / (url_path + ".pdf"),
        httrack_dir / (url_path + ".htm"),
    ]
    for candidate in candidates:
        if candidate.exists() and candidate.stat().st_size > 1024:
            return candidate

    # Suffixe HTTrack : chercher dans le dossier parent tous les fichiers
    # dont le nom commence par le segment final attendu (ex: "download").
    parent_dir = (httrack_dir / url_path).parent
    filename_stem = Path(url_path).name
    if parent_dir.is_dir():
        for f in parent_dir.iterdir():
            if f.name.startswith(filename_stem) and f.stat().st_size > 1024:
                return f

    return None


async def list_aaps(page) -> list[str]:
    """Collecte les URLs des fiches AAP sur la page de listing ARS IDF.

    Identique a ars_idf.py — navigation web normale.
    """
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

    print(f"  [ars_idf_local] {len(links)} AAP trouves sur la page de listing")
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

    pdf_urls: list[str] = await page.evaluate(
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
    httrack_dir = _get_httrack_dir()

    if not httrack_dir:
        print("  [httrack] HTTRACK_ARS_DIR non configure — PDF ignores")

    with httpx.Client(follow_redirects=True, timeout=45, headers=_HTTP_HEADERS) as client:
        for pdf_url in pdf_urls:
            if pdf_url in seen:
                continue
            seen.add(pdf_url)
            if len(fichiers) >= MAX_ATTACHMENTS:
                break

            path_parts = [p for p in urlparse(pdf_url).path.split("/") if p]
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
                print(f"  [pdf cache] {filename} ({target.stat().st_size // 1024} Ko)")

            elif httrack_dir:
                # Chercher le fichier dans le dossier HTTrack local
                local_file = _find_local_pdf(pdf_url, httrack_dir)
                if local_file:
                    import shutil
                    shutil.copy2(local_file, target)
                    local_path = str(target)
                    print(f"  [pdf httrack] {filename} ({target.stat().st_size // 1024} Ko)")
                else:
                    # Fallback : tentative de telechargement direct (PDF publics)
                    try:
                        r = client.get(pdf_url)
                        r.raise_for_status()
                        target.write_bytes(r.content)
                        local_path = str(target)
                        print(f"  [pdf web] {filename} ({len(r.content) // 1024} Ko)")
                    except Exception as e:
                        print(f"  [pdf non dispo] {pdf_url} : non trouve HTTrack ni web ({e})")
            else:
                print(f"  [pdf ignore] {pdf_url} : configurez HTTRACK_ARS_DIR")

            fichiers.append({"url": pdf_url, "filename": filename, "local_path": local_path})

    return {"text": text, "fichiers_joints": fichiers, "financeur_hint": FINANCEUR_HINT}
