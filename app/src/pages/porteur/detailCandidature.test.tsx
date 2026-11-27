// Détail d'une candidature (corrections-relecture 3.1, 2026-11-20) : une candidature suivie par le candidat seul
// (déposée sur le site du financeur) ne dit pas que le financeur a reçu le dossier ni « Budget demandé : 0 € » ; une
// pièce non déposée s'affiche sans lien, avec la mention « non déposée ».
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

const donnees = vi.hoisted(() => ({ dossier: {} as Record<string, unknown> }));
vi.mock('../../config/firebase', () => ({ db: {} }));
vi.mock('../../contexts/AuthContext', () => ({ useAuth: () => ({ currentUser: { uid: 'p1' } }) }));
// Question 50 : « Écrire au financeur » ouvre la conversation de la candidature, puis la page Messages
const messagerie = vi.hoisted(() => ({ ouvrir: vi.fn((c: { id: string }) => Promise.resolve(c.id)) }));
vi.mock('../../services/messagerieService', async (original) => ({
  ...(await original<typeof import('../../services/messagerieService')>()),
  ouvrirConversation: (c: { id: string }) => messagerie.ouvrir(c),
}));
vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  getDoc: vi.fn(() => Promise.resolve({ exists: () => true, data: () => donnees.dossier })),
  Timestamp: class {},
}));

import ApplicationDetailPage from './ApplicationDetailPage';

const ouvrir = (dossier: Record<string, unknown>) => {
  donnees.dossier = {
    porteurId: 'p1',
    aapId: 'a1',
    aapTitle: 'Appel',
    projectTitle: 'Mon projet',
    status: 'submitted',
    ...dossier,
  };
  render(
    <MemoryRouter initialEntries={['/candidature/c1']}>
      <Routes>
        <Route path="/candidature/:applicationId" element={<ApplicationDetailPage />} />
        <Route path="/messages" element={<p>Page Messages</p>} />
      </Routes>
    </MemoryRouter>,
  );
};

describe('détail d’une candidature', () => {
  afterEach(cleanup);

  it('suivie hors de l’application : ni « dossier reçu » ni budget à 0 €', async () => {
    ouvrir({ externe: true, budget: { total: 0, breakdown: '' }, documents: [] });
    expect(await screen.findByText('Mon projet')).toBeInTheDocument();
    expect(screen.queryByText(/Le financeur a reçu votre dossier/)).toBeNull();
    expect(screen.queryByText(/Budget demandé/)).toBeNull();
    expect(screen.getByText(/site du financeur/)).toBeInTheDocument();
  });

  it('envoyée par l’application : message de réception et budget gardés', async () => {
    ouvrir({ budget: { total: 12000, breakdown: '' }, documents: [] });
    expect(await screen.findByText(/Le financeur a reçu votre dossier/)).toBeInTheDocument();
    expect(screen.getByText(/Budget demandé/)).toBeInTheDocument();
  });

  it('envoyée par l’application : « Écrire au financeur » ouvre la conversation ; suivie dehors : pas de bouton', async () => {
    ouvrir({ financeurId: 'f1', documents: [] });
    fireEvent.click(await screen.findByRole('button', { name: 'Écrire au financeur' }));
    expect(await screen.findByText('Page Messages')).toBeInTheDocument();
    expect(messagerie.ouvrir).toHaveBeenCalledWith(expect.objectContaining({ id: 'c1', porteurId: 'p1', financeurId: 'f1' }));
    cleanup();
    ouvrir({ financeurId: 'f1', externe: true, documents: [] });
    expect(await screen.findByText('Mon projet')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Écrire au financeur' })).toBeNull();
  });

  it('pièce non déposée : sans lien, avec la mention', async () => {
    ouvrir({
      documents: [
        { name: 'dossier.pdf', url: '', nonDeposee: true },
        { name: 'budget.xlsx', url: 'https://exemple.fr/b' },
      ],
    });
    expect(await screen.findByText(/dossier\.pdf/)).toBeInTheDocument();
    expect(screen.getByText(/dossier\.pdf/).closest('a')).toBeNull();
    expect(screen.getByText(/non déposée/)).toBeInTheDocument();
    expect(screen.getByText(/budget\.xlsx/).closest('a')).toHaveAttribute('href', 'https://exemple.fr/b');
  });
});

describe('avis du financeur (décision 40 du 2026-11-24)', () => {
  afterEach(cleanup);

  it('le candidat voit l’avis écrit par le financeur sur la page d’évaluation', async () => {
    ouvrir({ status: 'accepted', financeurFeedback: 'Dossier solide, budget à préciser.', documents: [] });
    expect(await screen.findByText('Dossier solide, budget à préciser.')).toBeInTheDocument();
  });
});
