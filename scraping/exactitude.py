"""Mesure d'exactitude des fiches extraites (changement OpenSpec mesure-exactitude-30-fiches, 2026-11-16).

Critère « Exactitude » du pilote (docs/PILOTE_MVP.md) : 30 fiches produites pendant le pilote et classées dans le champ,
comparées à leur texte source sur le titre, le financeur, la date limite et le montant ; seuil : 90 % de champs justes
et aucune date inventée. Zéro euro : aucun appel au modèle.

    python exactitude.py --tirer      # results/exactitude_tirage.json (tirage rejouable, graine fixe)
    python exactitude.py --rapport    # EXACTITUDE.md d'après sources/exactitude_verdicts.json

Verdicts (écrits par la session, champ par champ, contre le texte que le modèle a lu) : juste, faux, invente (valeur
absente du texte), manque (valeur présente dans le texte, champ vide), vide-juste (rien dans le texte, champ vide).
"""
from __future__ import annotations

import argparse
import json
import random
import sys
from pathlib import Path

from champ import DANS_LE_CHAMP

ICI = Path(__file__).resolve().parent
EXTRACTION = ICI / "results" / "extraction_api.json"
TIRAGE = ICI / "results" / "exactitude_tirage.json"
VERDICTS = ICI / "sources" / "exactitude_verdicts.json"
RAPPORT = ICI / "EXACTITUDE.md"

CHAMPS = ("titre", "financeur", "date_cloture", "montant")
JUSTES = {"juste", "vide-juste"}
GRAINE = 20261116
SEUIL = 0.90


def tirer(fiches: list[dict], n: int = 30, graine: int = GRAINE, debut: str = "2026-10-28", fin: str = "2026-11-11") -> list[dict]:
    """n fiches produites entre `debut` et `fin` (inclus) et classées santé ou médico-social ; l'ordre d'entrée ne compte
    pas (tri par adresse avant le tirage), la graine fixe rend le tirage rejouable (fonction pure)."""
    meta = lambda f: f.get("scrape_metadata") or {}  # noqa: E731
    candidates = sorted((f for f in fiches if debut <= meta(f).get("produite_le", "")[:10] <= fin
                         and meta(f).get("champ") in DANS_LE_CHAMP), key=lambda f: f.get("url_source") or "")
    choix = random.Random(graine).sample(candidates, min(n, len(candidates)))
    return [{"url": f.get("url_source"), "titre": f.get("titre"), "financeur": f.get("financeur"),
             "date_cloture": f.get("date_cloture"),
             "montant": {"min": f.get("montant_min"), "max": f.get("montant_max"), "enveloppe": f.get("enveloppe_globale")},
             "fichier": meta(f).get("fichier")} for f in choix]


def _verdict(v: dict, champ: str) -> str | None:
    return (v["champs"].get(champ) or {}).get("verdict")


def resume(verdicts: list[dict]) -> dict:
    """Champs justes au total et par champ, dates inventées, seuil (fonction pure)."""
    par_champ = {c: {"justes": sum(_verdict(v, c) in JUSTES for v in verdicts), "total": len(verdicts)} for c in CHAMPS}
    dates_inventees = sum(_verdict(v, "date_cloture") == "invente" for v in verdicts)
    justes = sum(x["justes"] for x in par_champ.values())
    total = len(verdicts) * len(CHAMPS)
    part = justes / total if total else 0.0
    return {"justes": justes, "total": total, "part": part, "par_champ": par_champ, "dates_inventees": dates_inventees,
            "seuil_atteint": total > 0 and part >= SEUIL and dates_inventees == 0}


def _pourcent(x: float) -> str:
    return f"{x * 100:.1f}".replace(".", ",") + " %"


def texte_rapport(r: dict, verdicts: list[dict]) -> str:
    lignes = ["# Mesure d'exactitude des fiches (pilote)", "",
              "Changement `mesure-exactitude-30-fiches`. Fiches tirées par `exactitude.py --tirer` (graine "
              f"{GRAINE}), comparées par la session au texte source que le modèle a lu. Zéro euro.", "",
              f"- {r['justes']} / {r['total']} champs justes ({_pourcent(r['part'])})",
              f"- Dates inventées : {r['dates_inventees']}",
              f"- Conclusion : {'seuil atteint' if r['seuil_atteint'] else 'seuil non atteint'} (90 % au moins et aucune date inventée)", "",
              "| Champ | Justes | Total | Part |", "|---|---|---|---|"]
    for c, x in r["par_champ"].items():
        lignes.append(f"| {c} | {x['justes']} | {x['total']} | {_pourcent(x['justes'] / x['total']) if x['total'] else '-'} |")
    ecarts = [(v["url"], c, v["champs"][c]) for v in verdicts for c in CHAMPS
              if _verdict(v, c) not in JUSTES]
    lignes += ["", "## Écarts", ""]
    lignes += [f"- {c} ({x['verdict']}) : {url} ; {x.get('preuve', '')}" for url, c, x in ecarts] or ["Aucun."]
    lignes += ["", "## Dix fiches à relire par Monsieur DUCOUT (les dix premières du tirage)", ""]
    lignes += [f"{i}. {v['url']}" for i, v in enumerate(verdicts[:10], 1)]
    return "\n".join(lignes) + "\n"


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--tirer", action="store_true")
    parser.add_argument("--rapport", action="store_true")
    args = parser.parse_args()
    if args.tirer:
        tirage = tirer(json.loads(EXTRACTION.read_text(encoding="utf-8")))
        TIRAGE.write_text(json.dumps(tirage, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"{len(tirage)} fiches tirées -> {TIRAGE.name}")
    if args.rapport:
        verdicts = json.loads(VERDICTS.read_text(encoding="utf-8"))
        r = resume(verdicts)
        RAPPORT.write_text(texte_rapport(r, verdicts), encoding="utf-8")
        print(f"{r['justes']} / {r['total']} champs justes, dates inventées : {r['dates_inventees']} -> {RAPPORT.name}")
    if not (args.tirer or args.rapport):
        parser.print_help()
    return 0


if __name__ == "__main__":
    sys.exit(main())
