# consultation-aap-scrapes Specification

## ADDED Requirements

### Requirement: Date de clôture absente

La recherche et la fiche SHALL afficher « Date de clôture non précisée » pour un AAP dont `deadline` est `null`,
SHALL classer ces AAP après les AAP datés sans changer l'ordre des datés, et SHALL ne jamais afficher « Clôturé »
ni l'alerte d'urgence pour une date nulle.

#### Scenario: Liste de recherche

- **WHEN** un AAP publié sans date de clôture figure parmi les résultats de « Rechercher des AAP »
- **THEN** il apparaît après tous les AAP datés, avec la mention « Date de clôture non précisée » à la place du
  nombre de jours

#### Scenario: Fiche

- **WHEN** Monsieur DUCOUT ouvre la fiche d'un AAP sans date de clôture
- **THEN** la fiche affiche « Date de clôture non précisée », sans le mot « Clôturé » ni le compte à rebours

#### Scenario: Administration

- **WHEN** Monsieur DUCOUT consulte `/admin/aaps`
- **THEN** la colonne de clôture affiche « Non précisée » pour ces AAP et le bouton « Publier » n'est proposé que si
  `validation.statut` n'est ni `proposee` ni `a_corriger`
