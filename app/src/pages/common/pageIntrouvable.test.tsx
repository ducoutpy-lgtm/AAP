// Page 404 (plan niveau A, lot 3.7, 2026-11-25) : une adresse inconnue affichait « Cette page est en cours de
// développement », sans lien de retour.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const etat = vi.hoisted(() => ({
  compte: { currentUser: null as { uid: string } | null, userProfile: null as { userType: string } | null },
}));
vi.mock('../../contexts/AuthContext', () => ({ useAuth: () => etat.compte }));

import PageIntrouvable from './PageIntrouvable';

describe('page introuvable', () => {
  afterEach(cleanup);

  it('sans compte : « Page introuvable » et un lien vers l’accueil', () => {
    etat.compte = { currentUser: null, userProfile: null };
    render(
      <MemoryRouter>
        <PageIntrouvable />
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { name: 'Page introuvable' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: "Retour à l'accueil" })).toHaveAttribute('href', '/');
    expect(screen.queryByRole('link', { name: 'Mon tableau de bord' })).toBeNull();
  });

  it('connecté : un lien vers son tableau de bord en plus', () => {
    etat.compte = { currentUser: { uid: 'p1' }, userProfile: { userType: 'porteur' } };
    render(
      <MemoryRouter>
        <PageIntrouvable />
      </MemoryRouter>,
    );
    expect(screen.getByRole('link', { name: 'Mon tableau de bord' })).toHaveAttribute('href', '/dashboard/porteur');
  });
});
