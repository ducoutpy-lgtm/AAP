# Proposal

## Why

Les pages légales (`app/src/pages/legal/`) portent encore sept mentions « À VALIDER ». Monsieur DUCOUT les a tranchées
le 2026-11-13 (question 5 de `docs/A_VALIDER.md`) : aucun outil de mesure d'audience pendant le test, durées de
conservation confirmées, tarifs provisoires sans paiement ouvert, clause de litige gardée pour le test. L'emplacement
des comptes et des fichiers, resté « non vérifié », a été vérifié le même jour par la session.

## What Changes

- Conditions générales : tarifs provisoires, aucun paiement ouvert pendant le test, résiliation fixée à l'ouverture du
  paiement ; clause de litige sans mention.
- Confidentialité et mentions légales : emplacement vérifié écrit en clair (base de données dans l'Union européenne,
  région `eur3` ; comptes de connexion traités aux États-Unis par Firebase Authentication ; stockage des fichiers aux
  États-Unis, région US-CENTRAL1) ; durées de conservation sans mention ; aucun outil de mesure d'audience pendant le test.
- Test `legal.test.tsx` : plus aucune mention « À VALIDER » ; l'emplacement des comptes est écrit.
- Hors périmètre : relecture de la clause de litige par un conseil (préalable à l'ouverture du paiement, noté dans
  `docs/A_VALIDER.md`) ; déplacement éventuel du stockage des fichiers en Europe (choix E du point d'étape) ; mise en
  ligne, sur son accord.

## Capabilities

### New Capabilities

- `pages-legales` : contenu des pages légales.

## Impact

- Code : `app/src/pages/legal/CguPage.tsx`, `ConfidentialitePage.tsx`, `MentionsLegalesPage.tsx`, `legal.test.tsx`.
- Coût : zéro euro. Mise en ligne sur accord de Monsieur DUCOUT.
