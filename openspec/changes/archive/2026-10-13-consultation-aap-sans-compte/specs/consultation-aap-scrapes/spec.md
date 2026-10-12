# consultation-aap-scrapes Specification

## MODIFIED Requirements

### Requirement: Les AAP scrapés apparaissent dans la recherche

La page « Rechercher des AAP » SHALL lister les AAP publiés, scrapés ou saisis, avec titre et nom
du financeur, pour tout visiteur, connecté ou non.

#### Scenario: Liste après import

- **WHEN** Monsieur DUCOUT ouvre http://localhost:3000/aap/search sans être connecté, après un import
- **THEN** la liste affiche des AAP dont le financeur est « ARS Île-de-France », « Fondation de France », « CNSA » ou « ARS Normandie », sans passer par l'écran de connexion

#### Scenario: Recherche par mot

- **WHEN** il tape « Dentobus » dans le champ de recherche
- **THEN** seuls les AAP dont le titre, la description ou le financeur contient « Dentobus » restent affichés

## ADDED Requirements

### Requirement: Consultation d'une fiche sans compte

La fiche d'un AAP publié SHALL être consultable par tout visiteur, connecté ou non, avec les mêmes
contenus que pour un compte connecté (description, clôture, critères, lien d'origine, pièces
jointes). Les actions « Candidater » et « favori » SHALL rester réservées aux comptes connectés :
pour un visiteur sans compte, elles SHALL mener à la page de connexion puis ramener sur la fiche.

#### Scenario: Fiche ouverte sans compte

- **WHEN** Monsieur DUCOUT, non connecté, clique sur l'AAP « Appel à candidatures – Déploiement du Dentobus dans l'Orne »
- **THEN** la fiche affiche la description, la date de clôture 15/10/2026 et le lien vers normandie.ars.sante.fr

#### Scenario: Candidater sans compte

- **WHEN** il clique sur « Candidater » sans être connecté
- **THEN** la page de connexion s'affiche, et après connexion il revient sur la même fiche

### Requirement: Lecture publique des AAP publiés dans Firestore

Les règles Firestore SHALL autoriser la lecture d'un document de `aap` dont `status` vaut
`published` sans authentification, et SHALL conserver les conditions actuelles pour toute autre
lecture et pour l'écriture.

#### Scenario: Brouillon protégé

- **WHEN** un visiteur non connecté tente de lire un AAP dont le statut n'est pas `published`
- **THEN** Firestore refuse la lecture

### Requirement: Accès à la recherche depuis la page d'accueil

La page d'accueil SHALL proposer un lien « Voir les appels à projets » vers la recherche, visible
sans compte.

#### Scenario: Lien d'accueil

- **WHEN** Monsieur DUCOUT ouvre http://localhost:3000 sans être connecté
- **THEN** un lien « Voir les appels à projets » mène à la page de recherche
