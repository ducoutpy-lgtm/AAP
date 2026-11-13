# parcours-candidat Specification

## ADDED Requirements

### Requirement: Parcours candidat sans impasse

Le candidat SHALL pouvoir envoyer une candidature même si le dépôt d'une pièce échoue (pièce notée « non déposée »),
SHALL enregistrer une recherche qui n'a qu'un nom, et le menu SHALL ne proposer aucune page que rien n'alimente.

#### Scenario: Recherche sauvegardée sans filtre

- **WHEN** le candidat crée une recherche sauvegardée en ne donnant qu'un nom
- **THEN** elle apparaît dans la liste, sans erreur

#### Scenario: Menu du candidat

- **WHEN** le candidat ouvre le menu
- **THEN** il n'y trouve ni Messagerie ni Alertes

#### Scenario: Pièce refusée par le stockage

- **WHEN** le dépôt d'une pièce échoue à l'envoi d'une candidature
- **THEN** la candidature est enregistrée et la confirmation nomme la pièce non déposée
