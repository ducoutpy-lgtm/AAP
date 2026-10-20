"""Envoi de courriels (jour 3 du plan MVP, changement OpenSpec alertes-courriel, 2026-10-20).

Pourquoi en Python et non en fonction serveur : la veille tourne déjà sur le PC le lundi matin ; un envoi SMTP depuis
le même script évite de déployer des fonctions. La boîte d'envoi est celle d'ARCADIA (Zoho Mail), avec un mot de passe
d'application lu dans scraping/.env et jamais affiché.

Variables de scraping/.env :
  SMTP_HOTE=smtp.zoho.eu        SMTP_PORT=465 (SSL)       SMTP_UTILISATEUR=adresse@domaine.fr
  SMTP_MOT_DE_PASSE=...         COURRIEL_EXPEDITEUR=adresse@domaine.fr (défaut : l'utilisateur)
  COURRIEL_ADMIN=adresse qui reçoit le bilan hebdomadaire

Sans configuration, ou avec --dry-run, chaque courriel est écrit dans logs/courriels/ au lieu d'être envoyé.
Usage : python courriel.py --test [--dry-run]
"""
from __future__ import annotations

import argparse
import os
import re
import smtplib
import sys
from datetime import datetime
from email.message import EmailMessage
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import echantillon  # noqa: E402

ICI = Path(__file__).resolve().parent
DOSSIER_COURRIELS = ICI / "logs" / "courriels"


def charger_config() -> dict | None:
    """Configuration SMTP depuis l'environnement, ou None si incomplète (la valeur du mot de passe n'est jamais lue
    ailleurs que par smtplib)."""
    echantillon.charger_env()
    utilisateur = os.getenv("SMTP_UTILISATEUR", "").strip()
    mot_de_passe = os.getenv("SMTP_MOT_DE_PASSE", "")
    if not utilisateur or not mot_de_passe:
        return None
    return {"hote": os.getenv("SMTP_HOTE", "smtp.zoho.eu").strip(), "port": int(os.getenv("SMTP_PORT", "465")),
            "utilisateur": utilisateur, "mot_de_passe": mot_de_passe,
            "expediteur": os.getenv("COURRIEL_EXPEDITEUR", utilisateur).strip(), "admin": os.getenv("COURRIEL_ADMIN", "").strip()}


def nom_fichier(destinataire: str, sujet: str, maintenant: datetime | None = None) -> str:
    """Nom lisible et sûr : horodatage, destinataire, sujet abrégé (fonction pure)."""
    quand = (maintenant or datetime.now()).strftime("%Y-%m-%d_%H%M%S")
    dest = re.sub(r"[^a-z0-9]+", "-", destinataire.lower()).strip("-")[:40]
    suj = re.sub(r"[^a-z0-9]+", "-", sujet.lower()).strip("-")[:40]
    return f"{quand}_{dest}_{suj}.txt"


def ecrire_courriel(destinataire: str, sujet: str, texte: str, dossier: Path = DOSSIER_COURRIELS) -> Path:
    dossier.mkdir(parents=True, exist_ok=True)
    chemin = dossier / nom_fichier(destinataire, sujet)
    chemin.write_text(f"À : {destinataire}\nObjet : {sujet}\n\n{texte}", encoding="utf-8")
    return chemin


def envoyer(destinataire: str, sujet: str, texte: str, dry_run: bool = False) -> str:
    """Envoie, ou écrit dans logs/courriels/ si --dry-run ou configuration absente. Retourne un compte rendu court."""
    config = charger_config()
    if dry_run or config is None:
        chemin = ecrire_courriel(destinataire, sujet, texte)
        raison = "essai à blanc" if dry_run else "boîte d'envoi non configurée (SMTP_UTILISATEUR, SMTP_MOT_DE_PASSE dans scraping/.env)"
        return f"non envoyé ({raison}) : {chemin.name}"
    message = EmailMessage()
    message["From"] = config["expediteur"]
    message["To"] = destinataire
    message["Subject"] = sujet
    message.set_content(texte)
    with smtplib.SMTP_SSL(config["hote"], config["port"], timeout=30) as smtp:
        smtp.login(config["utilisateur"], config["mot_de_passe"])
        smtp.send_message(message)
    return f"envoyé à {destinataire}"


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--test", action="store_true", help="envoie un courriel de test à COURRIEL_ADMIN")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()
    if args.test:
        config = charger_config()
        dest = (config or {}).get("admin") or os.getenv("COURRIEL_ADMIN", "") or "admin@exemple.fr"
        print(envoyer(dest, "AAP Santé : courriel de test", "Si vous lisez ceci, la boîte d'envoi d'AAP Santé fonctionne.", args.dry_run))
        return 0
    parser.print_help()
    return 0


if __name__ == "__main__":
    sys.exit(main())
