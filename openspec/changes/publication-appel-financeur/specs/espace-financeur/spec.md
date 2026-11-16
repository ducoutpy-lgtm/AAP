# Spec : espace financeur

## ADDED Requirements

### Requirement: Publication d'un appel avec des champs facultatifs vides

Un financeur MUST pouvoir publier un appel dont les champs facultatifs (montant minimum, enveloppe, téléphone, lien,
étiquettes) sont vides.

#### Scenario: montant minimum vide
- **WHEN** le financeur de test remplit titre, description, secteur, territoire, montant maximum, date limite et adresse
  de contact, laisse le reste vide, puis clique « Publier l'AAP »
- **THEN** l'appel est créé et apparaît dans « Mes appels », sans message d'erreur

#### Scenario: champ vidé à la modification
- **WHEN** un champ facultatif renseigné est vidé dans la modification d'un appel
- **THEN** le champ est retiré du document Firestore
