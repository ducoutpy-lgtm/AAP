# consultation-aap-scrapes Specification

## ADDED Requirements

### Requirement: Filtres fondés sur les valeurs réelles des fiches

La page de recherche SHALL construire ses listes de filtres à partir des valeurs présentes dans les fiches chargées
(territoires, thématiques, financeurs), SHALL afficher un libellé lisible pour chaque identifiant de territoire, et
SHALL comparer sur l'identifiant enregistré, de sorte qu'un filtre choisi renvoie toutes les fiches qui le portent.

#### Scenario: Filtrer par territoire

- **WHEN** Monsieur DUCOUT choisit « Normandie » dans le filtre Territoire
- **THEN** la liste ne montre que les fiches dont les territoires contiennent `normandie`, et le compteur affiche
  leur nombre

#### Scenario: Filtrer par thématique

- **WHEN** il choisit « Médico-social »
- **THEN** la liste ne montre que les fiches dont le champ classé vaut `medico-social` ; « Non classée » montre les
  fiches sans champ connu

#### Scenario: Filtre budget et montants inconnus

- **WHEN** il saisit un budget minimal
- **THEN** les fiches dont le montant maximal est connu et inférieur sont écartées, et les fiches sans montant connu
  restent visibles, après les fiches chiffrées

#### Scenario: Réinitialiser

- **WHEN** il clique « Réinitialiser »
- **THEN** tous les filtres reviennent à « Tous » et le compteur retrouve le total des fiches publiées
