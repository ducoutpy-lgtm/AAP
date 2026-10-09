# AAP Platform — Résumé du projet (fiche de reprise)

Document de synthèse pour reprendre ce projet dans un autre environnement (autre machine, autre outil IA, autre développeur).

- **Dépôt GitHub :** `ducoutpy-lgtm/AAP`
- **Branche de développement :** `claude/implement-app-requirements-011CUrUECuFa29vv6uit19R8`
- **Déploiement actuel :** Netlify — https://teal-twilight-a7fcf3.netlify.app/
- **Projet Firebase :** `aapi-11bc3`
- **Documents de référence :** `CAHIER-DES-CHARGES.md`, `annexe-technique-detaillee.md`, `README.md`

---

## 1. Ce que fait l'application

Plateforme web centralisant les **Appels À Projets (AAP)** en France, avec deux types d'utilisateurs payants et un rôle admin :

| Rôle | Ce qu'il peut faire |
|---|---|
| **Porteur de projet** | Rechercher des AAP (filtres secteur / territoire / budget), consulter le détail, candidater via un formulaire en 7 étapes avec pièces jointes, suivre ses candidatures, sauvegarder des recherches avec alertes, recevoir des recommandations, voir le calendrier des deadlines, messagerie, notifications. |
| **Financeur** | Créer / gérer ses AAP, consulter les candidatures reçues (filtres, tri, export CSV), évaluer chaque candidature (score, commentaires, changement de statut), statistiques de ses AAP, messagerie, notifications. |
| **Admin** | Tableau de bord global, gestion des utilisateurs (suspendre / réactiver, export CSV), modération des AAP (publier / clôturer / archiver / supprimer), statistiques plateforme (KPIs, évolution 6 mois, revenus, taux de conversion). |

Modèle économique : abonnement Stripe (mensuel / annuel) avec **essai gratuit de 14 jours** attribué à l'inscription.

---

## 2. Stack technique

**Frontend**
- React 18 + TypeScript, Vite 5 (port dev : `3000`)
- React Router v6
- Tailwind CSS 3, icônes `lucide-react`
- Firebase SDK v10 (Auth, Firestore, Storage)
- `date-fns` (calendrier), `recharts`, `react-hook-form`, `zod`, `@tanstack/react-query` (installés, peu utilisés)
- `@stripe/stripe-js`, `@sentry/react`

**Backend (Firebase)**
- Authentication (Email/Password + Google)
- Firestore (base de données)
- Storage (documents de candidature)
- Cloud Functions (Node 18 + TS, dossier `functions/`) : `onUserCreated`, `onApplicationCreated`, `createCheckoutSession`, `stripeWebhook`, `sendDailyAlerts` — **non déployées à ce jour**
- Fichiers de config : `firebase.json`, `firestore.rules`, `firestore.indexes.json`, `storage.rules`

**Scripts npm**
```bash
npm install        # dépendances
npm run dev        # serveur de dev → http://localhost:3000
npm run build      # tsc + vite build → dossier dist/
npm run preview    # prévisualiser le build
npm run lint
```

---

## 3. Structure du code

```
src/
├── App.tsx                      # Toutes les routes + guards
├── main.tsx
├── config/
│   ├── firebase.ts              # init Firebase (lit les VITE_FIREBASE_*)
│   └── stripe.ts                # Price IDs Stripe (à remplacer par les vôtres)
├── contexts/AuthContext.tsx     # signup / login / logout / userProfile (Firestore users/{uid})
├── components/
│   ├── guards/                  # ProtectedRoute, RoleGuard, SubscriptionGuard
│   └── ui/                      # Button, Badge, Card, Input, Select, Textarea, Modal, Stepper, LoadingSpinner
├── services/aapService.ts       # CRUD AAP
├── types/index.ts               # Tous les types (User, AAP, Application, Message, Notification, SavedSearch, Payment…)
└── pages/
    ├── public/LandingPage.tsx
    ├── auth/LoginPage.tsx, SignupPage.tsx
    ├── profile/CompleteProfile.tsx, CompletePorteurProfile.tsx, CompleteFinanceurProfile.tsx
    ├── subscription/SelectPlanPage.tsx, SubscriptionSuccess.tsx, SubscriptionCancelled.tsx
    ├── porteur/PorteurDashboard, SearchAapPage, AapDetailPage, ApplicationFormPage,
    │           MyApplicationsPage, SavedSearchesPage, RecommendationsPage
    ├── financeur/FinanceurDashboard, CreateAapPage, MyAapPage, ViewApplicationsPage,
    │             EvaluateApplicationPage, StatisticsPage
    ├── common/NotificationsPage, MessagesPage, CalendarPage
    └── admin/AdminDashboard, ManageUsersPage, ManageAAPsPage, GlobalStatisticsPage
```

