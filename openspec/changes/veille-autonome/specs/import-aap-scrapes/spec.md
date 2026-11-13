# import-aap-scrapes Specification

## ADDED Requirements

### Requirement: Import en « à valider »

Avec l'option `--a-valider`, l'import SHALL faire entrer une fiche nouvelle validée par le modèle en brouillon avec la
validation « proposée », SHALL laisser une fiche rejetée ou à corriger dans son état, et SHALL ne jamais toucher à une
fiche relue par Monsieur DUCOUT.

#### Scenario: Fiche nouvelle validée par le modèle

- **WHEN** la veille importe avec `--a-valider` une fiche que le contrôle du modèle a validée
- **THEN** elle apparaît dans la file « Proposée, non relue » de `/admin/aaps`, et pas dans la recherche publique
