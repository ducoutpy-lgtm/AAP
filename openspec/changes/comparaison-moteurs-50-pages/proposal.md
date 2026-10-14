# Proposal

## Why

Demande de Monsieur DUCOUT du 2026-10-14 (section 8 du rapport de critique) : comparer sur les mêmes 50 pages le
modèle local `qwen3:8b`, moteur du passage global en cours, et `claude-haiku-5-5`, mesuré le même jour sur
l'échantillon (19 justes sur 20, seuil manqué d'une fiche, 0,03 euro). Deux mesures : le repérage (« cette page
est-elle un appel ? ») et la qualité des fiches, en pourcentage. L'échantillon de 45 textes porte sur des pages
choisies à la main ; ici les pages sont tirées au sort dans le corpus réel et jugées par Monsieur DUCOUT.

## What Changes

- Nouvel outil `scraping/comparaison.py`, cinq étapes : `--tirer` (50 adresses, graine fixe, parmi les textes
  collectés que le modèle local n'a jamais traités, hors échantillon, réparties par famille, écrites dans
  `sources/comparaison_pages.json`) ; `--extraire-local` (les 50 textes
  par `qwen3:8b`, même chaîne que le passage global, 0 euro) ; `--extraire-api` (les 50 textes par
  `claude-haiku-5-5`, deux appels par texte, plafond cumulé 5 euros, reprise) ; `--juger` (écran local : texte
  collecté, fiche locale et fiche Haiku côte à côte, verdict par page et par moteur dans
  `sources/verdicts_comparaison.json`) ; `--rapport` (`scraping/COMPARAISON.md`).
- Les deux moteurs traitent les 50 textes à neuf par la même chaîne (question fermée, extraction, contrôle des
  formats, consigne version 3). Le passage global n'est pas interrompu : les durées locales sont mesurées en
  concurrence avec lui, ce que le rapport signale.
- `echantillon.extraire` et `extraire_api` reçoivent deux paramètres optionnels (liste de textes, fichier de
  sortie), comportement de l'échantillon et du passage global inchangé.
- Mesures par moteur : repérage (décisions justes sur 50), qualité (fiches justes parmi les pages qui sont des
  appels), fabrications (fiches sur des pages qui n'en sont pas), temps, coût réel.

## Capabilities

### New Capabilities

- `comparaison-moteurs-extraction` : tirage reproductible, mêmes textes pour les deux moteurs, extraction API
  sous plafond après accord, jugement humain par page et par moteur, rapport en pourcentages.

### Modified Capabilities

Aucune : la généralisation de `extraire_api` est interne.

## Impact

- Nouveaux : `scraping/comparaison.py`, `tests/test_comparaison.py`, `sources/comparaison_pages.json` et
  `sources/verdicts_comparaison.json` (versionnés), `scraping/COMPARAISON.md`, raccourci `comparaison_juger.cmd`.
  Modifiés : `echantillon.py`, README scraping, CHANGELOGs, CLAUDE.md, REPRISE.md, rapport de critique
  (section 8). Hors Git : `results/comparaison_api_claude-haiku-5-5.json`.
- Coût : Haiku, environ 0,03 euro pour 50 textes (0,0006 euro par texte constaté), moins de 0,10 euro avec marge,
  plafond cumulé 5 euros, aucun appel avant l'accord écrit et un premier texte seul. Modèle local : 0 euro,
  environ une heure de calcul, davantage tant que le passage global tourne. Monsieur DUCOUT : environ une heure
  et quart de jugement (estimation). Développement : une session.

## Hors périmètre

- La décision sur le moteur du passage global : la comparaison donne les chiffres, Monsieur DUCOUT décide.
- Tout appel au-delà des 50 textes ; tout autre modèle (nouvel accord et nouvelle estimation).
- Un second tirage parmi les pages déjà traitées par le passage global, pour comparer avec ses résultats
  existants, sur demande.
- Les PDF, le schéma `AapNormalized`, l'import dans l'application.
