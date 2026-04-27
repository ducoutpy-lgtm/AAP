"""Analyse le journal de consommation API Claude.

Usage :
  python analyze_costs.py            # tout le journal
  python analyze_costs.py --today    # aujourd hui uniquement
  python analyze_costs.py --source fondation_de_france
"""
from __future__ import annotations

import argparse
import json
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path

LOG_FILE = Path("logs/extraction_costs.jsonl")


def load(path: Path) -> list[dict]:
    if not path.exists():
        return []
    with path.open(encoding="utf-8") as f:
        return [json.loads(line) for line in f if line.strip()]


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--today", action="store_true")
    ap.add_argument("--source", default=None)
    args = ap.parse_args()

    entries = load(LOG_FILE)
    if args.today:
        today = datetime.now(timezone.utc).date().isoformat()
        entries = [e for e in entries if e["timestamp"].startswith(today)]
    if args.source:
        entries = [e for e in entries if e.get("source") == args.source]

    if not entries:
        print("Aucune entree dans le journal pour ces filtres.")
        return

    by_source: dict[str, list[dict]] = defaultdict(list)
    for e in entries:
        by_source[e.get("source", "inconnu")].append(e)

    print(f"{'=' * 72}")
    print(f"{'Source':<30} {'AAP':>6} {'InTok':>10} {'OutTok':>8} {'USD':>8} {'EUR':>8}")
    print(f"{'-' * 72}")
    tot_in = tot_out = tot_cache_r = tot_cache_w = 0
    tot_usd = tot_eur = 0.0
    for src, items in sorted(by_source.items()):
        s_in = sum(e["input_tokens"] for e in items)
        s_out = sum(e["output_tokens"] for e in items)
        s_cr = sum(e.get("cache_read_tokens", 0) for e in items)
        s_cw = sum(e.get("cache_creation_tokens", 0) for e in items)
        s_usd = sum(e["cost_usd"] for e in items)
        s_eur = sum(e["cost_eur_approx"] for e in items)
        print(f"{src:<30} {len(items):>6} {s_in:>10} {s_out:>8} {s_usd:>8.4f} {s_eur:>8.4f}")
        tot_in += s_in; tot_out += s_out; tot_cache_r += s_cr; tot_cache_w += s_cw
        tot_usd += s_usd; tot_eur += s_eur

    print(f"{'-' * 72}")
    print(f"{'TOTAL':<30} {len(entries):>6} {tot_in:>10} {tot_out:>8} {tot_usd:>8.4f} {tot_eur:>8.4f}")
    print(f"{'=' * 72}")
    print(f"Cache read tokens : {tot_cache_r}  |  cache write : {tot_cache_w}")
    if entries:
        avg_eur = tot_eur / len(entries)
        print(f"Cout moyen / AAP  : {avg_eur:.4f} EUR")
        # Projection a 5 sources x 50 AAP/jour
        print(f"Projection 5 src x 50 AAP / jour  : {avg_eur * 250:.2f} EUR/jour  =  {avg_eur * 250 * 30:.1f} EUR/mois (sans delta scraping)")
        print(f"Projection avec delta scraping 5% : {avg_eur * 250 * 0.05 * 30:.2f} EUR/mois")

    # Top 5 les plus chers
    top = sorted(entries, key=lambda e: e["cost_usd"], reverse=True)[:5]
    print("\nTop 5 des AAP les plus couteux :")
    for e in top:
        print(f"  {e['cost_eur_approx']:.4f} EUR | {e['input_tokens']:>6} in / {e['output_tokens']:>5} out | {e['url'][:80]}")


if __name__ == "__main__":
    main()
