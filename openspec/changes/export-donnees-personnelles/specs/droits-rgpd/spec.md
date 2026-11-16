# Spec : droits RGPD en libre-service

## ADDED Requirements

### Requirement: Export des données personnelles

Un compte connecté MUST pouvoir télécharger depuis `/profil` un fichier JSON de ses données lisibles, et le fichier MUST
nommer ce qu'il ne contient pas.

#### Scenario: candidat
- **WHEN** le candidat de test des émulateurs clique « Télécharger mes données » sur `/profil`
- **THEN** un fichier `mes-donnees-aap-sante-<date du jour>.json` est produit ; il contient son adresse, son profil de
  structure, ses candidatures et ses recherches sauvegardées, des dates en ISO 8601, et la liste « Sur demande au DPO »
  (journal des actions, retours de test, messages du formulaire de contact)

#### Scenario: partie illisible
- **WHEN** une lecture échoue (règle, réseau)
- **THEN** la partie porte `{ "nonLue": "<motif>" }` et les autres parties sont présentes

#### Scenario: conversion des valeurs
- **WHEN** une valeur est une date Firestore, une date JavaScript, un tableau ou un objet imbriqué
- **THEN** la date devient une chaîne ISO 8601, tableaux et objets sont parcourus, les autres valeurs sont gardées
