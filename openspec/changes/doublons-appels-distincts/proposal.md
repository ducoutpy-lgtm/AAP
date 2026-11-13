# Proposal

## Why

Le 2026-11-13, l'essai à blanc du rejet des doublons (changement `rejet-des-doublons`) proposait 63 fiches, dont une
vingtaine d'appels distincts : « ESMS numérique » lancé par dix ARS, une par région ; trois collèges de la CRSA de
Mayotte ; deux appels différents de l'ARS Guyane ; psychiatrie périnatale en Corse et en Normandie ; résidence autonomie
de 62 à 80 places et EHPAD de 100 places en Île-de-France. Tous venaient de la règle approximative (même date de
clôture, mots du titre en commun) du changement `doublons-file-a-valider`. Monsieur DUCOUT a demandé la correction
(« Oui, corrige-les »).

## What Changes

- `doublons.meme_appel`, avant la règle approximative : deux fiches restent séparées si leurs territoires précis sont
  disjoints (régions différentes), si elles viennent de deux pages différentes d'un même site, ou si les nombres de leurs
  titres (hors années) sont disjoints. Pourquoi : dans le doute, un doublon manqué se rejette à la main, alors qu'un vrai
  appel rejeté disparaît de la file.
- Contrôle sur les vraies pages des 20 groupes encore rapprochés par la règle approximative (lecture seule).
- Hors périmètre : le rejet en base lui-même (`rejet-des-doublons`, sur accord).

## Capabilities

### Modified Capabilities

- `import-aap-scrapes` : rapport des doublons, appels distincts jamais rapprochés.

## Impact

- Code : `scripts/doublons.py`, `scripts/tests/test_import_to_firestore.py` (l'aide `_fiche` donne à chaque fiche de
  test une adresse sur le site de sa source).
- Données : aucune écriture ; `docs/DOUBLONS.md` régénéré.
- Coût : zéro euro.
