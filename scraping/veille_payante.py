"""Étapes payantes de la veille du lundi (changement OpenSpec veille-autonome, semaine 1 du plan, 2026-11-13).

Pourquoi : pendant le pilote, la veille s'arrêtait à un devis ; extraction, contrôle, qualification et import
attendaient une séance. Délégation de Monsieur DUCOUT, permanente depuis le 2026-11-13 : jusqu'à 0,50 euro par semaine
d'appels Haiku, devis et --plafond obligatoires pour chaque commande payante, arrêt et accord demandé avant 4,50 euros
de cumul ; import en « à valider », jamais en « validée ».

Pour chaque étape (extraction, contrôle, qualification) : devis à blanc écrit dans le journal, puis passage réel
seulement si le devis tient dans le reste du budget de la semaine (du lundi au dimanche) et sous 4,50 euros de cumul,
avec --plafond = cumul + devis ; sinon cette étape et les suivantes attendent son accord, motif écrit. Enfin import des
fiches nouvelles en « à valider » (import_to_firestore.py --a-valider).

Usage (depuis scraping/, environnement ../.venv) :
  python veille_payante.py          # devis seulement, aucun appel
  python veille_payante.py --reel   # dans la délégation (veille.cmd)
"""
from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
from datetime import date, datetime, timedelta
from pathlib import Path

import echantillon

ICI = Path(__file__).resolve().parent
PYTHON = sys.executable
MODELE = "claude-haiku-5-5"
BUDGET_SEMAINE, ARRET_CUMUL = 0.50, 4.50
FICHES_API = "results/extraction_api.json"
ETAPES = [("extraction", ["extraction_locale.py", "--extraire", "--moteur", "api"]),
          ("contrôle", ["verification.py", "--verifier", "--fichier", FICHES_API]),
          ("qualification", ["qualifier_fiches.py", "--qualifier", "--fichier", FICHES_API])]
DEVIS = re.compile(r"(\d+(?:\.\d+)?) euros (?:au plus|estimés)")
# Le controle et la qualification sous-estiment leur cout (0,0003 euro par fiche annonce, environ 0,0006 mesure le
# 2026-11-13 : arret au plafond apres 9 fiches sur 16) ; le devis retenu double leur estimation. L'extraction annonce
# deja un maximum (trois appels par texte).
MARGES = {"extraction": 1.0, "contrôle": 2.0, "qualification": 2.0}


def lundi_de(jour: date) -> date:
    return jour - timedelta(days=jour.weekday())


def depense_semaine(lignes: list[str], lundi: date, modele: str = MODELE) -> float:
    """Euros dépensés avec ce modèle depuis le lundi donné, d'après les lignes du journal des coûts (fonction pure)."""
    total = 0.0
    for ligne in lignes:
        if ligne.strip():
            d = json.loads(ligne)
            if d.get("model") == modele and (d.get("timestamp") or "")[:10] >= lundi.isoformat():
                total += float(d.get("cost_eur_approx") or 0)
    return total


def montant_devis(sortie: str) -> float | None:
    """Montant lu dans la sortie à blanc d'un outil (« 0.07 euros au plus », « 0.004 euros estimés »), sinon None."""
    trouves = DEVIS.findall(sortie)
    return float(trouves[-1]) if trouves else None


def devis_retenu(etape: str, devis: float | None) -> float | None:
    """Devis retenu pour une etape : estimation de l'outil multipliee par la marge mesuree (fonction pure)."""
    return None if devis is None else round(devis * MARGES[etape], 4)


def decision(devis: float | None, depense: float, cumul: float) -> tuple[bool, float, str]:
    """(lancer, plafond, motif) d'une étape selon la délégation (fonction pure)."""
    if devis is None:
        return False, cumul, "devis illisible : accord de Monsieur DUCOUT demandé"
    plafond = round(cumul + devis, 3)
    if devis > BUDGET_SEMAINE - depense + 1e-9:
        return False, plafond, (f"devis {devis:.3f} euro au-delà du reste de la semaine ({BUDGET_SEMAINE - depense:.3f}) : "
                                "accord de Monsieur DUCOUT demandé")
    if plafond > ARRET_CUMUL:
        return False, plafond, f"cumul après l'étape {plafond:.3f} euros, au-delà de 4,50 : accord de Monsieur DUCOUT demandé"
    return True, plafond, "dans la délégation"


def lancer(arguments: list[str]) -> tuple[int, str]:
    r = subprocess.run([PYTHON, *arguments], cwd=ICI, capture_output=True, text=True, encoding="utf-8", errors="replace")
    sortie = (r.stdout or "") + (r.stderr or "")
    print(sortie.rstrip(), flush=True)
    return r.returncode, sortie


def main() -> int:
    parser = argparse.ArgumentParser(description="Étapes payantes de la veille, dans la délégation de Monsieur DUCOUT.")
    parser.add_argument("--reel", action="store_true", help="lancer les étapes dont le devis tient dans la délégation")
    args = parser.parse_args()
    journal = echantillon.JOURNAL_COUTS
    for nom, commande in ETAPES:
        lignes = journal.read_text(encoding="utf-8").splitlines() if journal.exists() else []
        depense, cumul = depense_semaine(lignes, lundi_de(date.today())), echantillon.cout_cumule(MODELE)
        print(f"--- {nom} : devis à blanc ({datetime.now():%Y-%m-%d %H:%M}, dépensé cette semaine {depense:.3f} euro "
              f"sur {BUDGET_SEMAINE:.2f}, cumul {cumul:.3f})", flush=True)
        _, sortie = lancer([*commande, "--dry-run"])
        estime = montant_devis(sortie)
        if estime == 0:
            print(f"--- {nom} : rien à faire", flush=True)
            continue
        devis = devis_retenu(nom, estime)
        ok, plafond, motif = decision(devis, depense, cumul)
        print(f"--- {nom} : estimation de l'outil {estime if estime is not None else '?'} euro, devis retenu "
              f"{devis if devis is not None else '?'} euro ; {motif}", flush=True)
        if not ok:
            return 0
        if not args.reel:
            print(f"--- {nom} : essai à blanc, étape non lancée (plafond prévu {plafond:.3f})", flush=True)
            continue
        code, _ = lancer([*commande, "--plafond", f"{plafond:.3f}"])
        if code != 0:
            print(f"--- {nom} : arrêt (code {code}), étapes suivantes non lancées", flush=True)
            return code
    if args.reel:
        print("--- import des fiches nouvelles en « à valider »", flush=True)
        code, _ = lancer([str(ICI.parent / "scripts" / "import_to_firestore.py"), "--source", "extraction_api", "--a-valider"])
        return code
    return 0


if __name__ == "__main__":
    sys.exit(main())
