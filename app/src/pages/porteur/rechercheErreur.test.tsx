// États d'erreur des pages (plan niveau A, lot 3.1, 2026-11-25) : une panne de lecture s'affichait comme « Aucun AAP
// trouvé », ce qui laissait croire qu'aucun appel n'existait. La page dit maintenant que la lecture a échoué et propose
// de réessayer ; le même composant sert aux autres pages.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const etat = vi.hoisted(() => ({
  compte: {
    currentUser: { uid: 'p1' },
    userProfile: { userType: 'porteur' },
    refreshUserProfile: () => Promise.resolve(),
  },
  lectures: 0,
  enPanne: true,
}));
vi.mock('../../config/firebase', () => ({ db: {} }));
vi.mock('../../contexts/AuthContext', () => ({ useAuth: () => etat.compte }));
vi.mock('../../services/journalService', () => ({ journaliser: vi.fn() }));
vi.mock('../../hooks/useMarquerDemarrage', () => ({ useMarquerDemarrage: vi.fn() }));
vi.mock('../../services/favorisService', () => ({
  lireFavoris: () => Promise.resolve(new Set<string>()),
  basculerFavori: vi.fn(),
}));
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  doc: vi.fn(),
  addDoc: vi.fn(),
  Timestamp: class {},
  getDoc: vi.fn(() => Promise.resolve({ exists: () => false, data: () => ({}) })),
  getDocs: vi.fn(() => {
    etat.lectures += 1;
    return etat.enPanne ? Promise.reject(new Error('unavailable')) : Promise.resolve({ docs: [] });
  }),
}));

import SearchAapPage from './SearchAapPage';

describe('recherche : lecture des appels en échec', () => {
  afterEach(cleanup);

  it('la page dit que la lecture a échoué, sans « Aucun AAP trouvé », et « Réessayer » relance la lecture', async () => {
    render(
      <MemoryRouter initialEntries={['/aap/search']}>
        <SearchAapPage />
      </MemoryRouter>,
    );
    expect(await screen.findByRole('alert')).toHaveTextContent(/n'ont pas pu être chargées/);
    expect(screen.queryByText('Aucun AAP trouvé')).toBeNull();
    const avant = etat.lectures;
    etat.enPanne = false;
    fireEvent.click(screen.getByRole('button', { name: 'Réessayer' }));
    expect(await screen.findByText('Aucun AAP trouvé')).toBeInTheDocument();
    expect(etat.lectures).toBeGreaterThan(avant);
  });
});
