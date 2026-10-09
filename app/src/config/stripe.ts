import { loadStripe } from '@stripe/stripe-js';

export const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

export const STRIPE_PLANS = {
  porteur: {
    monthly: {
      priceId: 'price_porteur_monthly', // À remplacer par vos vrais IDs Stripe
      amount: 29.99,
      currency: 'EUR',
      interval: 'month' as const,
    },
    annual: {
      priceId: 'price_porteur_annual',
      amount: 299.99,
      currency: 'EUR',
      interval: 'year' as const,
    },
  },
  financeur: {
    monthly: {
      priceId: 'price_financeur_monthly',
      amount: 99.99,
      currency: 'EUR',
      interval: 'month' as const,
    },
    annual: {
      priceId: 'price_financeur_annual',
      amount: 999.99,
      currency: 'EUR',
      interval: 'year' as const,
    },
  },
};

export const TRIAL_DAYS = 14;
