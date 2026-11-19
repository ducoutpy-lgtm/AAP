# Spec : effacement du compte

## ADDED Requirements

### Requirement: Supprimer son compte

#### Scenario: candidat
- **WHEN** le candidat de test, connecté depuis moins de cinq minutes, confirme « Supprimer mon compte »
- **THEN** son profil, ses recherches, ses favoris, ses notifications, ses candidatures aux appels importés, son document
  `users` et son compte de connexion disparaissent ; ses candidatures envoyées à un financeur inscrit restent avec
  `porteurId` « compte-supprime »

#### Scenario: connexion ancienne
- **WHEN** la dernière connexion date de plus de cinq minutes
- **THEN** rien n'est supprimé et l'écran demande de se reconnecter d'abord

#### Scenario: règles
- **WHEN** un candidat met à jour sa candidature envoyée en changeant autre chose que `porteurId` vers « compte-supprime »
- **THEN** l'émulateur refuse
