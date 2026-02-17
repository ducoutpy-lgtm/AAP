import { STRIPE_PLANS } from './stripe';

describe('Stripe config', () => {
  describe('STRIPE_PLANS', () => {
    it('defines porteur monthly plan', () => {
      expect(STRIPE_PLANS.porteur.monthly).toEqual({
        priceId: 'price_porteur_monthly',
        amount: 29.99,
        currency: 'EUR',
      });
    });

    it('defines porteur annual plan', () => {
      expect(STRIPE_PLANS.porteur.annual).toEqual({
        priceId: 'price_porteur_annual',
        amount: 299.99,
        currency: 'EUR',
      });
    });

    it('defines financeur monthly plan', () => {
      expect(STRIPE_PLANS.financeur.monthly).toEqual({
        priceId: 'price_financeur_monthly',
        amount: 99.99,
        currency: 'EUR',
      });
    });

    it('defines financeur annual plan', () => {
      expect(STRIPE_PLANS.financeur.annual).toEqual({
        priceId: 'price_financeur_annual',
        amount: 999.99,
        currency: 'EUR',
      });
    });

    it('annual plans are cheaper per-month than monthly plans', () => {
      const porteurMonthlyAnnualized = STRIPE_PLANS.porteur.monthly.amount * 12;
      expect(STRIPE_PLANS.porteur.annual.amount).toBeLessThan(porteurMonthlyAnnualized);

      const financeurMonthlyAnnualized = STRIPE_PLANS.financeur.monthly.amount * 12;
      expect(STRIPE_PLANS.financeur.annual.amount).toBeLessThan(financeurMonthlyAnnualized);
    });

    it('all plans use EUR currency', () => {
      const plans = [
        STRIPE_PLANS.porteur.monthly,
        STRIPE_PLANS.porteur.annual,
        STRIPE_PLANS.financeur.monthly,
        STRIPE_PLANS.financeur.annual,
      ];
      plans.forEach((plan) => {
        expect(plan.currency).toBe('EUR');
      });
    });
  });
});
