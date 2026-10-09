import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import Stripe from 'stripe';

const stripe = new Stripe(functions.config().stripe?.secret_key || process.env.STRIPE_SECRET_KEY || '', {
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
      const appUrl = functions.config().app?.url || process.env.VITE_APP_URL || 'http://localhost:3000';

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
        success_url: `${appUrl}/abonnement/succes?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${appUrl}/abonnement/annule`,
        metadata: {
          firebaseUID: userId,
          userType,
        },
      });

      return { sessionId: session.id };
    } catch (error: any) {
      console.error('Error creating checkout session:', error);
      throw new functions.https.HttpsError('internal', error.message || 'Unable to create checkout session');
    }
  });
