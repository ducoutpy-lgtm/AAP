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

Les règles de sécurité Firestore sont dans `firestore.rules`. Déployer avec:

```bash
firebase deploy --only firestore:rules
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
