# Proposal

## Why

Question 20 de `docs/A_VALIDER.md`, « Oui, corriger » (Monsieur DUCOUT, 2026-11-13, relayé par la séance de pilotage).
L'audit du parcours candidat a montré qu'un compte pouvait réécrire son propre rôle dans `users` et se donner le rôle
administrateur (`app/firestore.rules`), et que les pièces de candidature étaient lisibles par tout compte connecté
(`app/storage.rules`).

## What Changes

- `firestore.rules` : un compte naît porteur ou financeur, jamais administrateur ; il ne change son rôle qu'entre porteur
  et financeur (parcours d'intégration) ; l'administrateur garde la main.
- `storage.rules` : pièces de candidature lisibles par leur propriétaire seulement ; l'accès du financeur destinataire
  sera conçu à l'ouverture du stockage (facturation). Règle non déployée tant que le stockage reste fermé.
- Hors périmètre : un compte peut encore écrire son propre `subscriptionStatus` (à traiter avec le paiement).

## Capabilities

### New Capabilities

- `regles-securite` : rôle protégé.

## Impact

- `app/firestore.rules`, `app/storage.rules`, `app/tests/rules/firestore.rules.test.ts`. Mise en ligne des règles
  Firestore avec le site, sur accord. Zéro euro.
