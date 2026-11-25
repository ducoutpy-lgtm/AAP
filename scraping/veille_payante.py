"""Étapes payantes de la veille du lundi (changement OpenSpec veille-autonome, semaine 1 du plan, 2026-11-13).

Pourquoi : pendant le pilote, la veille s'arrêtait à un devis ; extraction, contrôle, qualification et import
attendaient une séance. Délégation de Monsieur DUCOUT, permanente depuis le 2026-11-13 : jusqu'à 0,50 euro par semaine
d'appels Haiku, devis et --plafond obligatoires pour chaque commande payante, arrêt et accord demandé avant 4,50 euros
de cumul ; import en « à valider », puis tri de la file : une fiche que le contrôle juge bonne, sans doute, est publiée,
seules les fiches douteuses restent à relire (décision du 2026-11-18, changement tri-automatique-file).

Pour chaque étape (extraction, contrôle, qualification) : devis à blanc écrit dans le journal, puis passage réel
seulement si le devis tient dans le reste du budget de la semaine (du lundi au dimanche) et sous 4,50 euros de cumul,
avec --plafond = cumul + devis ; sinon cette étape et les suivantes attendent son accord, motif écrit. Enfin import des
fiches nouvelles en « à valider » (import_to_firestore.py --a-valider).

Depuis le 2026-11-21 (changement veille-modele-local, règle « modèle local d'abord » de CLAUDE.md, réponse de Monsieur
DUCOUT « Modèle local ») : par défaut, extraction, contrôle et qualification par le modèle local (qwen3:8b), à zéro euro,
sans devis, fiches dans results/extraction_veille_locale.json ; sur batterie, ces étapes sont reportées à la veille
suivante (la carte graphique viderait la batterie). Le chemin payant ci-dessus ne sert plus que sur sa demande
(--moteur api). Nom du fichier gardé pour ne pas toucher la tâche planifiée.

Usage (depuis scraping/, environnement ../.venv) :
  python veille_payante.py                      # essai à blanc : étapes listées, rien lancé
  python veille_payante.py --reel               # modèle local (veille.cmd)
  python veille_payante.py --moteur api         # devis seulement, aucun appel
  python veille_payante.py --reel --moteur api  # API, dans la délégation, sur sa demande seulement
"""
from __future__ import annotations

import argparse
import json
import os
import re
import subprocess
import sys
from datetime import date, datetime, timedelta
from pathlib import Path

import echantillon
from chaine_pdf_locale import rester_eveille

ICI = Path(__file__).resolve().parent
PYTHON = sys.executable
MODELE = "claude-haiku-5-5"
BUDGET_SEMAINE, ARRET_CUMUL = 0.50, 4.50
FICHES_API = "results/extraction_api.json"
FICHES_VEILLE_LOCALE = "results/extraction_veille_locale.json"
MOTEUR = "ollama"  # règle « modèle local d'abord » (2026-11-21) ; « api » sur demande de Monsieur DUCOUT seulement
ETAPES_API = [("extraction", ["extraction_locale.py", "--extraire", "--moteur", "api", "--sans-pdf"]),
              ("contrôle", ["verification.py", "--verifier", "--fichier", FICHES_API]),
              ("qualification", ["qualifier_fiches.py", "--qualifier", "--fichier", FICHES_API])]
# La tâche Windows coupe la veille à 4 h (corrections-chaine-du-lundi 1.5, décision « Ordre des étapes » du 2026-11-22) :
# courriels et chiffres partent avant ce lot (veille.cmd), qui traite au plus 40 textes ; les suivants attendent le lundi
# d'après
TEXTES_PAR_VEILLE = 40
ETAPES_LOCALES = [("extraction", ["extraction_locale.py", "--extraire", "--sans-pdf", "--limite", str(TEXTES_PAR_VEILLE)]),
                  ("contrôle", ["verification.py", "--verifier", "--moteur", "ollama", "--fichier", FICHES_VEILLE_LOCALE]),
                  ("qualification", ["qualifier_fiches.py", "--qualifier", "--moteur", "ollama", "--fichier",
                                     FICHES_VEILLE_LOCALE])]


def etapes(moteur: str) -> list[tuple[str, list[str]]]:
    return ETAPES_API if moteur == "api" else ETAPES_LOCALES


def source_import(moteur: str) -> str:
    """Nom du fichier de résultats importé en « à valider » (import_to_firestore.py --source)."""
    return Path(FICHES_API if moteur == "api" else FICHES_VEILLE_LOCALE).stem


