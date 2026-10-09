import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import Stripe from 'stripe';

const stripe = new Stripe(functions.config().stripe?.secret_key || process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

export const stripeWebhook = functions
  .region('europe-west1')
  .https.onRequest(async (req, res) => {
    const sig = req.headers['stripe-signature'] as string;
    const webhookSecret = functions.config().stripe?.webhook_secret || process.env.STRIPE_WEBHOOK_SECRET || '';

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Gestion des événements Stripe
    try {
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
    } catch (error: any) {
      console.error('Error processing webhook:', error);
      res.status(500).send(`Webhook Error: ${error.message}`);
    }
  });

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.firebaseUID;
  if (!userId) return;

  const subscription = await stripe.subscriptions.retrieve(session.subscription as string);

  await admin.firestore().collection('users').doc(userId).update({
    subscriptionStatus: 'active',
    subscriptionId: subscription.id,
    subscriptionPlan: subscription.items.data[0].plan.interval === 'month' ? 'monthly' : 'annual',
    currentPeriodEnd: admin.firestore.Timestamp.fromDate(new Date(subscription.current_period_end * 1000)),
    trialEndsAt: null,
  });

  // Notification
  await admin.firestore().collection('notifications').add({
    userId,
    type: 'system',
    title: 'Abonnement activé',
    message: 'Votre abonnement a été activé avec succès. Bienvenue !',
    read: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customer = subscription.customer as string;
  const snapshot = await admin
    .firestore()
    .collection('users')
    .where('stripeCustomerId', '==', customer)
    .limit(1)
    .get();

  if (snapshot.empty) return;

  const userId = snapshot.docs[0].id;

  await admin.firestore().collection('users').doc(userId).update({
    subscriptionStatus: subscription.status === 'active' ? 'active' : 'expired',
    currentPeriodEnd: admin.firestore.Timestamp.fromDate(new Date(subscription.current_period_end * 1000)),
  });
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customer = subscription.customer as string;
  const snapshot = await admin
    .firestore()
    .collection('users')
    .where('stripeCustomerId', '==', customer)
    .limit(1)
    .get();

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
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  const customer = invoice.customer as string;
  const snapshot = await admin
    .firestore()
    .collection('users')
    .where('stripeCustomerId', '==', customer)
    .limit(1)
    .get();

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
    paidAt: admin.firestore.Timestamp.fromDate(new Date((invoice.status_transitions.paid_at || 0) * 1000)),
    periodStart: admin.firestore.Timestamp.fromDate(new Date(invoice.period_start * 1000)),
    periodEnd: admin.firestore.Timestamp.fromDate(new Date(invoice.period_end * 1000)),
  });
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const customer = invoice.customer as string;
  const snapshot = await admin
    .firestore()
    .collection('users')
    .where('stripeCustomerId', '==', customer)
    .limit(1)
    .get();

  if (snapshot.empty) return;

  const userId = snapshot.docs[0].id;

  // Notification
  await admin.firestore().collection('notifications').add({
    userId,
    type: 'system',
    title: 'Échec du paiement',
    message: 'Le paiement de votre abonnement a échoué. Veuillez mettre à jour vos informations de paiement.',
    read: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}
