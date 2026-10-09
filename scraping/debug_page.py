"""Script de diagnostic : ouvre une URL et dump tout ce qu on peut en apprendre.

Usage :
    python debug_page.py <url>

Si aucune URL fournie, utilise la page de liste Fondation de France.

Sorties dans debug/ :
  - page.html        : le HTML complet apres rendu
  - screenshot.png   : capture plein page
  - links.txt        : tous les liens avec leur texte
  - console.log      : messages console du navigateur
"""
from __future__ import annotations

import asyncio
import sys
from pathlib import Path

from playwright.async_api import async_playwright

from utils import accept_cookies, ensure_utf8_stdout, make_browser_context

DEFAULT_URL = "https://www.fondationdefrance.org/fr/appels-a-projets"
DEBUG_DIR = Path("debug")


async def main(url: str) -> None:
    DEBUG_DIR.mkdir(exist_ok=True)

    async with async_playwright() as p:
        # Mode visible pour qu on voie ce qui se passe
        browser = await p.chromium.launch(headless=False)
        context = await make_browser_context(browser)
        page = await context.new_page()

        console_msgs: list[str] = []
        page.on("console", lambda msg: console_msgs.append(f"[{msg.type}] {msg.text}"))

        print(f"[1/6] Navigation vers : {url}")
        await page.goto(url, wait_until="domcontentloaded", timeout=60000)
        print(f"[2/6] Page chargee. Titre = {await page.title()!r}")

        if await accept_cookies(page):
            print("[cookies] banniere fermee")
        else:
            print("[cookies] aucun bouton trouve (ou pas de banniere)")
        await page.wait_for_timeout(2000)

        print("[3/6] Scroll pour declencher le lazy loading...")
        for _ in range(5):
            await page.mouse.wheel(0, 3000)
            await page.wait_for_timeout(1200)

        print("[4/6] Extraction du HTML complet et des liens...")
        html = await page.content()
        (DEBUG_DIR / "page.html").write_text(html, encoding="utf-8")

        links = await page.evaluate(
            """
            () => {
              const anchors = Array.from(document.querySelectorAll('a[href]'));
              return anchors.map(a => ({
                href: a.href,
                text: (a.innerText || a.textContent || '').trim().slice(0, 100),
              }));
            }
            """
        )
        lines = [f"Total anchors: {len(links)}\n", "-" * 80 + "\n"]
        for lk in links:
            lines.append(f"{lk['href']}\n    {lk['text']}\n")
        (DEBUG_DIR / "links.txt").write_text("".join(lines), encoding="utf-8")
        print(f"       {len(links)} liens trouves -> debug/links.txt")

        print("[5/6] Capture d ecran pleine page...")
        await page.screenshot(path=str(DEBUG_DIR / "screenshot.png"), full_page=True)

        print("[6/6] Apercu des 40 premiers liens :")
        print("-" * 80)
        for lk in links[:40]:
            print(f"  {lk['href']}")
            if lk["text"]:
                print(f"      \u00ab {lk['text'][:80]} \u00bb")

        (DEBUG_DIR / "console.log").write_text("\n".join(console_msgs), encoding="utf-8")

        print("\n[OK] Inspection terminee.")
        print(f"     HTML       : {DEBUG_DIR / 'page.html'}")
        print(f"     Liens      : {DEBUG_DIR / 'links.txt'}")
        print(f"     Screenshot : {DEBUG_DIR / 'screenshot.png'}")
        print(f"     Console    : {DEBUG_DIR / 'console.log'}")

        print("\nLa fenetre va rester ouverte 10 s pour que tu puisses regarder la page.")
        await page.wait_for_timeout(10000)

        await browser.close()


if __name__ == "__main__":
    ensure_utf8_stdout()
    url = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_URL
    asyncio.run(main(url))
