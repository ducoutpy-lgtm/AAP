# Spec : règles du stockage de fichiers

## ADDED Requirements

### Requirement: Pièces de candidature au seul auteur

Les fichiers de `uploads/applications/{userId}/` MUST être lus, écrits et supprimés par le seul compte `userId`.

#### Scenario: autre compte
- **WHEN** porteur2 lit, écrit ou supprime un fichier de `uploads/applications/porteur1/`
- **THEN** l'émulateur refuse ; porteur1 réussit les trois

### Requirement: Documents d'appel en lecture seule depuis l'application

Les fichiers de `uploads/aap-documents/` MUST être lisibles par un compte avec abonnement ou essai, et MUST NOT être
écrits ni supprimés depuis l'application, même par l'administrateur.

#### Scenario: suppression
- **WHEN** un porteur en essai ou l'administrateur supprime ou écrit un document d'appel
- **THEN** l'émulateur refuse ; le porteur en essai lit le document ; un visiteur et un compte expiré ne le lisent pas

### Requirement: Chemins inutilisés fermés

Un chemin sans règle MUST être refusé.

#### Scenario: ancien dossier
- **WHEN** un compte connecté lit ou supprime un fichier de `uploads/application-documents/`
- **THEN** l'émulateur refuse