### Contraintes des composants UI (source fréquente d'erreurs TypeScript)
- `Button` : `variant` ∈ `primary | secondary | danger | ghost` (pas de `outline`)
- `Badge` : `variant` ∈ `primary | success | warning | error | gray` (pas de `secondary`)
- `Stepper` : les étapes utilisent `{ label, description }` (pas `title`)

---

## 4. Routes principales

| Route | Accès |
|---|---|
| `/`, `/login`, `/signup` | public |
| `/complete-profile` | connecté |
| `/abonnement/choisir`, `/abonnement/succes`, `/abonnement/annule` | connecté |
| `/dashboard/porteur`, `/aap/search`, `/aap/:aapId/candidater`, `/mes-candidatures`, `/recherches-sauvegardees`, `/recommandations` | porteur + abonnement |
| `/aap/:aapId` | connecté + abonnement |
| `/dashboard/financeur`, `/mes-aap`, `/aap/nouveau`, `/aap/:aapId/candidatures`, `/aap/:aapId/candidature/:applicationId/evaluer`, `/statistiques` | financeur + abonnement |
| `/calendrier`, `/messages` | connecté + abonnement |
| `/notifications` | connecté |
| `/admin`, `/admin/utilisateurs`, `/admin/aaps`, `/admin/statistiques` | admin |
| `/aap/:aapId/edit`, `/profil`, `/admin/paiements`, `/admin/parametres`, `/cgu`, `/confidentialite`, `/mentions-legales` | **placeholders** (pages non développées) |

Après connexion, `LoginPage` lit `users/{uid}.userType` et redirige vers le bon dashboard.

---

## 5. Modèle de données Firestore

| Collection | Clé | Contenu principal |
|---|---|---|
| `users/{uid}` | uid Auth | `email`, `userType` (`porteur`/`financeur`/`admin`), `subscriptionStatus` (`trial`/`active`/`expired`/`cancelled`), `subscriptionPlan`, `trialEndsAt`, `profileComplete`, `createdAt` |
| `porteurProfiles/{uid}` | uid | `structureName`, `structureType`, `secteurActivite`, `domainesIntervention[]`, adresse, contact |
| `financeurProfiles/{uid}` | uid | `organisationName`, `organisationType`, `sectorsSupported[]`, adresse, contact |
| `aap/{aapId}` | auto | `financeurId`, `title`, `description`, `sectorsTargeted[]`, `territoriesEligible[]`, `budgetMin/Max`, `deadline`, `status` (`draft`/`published`/`closed`/`archived`), `views`, `applicationsCount` |
| `applications/{id}` | auto | `aapId`, `porteurId`, `financeurId`, projet (titre, description, objectifs, méthodo, planning, impact), `budget`, `team[]`, `partners[]`, `documents[]`, scores, `status` (`draft`/`submitted`/`under_review`/`accepted`/`rejected`/`pending_info`), `statusHistory[]` |
| `savedSearches/{id}` | auto | `userId`, `name`, `filters`, `alertEnabled`, `alertFrequency` |
| `favoriteAap/{id}` | auto | `userId`, `aapId` |
| `notifications/{id}` | auto | `userId`, `type`, `title`, `message`, `read`, `actionUrl` |
| `messages/{id}` | auto | `applicationId`, `senderId`, `receiverId`, `content`, `read`, `createdAt` |
| `payments/{id}` | auto | écrit par Cloud Functions uniquement |

Les types complets sont dans `src/types/index.ts`.

---

## 6. Configuration requise

### Variables d'environnement (`.env` à la racine — **non versionné**)
```env
VITE_FIREBASE_API_KEY=            # Console Firebase > Paramètres du projet > Vos applications (Web)
VITE_FIREBASE_AUTH_DOMAIN=aapi-11bc3.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=aapi-11bc3
VITE_FIREBASE_STORAGE_BUCKET=aapi-11bc3.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_STRIPE_PUBLIC_KEY=           # optionnel tant que Stripe n'est pas branché
VITE_APP_ENV=development
VITE_APP_URL=http://localhost:3000
```
Sur Netlify, ces mêmes variables sont saisies dans *Site configuration → Environment variables*. Build command : `npm run build`, publish directory : `dist`.

