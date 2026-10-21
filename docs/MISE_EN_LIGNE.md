# Mise en ligne pour les testeurs

Jour 7 du plan MVP (changement `mise-en-ligne-testeurs`, 2026-10-21). Procédure rejouable, dans l'ordre. Toutes les
commandes se lancent depuis le dossier `app` du dépôt, par Monsieur DUCOUT : le garde-fou de la session Claude Code
refuse les déploiements.

## Pourquoi Firebase Hosting

Le projet Firebase `aapi-11bc3` héberge déjà la base, les comptes et les règles ; `firebase.json` contient la section
`hosting` (dossier `dist`, réécriture vers `index.html` pour les adresses de l'application). Déployer là évite un
second compte et une seconde configuration. Le déploiement Netlify d'avril (`teal-twilight-a7fcf3.netlify.app`) reste
une solution de repli si Hosting posait problème. Hosting est gratuit dans le forfait actuel pour trois testeurs.

## 1. Avant de déployer

1. **Champs d'entreprise** dans `app/src/pages/legal/editeur.ts` : `siege` (adresse complète), `siren`, `capital`,
   `contact` (adresse e-mail), et `dateMiseAJour`. Tant qu'ils contiennent « À VALIDER », les pages légales les
   affichent surlignés en jaune.
2. **Variables de production** : `app/.env` contient la configuration Firebase du vrai projet (jamais commitée). La
   construction (`npm run build`) les incorpore. Vérifier que `VITE_FIREBASE_PROJECT_ID` vaut `aapi-11bc3`.
3. **Règles Firestore et Storage** : le fichier `firestore.rules` du dépôt est la référence ; le déploiement ci-dessous
   le publie en même temps que le site (règles `journal`, `messagesContact`, `coutsIa`, `statistiquesPubliques`,
   `retours`).
4. **Contrôles locaux** :

```bash
cd "C:\Users\pierr\Documents\Projets Claude Code\AAP\app" && npm run lint && npm run build && npm test
```

## 2. Déployer

```bash
cd "C:\Users\pierr\Documents\Projets Claude Code\AAP\app" && firebase deploy --only hosting,firestore:rules,storage --project aapi-11bc3
```

La commande affiche l'adresse publique (`https://aapi-11bc3.web.app`). Les fonctions serveur ne sont pas dans cette
commande : elles attendent l'ouverture de la facturation Blaze (jour 5).

## 3. Après le déploiement

1. Ouvrir l'adresse publique sans compte : accueil, « Financeurs » (chiffres présents), « Tarifs », pages légales.
2. Se connecter avec un compte administrateur : `/admin/testeurs` s'ouvre, « Retours des testeurs » affiche « Aucun
   retour » ou les premiers retours.
3. Lancer une fois `python scripts/publier_chiffres.py` depuis la racine du dépôt si les chiffres de la page Financeurs
   manquent (la veille hebdomadaire le refera chaque lundi).
4. Noter l'adresse et la date de mise en ligne dans `CHANGELOG.md`.

## 4. Inviter les trois premiers testeurs

Objet : Test de la plateforme AAP Santé (ARCADIA)

Bonjour,

Je vous propose de tester AAP Santé, qui rassemble les appels à projets du secteur sanitaire et médico-social.
L'accès est gratuit pendant le test.

1. Ouvrez https://aapi-11bc3.web.app et créez votre compte (« Je cherche des financements » ou « Je finance des projets »).
2. Suivez les trois écrans de démarrage, puis cherchez un appel qui vous concerne et ouvrez sa fiche.
3. À tout moment, dites-moi ce qui coince ou ce qui manque par « Donner mon avis » dans le menu : chaque remarque arrive
   directement chez moi.

Ce qui n'est pas encore ouvert : le paiement (aucun prélèvement possible) et le pré-remplissage de candidature depuis
un PDF. Vos données restent en Europe et ne sont transmises à personne (page « Confidentialité »).

Merci de votre aide,
Pierre-Yves DUCOUT, ARCADIA SASU, [adresse e-mail de contact à compléter]

## 5. Lire les retours

`/admin/testeurs` : section « Retours des testeurs » en tête (date, compte, rôle, type, page, message), puis l'usage
compte par compte. Un retour ne se modifie ni ne se supprime depuis l'application (règle Firestore) ; la réponse se
fait par courriel au testeur.
