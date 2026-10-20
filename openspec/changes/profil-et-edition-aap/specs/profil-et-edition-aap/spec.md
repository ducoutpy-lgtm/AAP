# profil-et-edition-aap Specification

## Purpose

Permettre à un utilisateur connecté de revoir et corriger son profil, et à un financeur de modifier un appel à projets
qu'il a créé. Vérifiable par Monsieur DUCOUT avec deux comptes de test (un porteur, un financeur).

## Requirements

### Requirement: Page Mon profil

L'adresse `/profil` SHALL afficher, pour un utilisateur connecté, son compte (adresse e-mail, rôle, état de
l'abonnement, date de fin d'essai quand elle existe) et son formulaire de profil pré-rempli avec les valeurs
enregistrées. L'enregistrement SHALL mettre à jour le profil existant et laisser l'utilisateur sur `/profil` avec un
message de confirmation, sans le renvoyer vers le choix d'abonnement.

#### Scenario: Correction du nom de la structure d'un porteur

- WHEN un porteur dont le profil est complet ouvre `/profil`, change le nom de sa structure et clique « Enregistrer »
- THEN la page affiche « Profil enregistré », reste sur `/profil`, et le nouveau nom apparaît après rechargement de la
  page ainsi que sur le tableau de bord porteur.

#### Scenario: Profil d'un financeur

- WHEN un financeur ouvre `/profil`
- THEN le formulaire montre le nom de l'organisation, le type, les secteurs soutenus, l'adresse et la personne de contact
  tels qu'enregistrés, et l'en-tête de la page montre son adresse e-mail et « Financeur ».

#### Scenario: Profil jamais complété

- WHEN un utilisateur dont le profil n'a jamais été complété ouvre `/profil`
- THEN il est renvoyé vers `/complete-profile`.

### Requirement: Modification d'un appel par son auteur

L'adresse `/aap/:id/edit` SHALL afficher au financeur auteur de l'appel le formulaire de création pré-rempli avec
l'appel existant. « Sauvegarder en brouillon » SHALL mettre l'appel à jour sans changer son statut ; « Publier l'AAP »
SHALL mettre l'appel à jour puis le publier s'il était en brouillon. Un compte qui n'est pas l'auteur SHALL voir le
message « Cet appel n'est pas le vôtre » et aucun formulaire.

#### Scenario: Correction du titre d'un appel publié

- WHEN le financeur auteur ouvre « Modifier » depuis « Mes appels » sur un appel publié, corrige le titre et clique
  « Publier l'AAP » à la dernière étape
- THEN il est renvoyé vers la fiche de l'appel, qui montre le nouveau titre, l'appel reste publié et sa date de
  publication initiale est conservée.

#### Scenario: Brouillon publié depuis la modification

- WHEN le financeur auteur modifie un appel en brouillon et clique « Publier l'AAP »
- THEN l'appel passe « publié » et apparaît dans la recherche publique `/aap/search`.

#### Scenario: Appel d'un autre financeur

- WHEN un financeur ouvre `/aap/<identifiant d'un appel importé ou d'un autre financeur>/edit`
- THEN la page affiche « Cet appel n'est pas le vôtre » et un lien vers « Mes appels », sans formulaire.

### Requirement: Logique de formulaire testée sans Firebase

Les conversions appel -> formulaire, formulaire -> données enregistrées, et profil -> formulaire SHALL être des
fonctions sans accès réseau, couvertes par `npm test`.

#### Scenario: Aller-retour d'un appel

- WHEN la suite `npm test` s'exécute
- THEN un test convertit un appel avec date, budgets et étiquettes en formulaire puis en données, et retrouve les mêmes
  valeurs ; un test convertit un profil porteur et un profil financeur en formulaire pré-rempli.
