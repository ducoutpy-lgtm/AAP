"""Point d entree du POC.

Usage :
    python run.py --source fondation_de_france
"""
from __future__ import annotations

import argparse
import asyncio
import importlib

from dotenv import load_dotenv

from orchestrator import process_source
from utils import ensure_utf8_stdout


def main() -> None:
    ensure_utf8_stdout()
    load_dotenv(override=True)

    parser = argparse.ArgumentParser(description="POC scraping AAP Sante")
    parser.add_argument(
        "--source",
        required=True,
        help="Nom du module dans sources/ (sans extension), ex: fondation_de_france",
    )
    args = parser.parse_args()

    try:
        module = importlib.import_module(f"sources.{args.source}")
    except ModuleNotFoundError as e:
        raise SystemExit(f"Source introuvable : sources/{args.source}.py  ({e})")

    asyncio.run(process_source(args.source, module))


if __name__ == "__main__":
    main()
