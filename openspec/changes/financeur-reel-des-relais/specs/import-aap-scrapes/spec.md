# import-aap-scrapes Specification (delta)

## ADDED Requirements

### Requirement: Financeur réel d'un appel publié par un relais

Quand une fiche vient d'une source `relais: true` et que son financeur extrait se rattache au relais lui-même, l'import
SHALL afficher le financeur connu du référentiel cité entre parenthèses, s'il y en a un ; sinon il SHALL garder le nom
actuel. Une source qui n'est pas un relais SHALL garder le rattachement actuel.

#### Scenario: Appel européen relayé par Lyonbiopôle

- **WHEN** le financeur extrait est « Lyonbiopôle Auvergne-Rhône-Alpes – appels à projets (appel émis par la Commission
  européenne, programme HORIZON EUROPE - CLUSTER SANTE) » et la source est `lyonbiopole`
- **THEN** la fiche affiche « Commission européenne »

#### Scenario: Appel propre au relais

- **WHEN** le financeur extrait est « Cancéropôle Nord-Ouest – appels à projets » et la source est
  `canceropole-nord-ouest`
- **THEN** la fiche garde le nom du cancéropôle

#### Scenario: Correction de la file

- **WHEN** Monsieur DUCOUT lance `python scripts/corriger_financeur_relais.py` puis `--reel`
- **THEN** l'essai à blanc liste les fiches corrigées (ancien et nouveau financeur) et celles sans information ;
  `--reel` sauvegarde puis ne modifie que le financeur des brouillons « proposee », jamais une fiche relue
