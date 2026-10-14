# consultation-aap-scrapes Specification

## ADDED Requirements

### Requirement: Un AAP à vérifier est signalé comme tel

Un AAP portant l'étiquette `a-verifier` SHALL afficher la mention « À vérifier » dans la liste
« Rechercher des AAP » et dans sa fiche.

#### Scenario: Mention dans la liste

- **WHEN** Monsieur DUCOUT ouvre http://localhost:3000/aap/search après l'import d'un lot de
  l'extraction locale
- **THEN** les cartes des AAP issus du modèle local portent un badge « À vérifier » et les AAP
  des connecteurs historiques n'en portent pas

#### Scenario: Mention dans la fiche

- **WHEN** il ouvre la fiche d'un de ces AAP
- **THEN** la fiche affiche « À vérifier » près du titre
