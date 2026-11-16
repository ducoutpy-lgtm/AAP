# Proposal

## Why

Ligne 14 de `docs/PRET_POUR_TESTEURS.md` : la correction du 2026-11-13 des pièces de candidature (`uploads/applications`,
question 20 « Oui, corriger ») a été écrite dans `app/storage.rules` sans test ni déploiement. En relisant le fichier le
2026-11-16, deux autres règles de la même famille sont trop ouvertes :

- `uploads/aap-documents/{aapId}` : tout compte en essai peut écrire, tout compte connecté peut supprimer les documents
  d'un appel. Aucun écran n'écrit dans ce dossier (`aapService.uploadDocument` et `deleteDocument` ne sont appelées nulle
  part) ; seul l'import (`scripts/import_to_firestore.py`, SDK administrateur, hors règles) y dépose les pièces jointes.
- `uploads/application-documents/{applicationId}` : tout compte connecté lit et supprime ; aucun code n'utilise ce
  chemin.

## What Changes

- `uploads/aap-documents` : lecture inchangée (compte connecté avec abonnement ou essai) ; écriture et suppression
  refusées depuis l'application. Le dépôt de documents par un financeur sera conçu avec l'ouverture du stockage
  (facturation Blaze).
- `uploads/application-documents` : règle retirée (tout est refusé par défaut).
- `uploads/applications/{userId}` : inchangé (propriétaire seul), désormais testé.
- Tests des règles du stockage sur l'émulateur (`app/tests/rules/storage.rules.test.ts`) ; `npm run test:rules` lance
  les émulateurs Firestore et Storage ensemble (la règle de lecture consulte Firestore).
- Déploiement des règles du stockage : sur accord de Monsieur DUCOUT (question 27). Coût : aucun.

## Capabilities

### New Capabilities

- `regles-stockage` : droits sur les fichiers déposés.
