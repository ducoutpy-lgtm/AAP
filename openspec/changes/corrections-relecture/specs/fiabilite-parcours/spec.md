# Spec : fiabilité des parcours

## ADDED Requirements

### Requirement: Enregistrements partiels du profil

Un enregistrement du profil MUST NOT effacer un champ qu'il n'affiche pas. Les champs concernés sont les textes
réutilisables, ainsi que le site et la présentation d'un financeur.

#### Scenario: textes réutilisables conservés
- **WHEN** un candidat enregistre ses textes réutilisables, puis modifie son téléphone dans Mon profil et enregistre
- **THEN** à sa candidature suivante, les boutons « Ajouter : … » proposent toujours ses textes

#### Scenario: fenêtre « Préciser mon profil »
- **WHEN** un financeur a renseigné son site dans Mon profil, ouvre « Préciser mon organisation » et enregistre sans rien taper
- **THEN** son site et sa présentation sont toujours dans Mon profil

### Requirement: Candidatures reçues pour un appel

La page des candidatures d'un appel MUST lister les candidatures reçues par le financeur connecté.

#### Scenario: financeur de test
- **WHEN** le financeur de test ouvre « Candidatures » sur un de ses appels qui en a reçu
- **THEN** la page en affiche le nombre et la liste, et non « 0 candidature reçue »

### Requirement: Correction d'une fiche par l'administrateur

Le bouton « Modifier » de `/admin/aaps` MUST ouvrir le formulaire pré-rempli. Une date de clôture laissée vide MUST être
enregistrée comme une échéance nulle, sans erreur.

#### Scenario: fiche importée sans date
- **WHEN** l'administrateur clique « Modifier » sur une fiche importée sans date de clôture, puis enregistre
- **THEN** le formulaire s'est ouvert, l'enregistrement réussit et la fiche reste « Date de clôture non précisée »

#### Scenario: brouillon sans date
- **WHEN** un financeur sauvegarde en brouillon un appel dont la date limite est vide
- **THEN** le brouillon est créé, sans le message « Invalid time value »

### Requirement: Appel clos

Un appel clos (date dépassée ou statut autre que publié) MUST NOT accepter de candidature dans l'application.

#### Scenario: fiche d'un appel clos
- **WHEN** un candidat ouvre un appel de financeur dont la date est passée
- **THEN** le bouton « Candidater à cet AAP » n'est pas proposé, et l'adresse du formulaire affiche « Cet appel est clôturé »

### Requirement: Écran d'erreur passager

Après une erreur d'affichage, un changement de page MUST afficher la page demandée.

#### Scenario: menu après une erreur
- **WHEN** une page affiche « Cette page a rencontré une erreur » et que l'utilisateur clique une entrée du menu
- **THEN** la page choisie s'affiche normalement

### Requirement: Validation groupée

L'action « Valider et publier la sélection » MUST appliquer les mêmes conditions que le bouton unitaire. « Annuler »
sur la fenêtre du motif MUST interrompre le rejet groupé.

#### Scenario: sélection mêlée
- **WHEN** l'administrateur sélectionne des fiches validées, rejetées et archivées, puis valide la sélection
- **THEN** les fiches rejetées, archivées ou clôturées ne repassent pas en publiées, et le message dit combien ont été ignorées

### Requirement: Règles des candidatures et des appels

Un financeur MUST NOT modifier le dossier d'un candidat (seulement le statut et l'évaluation). Un candidat MUST NOT créer
une candidature déjà évaluée. L'auteur d'un appel MUST NOT republier un appel archivé ou clos, ni écrire lui-même un
verdict de relecture.

#### Scenario: tests de règles
- **WHEN** `npm run test:rules` rejoue ces écritures sur l'émulateur
- **THEN** elles sont refusées, et les écritures des écrans (évaluation, envoi, publication d'un brouillon) passent

### Requirement: Affichages justes

Les écrans du candidat MUST refléter ce qui a réellement eu lieu.

#### Scenario: candidature suivie hors de l'application
- **WHEN** un candidat ouvre une candidature qu'il suit seul (déposée sur le site du financeur)
- **THEN** la page ne dit pas que le financeur a reçu son dossier et n'affiche pas « Budget demandé : 0 € »

#### Scenario: pièce non déposée
- **WHEN** une pièce n'a pas pu être déposée
- **THEN** elle s'affiche sans lien, avec la mention « non déposée »

#### Scenario: retour à la recherche
- **WHEN** un candidat ouvre une fiche depuis une recherche filtrée, puis clique « Retour à la recherche »
- **THEN** la recherche réapparaît avec ses filtres

#### Scenario: calendrier
- **WHEN** le calendrier du candidat affiche un mois
- **THEN** il ne montre que les fiches visibles dans la recherche, et aucun appel clos n'est classé urgent
