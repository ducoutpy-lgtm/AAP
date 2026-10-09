# ANNEXE TECHNIQUE DÉTAILLÉE
## Plateforme Meta-Moteur de Recherche d'Appels à Projets

**Document complémentaire au Cahier des Charges principal**

---

## TABLE DES MATIÈRES

1. [Spécifications techniques approfondies](#1-spécifications-techniques-approfondies)
2. [Architecture détaillée Firebase](#2-architecture-détaillée-firebase)
3. [Algorithmes et logique métier](#3-algorithmes-et-logique-métier)
4. [Gestion des erreurs et monitoring](#4-gestion-des-erreurs-et-monitoring)
5. [Performance et optimisation](#5-performance-et-optimisation)
6. [Sécurité avancée](#6-sécurité-avancée)
7. [Tests et qualité](#7-tests-et-qualité)
8. [Maintenance et évolution](#8-maintenance-et-évolution)
9. [Critères de validation](#9-critères-de-validation)
10. [Glossaire technique](#10-glossaire-technique)

---

## 1. SPÉCIFICATIONS TECHNIQUES APPROFONDIES

### 1.1 Authentification Firebase - Détails d'implémentation

**Configuration Firebase Authentication:**

```typescript
// src/config/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app, 'europe-west1');

// Emulators pour développement
if (import.meta.env.DEV) {
  connectAuthEmulator(auth, 'http://localhost:9099');
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectStorageEmulator(storage, 'localhost', 9199);
  connectFunctionsEmulator(functions, 'localhost', 5001);
}
```

**Context d'authentification:**

```typescript
// src/contexts/AuthContext.tsx
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  sendEmailVerification,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

interface UserProfile {
  uid: string;
  email: string;
  userType: 'porteur' | 'financeur' | 'admin';
  subscriptionStatus: 'active' | 'trial' | 'expired' | 'cancelled';
  profileComplete: boolean;
}

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signup: (email: string, password: string, userType: 'porteur' | 'financeur') => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Signup avec création du profil utilisateur
  const signup = async (email: string, password: string, userType: 'porteur' | 'financeur') => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Envoi email de vérification
    await sendEmailVerification(user);

    // Création du document utilisateur dans Firestore
    await setDoc(doc(db, 'users', user.uid), {
      email: user.email,
      userType,
      createdAt: new Date(),
      subscriptionStatus: 'trial',
      trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 jours
      profileComplete: false,
      notificationPreferences: {
        email: true,
        inApp: true,
        frequency: 'realtime',
      },
    });

    // Création du document profil selon le type
    const profileCollection = userType === 'porteur' ? 'porteurProfiles' : 'financeurProfiles';
    await setDoc(doc(db, profileCollection, user.uid), {
      updatedAt: new Date(),
    });
  };

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.addScope('profile');
    provider.addScope('email');
    
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Vérifier si le profil existe déjà
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    if (!userDoc.exists()) {
      // Redirection vers page de sélection du type de compte
      // Sera géré dans le composant
    }
  };

  const logout = () => signOut(auth);

  const resetPassword = (email: string) => sendPasswordResetEmail(auth, email);

  // Écoute des changements d'authentification
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        // Récupération du profil utilisateur
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserProfile({
            uid: user.uid,
            ...userDoc.data(),
          } as UserProfile);
        }
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    loading,
    signup,
    login,
    loginWithGoogle,
    logout,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
```

### 1.2 Intégration Stripe - Implémentation complète

**Configuration Stripe:**

```typescript
// src/config/stripe.ts
import { loadStripe } from '@stripe/stripe-js';

export const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

export const STRIPE_PLANS = {
  porteur: {
    monthly: {
      priceId: 'price_porteur_monthly',
      amount: 29.99,
      currency: 'EUR',
    },
    annual: {
      priceId: 'price_porteur_annual',
      amount: 299.99,
      currency: 'EUR',
    },
  },
  financeur: {
    monthly: {
      priceId: 'price_financeur_monthly',
      amount: 99.99,
      currency: 'EUR',
    },
    annual: {
      priceId: 'price_financeur_annual',
      amount: 999.99,
      currency: 'EUR',
    },
  },
};
```

**Cloud Function - Création de session de paiement:**

```typescript
// functions/src/payments/createCheckoutSession.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import Stripe from 'stripe';

const stripe = new Stripe(functions.config().stripe.secret_key, {
  apiVersion: '2023-10-16',
});

export const createCheckoutSession = functions
  .region('europe-west1')
  .https.onCall(async (data, context) => {
    // Vérification de l'authentification
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'User must be authenticated'
      );
    }

    const { priceId, userType } = data;
    const userId = context.auth.uid;

    try {
      // Récupération ou création du customer Stripe
      const userDoc = await admin.firestore().collection('users').doc(userId).get();
      const userData = userDoc.data();
      
      let customerId = userData?.stripeCustomerId;

      if (!customerId) {
        const customer = await stripe.customers.create({
          email: context.auth.token.email,
          metadata: {
            firebaseUID: userId,
            userType,
          },
        });
        customerId = customer.id;

        // Sauvegarde du customerId
        await admin.firestore().collection('users').doc(userId).update({
          stripeCustomerId: customerId,
        });
      }

      // Création de la session de checkout
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        mode: 'subscription',
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        success_url: `${functions.config().app.url}/abonnement/succes?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${functions.config().app.url}/abonnement/annule`,
        metadata: {
          firebaseUID: userId,
          userType,
        },
      });

      return { sessionId: session.id };
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw new functions.https.HttpsError('internal', 'Unable to create checkout session');
    }
  });
```

**Cloud Function - Webhook Stripe:**

```typescript
// functions/src/payments/stripeWebhook.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import Stripe from 'stripe';

const stripe = new Stripe(functions.config().stripe.secret_key, {
  apiVersion: '2023-10-16',
});

export const stripeWebhook = functions
  .region('europe-west1')
  .https.onRequest(async (req, res) => {
    const sig = req.headers['stripe-signature'] as string;
    const webhookSecret = functions.config().stripe.webhook_secret;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Gestion des événements Stripe
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  });

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.firebaseUID;
  if (!userId) return;

  const subscription = await stripe.subscriptions.retrieve(session.subscription as string);

  await admin.firestore().collection('users').doc(userId).update({
    subscriptionStatus: 'active',
    subscriptionId: subscription.id,
    subscriptionPlan: subscription.items.data[0].plan.interval === 'month' ? 'monthly' : 'annual',
    currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    trialEndsAt: null,
  });

  // Création d'un enregistrement de paiement
  await admin.firestore().collection('payments').add({
    userId,
    stripePaymentId: session.payment_intent,
    stripeSubscriptionId: subscription.id,
    amount: session.amount_total! / 100,
    currency: session.currency!.toUpperCase(),
    plan: subscription.items.data[0].plan.interval === 'month' ? 'monthly' : 'annual',
    status: 'succeeded',
    paidAt: new Date(),
    periodStart: new Date(subscription.current_period_start * 1000),
    periodEnd: new Date(subscription.current_period_end * 1000),
  });

  // Notification à l'utilisateur
  await admin.firestore().collection('notifications').add({
    userId,
    type: 'system',
    title: 'Abonnement activé',
    message: 'Votre abonnement a été activé avec succès. Bienvenue !',
    read: false,
    createdAt: new Date(),
  });
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customer = subscription.customer as string;
  const customersRef = admin.firestore().collection('users');
  const snapshot = await customersRef.where('stripeCustomerId', '==', customer).get();

  if (snapshot.empty) return;

  const userId = snapshot.docs[0].id;

  await admin.firestore().collection('users').doc(userId).update({
    subscriptionStatus: subscription.status === 'active' ? 'active' : 'expired',
    currentPeriodEnd: new Date(subscription.current_period_end * 1000),
  });
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customer = subscription.customer as string;
  const customersRef = admin.firestore().collection('users');
  const snapshot = await customersRef.where('stripeCustomerId', '==', customer).get();

  if (snapshot.empty) return;

  const userId = snapshot.docs[0].id;

  await admin.firestore().collection('users').doc(userId).update({
    subscriptionStatus: 'cancelled',
    subscriptionId: null,
  });

  // Notification
  await admin.firestore().collection('notifications').add({
    userId,
    type: 'system',
    title: 'Abonnement annulé',
    message: 'Votre abonnement a été annulé. Vous conservez l\'accès jusqu\'à la fin de la période payée.',
    read: false,
    createdAt: new Date(),
  });
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  // Enregistrement du paiement
  const customer = invoice.customer as string;
  const customersRef = admin.firestore().collection('users');
  const snapshot = await customersRef.where('stripeCustomerId', '==', customer).get();

  if (snapshot.empty) return;

  const userId = snapshot.docs[0].id;

  await admin.firestore().collection('payments').add({
    userId,
    stripePaymentId: invoice.payment_intent,
    stripeSubscriptionId: invoice.subscription,
    amount: invoice.amount_paid / 100,
    currency: invoice.currency.toUpperCase(),
    status: 'succeeded',
    invoiceUrl: invoice.invoice_pdf,
    paidAt: new Date(invoice.status_transitions.paid_at! * 1000),
    periodStart: new Date(invoice.period_start * 1000),
    periodEnd: new Date(invoice.period_end * 1000),
  });
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const customer = invoice.customer as string;
  const customersRef = admin.firestore().collection('users');
  const snapshot = await customersRef.where('stripeCustomerId', '==', customer).get();

  if (snapshot.empty) return;

  const userId = snapshot.docs[0].id;

  // Notification d'échec
  await admin.firestore().collection('notifications').add({
    userId,
    type: 'system',
    title: 'Échec du paiement',
    message: 'Le paiement de votre abonnement a échoué. Veuillez mettre à jour vos informations de paiement.',
    read: false,
    createdAt: new Date(),
  });

  // Après 3 tentatives échouées, suspension du compte
  const failedPaymentsRef = admin.firestore().collection('payments');
  const failedPayments = await failedPaymentsRef
    .where('userId', '==', userId)
    .where('status', '==', 'failed')
    .orderBy('paidAt', 'desc')
    .limit(3)
    .get();

  if (failedPayments.size >= 3) {
    await admin.firestore().collection('users').doc(userId).update({
      subscriptionStatus: 'expired',
    });
  }
}
```

---

## 2. ARCHITECTURE DÉTAILLÉE FIREBASE

### 2.1 Cloud Functions - Structure complète

**Index principal:**

```typescript
// functions/src/index.ts
import * as admin from 'firebase-admin';

admin.initializeApp();

// Authentication triggers
export { onUserCreated } from './auth/onUserCreated';
export { onUserDeleted } from './auth/onUserDeleted';

// Application triggers
export { onApplicationCreated } from './applications/onApplicationCreated';
export { onApplicationStatusChanged } from './applications/onApplicationStatusChanged';
export { calculatePrequalificationScore } from './applications/calculatePrequalificationScore';

// Notifications
export { sendNotificationEmail } from './notifications/sendNotificationEmail';
export { sendDailyDigest } from './notifications/sendDailyDigest';

// Alerts
export { checkAndSendAlerts } from './alerts/checkAndSendAlerts';

// Scraping
export { scrapeExternalAAP } from './scraping/scrapeExternalAAP';

// Analytics
export { generateDailyAnalytics } from './analytics/generateDailyAnalytics';
export { generateWeeklyAnalytics } from './analytics/generateWeeklyAnalytics';

// Payments
export { createCheckoutSession } from './payments/createCheckoutSession';
export { createPortalSession } from './payments/createPortalSession';
export { stripeWebhook } from './payments/stripeWebhook';

// Scheduled functions
export { cleanExpiredTrials } from './scheduled/cleanExpiredTrials';
export { sendDeadlineReminders } from './scheduled/sendDeadlineReminders';
```

**Trigger: Création d'utilisateur:**

```typescript
// functions/src/auth/onUserCreated.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export const onUserCreated = functions
  .region('europe-west1')
  .auth.user().onCreate(async (user) => {
    const { uid, email } = user;

    // Notification de bienvenue
    await admin.firestore().collection('notifications').add({
      userId: uid,
      type: 'system',
      title: 'Bienvenue !',
      message: 'Bienvenue sur la plateforme. Complétez votre profil pour commencer.',
      read: false,
      createdAt: new Date(),
      actionUrl: '/profil',
    });

    // Email de bienvenue
    // (Sera géré par la fonction sendNotificationEmail)

    console.log(`User created: ${uid} (${email})`);
  });
```

**Trigger: Soumission de candidature:**

```typescript
// functions/src/applications/onApplicationCreated.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export const onApplicationCreated = functions
  .region('europe-west1')
  .firestore.document('applications/{applicationId}')
  .onCreate(async (snapshot, context) => {
    const application = snapshot.data();
    const applicationId = context.params.applicationId;

    // Calcul du score de préqualification
    const score = await calculateScore(application);
    
    await snapshot.ref.update({
      prequalificationScore: score.overall,
      completenessScore: score.completeness,
      conformityFlags: score.flags,
      suggestions: score.suggestions,
    });

    // Notification au porteur
    await admin.firestore().collection('notifications').add({
      userId: application.porteurId,
      type: 'status_change',
      title: 'Candidature soumise',
      message: 'Votre candidature a été soumise avec succès.',
      relatedEntityId: applicationId,
      relatedEntityType: 'application',
      read: false,
      createdAt: new Date(),
      actionUrl: `/mes-candidatures/${applicationId}`,
    });

    // Notification au financeur
    await admin.firestore().collection('notifications').add({
      userId: application.financeurId,
      type: 'new_message',
      title: 'Nouvelle candidature',
      message: 'Vous avez reçu une nouvelle candidature.',
      relatedEntityId: applicationId,
      relatedEntityType: 'application',
      read: false,
      createdAt: new Date(),
      actionUrl: `/mes-aap/${application.aapId}/candidatures/${applicationId}`,
    });

    // Incrément du compteur de candidatures dans l'AAP
    const aapRef = admin.firestore().collection('aap').doc(application.aapId);
    await aapRef.update({
      applicationsCount: admin.firestore.FieldValue.increment(1),
    });
  });

async function calculateScore(application: any) {
  // Implémentation de l'algorithme de préqualification
  // (voir section 3.1)
  return {
    overall: 85,
    completeness: 90,
    flags: [],
    suggestions: [],
  };
}
```

**Scheduled Function: Envoi d'alertes:**

```typescript
// functions/src/alerts/checkAndSendAlerts.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export const checkAndSendAlerts = functions
  .region('europe-west1')
  .pubsub.schedule('0 9 * * *') // Tous les jours à 9h
  .timeZone('Europe/Paris')
  .onRun(async (context) => {
    const db = admin.firestore();

    // Récupération de toutes les recherches sauvegardées avec alerte activée
    const savedSearchesSnapshot = await db
      .collection('savedSearches')
      .where('alertEnabled', '==', true)
      .get();

    for (const searchDoc of savedSearchesSnapshot.docs) {
      const search = searchDoc.data();
      const userId = search.userId;

      // Récupération des nouveaux AAP depuis la dernière exécution
      const lastExecuted = search.lastExecutedAt?.toDate() || new Date(0);
      const newAapQuery = db
        .collection('aap')
        .where('status', '==', 'published')
        .where('publishedAt', '>', lastExecuted);

      // Application des filtres de recherche
      let aapSnapshot = await newAapQuery.get();
      const matchingAap = aapSnapshot.docs.filter(doc => 
        matchesSearchCriteria(doc.data(), search.filters)
      );

      if (matchingAap.length > 0) {
        // Notification
        await db.collection('notifications').add({
          userId,
          type: 'new_aap',
          title: `${matchingAap.length} nouveaux AAP`,
          message: `${matchingAap.length} nouveaux appels à projets correspondent à votre recherche "${search.name}"`,
          read: false,
          createdAt: new Date(),
          actionUrl: '/aap/search',
        });

        // Email (selon préférences)
        const userDoc = await db.collection('users').doc(userId).get();
        const notifPrefs = userDoc.data()?.notificationPreferences;
        
        if (notifPrefs?.email) {
          // Envoi d'email via SendGrid
          // (implémentation dans sendNotificationEmail)
        }
      }

      // Mise à jour de la date de dernière exécution
      await searchDoc.ref.update({
        lastExecutedAt: new Date(),
      });
    }

    console.log('Alerts checked and sent');
  });

function matchesSearchCriteria(aap: any, filters: any): boolean {
  // Logique de matching
  // (vérification des secteurs, régions, budget, etc.)
  return true; // Simplifié
}
```

### 2.2 Scraping d'AAP externes

```typescript
// functions/src/scraping/scrapeExternalAAP.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import axios from 'axios';
import * as cheerio from 'cheerio';

export const scrapeExternalAAP = functions
  .region('europe-west1')
  .pubsub.schedule('0 2 * * *') // Tous les jours à 2h du matin
  .timeZone('Europe/Paris')
  .onRun(async (context) => {
    const sources = [
      {
        name: 'ADEME',
        url: 'https://agirpourlatransition.ademe.fr/entreprises/aides-financieres',
        parser: parseAdeme,
      },
      {
        name: 'BPI France',
        url: 'https://www.bpifrance.fr/nos-appels-a-projets-concours',
        parser: parseBPI,
      },
      // Autres sources...
    ];

    const db = admin.firestore();
    let totalImported = 0;

    for (const source of sources) {
      try {
        const response = await axios.get(source.url);
        const $ = cheerio.load(response.data);
        const aapList = source.parser($);

        for (const aap of aapList) {
          // Vérification de doublon
          const existingAap = await db
            .collection('aap')
            .where('title', '==', aap.title)
            .where('source', '==', 'scraped')
            .where('externalUrl', '==', aap.url)
            .get();

          if (existingAap.empty) {
            // Création de l'AAP
            await db.collection('aap').add({
              ...aap,
              source: 'scraped',
              status: 'published',
              publishedAt: new Date(),
              createdAt: new Date(),
              updatedAt: new Date(),
              views: 0,
              applicationsCount: 0,
            });
            totalImported++;
          }
        }
      } catch (error) {
        console.error(`Error scraping ${source.name}:`, error);
      }
    }

    console.log(`Scraping completed: ${totalImported} AAP imported`);
  });

function parseAdeme($: cheerio.CheerioAPI): any[] {
  // Logique de parsing spécifique à ADEME
  const aapList: any[] = [];
  
  $('.aap-card').each((i, elem) => {
    const title = $(elem).find('.title').text().trim();
    const description = $(elem).find('.description').text().trim();
    const deadline = $(elem).find('.deadline').text().trim();
    const url = $(elem).find('a').attr('href');

    aapList.push({
      title,
      description,
      deadline: parseDate(deadline),
      externalUrl: url,
      financeurId: 'ADEME_SYSTEM_ID', // ID système pour ADEME
      sectorsTargeted: ['environnement', 'energie'],
      territoriesEligible: ['france'],
      tags: ['transition-ecologique'],
    });
  });

  return aapList;
}

function parseBPI($: cheerio.CheerioAPI): any[] {
  // Logique de parsing spécifique à BPI
  return [];
}

function parseDate(dateString: string): Date {
  // Parse des formats de date français
  // "31/12/2025" → Date object
  const [day, month, year] = dateString.split('/');
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
}
```

---

## 3. ALGORITHMES ET LOGIQUE MÉTIER

### 3.1 Algorithme de préqualification détaillé

```typescript
// functions/src/applications/calculatePrequalificationScore.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

interface ScoreResult {
  overall: number;
  completeness: number;
  conformity: number;
  quality: number;
  flags: string[];
  suggestions: string[];
}

export const calculatePrequalificationScore = functions
  .region('europe-west1')
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { applicationId } = data;
    const db = admin.firestore();

    // Récupération de la candidature et de l'AAP
    const applicationDoc = await db.collection('applications').doc(applicationId).get();
    if (!applicationDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Application not found');
    }

    const application = applicationDoc.data()!;
    const aapDoc = await db.collection('aap').doc(application.aapId).get();
    const aap = aapDoc.data()!;

    // Calcul du score
    const score = calculateScore(application, aap);

    // Mise à jour de la candidature
    await applicationDoc.ref.update({
      prequalificationScore: score.overall,
      completenessScore: score.completeness,
      conformityFlags: score.flags,
      suggestions: score.suggestions,
    });

    return score;
  });

function calculateScore(application: any, aap: any): ScoreResult {
  const flags: string[] = [];
  const suggestions: string[] = [];

  // 1. Score de complétude (30%)
  const completenessScore = calculateCompletenessScore(application, aap, flags, suggestions);

  // 2. Score de conformité (40%)
  const conformityScore = calculateConformityScore(application, aap, flags, suggestions);

  // 3. Score de qualité (30%)
  const qualityScore = calculateQualityScore(application, flags, suggestions);

  // Score global
  const overall = Math.round(
    completenessScore * 0.3 +
    conformityScore * 0.4 +
    qualityScore * 0.3
  );

  return {
    overall,
    completeness: completenessScore,
    conformity: conformityScore,
    quality: qualityScore,
    flags,
    suggestions,
  };
}

function calculateCompletenessScore(
  application: any,
  aap: any,
  flags: string[],
  suggestions: string[]
): number {
  let score = 100;
  const penalties: { [key: string]: number } = {};

  // Vérification des champs obligatoires
  const requiredFields = [
    'projectTitle',
    'projectDescription',
    'objectives',
    'methodology',
    'timeline',
    'budget',
    'team',
    'expectedImpact',
  ];

  for (const field of requiredFields) {
    if (!application[field] || application[field] === '') {
      penalties[field] = 15;
      flags.push(`Champ obligatoire manquant: ${field}`);
      suggestions.push(`Veuillez remplir le champ "${field}"`);
    }
  }

  // Vérification de la longueur des réponses
  const minLengths: { [key: string]: number } = {
    projectDescription: 200,
    objectives: 100,
    methodology: 150,
    expectedImpact: 100,
  };

  for (const [field, minLength] of Object.entries(minLengths)) {
    if (application[field] && application[field].length < minLength) {
      penalties[field] = 5;
      suggestions.push(
        `Le champ "${field}" est trop court (${application[field].length} caractères, minimum ${minLength})`
      );
    }
  }

  // Vérification des documents
  const requiredDocs = aap.requiredDocuments || [];
  const uploadedDocs = application.documents?.map((d: any) => d.type) || [];
  
  for (const reqDoc of requiredDocs) {
    if (!uploadedDocs.includes(reqDoc)) {
      penalties[`doc_${reqDoc}`] = 10;
      flags.push(`Document manquant: ${reqDoc}`);
      suggestions.push(`Veuillez uploader le document "${reqDoc}"`);
    }
  }

  // Application des pénalités
  const totalPenalty = Object.values(penalties).reduce((sum, val) => sum + val, 0);
  score = Math.max(0, score - totalPenalty);

  return score;
}

function calculateConformityScore(
  application: any,
  aap: any,
  flags: string[],
  suggestions: string[]
): number {
  let score = 100;

  // Récupération du profil du porteur
  // (simplifié - normalement on irait chercher dans Firestore)
  const porteurProfile = {
    sector: application.porteurSector || [],
    location: application.porteurLocation || '',
    structureType: application.porteurType || '',
  };

  // Vérification du secteur
  if (aap.sectorsTargeted && aap.sectorsTargeted.length > 0) {
    const sectorMatch = porteurProfile.sector.some((s: string) =>
      aap.sectorsTargeted.includes(s)
    );
    
    if (!sectorMatch) {
      score -= 30;
      flags.push('Secteur d\'activité non éligible');
      suggestions.push(
        `Ce projet ne correspond pas aux secteurs ciblés: ${aap.sectorsTargeted.join(', ')}`
      );
    }
  }

  // Vérification du territoire
  if (aap.territoriesEligible && aap.territoriesEligible.length > 0) {
    const territoryMatch = aap.territoriesEligible.includes(porteurProfile.location);
    
    if (!territoryMatch) {
      score -= 30;
      flags.push('Territoire non éligible');
      suggestions.push(
        `Votre localisation ne correspond pas aux territoires éligibles: ${aap.territoriesEligible.join(', ')}`
      );
    }
  }

  // Vérification du budget
  if (application.budget?.total) {
    const budgetTotal = application.budget.total;
    
    if (aap.budgetMin && budgetTotal < aap.budgetMin) {
      score -= 20;
      flags.push('Budget inférieur au minimum');
      suggestions.push(`Le budget demandé (${budgetTotal}€) est inférieur au minimum (${aap.budgetMin}€)`);
    }
    
    if (aap.budgetMax && budgetTotal > aap.budgetMax) {
      score -= 20;
      flags.push('Budget supérieur au maximum');
      suggestions.push(`Le budget demandé (${budgetTotal}€) dépasse le maximum (${aap.budgetMax}€)`);
    }
  }

  return Math.max(0, score);
}

function calculateQualityScore(
  application: any,
  flags: string[],
  suggestions: string[]
): number {
  let score = 100;

  // Analyse de la richesse du vocabulaire
  const description = application.projectDescription || '';
  const words = description.split(/\s+/);
  const uniqueWords = new Set(words.map((w: string) => w.toLowerCase()));
  const vocabularyRichness = uniqueWords.size / words.length;

  if (vocabularyRichness < 0.4) {
    score -= 15;
    suggestions.push('Enrichissez votre vocabulaire pour rendre votre description plus précise');
  }

  // Vérification de la structure (paragraphes)
  const paragraphs = description.split('\n\n');
  if (paragraphs.length < 3) {
    score -= 10;
    suggestions.push('Structurez votre description en plusieurs paragraphes');
  }

  // Présence de mots-clés pertinents
  const keywords = ['innovation', 'impact', 'objectif', 'méthodologie', 'résultat'];
  const keywordCount = keywords.filter(kw =>
    description.toLowerCase().includes(kw)
  ).length;

  if (keywordCount < 2) {
    score -= 10;
    suggestions.push('Utilisez des mots-clés pertinents comme "innovation", "impact", "objectifs"');
  }

  // Vérification de l'équipe
  if (!application.team || application.team.length === 0) {
    score -= 15;
    suggestions.push('Ajoutez les membres de l\'équipe projet');
  }

  // Vérification du calendrier
  if (!application.timeline || application.timeline.length < 50) {
    score -= 10;
    suggestions.push('Détaillez davantage le calendrier de réalisation');
  }

  return Math.max(0, score);
}
```

### 3.2 Système de recommandations

```typescript
// functions/src/recommendations/generateRecommendations.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

interface RecommendationScore {
  aapId: string;
  score: number;
  reasons: string[];
}

export const generateRecommendations = functions
  .region('europe-west1')
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const userId = context.auth.uid;
    const db = admin.firestore();

    // Récupération du profil utilisateur
    const userDoc = await db.collection('users').doc(userId).get();
    const user = userDoc.data()!;

    if (user.userType !== 'porteur') {
      throw new functions.https.HttpsError('invalid-argument', 'Only porteurs can get recommendations');
    }

    const porteurProfileDoc = await db.collection('porteurProfiles').doc(userId).get();
    const porteurProfile = porteurProfileDoc.data()!;

    // Récupération de tous les AAP actifs
    const aapSnapshot = await db
      .collection('aap')
      .where('status', '==', 'published')
      .where('deadline', '>', new Date())
      .get();

    // Calcul du score pour chaque AAP
    const recommendations: RecommendationScore[] = [];

    for (const aapDoc of aapSnapshot.docs) {
      const aap = aapDoc.data();
      const score = await calculateRecommendationScore(userId, porteurProfile, aap, db);
      
      if (score.score > 50) { // Seuil minimum
        recommendations.push({
          aapId: aapDoc.id,
          ...score,
        });
      }
    }

    // Tri par score décroissant
    recommendations.sort((a, b) => b.score - a.score);

    // Retour des 10 meilleurs
    return recommendations.slice(0, 10);
  });

async function calculateRecommendationScore(
  userId: string,
  porteurProfile: any,
  aap: any,
  db: admin.firestore.Firestore
): Promise<{ score: number; reasons: string[] }> {
  let score = 0;
  const reasons: string[] = [];

  // 1. Correspondance de profil (40%)
  const profileScore = calculateProfileMatch(porteurProfile, aap, reasons);
  score += profileScore * 0.4;

  // 2. Historique de comportement (30%)
  const behaviorScore = await calculateBehaviorScore(userId, aap, db, reasons);
  score += behaviorScore * 0.3;

  // 3. Critères d'éligibilité (30%)
  const eligibilityScore = calculateEligibilityScore(porteurProfile, aap, reasons);
  score += eligibilityScore * 0.3;

  return {
    score: Math.round(score),
    reasons,
  };
}

function calculateProfileMatch(porteurProfile: any, aap: any, reasons: string[]): number {
  let score = 0;

  // Secteur d'activité
  const sectorMatch = porteurProfile.domainesIntervention?.some((sector: string) =>
    aap.sectorsTargeted?.includes(sector)
  );
  
  if (sectorMatch) {
    score += 40;
    reasons.push('Secteur d\'activité correspondant');
  }

  // Localisation
  if (aap.territoriesEligible?.includes(porteurProfile.address?.region)) {
    score += 30;
    reasons.push('Territoire éligible');
  }

  // Taille de structure
  if (aap.structureTypeEligible) {
    if (aap.structureTypeEligible.includes(porteurProfile.structureType)) {
      score += 30;
      reasons.push('Type de structure éligible');
    }
  } else {
    score += 30; // Pas de restriction = ok
  }

  return score;
}

async function calculateBehaviorScore(
  userId: string,
  aap: any,
  db: admin.firestore.Firestore,
  reasons: string[]
): number {
  let score = 0;

  // Historique des consultations
  const viewedAapSnapshot = await db
    .collection('aapViews')
    .where('userId', '==', userId)
    .orderBy('viewedAt', 'desc')
    .limit(20)
    .get();

  const viewedSectors = viewedAapSnapshot.docs
    .map(doc => doc.data().aapSectors)
    .flat();

  const sectorOverlap = aap.sectorsTargeted?.filter((sector: string) =>
    viewedSectors.includes(sector)
  ).length || 0;

  score += Math.min(40, sectorOverlap * 10);
  if (sectorOverlap > 0) {
    reasons.push('Correspond à vos consultations récentes');
  }

  // AAP sauvegardés
  const savedAapSnapshot = await db
    .collection('favoriteAap')
    .where('userId', '==', userId)
    .get();

  const savedSectors = (await Promise.all(
    savedAapSnapshot.docs.map(async doc => {
      const aapDoc = await db.collection('aap').doc(doc.data().aapId).get();
      return aapDoc.data()?.sectorsTargeted || [];
    })
  )).flat();

  const savedSectorOverlap = aap.sectorsTargeted?.filter((sector: string) =>
    savedSectors.includes(sector)
  ).length || 0;

  score += Math.min(30, savedSectorOverlap * 10);
  if (savedSectorOverlap > 0) {
    reasons.push('Correspond à vos AAP sauvegardés');
  }

  // Candidatures passées
  const applicationsSnapshot = await db
    .collection('applications')
    .where('porteurId', '==', userId)
    .where('status', '==', 'accepted')
    .get();

  const acceptedSectors = (await Promise.all(
    applicationsSnapshot.docs.map(async doc => {
      const aapDoc = await db.collection('aap').doc(doc.data().aapId).get();
      return aapDoc.data()?.sectorsTargeted || [];
    })
  )).flat();

  const acceptedSectorOverlap = aap.sectorsTargeted?.filter((sector: string) =>
    acceptedSectors.includes(sector)
  ).length || 0;

  score += Math.min(30, acceptedSectorOverlap * 15);
  if (acceptedSectorOverlap > 0) {
    reasons.push('Vous avez déjà été accepté sur des AAP similaires');
  }

  return score;
}

function calculateEligibilityScore(porteurProfile: any, aap: any, reasons: string[]): number {
  let score = 100;

  // Budget
  // (Estimation basée sur les projets passés ou taille de structure)
  // Simplifié ici

  // Critères d'éligibilité automatiquement vérifiables
  if (aap.eligibilityCriteria) {
    reasons.push('Éligibilité à vérifier');
  }

  return score;
}
```

---

## 4. GESTION DES ERREURS ET MONITORING

### 4.1 Configuration Sentry

```typescript
// src/config/sentry.ts
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

export function initSentry() {
  if (import.meta.env.PROD) {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      integrations: [new BrowserTracing()],
      tracesSampleRate: 0.1,
      environment: import.meta.env.VITE_APP_ENV,
      beforeSend(event, hint) {
        // Filtrer les erreurs non critiques
        if (event.exception) {
          const error = hint.originalException;
          if (error && error.message && error.message.includes('ResizeObserver')) {
            return null; // Ignorer cette erreur commune et non critique
          }
        }
        return event;
      },
    });
  }
}

export function logError(error: Error, context?: any) {
  console.error('Error:', error, context);
  
  if (import.meta.env.PROD) {
    Sentry.captureException(error, {
      contexts: { custom: context },
    });
  }
}
```

### 4.2 Error Boundaries

```typescript
// src/components/ErrorBoundary.tsx
import { Component, ReactNode } from 'react';
import { logError } from '../config/sentry';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    logError(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Une erreur est survenue
              </h1>
              <p className="text-gray-600 mb-4">
                Nous sommes désolés, une erreur inattendue s'est produite.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700"
              >
                Recharger la page
              </button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
```

---

## 5. PERFORMANCE ET OPTIMISATION

### 5.1 Code Splitting et Lazy Loading

```typescript
// src/App.tsx
import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import LoadingSpinner from './components/ui/LoadingSpinner';

// Pages chargées immédiatement
import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/auth/LoginPage';

// Pages lazy loaded
const PorteurDashboard = lazy(() => import('./pages/porteur/Dashboard'));
const FinanceurDashboard = lazy(() => import('./pages/financeur/Dashboard'));
const SearchAapPage = lazy(() => import('./pages/porteur/SearchAapPage'));
const ApplicationFormPage = lazy(() => import('./pages/porteur/ApplicationFormPage'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner fullScreen />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard/porteur" element={<PorteurDashboard />} />
        <Route path="/dashboard/financeur" element={<FinanceurDashboard />} />
        <Route path="/aap/search" element={<SearchAapPage />} />
        <Route path="/aap/:aapId/apply" element={<ApplicationFormPage />} />
        {/* ... */}
      </Routes>
    </Suspense>
  );
}
```

### 5.2 Optimisation Firestore

```typescript
// src/hooks/useAapSearch.ts
import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, limit, startAfter, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

const PAGE_SIZE = 20;

export function useAapSearch(filters: any) {
  const [aaps, setAaps] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);

  const loadAaps = async (loadMore = false) => {
    setLoading(true);

    try {
      let q = query(
        collection(db, 'aap'),
        where('status', '==', 'published'),
        orderBy('publishedAt', 'desc'),
        limit(PAGE_SIZE)
      );

      // Pagination
      if (loadMore && lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      // Application des filtres
      if (filters.sectors && filters.sectors.length > 0) {
        q = query(q, where('sectorsTargeted', 'array-contains-any', filters.sectors));
      }

      const snapshot = await getDocs(q);
      const newAaps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      if (loadMore) {
        setAaps(prev => [...prev, ...newAaps]);
      } else {
        setAaps(newAaps);
      }

      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.docs.length === PAGE_SIZE);
    } catch (error) {
      console.error('Error loading AAPs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAaps();
  }, [filters]);

  return { aaps, loading, hasMore, loadMore: () => loadAaps(true) };
}
```

### 5.3 Caching avec React Query

```typescript
// src/services/aapService.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { doc, getDoc, collection, addDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export function useAap(aapId: string) {
  return useQuery({
    queryKey: ['aap', aapId],
    queryFn: async () => {
      const aapDoc = await getDoc(doc(db, 'aap', aapId));
      if (!aapDoc.exists()) throw new Error('AAP not found');
      return { id: aapDoc.id, ...aapDoc.data() };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useSaveAap() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, aapId }: { userId: string; aapId: string }) => {
      return await addDoc(collection(db, 'favoriteAap'), {
        userId,
        aapId,
        savedAt: new Date(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favoriteAap'] });
    },
  });
}
```

---

## 6. SÉCURITÉ AVANCÉE

### 6.1 Validation des données

```typescript
// src/utils/validation.ts
import { z } from 'zod';

export const applicationSchema = z.object({
  projectTitle: z.string().min(10, 'Le titre doit contenir au moins 10 caractères'),
  projectDescription: z.string().min(200, 'La description doit contenir au moins 200 caractères'),
  objectives: z.string().min(100),
  methodology: z.string().min(150),
  timeline: z.string().min(50),
  budget: z.object({
    total: z.number().positive(),
    breakdown: z.array(z.object({
      category: z.string(),
      amount: z.number().positive(),
    })),
  }),
  team: z.array(z.object({
    name: z.string(),
    role: z.string(),
    expertise: z.string(),
  })).min(1, 'Au moins un membre d\'équipe est requis'),
  expectedImpact: z.string().min(100),
});

export const aapSchema = z.object({
  title: z.string().min(10),
  description: z.string().min(100),
  budgetMin: z.number().positive().optional(),
  budgetMax: z.number().positive().optional(),
  deadline: z.date().min(new Date(), 'La deadline doit être dans le futur'),
  sectorsTargeted: z.array(z.string()).min(1),
  territoriesEligible: z.array(z.string()).min(1),
});
```

### 6.2 Protection CSRF et XSS

```typescript
// src/utils/security.ts
import DOMPurify from 'dompurify';

export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'a'],
    ALLOWED_ATTR: ['href', 'target'],
  });
}

export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}
```

---

## 7. TESTS ET QUALITÉ

### 7.1 Tests unitaires

```typescript
// src/components/AapCard.test.tsx
import { render, screen } from '@testing-library/react';
import { AapCard } from './AapCard';

describe('AapCard', () => {
  const mockAap = {
    id: '1',
    title: 'AAP Test',
    financeurName: 'Test Financeur',
    budgetMax: 100000,
    deadline: new Date('2025-12-31'),
    sectorsTargeted: ['environnement'],
  };

  it('renders AAP title', () => {
    render(<AapCard aap={mockAap} />);
    expect(screen.getByText('AAP Test')).toBeInTheDocument();
  });

  it('displays budget correctly', () => {
    render(<AapCard aap={mockAap} />);
    expect(screen.getByText(/100 000€/)).toBeInTheDocument();
  });

  it('shows deadline with warning if close', () => {
    const closeDeadline = new Date();
    closeDeadline.setDate(closeDeadline.getDate() + 5);
    
    render(<AapCard aap={{ ...mockAap, deadline: closeDeadline }} />);
    expect(screen.getByText(/5 jours/)).toHaveClass('text-warning-500');
  });
});
```

### 7.2 Tests E2E

```typescript
// cypress/e2e/application-flow.cy.ts
describe('Application Flow', () => {
  beforeEach(() => {
    cy.login('porteur@test.com', 'password123');
  });

  it('completes full application submission', () => {
    // Recherche d'AAP
    cy.visit('/aap/search');
    cy.get('[data-testid="search-input"]').type('environnement');
    cy.get('[data-testid="aap-card"]').first().click();

    // Détail de l'AAP
    cy.url().should('include', '/aap/');
    cy.get('[data-testid="apply-button"]').click();

    // Formulaire de candidature - Étape 1
    cy.get('[data-testid="project-title"]').type('Mon projet innovant');
    cy.get('[data-testid="project-description"]').type(
      'Description détaillée du projet avec plus de 200 caractères...'
    );
    cy.get('[data-testid="next-button"]').click();

    // Étape 2
    cy.get('[data-testid="objectives"]').type('Objectifs du projet...');
    cy.get('[data-testid="next-button"]').click();

    // ... autres étapes

    // Soumission
    cy.get('[data-testid="submit-button"]').click();
    cy.get('[data-testid="success-message"]').should('be.visible');
  });
});
```

---

## 8. MAINTENANCE ET ÉVOLUTION

### 8.1 Monitoring de production

```typescript
// functions/src/monitoring/healthCheck.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export const healthCheck = functions
  .region('europe-west1')
  .https.onRequest(async (req, res) => {
    const checks = {
      firestore: false,
      auth: false,
      storage: false,
    };

    try {
      // Test Firestore
      await admin.firestore().collection('_health').doc('check').get();
      checks.firestore = true;
    } catch (error) {
      console.error('Firestore health check failed:', error);
    }

    try {
      // Test Auth
      await admin.auth().listUsers(1);
      checks.auth = true;
    } catch (error) {
      console.error('Auth health check failed:', error);
    }

    try {
      // Test Storage
      await admin.storage().bucket().getFiles({ maxResults: 1 });
      checks.storage = true;
    } catch (error) {
      console.error('Storage health check failed:', error);
    }

    const allHealthy = Object.values(checks).every(v => v);
    const statusCode = allHealthy ? 200 : 503;

    res.status(statusCode).json({
      status: allHealthy ? 'healthy' : 'unhealthy',
      checks,
      timestamp: new Date().toISOString(),
    });
  });
```

### 8.2 Backup automatique

```typescript
// functions/src/maintenance/backupFirestore.ts
import * as functions from 'firebase-functions';
import { firestore } from 'firebase-admin';

export const backupFirestore = functions
  .region('europe-west1')
  .pubsub.schedule('0 3 * * *') // Tous les jours à 3h
  .timeZone('Europe/Paris')
  .onRun(async (context) => {
    const projectId = process.env.GCLOUD_PROJECT;
    const bucket = `gs://${projectId}-firestore-backups`;

    const client = new firestore.v1.FirestoreAdminClient();

    const databaseName = client.databasePath(projectId!, '(default)');

    try {
      const [operation] = await client.exportDocuments({
        name: databaseName,
        outputUriPrefix: bucket,
        collectionIds: [], // Toutes les collections
      });

      console.log(`Backup started: ${operation.name}`);
    } catch (error) {
      console.error('Backup failed:', error);
      throw error;
    }
  });
```

---

## 9. CRITÈRES DE VALIDATION

### 9.1 Checklist de validation

**Fonctionnalités:**
- [ ] Authentification (email/password + Google)
- [ ] Profils porteur et financeur
- [ ] Abonnements et paiements Stripe
- [ ] Recherche d'AAP avec filtres
- [ ] Sauvegarde d'AAP et recherches
- [ ] Création et gestion d'AAP
- [ ] Candidature avec upload de documents
- [ ] Préqualification automatique
- [ ] Évaluation et notation des candidatures
- [ ] Messagerie interne
- [ ] Notifications in-app et email
- [ ] Alertes personnalisées
- [ ] Calendrier des deadlines
- [ ] Recommandations
- [ ] Import automatique d'AAP
- [ ] Statistiques et analytics
- [ ] Dashboard admin
- [ ] FAQ et aide

**Technique:**
- [ ] TypeScript sans erreurs
- [ ] Tests unitaires >70% coverage
- [ ] Tests E2E pour flux critiques
- [ ] Performance Lighthouse >90
- [ ] Security Rules Firestore validées
- [ ] Pas de failles de sécurité critiques
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Accessibilité WCAG 2.1 AA
- [ ] Monitoring Sentry configuré
- [ ] Backup automatique en place

---

## 10. GLOSSAIRE TECHNIQUE

**API** : Application Programming Interface

**BaaS** : Backend as a Service (Firebase)

**CRUD** : Create, Read, Update, Delete

**DDD** : Domain-Driven Design

**DTI** : Data Transfer Object

**E2E** : End-to-End (tests)

**HOC** : Higher-Order Component

**JWT** : JSON Web Token

**NoSQL** : Not Only SQL (Firestore)

**OAuth** : Open Authorization

**RBAC** : Role-Based Access Control

**SaaS** : Software as a Service

**SPA** : Single Page Application

**SSR** : Server-Side Rendering

**TTL** : Time To Live

**UUID** : Universally Unique Identifier

**WCAG** : Web Content Accessibility Guidelines

**XSS** : Cross-Site Scripting

---

**FIN DE L'ANNEXE TECHNIQUE**

---

*Document créé le : 6 novembre 2025*  
*Version : 1.0*  
*Complément au Cahier des Charges principal*
