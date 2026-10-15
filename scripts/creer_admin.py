"""Compte administrateur de l'application (changement acces-administration, 2026-10-15).

Pourquoi : l'espace /admin n'est accessible qu'a un compte dont users/{uid}.userType vaut « admin » ; aucun compte de ce
type n'existait, et l'inscription est fermee depuis le lot 0. Ce script, lance par Monsieur DUCOUT lui-meme :
  1. retrouve le compte Firebase Auth de l'adresse donnee, ou le cree SANS mot de passe (adresse marquee verifiee) ;
  2. ecrit le profil users/{uid} avec le role admin (fusion : un profil existant garde ses autres champs).
Le mot de passe n'est jamais saisi ici : il se choisit par « Mot de passe oublie ? » sur la page de connexion
(e-mail envoye par Firebase). Rien n'est affiche d'autre que l'adresse et l'identifiant du compte.

Usage :
  python scripts/creer_admin.py --email adresse@exemple.fr --dry-run
  python scripts/creer_admin.py --email adresse@exemple.fr [--nom "Prenom NOM"]
"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from import_to_firestore import DEFAULT_KEY  # noqa: E402

ROLE = "admin"


def profil_admin(email: str, existant: dict | None, maintenant) -> dict:
    """Champs ecrits dans users/{uid} : role admin, profil complet, aucun essai ni abonnement (fonction pure).

    Les champs deja presents (createdAt, preferences) sont conserves ; seuls le role, l'adresse et profileComplete sont imposes.
    """
    base = {
        "email": email,
        "userType": ROLE,
        "subscriptionStatus": "active",
        "subscriptionPlan": None,
        "profileComplete": True,
        "notificationPreferences": {"email": True, "inApp": True, "frequency": "realtime"},
        "createdAt": maintenant,
    }
    doc = {**base, **(existant or {})}
    doc.update({"email": email, "userType": ROLE, "profileComplete": True})
    return doc


def main() -> int:
    parser = argparse.ArgumentParser(description="Cree ou promeut un compte administrateur de l'application.")
    parser.add_argument("--email", required=True)
    parser.add_argument("--nom", default="", help="nom affiche du compte (facultatif)")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--key", default=str(DEFAULT_KEY))
    args = parser.parse_args()
    if not Path(args.key).exists():
        print(f"Cle de compte de service introuvable : {args.key}", file=sys.stderr)
        return 1

    import firebase_admin
    from firebase_admin import auth, credentials, firestore

    firebase_admin.initialize_app(credentials.Certificate(args.key))
    email = args.email.strip().lower()
    try:
        utilisateur = auth.get_user_by_email(email)
        print(f"Compte Firebase Auth existant pour {email} : {utilisateur.uid}")
    except auth.UserNotFoundError:
        utilisateur = None
        print(f"Aucun compte Firebase Auth pour {email} : il sera cree sans mot de passe")

    db = firestore.client()
    ref = db.collection("users").document(utilisateur.uid) if utilisateur else None
    existant = ref.get().to_dict() if ref is not None and ref.get().exists else None
    print("Profil users existant :", f"role « {existant.get('userType')} »" if existant else "aucun")
    print(f"Apres : role « {ROLE} », profil complet, pas d'essai ni d'abonnement")
    if args.dry_run:
        print("Essai a blanc : rien n'a ete ecrit.")
        return 0

    if utilisateur is None:
        utilisateur = auth.create_user(email=email, email_verified=True, display_name=args.nom or None)
        print(f"Compte Firebase Auth cree : {utilisateur.uid} (sans mot de passe)")
        ref = db.collection("users").document(utilisateur.uid)
    elif args.nom and not utilisateur.display_name:
        auth.update_user(utilisateur.uid, display_name=args.nom)
    ref.set(profil_admin(email, existant, firestore.SERVER_TIMESTAMP), merge=True)
    print(f"Profil users/{utilisateur.uid} ecrit avec le role « {ROLE} ».")
    print("Etape suivante : sur http://localhost:3000/login, « Mot de passe oublie ? », puis choisir le mot de passe "
          "dans l'e-mail recu, et se connecter.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
