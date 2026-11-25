// Écran Abonnement (décision du 2026-11-24 « Le garder », plan niveau A, lot 3.7) : le paiement n'est pas branché (fonctions
// serveur non déployées) ; l'écran le dit, et les boutons d'abonnement ne lancent pas un appel voué à l'échec.
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const compte = vi.hoisted(() => ({
  userProfile: { userType: 'porteur', subscriptionStatus: 'trial', trialEndsAt: new Date() },
}));
vi.mock('../../contexts/AuthContext', () => ({ useAuth: () => compte }));
vi.mock('../../config/firebase', () => ({ functions: {} }));
vi.mock('firebase/functions', () => ({ httpsCallable: vi.fn() }));
vi.mock('@stripe/stripe-js', () => ({ loadStripe: vi.fn(() => Promise.resolve(null)) }));
vi.mock('@stripe/stripe-js/pure', () => ({ loadStripe: vi.fn(() => Promise.resolve(null)) }));

import SelectPlanPage from './SelectPlanPage';

describe('écran Abonnement', () => {
  it('mention « paiement bientôt disponible » et boutons d’abonnement inactifs ; l’essai reste accessible', () => {
    render(
      <MemoryRouter>
        <SelectPlanPage />
      </MemoryRouter>,
    );
    expect(screen.getAllByText(/Paiement bientôt disponible/).length).toBeGreaterThan(0);
    const abonnements = screen.getAllByRole('button', { name: /Paiement bientôt disponible/ });
    expect(abonnements).toHaveLength(2);
    for (const bouton of abonnements) expect(bouton).toBeDisabled();
    expect(screen.getByRole('button', { name: "Continuer avec la période d'essai" })).toBeEnabled();
  });
});
