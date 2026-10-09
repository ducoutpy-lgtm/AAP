"""Orchestrateur commun a toutes les sources.

Rend les scrapers source triviaux : il suffit de fournir list_aaps() et
fetch_detail(). L orchestrateur gere :
  - navigateur Playwright + cookies + user-agent standardises
  - cache inter-runs par signature (pas de re-appel Claude si deja extrait)
  - persistance incrementale (resultats sauves apres chaque AAP)
  - cap MAX_AAPS surchargable via env
  - journal d erreurs typees
"""
from __future__ import annotations

import hashlib
import os
import traceback
from pathlib import Path

from playwright.async_api import async_playwright
from pydantic import ValidationError

from extractor import extract_aap
from schema import AapNormalized
from utils import make_browser_context, utc_now_iso, write_json

RESULTS_DIR = Path("results")
DOWNLOADS_DIR = Path("downloads")
DEFAULT_MAX_AAPS = 100


def _signature(titre: str, financeur: str, date_cloture: str | None) -> str:
    base = f"{(titre or '').strip().lower()}|{(financeur or '').strip().lower()}|{date_cloture or ''}"
    return hashlib.sha1(base.encode("utf-8")).hexdigest()[:16]


def _load_previous(source_name: str) -> dict[str, dict]:
    """Indexe les AAP du run precedent par url_source pour cache inter-runs."""
    previous = RESULTS_DIR / f"{source_name}.json"
    if not previous.exists():
        return {}
    try:
        import json
        data = json.loads(previous.read_text(encoding="utf-8"))
        return {aap["url_source"]: aap for aap in data if aap.get("url_source")}
    except (OSError, ValueError, KeyError):
        return {}


async def process_source(source_name: str, source_module) -> None:
    max_aaps = int(os.getenv("MAX_AAPS", str(DEFAULT_MAX_AAPS)))
    force_refresh = os.getenv("FORCE_REFRESH", "0") == "1"

    RESULTS_DIR.mkdir(parents=True, exist_ok=True)
    downloads = DOWNLOADS_DIR / source_name
    downloads.mkdir(parents=True, exist_ok=True)

    cache = {} if force_refresh else _load_previous(source_name)
    print(f"\n=== Source : {source_name} ===")
    if cache:
        print(f"[cache] {len(cache)} AAP connus du run precedent (skip si URL inchangee)")

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await make_browser_context(browser)
        page = await context.new_page()

        try:
            print("[*] Listage des AAP...")
            urls = await source_module.list_aaps(page)
            urls = list(dict.fromkeys(urls))
            print(f"[*] {len(urls)} URLs candidates trouvees.")

            results: list[dict] = []
            errors: list[dict] = []
            n_cached = n_extracted = 0

            for i, url in enumerate(urls[:max_aaps], start=1):
                label = f"[{i}/{min(len(urls), max_aaps)}]"
                # Cache inter-runs : si l URL etait deja dans le run precedent,
                # on reutilise l extraction (pas d appel Claude).
                if url in cache:
                    cached_entry = {**cache[url]}
                    cached_entry.setdefault("scrape_metadata", {})["last_seen_at"] = utc_now_iso()
                    results.append(cached_entry)
                    n_cached += 1
                    print(f"{label} [cache] {url}")
                    _persist(source_name, results, errors)
                    continue

                print(f"\n{label} {url}")
                try:
                    detail = await source_module.fetch_detail(page, url, downloads)
                    text = detail.get("text", "")
                    if not text or len(text) < 200:
                        print("  ! Texte trop court, on saute.")
                        errors.append({"url": url, "error": "texte_trop_court"})
                        continue

                    extracted = extract_aap(
                        text=text,
                        url=url,
                        financeur_hint=detail.get("financeur_hint", ""),
                        source=source_name,
                    )
                    extracted["url_source"] = url
                    extracted["fichiers_joints"] = detail.get("fichiers_joints", [])
                    extracted["scrape_metadata"] = {
                        "scraped_at": utc_now_iso(),
                        "last_seen_at": utc_now_iso(),
                        "source": source_name,
                        "signature": _signature(
                            extracted.get("titre", ""),
                            extracted.get("financeur", ""),
                            extracted.get("date_cloture"),
                        ),
                    }

                    try:
                        aap = AapNormalized(**extracted)
                        results.append(aap.model_dump())
                        n_extracted += 1
                        print(f"  OK  titre: {aap.titre[:80]}")
                        print(f"      cloture: {aap.date_cloture}  pieces: {len(aap.fichiers_joints)}")
                    except ValidationError as ve:
                        print(f"  ! Validation schema: {ve}")
                        errors.append({"url": url, "error": f"validation: {ve}"})

                except Exception as e:
                    print(f"  !! Erreur : {type(e).__name__}: {e}")
                    errors.append({
                        "url": url,
                        "error_type": type(e).__name__,
                        "error": str(e),
                        "trace": traceback.format_exc(),
                    })

                # Persistance incrementale : en cas de crash, on ne perd pas tout.
                _persist(source_name, results, errors)

            print(f"\n[*] {len(results)} AAP sauvegardes dans {RESULTS_DIR / (source_name + '.json')}")
            print(f"    dont {n_cached} issus du cache et {n_extracted} nouvelles extractions.")
            if errors:
                print(f"[*] {len(errors)} erreurs dans {RESULTS_DIR / (source_name + '.errors.json')}")

        finally:
            await browser.close()


def _persist(source_name: str, results: list[dict], errors: list[dict]) -> None:
    """Ecrit les resultats et erreurs au fil de l eau (idempotent)."""
    write_json(RESULTS_DIR / f"{source_name}.json", results)
    if errors:
        write_json(RESULTS_DIR / f"{source_name}.errors.json", errors)
