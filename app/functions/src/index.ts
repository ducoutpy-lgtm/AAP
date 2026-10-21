import * as admin from 'firebase-admin';

// Initialize Firebase Admin
admin.initializeApp();

// Authentication triggers
export { onUserCreated } from './auth/onUserCreated';

// Application triggers
export { onApplicationCreated } from './applications/onApplicationCreated';

// Payments
export { createCheckoutSession } from './payments/createCheckoutSession';
export { stripeWebhook } from './payments/stripeWebhook';

// Scheduled functions
export { sendDailyAlerts } from './scheduled/sendDailyAlerts';

// Lecture du dossier PDF d'un candidat par le modèle (candidature-depuis-pdf, 2026-10-21)
export { preremplirCandidature } from './ia/preremplirCandidature';
