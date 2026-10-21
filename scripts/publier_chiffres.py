"""Chiffres publics de l'application (changement financeur-vendable, jour 6, 2026-10-21).

Pourquoi : la page publique « Financeurs » doit montrer des chiffres reels (etablissements inscrits, appels suivis)
sans inventer. Les regles Firestore interdisent la lecture publique des comptes et aucune fonction serveur n'est
deployee : ce script compte avec le SDK admin et ecrit un seul document lisible par tous,
statistiquesPubliques/accueil. Appele a la fin de veille.cmd ; relancable a volonte, sans aucun appel payant.

Usage :
  python scripts/publier_chiffres.py [--dry-run] [--projet demo-aap]   (--projet demo-aap = emulateur, avec
  FIRESTORE_EMULATOR_HOST=127.0.0.1:8080)
"""
from __future__ import annotations

import argparse
import sys
from datetime import datetime, timezone
from pathlib import Path

RACINE = Path(__file__).resolve().parent.parent
CLE = RACINE / "scripts" / "serviceAccountKey.json"


def chiffres(users: list[dict], aaps: list[dict], maintenant: datetime) -> dict:
    """Comptes a publier (fonction pure, testee) : etablissements = comptes porteurs ; appels suivis = fiches publiees
    (non archivees) ; financeurs = noms canoniques distincts des fiches publiees ; sources = sites d'origine distincts."""
    publies = [a for a in aaps if a.get("status") == "published"]
    return {
        "etablissementsInscrits": sum(1 for u in users if u.get("userType") == "porteur"),
        "appelsSuivis": len(publies),
        "financeursDistincts": len({a.get("financeurName") for a in publies if a.get("financeurName")}),
        "sourcesSuivies": len({(a.get("scrapeMetadata") or {}).get("source") for a in publies if (a.get("scrapeMetadata") or {}).get("source")}),
        "misAJourLe": maintenant.isoformat(),
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="Compte les etablissements et les appels, ecrit statistiquesPubliques/accueil.")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--projet", help="identifiant de projet force (emulateur : demo-aap)")
    parser.add_argument("--key", default=str(CLE))
    args = parser.parse_args()

    import firebase_admin
    from firebase_admin import credentials, firestore
    firebase_admin.initialize_app(credentials.Certificate(args.key), {"projectId": args.projet} if args.projet else None)
    db = firestore.client()
    users = [d.to_dict() for d in db.collection("users").select(["userType"]).stream()]
    aaps = [d.to_dict() for d in db.collection("aap").select(["status", "financeurName", "scrapeMetadata.source"]).stream()]
    c = chiffres(users, aaps, datetime.now(timezone.utc))
    print(f"etablissements inscrits {c['etablissementsInscrits']}, appels suivis {c['appelsSuivis']}, "
          f"financeurs {c['financeursDistincts']}, sources {c['sourcesSuivies']}")
    if args.dry_run:
        print("Essai a blanc : rien n'est ecrit.")
        return 0
    db.collection("statistiquesPubliques").document("accueil").set(c)
    print("Document statistiquesPubliques/accueil ecrit.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
