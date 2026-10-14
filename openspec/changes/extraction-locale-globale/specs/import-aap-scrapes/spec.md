# import-aap-scrapes Specification

## ADDED Requirements

### Requirement: Étiquette « à vérifier » sur les fiches du modèle local

Le script d'import SHALL ajouter l'étiquette `a-verifier` au champ `tags` de tout AAP dont
`scrape_metadata.moteur` vaut `ollama`, et SHALL lire `results/extraction_locale.json` dans
l'import global comme les autres sorties de connecteur.

#### Scenario: Essai à blanc sur l'extraction locale

- **WHEN** Monsieur DUCOUT lance `python scripts/import_to_firestore.py --dry-run --source extraction_locale`
- **THEN** le terminal affiche le nombre d'AAP à importer et, pour les premiers, l'étiquette
  `a-verifier` dans la ligne de détail
