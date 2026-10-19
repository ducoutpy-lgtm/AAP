# administration-aap Specification

## ADDED Requirements

### Requirement: Compte administrateur

L'application SHALL réserver `/admin`, `/admin/aaps` et `/admin/utilisateurs` aux comptes dont `users/{uid}.userType`
vaut `admin`, et un script SHALL permettre à Monsieur DUCOUT de créer ou promouvoir ce compte sans qu'aucun mot de
passe ne soit saisi hors de Firebase.

#### Scenario: Création du compte administrateur

- **WHEN** Monsieur DUCOUT lance `scripts/creer_admin.py --email <son adresse>` après un essai à blanc
- **THEN** un compte Firebase Auth existe pour l'adresse, sans mot de passe, et `users/{uid}.userType` vaut `admin`

#### Scenario: Accès à l'administration

- **WHEN** ce compte se connecte sur `/login` avec le mot de passe qu'il a choisi
- **THEN** il est redirigé vers `/admin` et voit le tableau de bord, la gestion des appels et celle des utilisateurs

### Requirement: Mot de passe oublié

La page `/reset-password` SHALL envoyer l'e-mail de réinitialisation de Firebase pour l'adresse saisie et SHALL
afficher le même message qu'un compte existe ou non.

#### Scenario: Demande de réinitialisation

- **WHEN** un visiteur saisit une adresse sur `/reset-password` et valide
- **THEN** la page affiche « Si un compte existe pour cette adresse, un e-mail vient d'être envoyé » et, pour un
  compte existant, Firebase envoie l'e-mail qui permet de choisir un nouveau mot de passe

### Requirement: Suivi de la validation des fiches

La page de modération des AAP SHALL afficher un compteur par statut de validation (proposée, à corriger, validée,
rejetée), SHALL permettre de filtrer la liste par ce statut, et SHALL montrer sur chaque fiche son statut de
validation, le relecteur, la date et le commentaire (rapport du 2026-10-14, instruction 12).

#### Scenario: Compteurs égaux à la base

- **WHEN** l'administrateur ouvre `/admin/aaps`
- **THEN** les quatre compteurs valent le nombre de documents de la collection `aap` portant chaque `validation.statut`

#### Scenario: Filtre par statut de validation

- **WHEN** l'administrateur choisit « À corriger » (compteur ou liste déroulante)
- **THEN** seules les fiches dont `validation.statut` vaut `a_corriger` restent affichées, avec leur commentaire
