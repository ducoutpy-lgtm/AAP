# Tasks

Demande de Monsieur DUCOUT du 2026-10-14 (22 h) : voir les fiches et les filtrer par territoire et par thématique.
Règle « Preuve avant affirmation » : chaque tâche cochée avec sa preuve. Aucun fichier des modules gelés modifié.

## 1. Filtres

- [x] 1.1 `app/src/types/index.ts` : `scrapeMetadata.champ?: string` et `champRaison?: string` (exigence explicite).
  `app/src/utils/territoires.ts` : table identifiant -> libellé des 13 régions, `france` -> « National, toute la
  France », `non-precise` -> « Territoire non précisé ». Fait quand : `npm run build` vert. (Fait le 2026-10-14, 22 h :
  `npm run build` « built in 17.70s ».)
- [x] 1.2 `SearchAapPage.tsx` : options Territoire et Financeur construites depuis les fiches chargées, Thématique
  (Santé, Médico-social, Non classée) depuis `scrapeMetadata.champ`, comparaison sur l'identifiant, budget sans
  exclusion des montants inconnus. Fait quand : `npm run lint` et `npm run build` verts ; dans le navigateur, le filtre
  « Normandie » renvoie un nombre non nul égal au compte des fiches `normandie`, « Médico-social » aussi. (Fait le
  2026-10-14, 22 h : lint code 0, build vert ; navigateur sur `/aap/search` : « 420 AAP disponibles », filtre Normandie
  -> « 15 AAP disponibles », filtre Médico-social -> « 5 AAP disponibles » ; base Firestore : 15 fiches publiées
  `normandie`, 5 `medico-social`, 16 `sante`, 399 non classées ; libellé du territoire affiché sur chaque carte.)

## 2. Documentation

- [ ] 2.1 README de l'application, CHANGELOG, CLAUDE.md (démo), rapport de critique (section 8 : constat des filtres
  traité). Fait quand : fichiers relus.

## 3. Vérification

- [ ] 3.1 Monsieur DUCOUT filtre par territoire, par thématique et par financeur sur `/aap/search`, puis réinitialise.
