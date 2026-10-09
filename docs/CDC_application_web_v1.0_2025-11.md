# CAHIER DES CHARGES COMPLET
## Plateforme Meta-Moteur de Recherche d'Appels à Projets

**Date:** 6 novembre 2025  
**Version:** 1.0  
**Statut:** Prêt pour développement

---

## SOMMAIRE

1. [Introduction Générale](#1-introduction-générale)
2. [Fonctionnalités Principales](#2-fonctionnalités-principales)
3. [Architecture de la Base de Données](#3-architecture-de-la-base-de-données)
4. [Description des Pages et Composants](#4-description-des-pages-et-composants)
5. [Style et Design Global](#5-style-et-design-global)
6. [Configuration des Routes](#6-configuration-des-routes)
7. [Spécifications Techniques](#7-spécifications-techniques)
8. [Livrables et Organisation](#8-livrables-et-organisation)
9. [Critères de Réussite et KPIs](#9-critères-de-réussite-et-kpis)
10. [Risques et Points d'Attention](#10-risques-et-points-dattention)
11. [Annexes](#11-annexes)

---

## 1. INTRODUCTION GÉNÉRALE

### 1.1 Contexte du Projet

Le projet consiste en le développement d'une **plateforme web innovante** centralisant l'ensemble des appels à projets (AAP) disponibles en France.

**Problématique:**  
Les AAP sont actuellement dispersés sur de multiples sites web (ministères, agences d'État, fondations, entreprises), rendant leur recherche complexe et chronophage pour les porteurs de projets.

**Solution proposée:**  
Un meta-moteur de recherche unifié qui:
- Centralise tous les AAP en France
- Facilite la recherche et la découverte pour les porteurs
- Simplifie la gestion et la sélection pour les financeurs
- Propose un outil de préqualification intelligent

### 1.2 Audiences Cibles

**Porteurs de projets:**
- Structures privées (entreprises, startups, PME)
- Associations
- Collectivités territoriales
- Laboratoires de recherche
- Établissements d'enseignement

**Financeurs:**
- Ministères
- Agences d'État (ADEME, ANR, Bpifrance)
- Fondations privées et publiques
- Entreprises proposant des AAP
- Collectivités territoriales

### 1.3 Valeur Ajoutée

**Pour les porteurs:**
- Recherche centralisée et efficace
- Alertes personnalisées
- Candidature guidée en ligne
- Suivi en temps réel

**Pour les financeurs:**
- Outil de préqualification automatique
- Gestion simplifiée des candidatures
- Statistiques et analytics
- Gain de temps considérable dans la sélection

### 1.4 Modèle Économique

**Service payant pour les deux audiences:**
- Abonnements mensuels ou annuels
- Paiement par carte bancaire
- Essai gratuit de 14 jours

### 1.5 Technologies

**Stack imposée:**
- Frontend: React avec TypeScript (TSX)
- Build tool: Vite
- Styling: Tailwind CSS
- Backend & Database: Firebase (Auth, Firestore, Storage, Functions)
- Paiements: Stripe

---

## 2. FONCTIONNALITÉS PRINCIPALES

### 2.1 Recherche et Découverte (F1-F3)

#### F1: Moteur de recherche avancé
- Recherche par mots-clés avec scoring
- Filtres combinables: secteur, montant, deadline, région, type
- Résultats paginés avec tri

#### F2: Autocomplétion
- Suggestions en temps réel
- Historique des recherches

#### F3: Recherches sauvegardées
- Enregistrement de filtres personnalisés
- Notifications automatiques

### 2.2 Gestion Utilisateurs (F4-F6)

#### F4: Authentification Firebase
- Email/password + Google OAuth
- Vérification d'email obligatoire
- Réinitialisation de mot de passe

#### F5: Profils différenciés
- Profil Porteur: structure, domaines, équipe
- Profil Financeur: organisme, types de financement

#### F6: Dashboards personnalisés
- Dashboard Porteur: AAP recommandés, candidatures, alertes
- Dashboard Financeur: statistiques AAP, candidatures récentes

### 2.3 Fonctionnalités Financeurs (F7-F10)

#### F7: Publication et gestion d'AAP (CRUD)
- Formulaire structuré complet
- Upload de documents
- Brouillons sauvegardables
- Édition et suppression

#### F8: Suivi des candidatures
- Liste par AAP avec filtres
- Vue rapide des informations clés

#### F9: Préqualification et gestion
- Score automatique de conformité
- Actions manuelles (notes, commentaires, statuts)
- Shortlists

#### F10: Statistiques
- Vues, candidatures, taux de conversion
- Graphiques d'évolution
- Export des données

### 2.4 Fonctionnalités Porteurs (F11-F13)

#### F11: Alertes personnalisées
- Critères multiples
- Notifications email + in-app
- Fréquence paramétrable

#### F12: Candidature en ligne
- Formulaire guidé multi-étapes
- Upload de documents
- Outil de préqualification en temps réel
- Brouillons sauvegardables

#### F13: Suivi des candidatures
- Statuts en temps réel
- Historique détaillé
- Communications avec financeur

### 2.5 Agrégation (F14-F16)

#### F14: Import automatique d'AAP
- Scraping/API de sources externes
- Normalisation des données
- Détection de doublons

#### F15: Recommandations
- Algorithme basé sur profil et historique
- Score de match affiché

#### F16: Calendrier et rappels
- Vue mensuelle interactive
- Notifications avant deadlines

### 2.6 Communication (F17-F19)

#### F17: Notifications
- Multiples types (AAP, deadlines, statuts)
- In-app + email

#### F18: Messagerie interne
- Chat contextualisé par candidature
- Pièces jointes

#### F19: FAQ et aide
- Base de connaissances
- Aide contextuelle

### 2.7 Paiement (F20)

#### F20: Abonnements Stripe
- Paiement CB sécurisé
- Plans mensuels/annuels
- Essai gratuit 14 jours
- Gestion complète (changement, annulation)

### 2.8 Administration (F21-F23)

#### F21: Dashboard admin
- Gestion utilisateurs et AAP
- Modération
- Gestion paiements

#### F22: Statistiques globales
- KPIs plateforme
- Graphiques d'évolution

#### F23: Export de données
- CSV, Excel, PDF
- Rapports personnalisables

---

## 3. ARCHITECTURE DE LA BASE DE DONNÉES FIREBASE

### 3.1 Collections Firestore Principales

#### `users/{userId}`

```javascript
{
  email: string
  userType: "porteur" | "financeur" | "admin"
  subscriptionStatus: "active" | "trial" | "expired" | "cancelled"
  subscriptionPlan: "monthly" | "annual" | null
  subscriptionId: string  // Stripe ID
  createdAt: timestamp
  profileComplete: boolean
}
```

#### `porteurProfiles/{userId}`
Structure, SIRET, secteur, domaines, coordonnées

#### `financeurProfiles/{userId}`
Organisme, type, secteurs supportés, contact

#### `aap/{aapId}`
Tous les détails de l'AAP: titre, description, critères, budget, deadlines, documents, statistiques

#### `applications/{applicationId}`
Candidature complète: contenu projet, documents, scores, statuts, commentaires

#### `savedSearches/{searchId}`
Recherches sauvegardées avec filtres et alertes

#### `favoriteAap/{favoriteId}`
AAP sauvegardés par utilisateur

#### `notifications/{notificationId}`
Notifications système par utilisateur

#### `messages/{messageId}`
Messagerie contextualisée

#### `payments/{paymentId}`
Historique paiements Stripe

#### `analytics/{analyticsId}`
Statistiques globales plateforme

### 3.2 Règles de Sécurité Firestore

**Principes:**
- Authentification requise pour toutes les opérations
- Vérification du rôle utilisateur
- Vérification de l'abonnement actif
- Propriétaire uniquement pour lecture/écriture données personnelles
- Isolation des données entre porteurs et financeurs

**Exemple (simplifié):**
```javascript
// AAP: lecture tous authentifiés, écriture financeurs avec abonnement
allow read: if request.auth != null;
allow create: if isFinanceur() && hasActiveSubscription();
allow update, delete: if resource.data.financeurId == request.auth.uid;
```

### 3.3 Firebase Storage

**Structure:**
```
/uploads/
  /aap-documents/{aapId}/
  /application-documents/{applicationId}/
  /logos/financeurs/{financeurId}/
  /profiles/avatars/{userId}/
```

---

## 4. DESCRIPTION DES PAGES ET COMPOSANTS

### 4.1 Pages Publiques

#### Landing Page `/`
- Hero avec double CTA (porteur/financeur)
- Problématique et solution
- Fonctionnalités clés
- Pricing
- Footer

#### Sign up/Login `/signup` `/login`
- Choix du profil
- Authentification (email ou Google)
- Complétion profil
- Sélection plan + paiement

### 4.2 Dashboard Porteur `/dashboard/porteur`
**Sections:**
- Stats rapides (AAP sauvegardés, candidatures, deadlines)
- AAP recommandés
- Candidatures récentes
- Alertes actives

### 4.3 Dashboard Financeur `/dashboard/financeur`
**Sections:**
- Stats (AAP actifs, candidatures, taux réponse)
- Mes AAP actifs
- Candidatures récentes
- Actions requises
- CTA "Publier AAP"

### 4.4 Recherche AAP `/aap/search`
- Barre recherche avec autocomplétion
- Filtres sidebar (secteur, montant, deadline, région)
- Grille résultats avec cards AAP
- Pagination

### 4.5 Détail AAP `/aap/:aapId`
- Header (titre, financeur, CTA candidater)
- Informations principales
- Critères d'éligibilité
- Documents annexes
- Contact référent

### 4.6 Candidature `/aap/:aapId/apply`
**Stepper 7 étapes:**
1. Infos générales
2. Objectifs et méthodologie
3. Budget
4. Équipe et partenaires
5. Impact et critères spécifiques
6. Documents
7. Vérification + score

### 4.7 Mes Candidatures `/mes-candidatures`
- Filtres par statut (tabs)
- Tableau/grid candidatures
- Actions (voir, modifier, supprimer)

### 4.8 Détail Candidature `/mes-candidatures/:applicationId`
- Header avec statut
- Timeline de statut
- Contenu candidature
- Score préqualification
- Commentaires financeur
- Messagerie

### 4.9 Publier AAP `/aap/nouveau`
**Stepper financeur:**
1. Infos principales
2. Critères et éligibilité
3. Financement
4. Calendrier
5. Documents et contact
6. Critères spécifiques
7. Prévisualisation

### 4.10 Mes AAP `/mes-aap`
- Filtres par statut
- Cards AAP avec stats
- Actions (voir, modifier, gérer candidatures)

### 4.11 Gestion Candidatures `/mes-aap/:aapId/candidatures`
- Filtres et tri
- Tableau candidatures avec scores
- Actions groupées

### 4.12 Review Candidature `/mes-aap/:aapId/candidatures/:applicationId`
**Layout 2 colonnes:**
- Principale: infos porteur, contenu, documents
- Sidebar: score, panel évaluation, historique, messaging

### 4.13 Autres Pages
- Profil `/profil`
- Calendrier `/calendrier`
- Messages `/messages`
- Notifications `/notifications`
- Statistiques `/statistiques` (financeur)
- Admin `/admin`
- FAQ `/aide`
- Pages légales `/cgu` `/confidentialite` `/mentions-legales`

---

## 5. STYLE ET DESIGN GLOBAL

### 5.1 Philosophie Design
- Moderne et professionnel
- Épuré et efficace
- Accessible (WCAG 2.1 AA)
- Data-driven

### 5.2 Palette de Couleurs

**Primaire (Bleu):**
```
primary-500: #3B82F6  // Couleur principale
primary-600: #2563EB  // Hover
```

**Secondaire (Violet):**
```
secondary-500: #8B5CF6
```

**Neutres:**
```
gray-50 à gray-900
```

**Statuts:**
```
success: #10B981 (vert)
warning: #F59E0B (orange)
error: #EF4444 (rouge)
info: #3B82F6 (bleu)
```

### 5.3 Typographie
**Police:** Inter (Google Fonts)

**Tailles:**
- H1: 2.5rem (bold)
- H2: 2rem (bold)
- Base: 1rem (normal)
- Small: 0.875rem

### 5.4 Composants UI

**Boutons:**
```css
Primary: bg-primary-600 hover:bg-primary-700 text-white rounded-lg
Secondary: bg-white border border-gray-300 hover:bg-gray-50
Danger: bg-error-500 hover:bg-error-600 text-white
```

**Cards:**
```css
bg-white rounded-xl shadow-sm border p-6 hover:shadow-md
```

**Inputs:**
```css
border rounded-lg focus:ring-2 focus:ring-primary-500
```

### 5.5 Iconographie
**Librairie:** Lucide React

**Tailles:** 16px (small), 20px (medium), 24px (large)

### 5.6 Responsive
**Breakpoints Tailwind:**
- sm: 640px
- md: 768px
- lg: 1024px
- xl: 1280px

**Stratégie:** Mobile-first

---

## 6. CONFIGURATION DES ROUTES

### 6.1 Structure App.tsx

```typescript
<BrowserRouter>
  <AuthProvider>
    <SubscriptionProvider>
      <Routes>
        // Public
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        
        // Porteur (protected + role + subscription)
        <Route path="/dashboard/porteur" element={<ProtectedRoute><RoleGuard role="porteur"><PorteurDashboard /></RoleGuard></ProtectedRoute>} />
        <Route path="/aap/search" element={<...><SearchAapPage /></...>} />
        <Route path="/aap/:aapId" element={<...><AapDetailPage /></...>} />
        <Route path="/aap/:aapId/apply" element={<...><ApplicationFormPage /></...>} />
        <Route path="/mes-candidatures" element={<...><MyApplicationsPage /></...>} />
        
        // Financeur (protected + role + subscription)
        <Route path="/dashboard/financeur" element={<...><FinanceurDashboard /></...>} />
        <Route path="/mes-aap" element={<...><MyAapPage /></...>} />
        <Route path="/aap/nouveau" element={<...><CreateAapPage /></...>} />
        <Route path="/mes-aap/:aapId/candidatures" element={<...><ManageApplicationsPage /></...>} />
        
        // Common authenticated
        <Route path="/profil" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/messages" element={<...><MessagesPage /></...>} />
        <Route path="/notifications" element={<...><NotificationsPage /></...>} />
        
        // Admin
        <Route path="/admin" element={<...><AdminDashboard /></...>} />
        
        // Payment
        <Route path="/abonnement/choisir" element={<...><SelectPlanPage /></...>} />
        
        // 404
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </SubscriptionProvider>
  </AuthProvider>
</BrowserRouter>
```

### 6.2 Guards
- **ProtectedRoute:** Auth requis
- **SubscriptionGuard:** Abonnement actif requis
- **RoleGuard:** Rôle spécifique requis

---

## 7. SPÉCIFICATIONS TECHNIQUES

### 7.1 Authentification
- Firebase Auth (Email/Password + Google)
- Context React pour état auth
- Email verification obligatoire

### 7.2 Paiements Stripe
**Flux:**
1. Choix plan → Checkout Session
2. Redirection Stripe
3. Webhook confirmation → update Firestore
4. Activation abonnement

**Gestion:**
- Renouvellements auto
- Annulation (fin période)
- Changement plan (proration)

### 7.3 Cloud Functions
**Fonctions clés:**
- `onUserCreated`: création profil
- `onApplicationSubmitted`: calcul score
- `sendAlerts`: daily alerts
- `scrapeAAP`: daily import
- `stripeWebhook`: gestion paiements
- `generateAnalytics`: weekly stats

### 7.4 Algorithme Préqualification

**Critères (score 0-100):**
1. Complétude (30%): champs remplis, documents
2. Conformité (40%): éligibilité, critères
3. Qualité (30%): analyse textuelle basique

### 7.5 Recommandations

**Basé sur:**
- Correspondance profil (40%)
- Historique comportement (30%)
- Critères éligibilité (30%)

**Score de match:** 0-100%

### 7.6 Système d'Alertes
- Déclencheurs: nouveaux AAP, deadlines, statuts
- Canaux: in-app + email
- Fréquence: temps réel, quotidien, hebdomadaire

### 7.7 Scraping/Import AAP
- Sources: APIs publiques, scraping HTML, RSS
- Process: Cloud Function daily
- Normalisation et dédoublonnage

### 7.8 Performance
**Frontend:**
- Code splitting
- Lazy loading images
- Pagination
- Debounce recherche

**Backend:**
- Index Firestore optimisés
- Batch operations
- Dénormalisation stratégique

### 7.9 Sécurité
- Validation client ET serveur
- Sanitization inputs
- HTTPS obligatoire
- Rate limiting
- Conformité RGPD

### 7.10 Accessibilité
- WCAG 2.1 AA
- Navigation clavier
- Labels ARIA
- Contraste suffisant

---

## 8. LIVRABLES ET ORGANISATION

### 8.1 Phases de Développement (25 semaines)

**Phase 1 (S1-3):** Fondations
- Setup projet + Firebase
- Auth complet
- Layouts et composants UI de base

**Phase 2 (S4-5):** Utilisateurs et abonnements
- Profils
- Intégration Stripe
- Flux paiement

**Phase 3 (S6-8):** Module AAP Financeur
- Dashboard financeur
- CRUD AAP complet
- Upload documents

**Phase 4 (S9-12):** Recherche et Candidature Porteur
- Dashboard porteur
- Moteur recherche
- Formulaire candidature
- Préqualification basique

**Phase 5 (S13-15):** Gestion Candidatures
- Suivi porteur
- Évaluation financeur
- Scoring avancé

**Phase 6 (S16-17):** Communication
- Notifications
- Messagerie
- Alertes + emails

**Phase 7 (S18-20):** Features Avancées
- Recommandations
- Calendrier
- Statistiques
- Import/scraping
- Exports

**Phase 8 (S21-22):** Administration
- Dashboard admin
- Analytics globales
- FAQ management

**Phase 9 (S23-24):** Tests et Optimisations
- Tests E2E
- Performance
- Bug fixes

**Phase 10 (S25):** Déploiement
- Production
- Documentation
- Formation

### 8.2 Stack Technique Complète

**Frontend:**
- React 18+ + TypeScript
- Vite
- React Router v6
- Tailwind CSS
- Lucide React (icons)
- Recharts (graphs)
- React Hook Form
- date-fns
- React Query

**Backend:**
- Firebase (Auth, Firestore, Storage, Functions, Hosting)
- Stripe (paiements)
- SendGrid/Mailgun (emails)

**Dev Tools:**
- ESLint + Prettier
- Husky
- Git

**Monitoring:**
- Firebase Analytics
- Sentry
- Firebase Performance

### 8.3 Variables d'Environnement

```env
# Firebase
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

# Stripe
VITE_STRIPE_PUBLIC_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Email
SENDGRID_API_KEY=

# Environment
VITE_APP_ENV=development|production
VITE_APP_URL=
```

### 8.4 Déploiement

**Environnements:**
- Development: localhost
- Staging: Firebase preview channels
- Production: Firebase main channel

**CI/CD:**
- GitHub Actions
- Tests auto sur push
- Deploy auto staging (develop)
- Deploy manuel production (main)

---

## 9. CRITÈRES DE RÉUSSITE ET KPIS

### 9.1 Critères de Réussite

**Fonctionnels:**
✅ Toutes les fonctionnalités opérationnelles
✅ Double audience fonctionnelle
✅ Paiement fonctionnel
✅ Données sécurisées
✅ Responsive et accessible

**Techniques:**
✅ Performance: temps chargement < 3s
✅ Disponibilité: uptime > 99%
✅ Sécurité: pas de failles critiques
✅ Code quality: standards respectés

**UX:**
✅ Interface intuitive
✅ Parcours fluides
✅ Feedbacks appropriés
✅ Messages d'erreur clairs

### 9.2 KPIs Post-Lancement

**Acquisition:**
- Inscriptions (porteurs/financeurs)
- Taux conversion visiteur → inscription
- Sources trafic

**Activation:**
- Taux complétion profil
- Taux conversion essai → payant
- Temps avant première action

**Engagement:**
- AAP consultés par porteur
- Candidatures soumises
- AAP publiés par financeur
- DAU/MAU

**Rétention:**
- Taux rétention (7/30/90 jours)
- Taux churn mensuel
- Durée moyenne abonnement

**Revenus:**
- MRR/ARR
- ARPU
- LTV

**Satisfaction:**
- Taux satisfaction
- NPS
- Tickets support

---

## 10. RISQUES ET POINTS D'ATTENTION

### 10.1 Risques Techniques

**Risque:** Performance Firestore volumétrie
**Mitigation:** Index optimisés, pagination, dénormalisation

**Risque:** Coûts Firebase
**Mitigation:** Monitoring, optimisation reads/writes, caching

**Risque:** Complexité scraping
**Mitigation:** Sources fiables, gestion erreurs

**Risque:** Failles sécurité
**Mitigation:** Audit, best practices, tests pénétration

### 10.2 Risques Fonctionnels

**Risque:** Préqualification peu fiable
**Mitigation:** Version basique, amélioration itérative

**Risque:** Fraude/spam
**Mitigation:** Vérification email, limitations, modération

**Risque:** UX confuse
**Mitigation:** Tests utilisateurs, itérations, onboarding

### 10.3 Risques Business

**Risque:** Adoption faible financeurs
**Mitigation:** Import auto AAP, outreach direct

**Risque:** Compétition
**Mitigation:** Différenciation par préqualification

**Risque:** Dépendance Firebase/Stripe
**Mitigation:** Architecture permettant migration

---

## 11. ANNEXES

### Annexe A: Glossaire

- **AAP:** Appel À Projets
- **Porteur:** Structure répondant aux AAP
- **Financeur:** Organisme publiant AAP
- **Préqualification:** Analyse automatique candidature
- **MRR:** Monthly Recurring Revenue
- **ARR:** Annual Recurring Revenue
- **CRUD:** Create, Read, Update, Delete
- **CTA:** Call To Action
- **KPI:** Key Performance Indicator

### Annexe B: Documentation Technique

- React: https://react.dev
- Vite: https://vitejs.dev
- Tailwind: https://tailwindcss.com
- Firebase: https://firebase.google.com/docs
- Stripe: https://stripe.com/docs

### Annexe C: User Stories Exemples

**Porteur:**
- Rechercher AAP par secteur
- Recevoir alertes AAP pertinents
- Candidater en ligne guidé
- Suivre candidatures temps réel
- Échanger avec financeurs

**Financeur:**
- Publier AAP facilement
- Recevoir candidatures pré-qualifiées
- Évaluer et noter structuré
- Suivre statistiques AAP
- Communiquer avec porteurs

**Admin:**
- Vue d'ensemble activité
- Gérer utilisateurs
- Statistiques globales
- Gérer FAQ

---

## CONCLUSION

Ce cahier des charges définit l'ensemble des spécifications pour développer une **plateforme complète de meta-moteur de recherche d'appels à projets en France**.

**Points clés:**

✅ **Problématique claire:** Centraliser AAP dispersés  
✅ **Double audience:** Porteurs + Financeurs  
✅ **Différenciation:** Outil préqualification intelligent  
✅ **Modèle économique:** Abonnements payants  
✅ **Stack moderne:** React TSX + Vite + Tailwind + Firebase  
✅ **Architecture complète:** BDD, routes, composants, design  
✅ **Roadmap:** 25 semaines en 10 phases  

**Prochaines étapes:**

1. Validation finale parties prenantes
2. Constitution équipe dev (1-2 fullstack + 1 UI/UX)
3. Setup projet (Firebase, Git, outils)
4. Sprint 0: config technique
5. Développement itératif par phases
6. Tests utilisateurs réguliers
7. Beta avec utilisateurs pilotes
8. Ouverture progressive au public

---

**Document créé le:** 6 novembre 2025  
**Version:** 1.0  
**Statut:** ✅ Prêt pour développement

---

*FIN DU CAHIER DES CHARGES*
