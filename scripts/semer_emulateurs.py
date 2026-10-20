"""Comptes et donnees de test pour les emulateurs Firebase (changement emulateurs-parcours-connectes, 2026-10-20).

Pourquoi : la session Claude Code ne se connecte jamais au vrai projet Firebase (regle du 2026-10-19) ; pour jouer les
parcours connectes (candidat, financeur, administrateur) elle utilise les emulateurs du PC, projet factice demo-aap.
Ce script cree trois comptes de test avec leur profil, puis importe un echantillon d'appels par l'import habituel,
dirige vers l'emulateur. Les mots de passe ci-dessous sont des valeurs de test, valables uniquement sur ce PC.

Prerequis : emulateurs demarres (app/emulateurs_dev.cmd ou « npm run emulateurs » dans app/, JDK 21).
Usage : .venv/Scripts/python scripts/semer_emulateurs.py [--sources ars_idf,cnsa,fondation_de_france]
"""
from __future__ import annotations

import argparse
import os
import subprocess
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

# Les variables d'environnement sont posees AVANT tout import Firebase : c'est ce qui garantit qu'aucune ecriture ne
# part vers le vrai projet.
os.environ["FIRESTORE_EMULATOR_HOST"] = "localhost:8080"
os.environ["FIREBASE_AUTH_EMULATOR_HOST"] = "localhost:9099"
os.environ["STORAGE_EMULATOR_HOST"] = "http://localhost:9199"
os.environ["GCLOUD_PROJECT"] = "demo-aap"

RACINE = Path(__file__).resolve().parent.parent
PROJET = "demo-aap"

# Comptes de test (valeurs de test pour les emulateurs du PC, jamais utilisees ailleurs)
COMPTES = [
    {"email": "candidat@test.local", "password": "Candidat-2026", "userType": "porteur",
     "profil": {"structureName": "EHPAD Les Lilas (test)", "structureType": "association", "secteurActivite": "sante",
                "domainesIntervention": [], "typeEtablissement": "ehpad", "tailleTranche": "51-200",
                "budgetTranche": "2m-10m", "publics": ["personnes-agees"],
                "address": {"city": "Évry-Courcouronnes", "postalCode": "91000", "region": "ile-de-france", "country": "France"},
                "contactPerson": {"firstName": "Camille", "lastName": "Test", "email": "candidat@test.local"}}},
    {"email": "financeur@test.local", "password": "Financeur-2026", "userType": "financeur",
     "profil": {"organisationName": "Fondation Test", "organisationType": "fondation", "sectorsSupported": ["sante", "social"],
                "address": {"city": "Paris", "postalCode": "75008", "region": "ile-de-france", "country": "France"},
                "contactPerson": {"firstName": "Anne", "lastName": "Test", "email": "financeur@test.local", "position": "Chargée de projets"}}},
    {"email": "admin@test.local", "password": "Admin-2026", "userType": "admin", "profil": None},
]


def main() -> int:
    parser = argparse.ArgumentParser(description="Comptes et appels de test dans les emulateurs Firebase.")
    parser.add_argument("--sources", default="ars_idf,cnsa,fondation_de_france", help="fichiers de resultats a importer")
    args = parser.parse_args()

    import firebase_admin
    from firebase_admin import auth, credentials, firestore

    cle = RACINE / "scripts" / "serviceAccountKey.json"
    firebase_admin.initialize_app(credentials.Certificate(str(cle)), {"projectId": PROJET})
    db = firestore.client()
    assert os.environ["FIRESTORE_EMULATOR_HOST"].startswith("localhost"), "emulateur attendu"

    maintenant = datetime.now(timezone.utc)
    for c in COMPTES:
        try:
            user = auth.get_user_by_email(c["email"])
        except auth.UserNotFoundError:
            user = auth.create_user(email=c["email"], password=c["password"], email_verified=True)
        est_admin = c["userType"] == "admin"
        db.collection("users").document(user.uid).set({
            "email": c["email"], "userType": c["userType"], "createdAt": maintenant,
            "subscriptionStatus": "active" if est_admin else "trial", "subscriptionPlan": None,
            "trialEndsAt": None if est_admin else maintenant + timedelta(days=14),
            "profileComplete": True,
            "notificationPreferences": {"email": True, "inApp": True, "frequency": "weekly"},
            "cguAccepteLe": maintenant,
        })
        if c["profil"]:
            collection = "porteurProfiles" if c["userType"] == "porteur" else "financeurProfiles"
            db.collection(collection).document(user.uid).set({"userId": user.uid, **c["profil"], "updatedAt": maintenant})
        print(f"compte {c['userType']:9s} {c['email']} -> {user.uid}")

    env = dict(os.environ)
    for source in [s.strip() for s in args.sources.split(",") if s.strip()]:
        r = subprocess.run([sys.executable, str(RACINE / "scripts" / "import_to_firestore.py"), "--source", source,
                            "--projet", PROJET, "--include-expired"], env=env, capture_output=True, text=True, encoding="utf-8", errors="replace")
        derniere = [l for l in r.stdout.splitlines() if l.startswith("Termine")]
        print(f"import {source}: {derniere[0] if derniere else r.stderr.strip()[-300:]}")
    n = sum(1 for _ in db.collection("aap").stream())
    print(f"appels dans l'emulateur : {n}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
