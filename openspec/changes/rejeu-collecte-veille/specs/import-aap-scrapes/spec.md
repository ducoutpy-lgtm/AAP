# import-aap-scrapes Specification

## ADDED Requirements

### Requirement: Dernière vue d'après le rejeu

L'import SHALL écrire `scrapeMetadata.derniereVueLe` depuis `scrape_metadata.vue_rubrique_le` quand le rejeu l'a posée,
sinon la date de l'import, et SHALL reporter `scrape_metadata.absences` dans `scrapeMetadata.absences` (0 par défaut).

#### Scenario: Fiche marquée par le rejeu

- **WHEN** une fiche porte `vue_rubrique_le = 2026-10-27` et `absences = 1`
- **THEN** le document porte `derniereVueLe = 2026-10-27` et `absences = 1`, quelle que soit la date de l'import
