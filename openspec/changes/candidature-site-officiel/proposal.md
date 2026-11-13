# Proposal

## Why

Question 21 de `docs/A_VALIDER.md`, « Lien site officiel » (Monsieur DUCOUT, 2026-11-13, relayé par la séance de
pilotage). Une candidature à une fiche importée par la veille (`financeurId = "scraped"`) n'était transmise à personne,
alors que l'écran disait « transmis au financeur ».

## What Changes

- `candidatureSurSiteOfficiel` (`app/src/utils/candidat.ts`) : fiche importée qui a une adresse officielle.
- Fiche d'appel et recommandations : bouton « Candidater sur le site officiel », qui ouvre l'annonce du financeur ; le
  formulaire interne reste pour les appels publiés par un financeur dans l'application.
- Hors périmètre : suivi d'une candidature externe dans « Mes candidatures » (à concevoir).

## Capabilities

### Modified Capabilities

- `parcours-candidat` : candidature sur le site officiel pour une fiche importée.

## Impact

- `app/src/utils/candidat.ts` et son test, `AapDetailPage.tsx`, `RecommendationsPage.tsx`. Zéro euro. Mise en ligne avec
  le reste, sur accord.
