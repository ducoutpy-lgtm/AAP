// Requêtes de liste des appels d'un candidat (changement securite-vues-messagerie, question 49, 2026-11-26) : la règle de
// lecture refuse désormais en entier une requête qui pourrait renvoyer un appel non visible (Firestore ne filtre pas). La
// doublure de Firestore applique la même preuve que la règle « allow list » de firestore.rules : une requête sur « aap »
// doit porter status == 'published' et validation.statut == 'validee', ou financeurId == l'identifiant du compte ; sinon
// elle est refusée comme par Firestore. Avant la correction, la recherche, le tableau de bord du candidat, les
// recommandations et le calendrier filtraient seulement sur le statut et affichaient « Les données n'ont pas pu être
// chargées ».
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

type Contrainte = { champ?: string; op?: string; valeur?: unknown };
const etat = vi.hoisted(() => ({
  compte: {
    currentUser: { uid: 'p1' },
    userProfile: { userType: 'porteur' },
    refreshUserProfile: () => Promise.resolve(),
  },
  lecturesAppels: 0,
  refusees: 0,
  appels: [] as Record<string, unknown>[],
}));
vi.mock('../config/firebase', () => ({ db: {} }));
vi.mock('../contexts/AuthContext', () => ({ useAuth: () => etat.compte }));
vi.mock('../services/journalService', () => ({ journaliser: vi.fn() }));
vi.mock('../hooks/useMarquerDemarrage', () => ({ useMarquerDemarrage: vi.fn() }));
vi.mock('../components/demarrage/ListeDemarrage', () => ({ ListeDemarrage: () => null }));
vi.mock('../services/favorisService', () => ({
  lireFavoris: () => Promise.resolve(new Set<string>()),
  basculerFavori: vi.fn(),
}));
vi.mock('firebase/firestore', () => ({
  collection: (_db: unknown, nom: string) => ({ nom }),
  query: (cible: { nom: string }, ...contraintes: Contrainte[]) => ({ nom: cible.nom, contraintes }),
  where: (champ: string, op: string, valeur: unknown): Contrainte => ({ champ, op, valeur }),
  orderBy: (): Contrainte => ({}),
  limit: (): Contrainte => ({}),
  doc: vi.fn(),
  addDoc: vi.fn(),
  Timestamp: { fromDate: (d: Date) => d, now: () => new Date() },
  getDoc: () => Promise.resolve({ exists: () => false, data: () => ({}) }),
  getDocs: (cible: { nom: string; contraintes?: Contrainte[] }) => {
    if (cible.nom !== 'aap') return Promise.resolve({ docs: [], size: 0 });
    etat.lecturesAppels += 1;
    const contraintes = cible.contraintes ?? [];
    const egal = (champ: string, valeur: unknown) =>
      contraintes.some((c) => c.champ === champ && c.op === '==' && c.valeur === valeur);
    const prouvee =
      (egal('status', 'published') && egal('validation.statut', 'validee')) ||
      egal('financeurId', etat.compte.currentUser.uid);
    if (!prouvee) {
      etat.refusees += 1;
      return Promise.reject(
        Object.assign(new Error('Missing or insufficient permissions.'), { code: 'permission-denied' }),
      );
    }
    const docs = etat.appels.map((a) => ({ id: a.id as string, data: () => a }));
    return Promise.resolve({ docs, size: docs.length });
  },
}));

import SearchAapPage from './porteur/SearchAapPage';
import PorteurDashboard from './porteur/PorteurDashboard';
import RecommendationsPage from './porteur/RecommendationsPage';
import CalendarPage from './common/CalendarPage';

// Clôture dans dix jours, à midi UTC : dans le mois affiché par le calendrier, sauf les dix derniers jours d'un mois
const dansDixJours = new Date(Date.now() + 10 * 24 * 3600 * 1000);
const APPEL = {
  id: 'a1',
  title: 'Appel publié et validé',
  description: 'Description',
  status: 'published',
  financeurId: 'scraped',
  financeurName: 'ARS Test',
  validation: { statut: 'validee', commentaire: '', date: '2026-11-20', par: 'claude-haiku-5-5' },
  publishedAt: new Date(Date.UTC(2026, 10, 20)),
  deadline: dansDixJours,
  territoriesEligible: ['france'],
  sectorsTargeted: [],
  views: 0,
};

const afficher = (page: JSX.Element) => render(<MemoryRouter>{page}</MemoryRouter>);

beforeEach(() => {
  etat.lecturesAppels = 0;
  etat.refusees = 0;
  etat.appels = [APPEL];
});
afterEach(cleanup);

describe('pages du candidat : requêtes de liste acceptées par la règle de lecture', () => {
  it('recherche : l’appel publié et validé s’affiche, aucune requête refusée', async () => {
    afficher(<SearchAapPage />);
    expect(await screen.findByText('Appel publié et validé')).toBeInTheDocument();
    expect(etat.refusees).toBe(0);
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('tableau de bord du candidat : l’appel s’affiche dans « pour vous », aucune requête refusée', async () => {
    afficher(<PorteurDashboard />);
    expect(await screen.findByText('Appel publié et validé')).toBeInTheDocument();
    expect(etat.refusees).toBe(0);
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('recommandations : la page se charge sans message d’erreur', async () => {
    afficher(<RecommendationsPage />);
    expect(await screen.findByText('Appels recommandés pour votre structure')).toBeInTheDocument();
    expect(etat.lecturesAppels).toBe(1);
    expect(etat.refusees).toBe(0);
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('calendrier du candidat : la lecture des échéances n’est pas refusée', async () => {
    afficher(<CalendarPage />);
    await waitFor(() => expect(etat.lecturesAppels).toBe(1));
    expect(etat.refusees).toBe(0);
    expect(screen.queryByRole('alert')).toBeNull();
  });
});
