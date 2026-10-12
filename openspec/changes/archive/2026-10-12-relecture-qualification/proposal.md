# Proposal

## Why

La qualification des sources (archivée le 2026-10-12) a donné 127 rubriques confirmées et 133
« hors santé ». La relecture du rapport avec Monsieur DUCOUT a montré que le verdict du modèle
local ne vaut que pour la page jugée : quand le robot de découverte a gardé une page d'accueil,
une page d'archives ou un bandeau cookies, le verdict ne dit rien de l'organisme (exemple : l'ANR,
jugée « hors santé » sur son moteur de recherche d'anciens appels). Le modèle classe aussi
« hors santé » des listes mixtes où un seul appel concerne la santé (Gard, Interreg Sudoe,
Hauts-de-Seine). Sans correction, l'extraction partirait d'une liste incomplète.

## What Changes

- Un fichier de relecture `scraping/sources/relecture_qualification.json` : pour chaque source
  corrigée, le verdict relu, le motif en clair, la date et le relecteur. Versionné (le dossier
  `decouverte/` ne l'est pas), pour que chaque correction reste tracée dans Git.
- `qualification.py` applique la relecture par-dessus le verdict du modèle lors de `--registre`
  et `--rapport`. Le verdict du modèle n'est jamais écrasé : il reste sous `verdict_modele`.
- `QUALIFICATION.md` gagne une section « Relecture manuelle » (décompte et tableau des
  corrections avec motif).
- Contenu initial décidé avec Monsieur DUCOUT : 10 sources passent en « rubrique confirmée »
  (le motif du modèle prouvait la santé), 60 passent en « à vérifier » (45 « hors santé » à santé
  probable, ANR et 4 pages d'accueil, 6 pages d'accueil et 4 pages d'archives parmi les
  confirmées). Les « à vérifier » sont ensuite relues par la session sur les pages gardées, et les
  décisions soumises à Monsieur DUCOUT avant écriture.

## Capabilities

### New Capabilities

Aucune.

### Modified Capabilities

- `qualification-sources` : ajout de la relecture manuelle des verdicts.

## Impact

- Modifié : `scraping/qualification.py`, `scraping/tests/test_qualification.py`,
  `scraping/sources/registre.json` (champ `qualification` enrichi), `REGISTRE_SOURCES.md`,
  `QUALIFICATION.md`, README scraping, CHANGELOGs, CLAUDE.md, REPRISE.md.
- Nouveau : `scraping/sources/relecture_qualification.json`.
- Coût : zéro euro. Aucun appel à Ollama ni à l'API Anthropic : la relecture est une lecture
  humaine des pages déjà gardées. Temps de travail : 2 à 3 heures.

## Hors périmètre

- Rejuger par le modèle les pages d'accueil ou d'archives sur une meilleure adresse : la nouvelle
  adresse est seulement notée dans le registre, le nouveau jugement viendra avec le passage global.
- La fusion des doublons du registre (même adresse sous deux identifiants) : traitée à l'extraction.
- L'extraction des fiches (changement `extraction-echantillon-aap`, repris ensuite).
