# Proposal

## Why

Le 2026-10-15, Monsieur DUCOUT ouvre http://localhost:3000/admin et tombe sur la page de connexion : il n'a jamais vu
l'espace d'administration. Constats dans la base et dans Firebase : aucun compte de rôle « admin » (collection `users` :
3 porteurs, 1 financeur), aucun compte à son nom ; connexion par e-mail et mot de passe activée, fournisseur Google
désactivé (le bouton « Google » échoue) ; le lien « Mot de passe oublié ? » de la page de connexion mène à la page 404 ;
l'inscription est fermée depuis le lot 0. L'espace d'administration est pourtant dans le périmètre du MVP (lot 0,
routes conservées) et le lot 1 y ajoute les compteurs par statut de validation (instruction 12). Sans compte, rien de
cela n'est utilisable ni vérifiable par lui.

## What Changes

- Script `scripts/creer_admin.py --email <adresse> [--dry-run]`, lancé par Monsieur DUCOUT lui-même : retrouve ou crée
  le compte Firebase Auth de l'adresse (sans mot de passe, adresse marquée vérifiée), écrit `users/{uid}` avec le rôle
  `admin` (fusion, idempotent). Aucun mot de passe ne transite par le script ni par la session.
- Page `/reset-password` (« Mot de passe oublié ») : saisie de l'adresse, envoi de l'e-mail de réinitialisation par
  Firebase (`resetPassword` du contexte d'authentification, déjà écrit), message unique quel que soit le résultat ;
  route publique ajoutée au MVP. C'est le moyen de choisir son mot de passe pour un compte créé sans.
- Administration des appels (instruction 12, lot 1) : compteurs et filtre par `validation.statut` dans `/admin/aaps`,
  affichage de `validation.commentaire`. Tâche prévue dans ce changement, après l'accès.

## Capabilities

### New Capabilities

- `administration-aap` : accès réservé au rôle admin, compte administrateur, mot de passe oublié, suivi de la
  validation des fiches.

## Impact

- Nouveaux : `scripts/creer_admin.py` (test de la fonction pure), `app/src/pages/auth/ResetPasswordPage.tsx`.
- Modifiés : `app/src/App.tsx` (route `/reset-password`), plus tard `app/src/pages/admin/ManageAAPsPage.tsx`.
- Coût : aucun appel API ; Firebase dans la part gratuite.

## Hors périmètre

- Réactiver l'inscription ou le fournisseur Google ; les modules gelés (porteur, financeur).
