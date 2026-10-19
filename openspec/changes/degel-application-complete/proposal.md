# Proposal

## Why

Le lot 0 (2026-10-14) a gelé tous les modules de l'application hors consultation publique et administration :
inscription, profils, tableau de bord porteur, candidatures, recherches sauvegardées, recommandations, espace
financeur, messagerie, notifications, calendrier, statistiques, abonnement. Le 2026-10-19, la base compte 289 appels
publiés dont 254 contrôlés par le modèle ; Monsieur DUCOUT décide : « compte porteur, inscription, profil, recherche
sauvegardée, candidature : on le lance ; espace financeur : on le lance ; messagerie, notification, calendrier : on le
lance ; pages légales, CGU, confidentialité : il faut que tu rédiges tout ; MFA : quand tout sera validé ; et les
tests, il faut le faire ». Le forfait Blaze est accepté et activé par lui ; tant qu'il n'est pas confirmé, rien n'est
déployé côté fonctions serveur.

## What Changes

- **Dégel technique** : routes rétablies dans `App.tsx` (celles d'avant le lot 0, plus `/reset-password`), fichiers
  gelés retirés des exclusions de lint et de compilation, trois pages corrigées pour la date de clôture nulle. Lint et
  build verts sur toute l'application.
- **Règles Firestore** rouvertes en écriture pour les collections des modules (profils, candidatures, recherches
  sauvegardées, favoris, notifications, messages), création d'un appel par un financeur abonné ; `payments` et
  `analytics` restent fermées (fonctions serveur). Tests de règles étendus sur l'émulateur ; déploiement après accord.
- **Inscription rouverte** (`/signup`, essai 14 jours, profil à compléter) ; parcours porteur, financeur, messagerie,
  notifications et calendrier vérifiés : par la session sur ce qui ne demande pas de compte, par Monsieur DUCOUT pour
  les parcours connectés sur le vrai projet. Pourquoi : la session ne crée aucun compte ni ne saisit de mot de passe
  hors émulateur local.
- **Pages légales rédigées** : mentions légales, CGU, politique de confidentialité, au nom d'ARCADIA SASU (Évry),
  DPO Monsieur DUCOUT, champs inconnus marqués `[À VALIDER — Monsieur DUCOUT]`.
- **Tests** : tests unitaires Vitest des utilitaires de l'application (`relecture`, `territoires`), tests de rendu des
  pages publiques avec Testing Library, tests de règles étendus ; script `npm test`.
- **Hors périmètre** : déploiement des fonctions serveur, Stripe réel, alertes e-mail, MFA (après Blaze et validation).

## Capabilities

### New Capabilities

- `application-complete` : parcours comptes, porteur, financeur, messagerie, notifications, calendrier, pages légales,
  tests.

### Modified Capabilities

- `consultation-aap-scrapes` : aucune règle nouvelle ; les pages publiques gardent leur comportement.

## Impact

- Code : `app/src/App.tsx`, `.eslintrc.cjs`, `tsconfig.json`, trois pages (date nulle), `firestore.rules`, tests,
  trois pages légales nouvelles, dépendance de développement Testing Library.
- Données : collections `porteurProfiles`, `financeurProfiles`, `applications`, `savedSearches`, `favoriteAap`,
  `notifications`, `messages` de nouveau écrites par l'application.
- Coût : zéro euro ; Blaze n'est requis que pour les fonctions serveur, hors périmètre.
