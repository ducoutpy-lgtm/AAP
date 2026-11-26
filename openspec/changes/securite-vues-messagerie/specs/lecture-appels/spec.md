## ADDED Requirements

### Requirement: Un appel non visible n'est lisible que par l'administrateur et son auteur

Les règles Firestore SHALL n'autoriser la lecture d'un document de `aap` que si l'appel est publié et visible du public
(bloc de validation au statut « validee »), ou si le lecteur est l'administrateur, ou s'il est le financeur auteur de
l'appel. Un compte en période d'essai et un visiteur SHALL se voir refuser tout autre appel, en lecture d'un document
comme en requête de liste.

#### Scenario: Brouillon lu par un candidat en essai

- **WHEN** un candidat en période d'essai lit par le kit Firebase un appel en brouillon d'un autre financeur
- **THEN** Firestore refuse la lecture

#### Scenario: Appel publié encore « Proposée » lu sans compte

- **WHEN** un visiteur sans compte lit un appel publié dont la validation est « proposee »
- **THEN** Firestore refuse la lecture

#### Scenario: Appel publié et validé

- **WHEN** un visiteur sans compte lit un appel publié dont la validation est « validee »
- **THEN** la lecture réussit

#### Scenario: Auteur et administrateur

- **WHEN** le financeur auteur lit son appel en brouillon, ou l'administrateur lit un appel rejeté
- **THEN** la lecture réussit

### Requirement: Les pages de liste restent compatibles avec la règle de lecture

La recherche, le calendrier, les tableaux de bord du candidat et du financeur, les recommandations et l'administration
SHALL interroger Firestore par des requêtes que la règle de lecture accepte, et afficher les mêmes appels qu'avant le
resserrement de la règle.

#### Scenario: Recherche d'un candidat

- **WHEN** un candidat connecté ouvre la recherche sur les émulateurs
- **THEN** la liste affiche les appels publiés et validés, sans message d'erreur

#### Scenario: Mes appels du financeur

- **WHEN** un financeur ouvre « Mes appels »
- **THEN** ses appels apparaissent, brouillons et appels « Proposée » compris
