# Spec : textes réutilisables

## ADDED Requirements

### Requirement: Réutiliser ses textes dans une candidature

#### Scenario: enregistrer puis réutiliser
- **WHEN** le candidat enregistre une présentation de sa structure dans Mon profil, puis ouvre le formulaire d'une
  candidature et clique « Ajouter : Présentation de la structure »
- **THEN** le résumé contient « Présentation de la structure : » suivi de son texte, après ce qu'il avait déjà écrit

#### Scenario: aucun texte
- **WHEN** aucun texte réutilisable n'est rempli
- **THEN** le formulaire propose un lien vers Mon profil pour en enregistrer
