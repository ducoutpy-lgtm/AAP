# Proposal

## Why

Pour contrôler que les appels à projets collectés arrivent bien dans la plateforme, il faut aujourd'hui
un compte, un abonnement (ou un essai), un rôle porteur et passer par un écran de connexion dont la
redirection est défectueuse. Le 2026-10-12, ce parcours a bloqué le contrôle des six fiches importées
(bouton Google non activé, message d'erreur trompeur). Monsieur DUCOUT l'a relevé : l'authentification
n'apporte rien à la preuve « les AAP scrapés sont visibles », elle la retarde. Les appels à projets
sont par nature des informations publiques : les consulter ne devrait exiger aucun compte, ni en
développement, ni dans le produit final. Le compte reste nécessaire pour agir (candidater, sauvegarder
une recherche, publier un appel, évaluer).

## What Changes

- Règle Firestore : la lecture d'un document de la collection `aap` dont `status` vaut `published`
  est autorisée à tout visiteur, connecté ou non ; les autres opérations (création, modification,
  lecture des brouillons) gardent leurs conditions actuelles.
- Routes de l'application : « Rechercher des AAP » (`/aap/search`) et la fiche d'un AAP
  (`/aap/:aapId`) sortent de la zone protégée (plus de garde de connexion, d'abonnement ni de rôle).
  Les actions qui exigent un compte (« Candidater », favoris) restent réservées aux comptes connectés
  et renvoient vers la connexion sinon.
- Page d'accueil : un lien « Voir les appels à projets » mène à la recherche sans compte.
- Déploiement des règles sur le projet `aapi-11bc3` (`firebase deploy --only firestore:rules`),
  après accord explicite de Monsieur DUCOUT, car cela modifie le projet Firebase.

## Capabilities

### New Capabilities

Aucune.

### Modified Capabilities

- `consultation-aap-scrapes` : la consultation (liste, fiche, pièces jointes) est ouverte à tout
  visiteur ; les scénarios « connecté avec un compte porteur » deviennent « tout visiteur ».

## Impact

- Modifié : `app/firestore.rules`, `app/src/App.tsx`, `app/src/pages/public/LandingPage.tsx`,
  `app/src/pages/porteur/AapDetailPage.tsx` (bouton Candidater pour visiteur non connecté),
  README racine (procédure de démo), CHANGELOG, CLAUDE.md, REPRISE.md.
- Sécurité : seuls les AAP publiés deviennent lisibles sans compte ; brouillons, candidatures,
  profils, messages restent protégés. Aucune donnée personnelle dans la collection `aap`.
- Coût : zéro euro (forfait Spark, lectures gratuites dans la limite du quota quotidien). Temps de
  travail : une heure.

## Hors périmètre

- Corriger la redirection après connexion (défaut connu, à traiter dans un changement « connexion »).
- Activer la connexion Google.
- Ouvrir sans compte d'autres pages (tableau de bord, candidatures, messagerie).
