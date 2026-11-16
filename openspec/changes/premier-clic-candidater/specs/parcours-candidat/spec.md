# Spec : parcours candidat

## ADDED Requirements

### Requirement: Premier clic sur « Candidater »

Le premier clic d'un compte neuf sur « Candidater à cet AAP » MUST ouvrir le formulaire de candidature et y rester.

#### Scenario: compte neuf
- **WHEN** un candidat dont l'étape « Commencer une candidature » n'est pas cochée clique « Candidater à cet AAP »
- **THEN** l'adresse reste `/aap/<id>/candidater`, aucun passage par `/admin`, et l'étape est cochée

#### Scenario: relecture partielle
- **WHEN** la relecture du compte ne contient que `demarrage`
- **THEN** le profil en mémoire garde `userType`, `subscriptionStatus` et les autres champs connus
