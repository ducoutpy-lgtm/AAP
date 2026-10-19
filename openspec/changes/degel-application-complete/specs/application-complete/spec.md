# application-complete Specification

## ADDED Requirements

### Requirement: Routes des modules rétablies

L'application SHALL servir de nouveau les routes de l'inscription, du profil, de l'abonnement, du porteur
(tableau de bord, candidature, mes candidatures, recherches sauvegardées, recommandations), du financeur (tableau de
bord, mes appels, nouvel appel, candidatures reçues, évaluation, statistiques), de la messagerie, des notifications, du
calendrier et des statistiques d'administration, avec les gardes d'avant le lot 0 (connexion, rôle, abonnement), et
`npm run lint` et `npm run build` SHALL passer sans exclure aucun fichier.

#### Scenario: Inscription accessible

- **WHEN** un visiteur ouvre `/signup`
- **THEN** il voit le formulaire d'inscription (porteur ou financeur), et non la page 404

#### Scenario: Route protégée sans compte

- **WHEN** un visiteur ouvre `/dashboard/porteur`
- **THEN** il est renvoyé vers `/login`

### Requirement: Écritures des modules autorisées par les règles Firestore

Les règles SHALL autoriser : un compte à écrire son profil porteur ou financeur ; un porteur abonné à créer une
candidature, à modifier et supprimer la sienne tant qu'elle est en brouillon ; le financeur de l'appel à mettre à jour la
candidature (évaluation) ; un compte à écrire ses recherches sauvegardées, favoris et notifications ; un compte abonné à
créer un message et le destinataire à le marquer lu ; un financeur abonné à créer un appel et son auteur à le modifier ;
`payments` et `analytics` SHALL rester en écriture interdite. Chaque règle SHALL être couverte par un test sur
l'émulateur.

#### Scenario: Candidature du porteur

- **WHEN** un porteur en essai crée une candidature portant son identifiant, puis la modifie en brouillon
- **THEN** les deux écritures réussissent, et la modification par un autre porteur échoue

#### Scenario: Appel créé par un financeur

- **WHEN** un financeur abonné crée un appel avec `financeurId` égal à son identifiant
- **THEN** la création réussit ; la même création par un porteur échoue

### Requirement: Pages légales rédigées

Les routes `/mentions-legales`, `/cgu` et `/confidentialite` SHALL afficher un texte complet en français au nom
d'ARCADIA SASU (Évry), avec le délégué à la protection des données (Monsieur DUCOUT), les finalités, bases légales,
durées de conservation, destinataires, droits des personnes et sous-traitants (Google Firebase, hébergeur du site),
et SHALL marquer `[À VALIDER — Monsieur DUCOUT]` toute donnée que le dépôt ne connaît pas (SIREN, capital, adresse
exacte, directeur de la publication).

#### Scenario: Lecture des mentions légales

- **WHEN** un visiteur ouvre `/mentions-legales`
- **THEN** il lit l'éditeur ARCADIA SASU, l'hébergeur et le contact, sans la mention « page en cours de développement »

### Requirement: Tests de l'application

Le dépôt SHALL fournir `npm test` (Vitest) couvrant les utilitaires (`relecture`, `territoires`) et le rendu des pages
publiques (recherche, fiche, pages légales) avec des données en mémoire, en plus de `npm run test:rules`.

#### Scenario: Mention de relecture testée

- **WHEN** `npm test` s'exécute
- **THEN** un test vérifie que `mentionRelecture` rend « Contrôlée par le modèle » pour une validation au nom du modèle
  et « Relue par Monsieur DUCOUT » pour un verdict humain, et tous les tests passent
