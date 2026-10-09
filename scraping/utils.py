"""Utilitaires partages entre orchestrator, scrapers sources et debug.

Centralise les helpers repetes : ouverture navigateur, cookies, datetime UTC,
encodage stdout Windows, lecture/ecriture JSONL.
"""
from __future__ import annotations

import json
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Iterable

# -------------------- stdout --------------------

def ensure_utf8_stdout() -> None:
    """Force stdout en UTF-8 sous Windows pour eviter UnicodeEncodeError
    lors du print de titres AAP contenant des caracteres non cp1252."""
    for stream in (sys.stdout, sys.stderr):
        reconfigure = getattr(stream, "reconfigure", None)
        if reconfigure is not None:
            try:
                reconfigure(encoding="utf-8", errors="replace")
            except Exception:
                pass


# -------------------- datetime --------------------

def utc_now_iso() -> str:
    """Horodatage ISO 8601 UTC avec suffixe Z (datetime.utcnow est deprecie)."""
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


# -------------------- JSONL --------------------

def append_jsonl(path: Path, entry: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("a", encoding="utf-8") as f:
        f.write(json.dumps(entry, ensure_ascii=False) + "\n")


def read_jsonl(path: Path) -> list[dict]:
    if not path.exists():
        return []
    with path.open(encoding="utf-8") as f:
        return [json.loads(line) for line in f if line.strip()]


def write_json(path: Path, data: object) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        json.dumps(data, ensure_ascii=False, indent=2, default=str),
        encoding="utf-8",
    )


# -------------------- Playwright helpers --------------------

DEFAULT_USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/131.0.0.0 Safari/537.36"
)

# Headers HTTP a utiliser pour tous les telechargements httpx.
# Regle : toujours simuler un navigateur reel (User-Agent Chrome).
# Les sites gouvernementaux français bloquent les bots identifies (User-Agent "Bot/0.1").
DEFAULT_HTTP_HEADERS = {
    "User-Agent": DEFAULT_USER_AGENT,
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "fr-FR,fr;q=0.9",
}

DEFAULT_COOKIE_SELECTORS = [
    "button:has-text('Accepter')",
    "button:has-text('Tout accepter')",
    "button:has-text('J accepte')",
    "#axeptio_btn_acceptAll",
    "button[aria-label*='ccepter']",
]


async def make_browser_context(browser, *, viewport=(1400, 900)):
    """Cree un context Playwright standardise (UA Chrome recent, fr-FR)."""
    w, h = viewport
    return await browser.new_context(
        accept_downloads=True,
        user_agent=DEFAULT_USER_AGENT,
        locale="fr-FR",
        viewport={"width": w, "height": h},
    )


async def accept_cookies(page, selectors: Iterable[str] = DEFAULT_COOKIE_SELECTORS) -> bool:
    """Tente de fermer une banniere cookies. Retourne True si un clic a reussi."""
    for selector in selectors:
        try:
            await page.click(selector, timeout=2000)
            await page.wait_for_timeout(500)
            return True
        except Exception:
            continue
    return False
