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
} as const;
