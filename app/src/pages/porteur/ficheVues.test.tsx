// Compteur de vues (décision 35 du 2026-11-24) : il restait à 0 faute d'écriture, d'où un taux de conversion à 0 % chez
// le financeur. L'ouverture d'une fiche publiée par un compte connecté ajoute une vue, une seule même quand React rejoue
// l'effet (mode strict) ; l'auteur de l'appel et l'administrateur ne comptent pas.
import { StrictMode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

const etat = vi.hoisted(() => ({
  compte: { currentUser: { uid: 'p1' }, userProfile: { userType: 'porteur' }, refreshUserProfile: () => Promise.resolve() },
  fiche: {} as Record<string, unknown>,
  incrementViews: (() => Promise.resolve()) as (id: string) => Promise<void>,
}));
vi.mock('../../config/firebase', () => ({ db: {}, storage: {} }));
vi.mock('../../contexts/AuthContext', () => ({ useAuth: () => etat.compte }));
vi.mock('../../services/journalService', () => ({ journaliser: vi.fn() }));
vi.mock('../../hooks/useMarquerDemarrage', () => ({ useMarquerDemarrage: vi.fn() }));
vi.mock('../../services/aapService', () => ({ aapService: { incrementViews: (id: string) => etat.incrementViews(id) } }));
vi.mock('firebase/storage', () => ({ ref: vi.fn(), getDownloadURL: vi.fn() }));
vi.mock('firebase/firestore', () => ({
  doc: vi.fn(), collection: vi.fn(), addDoc: vi.fn(),
  getDoc: vi.fn(() => Promise.resolve({ exists: () => true, data: () => etat.fiche })),
  Timestamp: class {},
}));

import AapDetailPage from './AapDetailPage';

const ouvrir = () => render(
  <StrictMode>
    <MemoryRouter initialEntries={['/aap/a1']}>
      <Routes><Route path="/aap/:aapId" element={<AapDetailPage />} /></Routes>
    </MemoryRouter>
  </StrictMode>,
);

describe('compteur de vues de la fiche', () => {
  const appels: string[] = [];
  beforeEach(() => {
    appels.length = 0;
    etat.incrementViews = (id: string) => { appels.push(id); return Promise.resolve(); };
    etat.fiche = { title: 'Appel test', status: 'published', financeurId: 'f1', deadline: null, territoriesEligible: [] };
  });
  afterEach(cleanup);

  it('un candidat ouvre la fiche : une vue, une seule', async () => {
    ouvrir();
    expect(await screen.findByRole('heading', { name: 'Appel test' })).toBeInTheDocument();
    await vi.waitFor(() => expect(appels).toEqual(['a1']));
    await new Promise(r => setTimeout(r, 20));
    expect(appels).toEqual(['a1']);
  });

  it('l’auteur de l’appel et l’administrateur ne comptent pas', async () => {
    etat.compte = { ...etat.compte, currentUser: { uid: 'f1' }, userProfile: { userType: 'financeur' } };
    ouvrir();
    expect(await screen.findByRole('heading', { name: 'Appel test' })).toBeInTheDocument();
    cleanup();
    etat.compte = { ...etat.compte, currentUser: { uid: 'admin1' }, userProfile: { userType: 'admin' } };
    ouvrir();
    expect(await screen.findByRole('heading', { name: 'Appel test' })).toBeInTheDocument();
    await new Promise(r => setTimeout(r, 20));
    expect(appels).toEqual([]);
  });
});
