# Proposal

## Why

Jour 7 du plan MVP (`docs/PLAN_MVP_2026-10-20.md`) : « Mise en ligne pour les testeurs ». Les six premiers jours sont
codés et joués sur les émulateurs ; il manque ce qui permet à trois personnes extérieures d'utiliser l'application et
de dire ce qu'elles en pensent : un formulaire de retour lisible dans l'administration, des pages légales complètes,
une procédure de mise en ligne rejouable, et une invitation prête à envoyer. Décision de Monsieur DUCOUT du 2026-10-21
(« ok »).

## What Changes

- **Formulaire de retour** `/retour` pour tout compte connecté : type (anomalie, idée, incompréhension, autre), page
  concernée, message ; écrit dans la collection `retours` (création par l'auteur seulement, lecture par
  l'administrateur, jamais de modification). Entrée « Donner mon avis » dans la section Support du menu de chaque rôle.
  Pourquoi une collection à part et pas le journal : le journal est automatique et borné à six champs, un retour est
  un texte libre que l'administrateur doit lire et traiter.
- **Retours dans l'administration** : section « Retours des testeurs » en tête de `/admin/testeurs` (les derniers
  d'abord, avec le compte, le type, la page, le message).
- **Pages légales** : les quatre champs d'entreprise restent dans `src/pages/legal/editeur.ts`, seul endroit à
  remplir (adresse, SIREN, capital, e-mail de contact) ; ce changement ne les invente pas, il les liste pour
  Monsieur DUCOUT.
- **Procédure de mise en ligne** `docs/MISE_EN_LIGNE.md` : Firebase Hosting du projet `aapi-11bc3` (déjà configuré
  dans `firebase.json`, même projet que la base, aucun compte supplémentaire ; Netlify d'avril reste une solution de
  repli), vérifications avant et après, commandes à lancer par Monsieur DUCOUT (le garde-fou de la session refuse
  les déploiements), modèle d'invitation des trois premiers testeurs.
- Hors périmètre : paiement, fonctions serveur (facturation Blaze), nom de domaine, mesure d'audience.

## Capabilities

### New Capabilities

- `mise-en-ligne-testeurs` : retours des testeurs et procédure de mise en ligne.

## Impact

- Code : `app/src/pages/common/RetourPage.tsx`, `app/src/utils/retours.ts` et test, `menus.ts`, `App.tsx`,
  `TesteursPage.tsx`, `firestore.rules` et test de règles.
- Documentation : `docs/MISE_EN_LIGNE.md`, résumé de l'application, CHANGELOG, CLAUDE.md, REPRISE.md, plan MVP.
- Coût : zéro euro. Hébergement Firebase Hosting : gratuit dans le forfait actuel pour ce volume.
