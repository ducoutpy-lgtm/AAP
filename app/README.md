# AAP Platform - Plateforme de Recherche d'Appels à Projets

Plateforme web centralisée pour la recherche et la gestion des appels à projets en France.

## 📋 Table des matières

- [Technologies](#technologies)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Configuration](#configuration)
- [Démarrage](#démarrage)
- [Structure du projet](#structure-du-projet)
- [Fonctionnalités](#fonctionnalités)
- [Déploiement](#déploiement)
- [Documentation](#documentation)

## 🚀 Technologies

**Frontend:**
- React 18 + TypeScript
- Vite
- Tailwind CSS
- React Router v6
- Lucide React (icons)
- Firebase SDK (Auth, Firestore, Storage)
- Stripe (paiements)

**Backend:**
- Firebase (Auth, Firestore, Storage, Functions, Hosting)
- Cloud Functions (Node.js 18 + TypeScript)
- Stripe API

## 📦 Prérequis

- Node.js 18+
- npm ou yarn
- Firebase CLI (`npm install -g firebase-tools`)
- Compte Firebase
- Compte Stripe

## 🔧 Installation

### 1. Cloner le repository

```bash
git clone <repository-url>
cd AAP
```

### 2. Installer les dépendances

**Frontend:**
```bash
npm install
```

**Cloud Functions:**
```bash
cd functions
npm install
cd ..
```

## ⚙️ Configuration

### 1. Firebase

1. Créer un projet Firebase sur [console.firebase.google.com](https://console.firebase.google.com)

2. Activer les services:
   - Authentication (Email/Password + Google)
   - Firestore Database
   - Storage
   - Functions
   - Hosting

3. Créer une application Web dans Firebase et récupérer la configuration

4. Créer un fichier `.env` à la racine:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

VITE_STRIPE_PUBLIC_KEY=pk_test_...
VITE_APP_ENV=development
VITE_APP_URL=http://localhost:3000
```

### 2. Stripe

1. Créer un compte sur [stripe.com](https://stripe.com)

2. Récupérer les clés API (mode test)

3. Créer les produits et prix dans Stripe Dashboard:
   - Porteur Mensuel: 29.99€/mois
   - Porteur Annuel: 299.99€/an
   - Financeur Mensuel: 99.99€/mois
   - Financeur Annuel: 999.99€/an

4. Récupérer les Price IDs et les mettre à jour dans `src/config/stripe.ts`

5. Configurer le webhook Stripe:
   ```bash
   # En développement, utiliser Stripe CLI
   stripe listen --forward-to localhost:5001/[PROJECT_ID]/europe-west1/stripeWebhook
   ```

### 3. Firebase Functions Configuration

Configurer les variables d'environnement pour les Cloud Functions:

```bash
firebase functions:config:set stripe.secret_key="sk_test_..."
firebase functions:config:set stripe.webhook_secret="whsec_..."
firebase functions:config:set app.url="http://localhost:3000"
```

### 4. Firestore Security Rules

Les règles de sécurité Firestore sont dans `firestore.rules`. Depuis le lot 0 du rapport de critique (2026-10-14) :
lecture publique des AAP publiés, lecture et actions (publier, clôturer, archiver, supprimer) réservées à
l'administrateur sur `aap`, suspension et activation d'un utilisateur par l'administrateur sur `users`, écriture
interdite dans les collections des modules gelés. Tests sur l'émulateur Firestore (`tests/rules/`) :

```bash
npm run test:rules
```

Prérequis : un JDK 21 en tête du PATH (la CLI Firebase refuse Java 11 : « no longer supports Java version before 21 ») ;
l'émulateur est téléchargé au premier lancement. Déployer, après accord de Monsieur DUCOUT :

```bash
firebase deploy --only firestore:rules --project aapi-11bc3
```

### 5. Firestore Indexes

Créer les indexes nécessaires dans Firestore (Firebase vous invitera à les créer lors de la première utilisation des requêtes).

## 🏃 Démarrage

### Développement Local

**1. Démarrer le serveur de développement Vite:**

```bash
npm run dev
```

L'application sera accessible sur `http://localhost:3000`

**2. (Optionnel) Démarrer les émulateurs Firebase:**

```bash
firebase emulators:start
```

Cela démarre:
- Auth Emulator: http://localhost:9099
- Firestore Emulator: http://localhost:8080
- Functions Emulator: http://localhost:5001
- Storage Emulator: http://localhost:9199

Pour utiliser les émulateurs, ajouter dans `.env`:
```env
VITE_USE_EMULATORS=true
```

**3. (Optionnel) Démarrer Stripe CLI pour les webhooks:**

```bash
stripe listen --forward-to localhost:5001/[PROJECT_ID]/europe-west1/stripeWebhook
```

### Build de production

```bash
npm run build
```

Les fichiers buildés seront dans le dossier `dist/`

### Lint

```bash
npm run lint
```

Configuration `.eslintrc.cjs` créée le 2026-10-14 (gabarit Vite) ; les fichiers des modules gelés y sont ignorés.

## 📁 Structure du projet

```
AAP/
├── src/
│   ├── components/
│   │   ├── guards/          # Route guards (Protected, Role, Subscription)
│   │   └── ui/              # Composants UI réutilisables
│   ├── config/
│   │   ├── firebase.ts      # Configuration Firebase
│   │   └── stripe.ts        # Configuration Stripe
│   ├── contexts/
│   │   └── AuthContext.tsx  # Context d'authentification
│   ├── pages/
│   │   ├── public/          # Pages publiques
│   │   ├── auth/            # Pages d'authentification
│   │   ├── porteur/         # Pages porteur
│   │   └── financeur/       # Pages financeur
│   ├── types/
│   │   └── index.ts         # Types TypeScript
│   ├── App.tsx              # Routes principales
│   ├── main.tsx             # Point d'entrée
│   └── index.css            # Styles globaux
├── functions/
│   └── src/
│       ├── auth/            # Triggers auth
│       ├── applications/    # Triggers candidatures
│       ├── payments/        # Paiements Stripe
│       └── scheduled/       # Fonctions planifiées
├── public/                  # Assets publics
├── .env.example             # Variables d'environnement exemple
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

## ✨ Fonctionnalités

**Périmètre du MVP depuis le 2026-10-14** (lot 0 du rapport de critique, décision de Monsieur DUCOUT) : consultation
publique des AAP (`/aap/search`, `/aap/:aapId`), connexion (`/login`) et administration (`/admin`, `/admin/aaps`,
`/admin/utilisateurs`). Les autres modules ci-dessous sont gelés jusqu'au lot 4 : routes retirées de `src/App.tsx`,
code conservé sans modification, inscription fermée (`/signup` affiche la page 404). Une fiche sans date de clôture
affiche « Date de clôture non précisée » et se classe après les fiches datées ; depuis le 2026-10-14 au soir (décision
de Monsieur DUCOUT) l'import la publie directement avec le badge « À vérifier ».

**Lancer l'application depuis le bureau** : raccourci « AAP Sante » (`lancer_application.cmd`, 2026-10-19) : démarre le
serveur local sur le port 3000 et ouvre le navigateur sur la recherche ; fermer la fenêtre noire arrête le serveur. Nom
affiché « AAP Santé » depuis le 2026-10-19 (nom provisoire décidé par Monsieur DUCOUT). Connexion Google activée dans la
console Firebase le même jour.

**Dégel de l'application complète** (changement `degel-application-complete`, 2026-10-19, décision de Monsieur DUCOUT) :
les modules gelés par le lot 0 sont de retour, avec leurs gardes d'origine (connexion, abonnement actif ou essai, rôle) :
inscription `/signup` (essai de 14 jours), `/complete-profile` (parcours d'intégration en trois écrans, 2026-10-20),
`/profil` (compte et profil modifiables, 2026-10-20),
`/aap/:id/edit` (modification d'un appel par son auteur, 2026-10-20), abonnement (écrans seulement, Stripe non branché),
porteur (`/dashboard/porteur`, `/aap/:id/candidater`, `/mes-candidatures`, `/recherches-sauvegardees`,
`/recommandations`), financeur (`/dashboard/financeur`, `/mes-aap`, `/aap/nouveau`, `/aap/:id/candidatures`,
`/aap/:id/candidature/:cid/evaluer`, `/statistiques`), communs (`/messages`, `/notifications`, `/calendrier`),
`/admin/statistiques`. Pourquoi : voir toute l'application fonctionner avec les 289 appels publiés. Les fonctions
serveur (notifications automatiques, alertes e-mail, paiement) restent non déployées tant que le forfait Blaze n'est pas
confirmé. Les règles Firestore rouvrent les écritures des collections des modules (profils, candidatures, recherches,
favoris, notifications, messages ; création d'un appel par un financeur abonné à son nom) et restent testées sur
l'émulateur (`npm run test:rules`, 23 tests). Pages légales rédigées dans `src/pages/legal/` (mentions légales, CGU,
politique de confidentialité) avec les données d'entreprise à valider surlignées. Tests : `npm test` (Vitest,
Testing Library, jsdom) couvre `utils/relecture.ts`, `utils/territoires.ts` et le rendu des pages légales, sans aucun
appel Firebase. La session ne crée aucun compte sur le vrai projet : les parcours connectés sont vérifiés par Monsieur
DUCOUT avec des comptes de test.

**Espace d'administration et compte administrateur** (changement `acces-administration`, 2026-10-15) : `/admin`,
`/admin/aaps` et `/admin/utilisateurs` sont réservés aux comptes dont `users/{uid}.userType` vaut `admin`. Aucun compte de
ce type n'existait et l'inscription est fermée : le script `scripts/creer_admin.py --email <adresse>` (essai à blanc avec
`--dry-run`) crée le compte Firebase Auth sans mot de passe, ou le retrouve, et écrit le profil avec le rôle admin. Le mot
de passe se choisit ensuite par « Mot de passe oublié ? » sur `/login` : la page `/reset-password` envoie l'e-mail de
réinitialisation de Firebase. Le fournisseur Google n'est pas activé dans le projet Firebase : le bouton « Google » de la
page de connexion ne fonctionne pas.

**Suivi de la validation dans la modération des AAP** (`/admin/aaps`, 2026-10-19, instruction 12 du rapport de critique) :
quatre compteurs cliquables (proposée non relue, à corriger, validée, rejetée) comptent les fiches par `validation.statut`,
la seule source de fiabilité d'une fiche ; une liste déroulante filtre sur le même statut (plus « sans bloc validation »
pour les fiches saisies à la main) ; chaque fiche montre son badge de validation, le relecteur (Monsieur DUCOUT ou le
modèle), la date et le commentaire. Pourquoi : la liste par `status` (brouillon, publié) ne dit pas si une fiche a été
relue ni par qui.

**Mention de relecture, date d'extraction et lien officiel** (changement `mention-relecture-fiches`, 2026-10-19,
instruction 11 du rapport de critique) : la liste et la fiche affichent, pour chaque appel scrapé, « Relue par Monsieur
DUCOUT », « Contrôlée par le modèle » ou « Non relue : informations extraites automatiquement », déduit de `validation`
par `src/utils/relecture.ts` ; la date « Informations extraites le ... » (`scrapeMetadata.extraitLe`, posé par l'import)
et le lien « Annonce officielle », cliquable dans la liste sans ouvrir la fiche et placé sous le titre de la fiche. Le
filtre « Relecture » garde les fiches validées, par Monsieur DUCOUT ou par le modèle. Pourquoi : un visiteur doit savoir
ce qui a été relu et pouvoir vérifier à la source.

**Filtres de la recherche** (changement `filtres-recherche`, 2026-10-14 au soir) : Territoire (identifiants écrits par
l'import, affichés avec leur libellé, `src/utils/territoires.ts`), Thématique (champ classé par le modèle :
`scrapeMetadata.champ`, « Santé », « Médico-social », « Non classée » tant que la fiche n'est pas classée) et Financeur,
construits à partir des fiches chargées ; le filtre budget n'écarte pas les fiches sans montant connu. Depuis le changement
`nettoyage-financeurs-territoires` (2026-10-14 au soir) : le filtre Financeur porte sur le nom canonique écrit par l'import
(une seule entrée par ARS), un filtre Source (site d'origine de la fiche, `scrapeMetadata.sourceNom`) est ajouté, les
cinq régions d'outre-mer ont leur libellé et une fiche sans territoire reconnu affiche « Territoire non précisé » au
lieu de « National ».

### Pour les Porteurs de Projets

- ✅ Authentification (Email/Password + Google)
- ✅ Dashboard personnalisé
- 🔄 Recherche avancée d'AAP avec filtres
- 🔄 Sauvegarde d'AAP favoris
- 🔄 Candidature en ligne multi-étapes
- 🔄 Préqualification automatique
- 🔄 Suivi des candidatures
- 🔄 Alertes personnalisées
- 🔄 Messagerie avec financeurs

### Pour les Financeurs

- ✅ Authentification et profil
- ✅ Dashboard avec statistiques
- 🔄 Publication d'AAP (CRUD)
- 🔄 Gestion des candidatures
- 🔄 Système de notation et scoring
- 🔄 Statistiques détaillées
- 🔄 Messagerie avec porteurs

### Fonctionnalités Communes

- ✅ Abonnements Stripe (essai gratuit 14 jours)
- 🔄 Notifications in-app
- 🔄 Calendrier des deadlines
- 🔄 Profils personnalisés
- 🔄 Messagerie interne

**Légende:** ✅ Implémenté | 🔄 À développer

## 🚢 Déploiement

### Déploiement sur Firebase Hosting

1. Build de production:
```bash
npm run build
```

2. Déployer sur Firebase:
```bash
firebase deploy
```

Ou déployer uniquement certains services:
```bash
# Hosting seulement
firebase deploy --only hosting

# Functions seulement
firebase deploy --only functions

# Firestore rules seulement
firebase deploy --only firestore:rules
```

### Environnement de staging

```bash
firebase hosting:channel:deploy staging
```

## 📚 Documentation

- [Cahier des charges](./CAHIER-DES-CHARGES.md)
- [Annexe technique](./annexe-technique-detaillee.md)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Stripe Documentation](https://stripe.com/docs)
- [Vite Documentation](https://vitejs.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 🤝 Contribution

Ce projet suit les phases de développement définies dans le cahier des charges (25 semaines).

**Phase actuelle:** Phase 1 - Fondations (Semaines 1-3)

## 📝 License

Propriétaire - Tous droits réservés

## 🐛 Bugs et Support

Pour signaler un bug ou demander de l'aide, créer une issue dans le repository.

---

**Version:** 1.0.0
**Date:** Novembre 2025
