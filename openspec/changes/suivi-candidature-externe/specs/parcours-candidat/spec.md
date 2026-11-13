# parcours-candidat Specification

## ADDED Requirements

### Requirement: Suivi d'une candidature déposée sur le site officiel

Sur une fiche importée, le candidat SHALL pouvoir noter qu'il a déposé sa candidature sur le site officiel ; elle SHALL
apparaître dans « Mes candidatures », marquée externe, sans message disant qu'elle a été transmise.

#### Scenario: Candidature notée

- **WHEN** le candidat clique « J'ai déposé ma candidature : la suivre ici » sur une fiche importée
- **THEN** « Mes candidatures » affiche « Candidature notée » et la candidature apparaît dans la liste
