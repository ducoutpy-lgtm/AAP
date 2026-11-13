# Proposal

## Why

Le 2026-11-13, la recherche annonce « 378 appels à projets », dont 141 déjà clos (lecture de la base). Un visiteur
voit d'abord des appels qu'il ne peut plus saisir. Semaine 1 du plan de quatre semaines, accepté par Monsieur DUCOUT
(« continue avec le plan »), option recommandée du point d'étape : appels clos masqués par défaut, visibles par un filtre.

## What Changes

- Recherche (`/aap/search`) : sans filtre de statut, les appels clos sont masqués ; le compteur ne compte que les appels
  ouverts, bientôt clôturés ou sans date. Nouvelle option « Tous, clôturés compris ». Les filtres « Clôturé », « Ouvert »,
  etc. restent. Pourquoi un filtre et pas un archivage : rien n'est retiré de la base, le choix se défait sans migration.
- Hors périmètre : archivage automatique des appels clos ; autres listes (tableau de bord, page Financeurs).

## Capabilities

### New Capabilities

- `recherche-appels` : statut par défaut de la recherche.

## Impact

- Code : `app/src/utils/recherche.ts`, `app/src/pages/porteur/SearchAapPage.tsx`, `app/src/utils/recherche.test.ts`.
- Coût : zéro euro. Mise en ligne sur accord de Monsieur DUCOUT.
