// Page de la fiche. Compteur de vues (décision 35 du 2026-11-24) : il restait à 0 faute d'écriture, d'où un taux de
// conversion à 0 % chez le financeur. L'ouverture d'une fiche publiée par un compte connecté ajoute une vue, une seule même quand React rejoue
// l'effet (mode strict) ; l'auteur de l'appel et l'administrateur ne comptent pas.
import { StrictMode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
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
const favoris = vi.hoisted(() => ({ basculer: vi.fn<(uid: string, id: string, actif: boolean) => Promise<void>>(() => Promise.resolve()) }));
vi.mock('../../services/favorisService', () => ({
  lireFavoris: () => Promise.resolve(new Set<string>()),
  basculerFavori: (uid: string, id: string, actif: boolean) => favoris.basculer(uid, id, actif),
}));
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

// Plan niveau A, lot 3.4 (2026-11-25) : une fiche proposée s'ouvrait par son adresse directe
describe('fiche non visible du public', () => {
  beforeEach(() => {
    etat.fiche = { title: 'Appel proposé', status: 'published', financeurId: 'f1', deadline: null, territoriesEligible: [],
      validation: { statut: 'proposee', commentaire: '', date: '2026-11-25', par: '' } };
  });
  afterEach(cleanup);

  it('un candidat voit « AAP non trouvé »', async () => {
    etat.compte = { ...etat.compte, currentUser: { uid: 'p1' }, userProfile: { userType: 'porteur' } };
    ouvrir();
    expect(await screen.findByText('AAP non trouvé')).toBeInTheDocument();
    expect(screen.queryByText('Appel proposé')).toBeNull();
  });

  it('son auteur la lit, pour l’aperçu', async () => {
    etat.compte = { ...etat.compte, currentUser: { uid: 'f1' }, userProfile: { userType: 'financeur' } };
    ouvrir();
    expect(await screen.findByRole('heading', { name: 'Appel proposé' })).toBeInTheDocument();
  });
});

// Favori (décision du 2026-11-24 « Le brancher », plan niveau A, lot 3.7) : le cœur de la fiche ne faisait rien
describe('favori de la fiche', () => {
  beforeEach(() => {
    etat.fiche = { title: 'Appel test', status: 'published', financeurId: 'f1', deadline: null, territoriesEligible: [] };
    etat.compte = { ...etat.compte, currentUser: { uid: 'p1' }, userProfile: { userType: 'porteur' } };
    favoris.basculer.mockClear();
  });
  afterEach(cleanup);

  it('ajouter puis retirer : enregistré dans les favoris du compte, bouton à jour', async () => {
    ouvrir();
    const bouton = await screen.findByRole('button', { name: 'Ajouter aux favoris' });
    expect(bouton).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(bouton);
    await vi.waitFor(() => expect(favoris.basculer).toHaveBeenCalledWith('p1', 'a1', false));
    const retirer = await screen.findByRole('button', { name: 'Retirer des favoris' });
    expect(retirer).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(retirer);
    await vi.waitFor(() => expect(favoris.basculer).toHaveBeenLastCalledWith('p1', 'a1', true));
  });
});
