"""Assistant de configuration de la boîte d'envoi (changement alertes-courriel, 2026-10-21).

Pourquoi : Monsieur DUCOUT ne savait « ni où mettre, ni quoi mettre ». Ce script pose les questions une par une dans
la fenêtre noire, écrit les réponses dans scraping/.env (le mot de passe est saisi sans s'afficher et n'est jamais
montré ensuite), puis envoie un courriel de test. Relançable : les valeurs existantes sont proposées par défaut.

Usage : double-clic sur configurer_courriel.cmd, ou python configurer_courriel.py
"""
from __future__ import annotations

import getpass
import re
import sys
from pathlib import Path

ICI = Path(__file__).resolve().parent
ENV = ICI / ".env"
CLES = ["SMTP_HOTE", "SMTP_PORT", "SMTP_UTILISATEUR", "SMTP_MOT_DE_PASSE", "COURRIEL_EXPEDITEUR", "COURRIEL_ADMIN"]


def lire_env() -> dict[str, str]:
    valeurs: dict[str, str] = {}
    if ENV.exists():
        for ligne in ENV.read_text(encoding="utf-8").splitlines():
            if "=" in ligne and not ligne.strip().startswith("#"):
                cle, _, val = ligne.partition("=")
                valeurs[cle.strip()] = val.strip()
    return valeurs


def ecrire_env(nouvelles: dict[str, str]) -> None:
    """Remplace les lignes SMTP_* et COURRIEL_* existantes, ajoute les absentes, ne touche à rien d'autre."""
    lignes = ENV.read_text(encoding="utf-8").splitlines() if ENV.exists() else []
    restantes = [l for l in lignes if not re.match(r"^(SMTP_|COURRIEL_)", l.strip())]
    bloc = ["", "# Boite d'envoi des courriels hebdomadaires (configurer_courriel.py)"] + [f"{k}={nouvelles[k]}" for k in CLES]
    ENV.write_text("\n".join(restantes).rstrip("\n") + "\n" + "\n".join(bloc) + "\n", encoding="utf-8")


def demander(question: str, defaut: str, secret: bool = False) -> str:
    invite = f"{question}" + (f" [{defaut}]" if defaut and not secret else (" [déjà renseigné, Entrée pour garder]" if defaut else "")) + " : "
    reponse = getpass.getpass(invite) if secret else input(invite)
    return reponse.strip() or defaut


def main() -> int:
    print("Configuration de la boîte d'envoi d'AAP Santé (Zoho Mail d'ARCADIA).")
    print("Le mot de passe demandé est un MOT DE PASSE D'APPLICATION Zoho, pas celui du compte :")
    print("  Zoho Mail > Paramètres (roue dentée) > Sécurité > Mots de passe d'application > Générer, nom « AAP Sante ».")
    print("  (ou https://accounts.zoho.eu/home#security/app-passwords)")
    print()
    actuel = lire_env()
    nouvelles = {
        "SMTP_HOTE": demander("Serveur SMTP (Zoho Europe : smtp.zoho.eu)", actuel.get("SMTP_HOTE") or "smtp.zoho.eu"),
        "SMTP_PORT": demander("Port (465)", actuel.get("SMTP_PORT") or "465"),
        "SMTP_UTILISATEUR": demander("Votre adresse Zoho complète (ex : prenom@arcadia.fr)", actuel.get("SMTP_UTILISATEUR", "")),
        "SMTP_MOT_DE_PASSE": demander("Mot de passe d'application Zoho (invisible à la frappe)", actuel.get("SMTP_MOT_DE_PASSE", ""), secret=True),
    }
    nouvelles["COURRIEL_EXPEDITEUR"] = demander("Adresse d'expédition", actuel.get("COURRIEL_EXPEDITEUR") or nouvelles["SMTP_UTILISATEUR"])
    nouvelles["COURRIEL_ADMIN"] = demander("Adresse qui reçoit le bilan hebdomadaire", actuel.get("COURRIEL_ADMIN") or "ducout@hotmail.fr")
    if not nouvelles["SMTP_UTILISATEUR"] or not nouvelles["SMTP_MOT_DE_PASSE"]:
        print("Adresse ou mot de passe manquant : rien n'est écrit.")
        return 1
    ecrire_env(nouvelles)
    print(f"\nÉcrit dans {ENV} (fichier ignoré par Git, mot de passe jamais affiché).")
    print("Envoi d'un courriel de test...")
    sys.path.insert(0, str(ICI))
    import courriel
    try:
        print(courriel.envoyer(nouvelles["COURRIEL_ADMIN"], "AAP Santé : courriel de test", "Si vous lisez ceci, la boîte d'envoi d'AAP Santé fonctionne."))
    except Exception as err:  # mot de passe refusé, serveur injoignable : le message aide à corriger
        print(f"Échec de l'envoi : {type(err).__name__}: {str(err)[:160]}")
        print("Vérifiez l'adresse, le mot de passe d'application (pas celui du compte) et que le compte Zoho est sur la zone .eu.")
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
