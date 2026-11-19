# Proposal

## Why

Semaine 3 du plan (« documents réutilisables »). Question 23 tranchée le 2026-11-19 (« (b) maintenant, (a) plus tard ») :
des textes réutilisables d'une candidature à l'autre, sans stockage de fichiers (les pièces jointes attendent
l'ouverture de la facturation Blaze).

## What Changes

- Profil du candidat (`porteurProfiles/{uid}`) : champ facultatif `textesReutilisables` (`presentation`, `references`,
  `moyens`), saisi dans une carte « Textes réutilisables » de `/profil`. Règle Firestore inchangée (le propriétaire écrit
  son profil).
- Formulaire de candidature : sous le résumé, un bouton par texte rempli (« Ajouter : Présentation de la structure »…)
  ajoute le texte au résumé, avec son intitulé ; sans texte rempli, un renvoi vers Mon profil.
- Fonctions pures `app/src/utils/textesReutilisables.ts`, testées. Aucun coût, rien de mis en ligne sans accord.

## Capabilities

### New Capabilities

- `candidature` : textes réutilisables.
