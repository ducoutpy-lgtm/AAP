# verdicts-humains Specification

## ADDED Requirements

### Requirement: Les décisions humaines vivent dans sources/ et sont versionnées

Les verdicts donnés à l'écran sur les pages gardées et sur les liens SHALL être écrits dans
`scraping/sources/verdicts_pages.json` et `scraping/sources/verdicts_liens.json`, suivis par Git, nommés par l'objet
jugé, et SHALL n'être écrits que par `validation.py` (jamais par un outil automatique).

#### Scenario: Migration rejouable

- **WHEN** Monsieur DUCOUT lance `validation.py --migrer-verdicts --dry-run` puis, après accord, sans `--dry-run`
- **THEN** l'essai à blanc affiche le nombre de verdicts par fichier sans rien écrire ; l'exécution réelle copie les
  deux anciens fichiers dans `scripts/sauvegardes/`, écrit les deux nouveaux fichiers avec le même nombre de verdicts,
  renomme les anciens en `.json.migre`, et `git status` montre les deux nouveaux fichiers suivis

#### Scenario: Même bilan avant et après

- **WHEN** `validation.py --appliquer-pages --dry-run` est lancé avant et après la migration
- **THEN** le bilan affiché (verdicts lus, confirmées, corrigées, à retrouver, hors champ, ignorés, sans source) est
  identique, et aucun fichier n'est écrit

#### Scenario: Raccourcis du bureau

- **WHEN** Monsieur DUCOUT lance « Validation des pages des sources » ou « Validation manuelle des AAP »
- **THEN** la fenêtre annonce le nouveau chemin des verdicts et les verdicts déjà donnés sont retrouvés
