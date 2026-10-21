# Proposal

## Why

Le 2026-10-21, Monsieur DUCOUT a demandé pourquoi les appels de l'ANAP n'apparaissaient pas dans l'application. La
redécouverte de la source sur sa page des actualités a répondu « aucune rubrique » alors que la page contient un lien
d'appel : le site de l'ANAP est bâti sur Salesforce (Lightning), qui place ses liens dans un « shadow DOM », une
partie de la page que la lecture classique (`document.querySelectorAll`) ne voit pas. Essai du jour : 14 liens lus
contre 29 réellement présents. D'autres sites publics utilisent la même technique ; les liens manqués sont des appels
jamais collectés. Accord de Monsieur DUCOUT (« 2 ok ») pour ouvrir ce changement.

## What Changes

- `decouverte.extraire_liens` lit les liens avec le moteur de sélection de Playwright (`page.locator`), qui traverse les
  shadow DOM ouverts, au lieu d'un script `document.querySelectorAll`. Pourquoi Playwright plutôt qu'un script maison
  qui parcourt les shadow roots : c'est déjà la bibliothèque du projet, la traversée est faite par elle, et le code reste
  une fonction de quelques lignes. Le résultat garde la même forme (`texte`, `href`), donc `choisir_rubrique`,
  `sans_navigation`, la veille (`rejeu.relire_source`) et les tests existants sont inchangés.
- Hors périmètre : pages qui ne chargent leurs liens qu'au clic sur « Afficher plus » (ANAP n'affiche que dix
  actualités), sites qui refusent le robot, toute lecture par IA.

## Capabilities

### Modified Capabilities

- `decouverte-rubriques-aap` : la lecture des liens d'une page SHALL inclure ceux placés dans un shadow DOM.

## Impact

- Code : `scraping/decouverte.py` (une fonction), `scraping/tests/test_decouverte.py` (un test sur une page locale
  avec shadow DOM, sans réseau).
- Coût : zéro euro (aucun appel au modèle). Redécouverte de l'ANAP comme preuve.
