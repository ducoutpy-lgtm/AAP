# administration-controle Specification

## Purpose

Que l'administrateur contrôle les fiches depuis l'application et que les candidats ne voient que des fiches
contrôlées. Vérifiable par Monsieur DUCOUT avec son compte administrateur.

## Requirements

### Requirement: Recherche publique limitée aux fiches contrôlées

`/aap/search` SHALL n'afficher que les fiches publiées dont la validation est « validée » ou qui n'ont pas de bloc de
validation (saisies par un financeur). Les filtres Source et Relecture SHALL ne plus apparaître.

#### Scenario: Fiche proposée invisible

- WHEN une fiche publiée porte la validation « proposée »
- THEN elle n'apparaît pas dans `/aap/search`, et apparaît dans `/admin/aaps?validation=proposee`.

### Requirement: Import en brouillon sans validation

Une fiche nouvelle dont la validation reste « proposée » ou « à corriger » après le contrôle du modèle SHALL être
créée en brouillon ; une fiche validée par le modèle SHALL être publiée comme aujourd'hui.

#### Scenario: Test de l'import

- WHEN la session lance les tests de `scripts/tests`
- THEN un test montre qu'un document « proposée » sort en `draft` et qu'un document « validée » reste `published`.

### Requirement: Dépublication des fiches non contrôlées

Un script `scripts/depublier_non_controlees.py` SHALL, en essai à blanc, compter les fiches publiées dont la
validation est « proposée » ou « à corriger », puis, après sauvegarde et accord, les repasser en brouillon sans
toucher à leur bloc de validation.

#### Scenario: Essai à blanc

- WHEN la session lance le script avec `--dry-run`
- THEN il affiche le nombre de fiches concernées et cinq exemples, et n'écrit rien.

### Requirement: Tableau de bord administrateur

`/admin` SHALL afficher : candidats (comptes porteurs), financeurs, abonnements actifs et essais en cours, appels
publiés, candidatures, et une carte « Fiches à contrôler » (brouillons et publiées dont la validation est proposée
ou à corriger) menant à `/admin/aaps?validation=proposee`.

#### Scenario: Carte à contrôler

- WHEN l'administrateur clique « Fiches à contrôler »
- THEN la liste des appels s'ouvre déjà filtrée sur « Proposées, non relues », avec le compteur correspondant.

### Requirement: Contrôle depuis la liste

Sur `/admin/aaps`, chaque fiche non validée SHALL proposer « Valider et publier » (validation « validée » au nom de
Monsieur DUCOUT, datée, fiche publiée), « Rejeter » (validation « rejetée », fiche archivée, commentaire facultatif)
et « Modifier » (formulaire de modification, ouvert à l'administrateur quelle que soit la fiche).

#### Scenario: Validation d'une fiche

- WHEN l'administrateur clique « Valider et publier » sur une fiche proposée
- THEN la fiche passe « Publié » et « Validée », la relecture indique « par Monsieur DUCOUT » avec la date du jour, et
  la fiche apparaît dans `/aap/search`.

#### Scenario: Modification par l'administrateur

- WHEN l'administrateur clique « Modifier » sur une fiche importée
- THEN le formulaire s'ouvre pré-rempli ; « Sauvegarder » garde le statut.
