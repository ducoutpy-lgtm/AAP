# perimetre-application-mvp Specification

## ADDED Requirements

### Requirement: Routes du MVP

L'application SHALL ne servir que les routes `/`, `/login`, `/aap/search`, `/aap/:aapId`, `/admin`, `/admin/aaps`,
`/admin/utilisateurs`, les trois pages légales gabarit et la page 404. Toute autre adresse, dont `/signup`,
SHALL afficher la page « Page non trouvée ». Le code des pages retirées reste dans le dépôt, sans modification.

#### Scenario: Inscription fermée

- **WHEN** un visiteur ouvre `http://localhost:3000/signup`
- **THEN** il voit « Page non trouvée », et ni l'accueil ni la page de connexion ne proposent de lien vers l'inscription

#### Scenario: Consultation et administration intactes

- **WHEN** un visiteur ouvre `/aap/search` puis une fiche, et Monsieur DUCOUT se connecte et ouvre `/admin/aaps`
- **THEN** la liste, la fiche et l'écran d'administration s'affichent comme avant

#### Scenario: Compilation

- **WHEN** `npm run build` et `npm run lint` sont lancés dans `app/`
- **THEN** les deux se terminent sans erreur

### Requirement: Règles d'accès du MVP

Les règles Firestore SHALL autoriser un administrateur à lire tout AAP et à publier, clôturer, archiver et
supprimer un AAP, et à suspendre ou activer un utilisateur ; SHALL refuser toute création, mise à jour ou
suppression d'AAP par un autre compte ; SHALL interdire toute écriture dans les collections des modules gelés.
Ces règles SHALL être couvertes par des tests sur l'émulateur Firestore et déployées seulement après accord de
Monsieur DUCOUT.

#### Scenario: Tests des règles

- **WHEN** `npm run test:rules` est lancé dans `app/`
- **THEN** les tests passent : lecture publique d'un AAP publié, refus de lecture d'un brouillon sans compte,
  lecture et mise à jour d'un AAP par l'administrateur, refus de mise à jour par un porteur, mise à jour de
  `subscriptionStatus` d'un utilisateur par l'administrateur, refus d'écriture dans `applications` et
  `savedSearches` même par leur propriétaire

#### Scenario: Déploiement

- **WHEN** Monsieur DUCOUT donne son accord et la commande de déploiement des règles est lancée
- **THEN** la console Firebase montre la nouvelle version des règles, et l'archivage d'un AAP depuis
  `/admin/aaps` réussit