def local_permis(etat_ac: int) -> bool:
    """ACLineStatus de Windows : 0 = batterie (modèle local reporté), 1 = secteur, 255 = inconnu (poste fixe : lancé)."""
    return etat_ac != 0


def etat_secteur() -> int:
    """État de l'alimentation lu par GetSystemPowerStatus ; 255 (inconnu) hors Windows ou en cas d'échec."""
    if sys.platform != "win32":
        return 255
    import ctypes

    class _Etat(ctypes.Structure):
        _fields_ = [("ACLineStatus", ctypes.c_ubyte), ("BatteryFlag", ctypes.c_ubyte),
                    ("BatteryLifePercent", ctypes.c_ubyte), ("SystemStatusFlag", ctypes.c_ubyte),
                    ("BatteryLifeTime", ctypes.c_ulong), ("BatteryFullLifeTime", ctypes.c_ulong)]
    etat = _Etat()
    return etat.ACLineStatus if ctypes.windll.kernel32.GetSystemPowerStatus(ctypes.byref(etat)) else 255
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
    # Sortie des scripts enfants imposée en UTF-8 (2026-11-16) : sous Windows, elle arrivait en encodage local
    # (« estim�s »), le devis du contrôle devenait illisible et la veille s'arrêtait à cette étape
    # Sortie écrite au journal au fil de l'eau (corrections-chaine-du-lundi 1.9, 2026-11-22) : une étape locale dure des
    # heures, et une coupure par la limite de la tâche ne laissait sinon aucune trace de l'endroit où elle s'arrêtait
    env = {**os.environ, "PYTHONUTF8": "1"}
    p = subprocess.Popen([PYTHON, "-u", *arguments], cwd=ICI, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True,
                         encoding="utf-8", errors="replace", env=env)
    lignes: list[str] = []
    assert p.stdout is not None  # stdout=PIPE : toujours un flux
    for ligne in p.stdout:
        lignes.append(ligne)
        print(ligne, end="", flush=True)
    return p.wait(), "".join(lignes)


def importer_et_trier(moteur: str) -> int:
    print("--- import des fiches nouvelles en « à valider »", flush=True)
    code, _ = lancer([str(ICI.parent / "scripts" / "import_to_firestore.py"), "--source", source_import(moteur),
                      "--a-valider"])
    if code != 0:
        return code
    # Tri de la file (changement tri-automatique-file, décision du 2026-11-18) : doublons rejetés, fiches sans doute
    # publiées, seules les fiches douteuses restent pour Monsieur DUCOUT
    print("--- tri de la file « à valider »", flush=True)
    code, _ = lancer([str(ICI.parent / "scripts" / "trier_file.py"), "--reel"])
    return code


def veille_locale(reel: bool) -> int:
    """Étapes par le modèle local, sans devis (zéro euro) ; reportées sur batterie, les textes restent en attente."""
    if not reel:
        for nom, commande in ETAPES_LOCALES:
            print(f"--- {nom} : essai à blanc, étape non lancée ({' '.join(commande)})", flush=True)
        return 0
    if not local_permis(etat_secteur()):
        print("--- sur batterie : étapes du modèle local reportées à la veille suivante (textes gardés en attente)",
              flush=True)
        return 0
    rester_eveille(True)
    try:
        for nom, commande in ETAPES_LOCALES:
            print(f"--- {nom} : modèle local ({datetime.now():%Y-%m-%d %H:%M}, zéro euro)", flush=True)
            code, _ = lancer(commande)
            if code != 0:
                print(f"--- {nom} : arrêt (code {code}), étapes suivantes non lancées", flush=True)
                return code
        return importer_et_trier("ollama")
    finally:
        rester_eveille(False)


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Étapes de la veille qui demandent un modèle (local par défaut).")
    parser.add_argument("--reel", action="store_true", help="lancer les étapes (en API : celles dont le devis tient)")
    parser.add_argument("--moteur", choices=["ollama", "api"], default=MOTEUR,
                        help="ollama (défaut, zéro euro) ou api (Haiku, sur demande de Monsieur DUCOUT seulement)")
    args = parser.parse_args(argv)
    if args.moteur != "api":
        return veille_locale(args.reel)
    journal = echantillon.JOURNAL_COUTS
    for nom, commande in ETAPES_API:
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
        return importer_et_trier("api")
    return 0


if __name__ == "__main__":
    sys.exit(main())
