// Dates de clôture affichées par les pages (constat 4 de la relecture du plan niveau A, 2026-11-25) : un appel qui clôt le
// 1er décembre (minuit UTC) s'affichait « 30/11/2026 » aux Antilles dans Mes appels, le tableau de bord du financeur,
// l'administration des appels et le calendrier, dont la case du 30 novembre portait l'échéance. Firestore, le service
// des appels et le compte sont remplacés par des doublures ; seule la date (Date) est simulée, pas les minuteries.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const donnees = vi.hoisted(() => ({ aap: [] as Record<string, unknown>[] }));
const service = vi.hoisted(() => ({ getFinanceurAaps: vi.fn() }));
vi.mock('../services/aapService', () => ({ aapService: service }));
vi.mock('../config/firebase', () => ({ db: {} }));
vi.mock('firebase/firestore', () => ({
  collection: (_db: unknown, nom: string) => nom,
  query: (nom: string) => nom,
  where: vi.fn(),
  doc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  setDoc: vi.fn(),
  Timestamp: { fromDate: (d: Date) => d },
  getDocs: (nom: string) =>
    Promise.resolve({
      docs: (nom === 'aap' ? donnees.aap : []).map((a) => ({ id: a.id as string, data: () => a })),
    }),
}));
// Compte stable : un nouvel objet à chaque affichage relancerait le chargement sans fin
const compte = vi.hoisted(() => ({
  currentUser: { uid: 'f1' },
  userProfile: { userType: 'financeur', email: 'financeur@exemple.fr' },
}));
vi.mock('../contexts/AuthContext', () => ({ useAuth: () => compte }));
vi.mock('../components/demarrage/ListeDemarrage', () => ({ ListeDemarrage: () => null }));

import MyAapPage from './financeur/MyAapPage';
import FinanceurDashboard from './financeur/FinanceurDashboard';
import ManageAAPsPage from './admin/ManageAAPsPage';
import CalendarPage from './common/CalendarPage';

const APPEL = {
  id: 'a1',
  title: 'Appel du 1er décembre',
  description: 'Description',
  status: 'published',
  financeurId: 'f1',
  financeurName: 'Financeur',
  deadline: new Date(Date.UTC(2026, 11, 1)),
  views: 0,
  territoriesEligible: [],
  sectorsTargeted: [],
};

const fuseauInitial = process.env.TZ;
beforeEach(() => {
  process.env.TZ = 'America/Martinique';
  // Le 28 novembre 2026 à 10 h en Martinique : l'appel est ouvert, à trois jours de sa clôture
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-11-28T10:00:00-04:00'));
  donnees.aap = [APPEL];
  service.getFinanceurAaps.mockResolvedValue([APPEL]);
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  if (fuseauInitial === undefined) delete process.env.TZ;
  else process.env.TZ = fuseauInitial;
});

const afficher = (page: JSX.Element) => render(<MemoryRouter>{page}</MemoryRouter>);

describe('en Martinique, un appel qui clôt le 1er décembre s’affiche le 1er décembre', () => {
  it('Mes appels', async () => {
    afficher(<MyAapPage />);
    expect((await screen.findByText(/^Deadline:/)).textContent).toBe('Deadline: 01/12/2026');
  });

  it('tableau de bord du financeur : liste des appels et prochaine échéance', async () => {
    compte.userProfile.userType = 'financeur';
    afficher(<FinanceurDashboard />);
    expect((await screen.findByText(/clôture le/)).textContent).toBe('0 vues · clôture le 01/12/2026');
    expect(screen.getByText(/Prochaine échéance/).textContent).toBe(
      'Prochaine échéance : 01/12/2026 (Appel du 1er décembre)',
    );
  });

  it('administration des appels', async () => {
    afficher(<ManageAAPsPage />);
    expect((await screen.findByText('Date limite')).nextElementSibling?.textContent).toBe('01/12/2026');
  });

  it('calendrier : échéance urgente datée du 1er décembre, sur la case du 1er décembre', async () => {
    compte.userProfile.userType = 'porteur';
    afficher(<CalendarPage />);
    const titres = await screen.findAllByText('Appel du 1er décembre');
    // Liste des échéances urgentes : la date suit le titre
    expect(titres.map((t) => t.nextElementSibling?.textContent).filter(Boolean)).toEqual(['01 déc. 2026']);
    // Grille : numéro de la case qui porte l'échéance
    expect(titres.map((t) => t.parentElement?.previousElementSibling?.textContent).filter(Boolean)).toEqual(['1']);
  });
});
