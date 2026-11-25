// Bouton « Clôturer » de Mes appels (décision 39 du 2026-11-24) : le tableau de bord annonçait « Modifier, clôturer »,
// mais rien ne clôturait un appel. Le service et Firestore sont remplacés par des doublures.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const service = vi.hoisted(() => ({
  getFinanceurAaps: vi.fn(),
  updateAapStatus: vi.fn(),
  deleteAap: vi.fn(),
}));
vi.mock('../../services/aapService', () => ({ aapService: service }));
vi.mock('../../config/firebase', () => ({ db: {} }));
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  getDocs: vi.fn(() => Promise.resolve({ docs: [] })),
}));
// Compte stable : un nouvel objet à chaque affichage relancerait le chargement sans fin
const compte = vi.hoisted(() => ({ currentUser: { uid: 'f1' } }));
vi.mock('../../contexts/AuthContext', () => ({ useAuth: () => compte }));

import MyAapPage from './MyAapPage';

describe('Mes appels : clôturer un appel publié', () => {
  afterEach(cleanup);

  it('le bouton « Clôturer » passe l’appel publié en clôturé', async () => {
    service.getFinanceurAaps.mockResolvedValue([
      {
        id: 'a1',
        title: 'Appel ouvert',
        description: 'Description',
        status: 'published',
        deadline: null,
        views: 0,
        territoriesEligible: [],
        sectorsTargeted: [],
      },
    ]);
    service.updateAapStatus.mockResolvedValue(undefined);
    const confirmation = vi.fn(() => true);
    vi.stubGlobal('confirm', confirmation);
    render(
      <MemoryRouter>
        <MyAapPage />
      </MemoryRouter>,
    );
    const bouton = await screen.findByRole('button', { name: 'Clôturer' });
    fireEvent.click(bouton);
    expect(confirmation).toHaveBeenCalled();
    await waitFor(() => expect(service.updateAapStatus).toHaveBeenCalledWith('a1', 'closed'));
  });
});
