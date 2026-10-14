# Proposal

## Why

Monsieur DUCOUT (2026-10-14, 22 h) : « je veux voir des fiches et pouvoir les classer et les manipuler par territoire,
par thématique ». Or les filtres de `/aap/search` ne renvoient rien (constat de la section 8 du rapport de critique) :
la liste des territoires propose des libellés (« Île-de-France ») alors que les fiches portent des identifiants
(`ile-de-france`) ; le filtre « secteur » propose dix secteurs génériques alors que toutes les fiches portent
`sante` et `social` ; le filtre budget écarte les fiches sans montant connu. Depuis ce soir, 420 fiches sont
publiées et chaque fiche classée porte son champ (`scrapeMetadata.champ`, changement `filtre-champ-sante`).

## What Changes

- Filtre « Territoire » : options construites à partir des identifiants réellement présents dans les fiches
  chargées, avec un libellé d'affichage par identifiant (`ile-de-france` -> « Île-de-France », `france` ->
  « National, toute la France ») ; comparaison sur l'identifiant.
- Filtre « Thématique » à la place de « Secteur » : « Santé », « Médico-social », « Non classée » (fiche dont le
  champ n'est pas encore connu), d'après `scrapeMetadata.champ` ; le type `AAP` reçoit ce champ optionnel dans
  `scrapeMetadata` (exigence explicite de ce changement).
- Filtre « Financeur » : liste des financeurs présents dans les fiches chargées, comparaison exacte
  `[A VALIDER - Monsieur DUCOUT]`.
- Filtre budget : une fiche sans montant connu n'est plus écartée quand une borne est saisie ; elle reste visible,
  classée après les fiches chiffrées.
- Compteur de résultats et bouton « Réinitialiser » inchangés.

## Capabilities

### Modified Capabilities

- `consultation-aap-scrapes` : filtres par territoire, thématique et financeur fondés sur les valeurs réelles des
  fiches.

## Impact

- Modifiés : `app/src/pages/porteur/SearchAapPage.tsx`, `app/src/types/index.ts` (champ optionnel
  `scrapeMetadata.champ`), `app/src/utils/territoires.ts` (nouveau : libellés), README de l'application,
  CHANGELOG, rapport de critique (section 8).
- Coût : aucun appel API ; `npm run lint` et `npm run build` ; vérification dans le navigateur. Temps : une session
  courte.

## Hors périmètre

- Le matching par profil d'établissement (lot 3 et au-delà) ; les filtres de l'administration ; le remplacement de
  `sectorsTargeted` dans l'import (constat P3, changement suivant).