### Côté Firebase (console)
1. **Authentication** → activer *E-mail/Mot de passe* (et Google si souhaité).
2. **Firestore** → créer la base, puis **publier les règles de `firestore.rules`** (les règles par défaut du mode production bloquent la création du profil à l'inscription → erreur « Profil utilisateur non trouvé »).
3. **Storage** → activer, publier `storage.rules`.
4. Pour un admin : dans Firestore, mettre `users/{uid}.userType = "admin"`.

### Déploiement alternatif : Firebase Hosting
```bash
npm i -g firebase-tools && firebase login
npm run build
firebase deploy --only hosting,firestore:rules,storage
```
`firebase.json` contient déjà la rewrite SPA vers `index.html`.

---

## 7. État d'avancement (par rapport au cahier des charges)

| Phase | Contenu | État |
|---|---|---|
| 1 | Fondations : Firebase, auth, UI kit, guards | ✅ |
| 2–3 | Profils, abonnements (UI), création / gestion AAP | ✅ |
| 4–5 | Recherche AAP, candidature multi-étapes, évaluation | ✅ |
| 6–7 | Notifications, messagerie temps réel, recherches sauvegardées, recommandations, calendrier, statistiques financeur | ✅ |
| 8 | Administration (dashboard, utilisateurs, modération AAP, stats globales) | ✅ |
| 9 | Tests E2E, performance | ⏳ non commencé |
| 10 | Déploiement production, documentation | 🔄 déployé sur Netlify (test) |

Dernier build : `npm run build` OK, bundle ≈ 917 kB (221 kB gzip). Aucune erreur TypeScript.

---

## 8. Ce qui reste à faire / limites connues

**Fonctionnel**
- Pages placeholder : édition d'un AAP, page profil, gestion paiements admin, paramètres admin, pages légales (CGU, confidentialité, mentions légales).
- Mot de passe oublié : lien présent (`/reset-password`) mais route non créée (la fonction `resetPassword` existe dans `AuthContext`).
- Préqualification automatique des candidatures (scores `completenessScore`, `conformityScore`) : champs prévus, calcul non implémenté.
- Alertes email (recherches sauvegardées) : dépendent de la Cloud Function `sendDailyAlerts`, non déployée.

**Paiement**
- Stripe : UI de choix de plan présente, mais `createCheckoutSession` / `stripeWebhook` (Cloud Functions) ne sont pas déployées et les Price IDs de `src/config/stripe.ts` sont à remplacer. Les comptes restent en `trial` tant que ce n'est pas branché.

**Technique**
- Pas de tests (unitaires ni E2E).
- Bundle > 500 kB : prévoir du code-splitting (`React.lazy` par page).
- `firestore.indexes.json` : les requêtes composées (ex. `orderBy` + `where`) peuvent demander des index ; Firebase propose un lien de création dans la console au premier appel.
- Les stats admin chargent les collections entières côté client ; à remplacer par des agrégats (collection `analytics`) quand le volume grossit.
- Cloud Functions non déployées : `onUserCreated`, `onApplicationCreated` (notifications automatiques) sont donc inactives.

---

## 9. Comptes de test recommandés

Créer via l'inscription de l'application, puis ajuster dans Firestore si besoin :
- `porteur@test.com` → `userType: porteur`
- `financeur@test.com` → `userType: financeur`
- un compte dont on passe `userType` à `admin` dans `users/{uid}`

Si un compte existe dans Authentication mais pas dans `users/`, créer manuellement le document `users/{uid}` (champs du §5) et `porteurProfiles/{uid}` ou `financeurProfiles/{uid}`.

---

## 10. Historique des commits (branche de travail)

```
f83ad2a Fix login redirect to appropriate dashboard
63f5855 Implement Phase 8: Administration
4e4f178 Implement Phase 6 and 7: Communication and Advanced Features
35a7362 Implement Phase 4 and 5: AAP search, application system, and evaluation
a02e6f1 Implement Phase 2 and 3: User profiles, subscriptions, and AAP management
d9e2793 feat: implémentation de l'application AAP Platform selon le cahier des charges
```
