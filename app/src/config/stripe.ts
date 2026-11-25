// Formules et montants (seule source des prix affichés). Plus aucun import de Stripe ici (plan niveau A, lot 3.6,
// 2026-11-25) : importer le paquet ajoutait son script à toutes les pages, accueil compris ; il n'est chargé qu'au
// paiement, par SelectPlanPage.

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
