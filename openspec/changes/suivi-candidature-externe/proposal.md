# Proposal

## Why

Suite de la question 21 (« Lien site officiel ») : une candidature déposée sur le site d'un financeur n'apparaissait nulle
part dans l'application. Lot du plan sans mise en ligne, dépense ni décision (séance de pilotage, 2026-11-13 au soir).

## What Changes

- Fiche importée : bouton « J'ai déposé ma candidature : la suivre ici », qui note la candidature dans « Mes candidatures »
  (`suiviCandidatureExterne`, marque `externe`), sans prétendre la transmettre.
- Confirmation « Candidature notée » : la réponse du financeur arrive hors de l'application.
- Hors périmètre : mise à jour du statut par le candidat (la règle Firestore limite sa modification au brouillon ; à
  décider avec un changement de règle).

## Capabilities

### Modified Capabilities

- `parcours-candidat` : suivi d'une candidature déposée sur le site officiel.

## Impact

- `app/src/utils/candidat.ts` et son test, `AapDetailPage.tsx`, `MyApplicationsPage.tsx`. Zéro euro.
