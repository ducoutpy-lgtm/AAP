"""Chaîne locale des PDF (changement lecture-pdf-locale, voie A « tout local » du 2026-11-19), lancée par
chaine_pdf_locale.cmd (tâche « AAP Sante - lecture locale des PDF », lundi 23 h) : extraction des PDF jamais lus
(question du champ comprise), contrôle, qualification, import en « à valider », tri de la file. Zéro euro.

Pendant toute la chaîne, le processus demande à Windows de ne pas se mettre en veille (SetThreadExecutionState) : le
2026-11-19, une mesure locale de la séance Perroquet a échoué sur une mise en veille. Aucun réglage d'alimentation
n'est modifié ; la demande cesse à la fin de la chaîne. Une fermeture du capot ou une mise en veille demandée par
l'utilisateur l'emportent toujours.
"""
from __future__ import annotations

import os
import subprocess
import sys
from datetime import datetime
from pathlib import Path

ICI = Path(__file__).resolve().parent
SCRIPTS = ICI.parent / "scripts"
PDF = str(Path("results") / "extraction_pdf_locale.json")
# La tâche de nuit est coupée à 12 h (corrections-chaine-du-lundi 1.5, 2026-11-22) : au plus 60 PDF par nuit, environ
# 5 h au rythme mesuré de 12 PDF par heure, pour que contrôle, qualification, import et tri passent chaque nuit
PDF_PAR_NUIT = 60
ETAPES = [
    ["extraction_locale.py", "--extraire", "--seulement-pdf", "--limite", str(PDF_PAR_NUIT)],
    ["verification.py", "--verifier", "--moteur", "ollama", "--fichier", PDF],
    ["qualifier_fiches.py", "--qualifier", "--moteur", "ollama", "--fichier", PDF],
    [str(SCRIPTS / "import_to_firestore.py"), "--source", "extraction_pdf_locale", "--a-valider"],
    [str(SCRIPTS / "trier_file.py"), "--reel"],
]
ES_CONTINUOUS = 0x80000000
ES_SYSTEM_REQUIRED = 0x00000001


def _definir_etat(drapeaux: int) -> None:
    if sys.platform == "win32":
        import ctypes
        ctypes.windll.kernel32.SetThreadExecutionState(drapeaux)


def rester_eveille(actif: bool) -> None:
    """Demande (actif) ou cesse de demander à Windows de ne pas se mettre en veille."""
    _definir_etat(ES_CONTINUOUS | ES_SYSTEM_REQUIRED if actif else ES_CONTINUOUS)


def main() -> int:
    rester_eveille(True)
    try:
        for etape in ETAPES:
            print(f"--- {datetime.now():%H:%M} {Path(etape[0]).name} {' '.join(etape[1:])}", flush=True)
            # -u : sortie écrite au journal au fil de l'eau (corrections-chaine-du-lundi 1.9)
            subprocess.run([sys.executable, "-u", "-X", "utf8", "-W", "ignore", *etape], cwd=ICI,
                           env={**os.environ, "PYTHONUTF8": "1"})
    finally:
        rester_eveille(False)
    return 0


if __name__ == "__main__":
    sys.exit(main())
