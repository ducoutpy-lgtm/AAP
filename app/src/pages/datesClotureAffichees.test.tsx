// Dates de clôture affichées par les pages (constat 4 de la relecture du plan niveau A, 2026-11-25) : un appel qui clôt le
// 1er décembre (minuit UTC) s'affichait « 30/11/2026 » aux Antilles dans Mes appels, le tableau de bord du financeur,
// l'administration des appels et le calendrier, dont la case du 30 novembre portait l'échéance. Firestore, le service
// des appels et le compte sont remplacés par des doublures ; seule la date (Date) est simulée, pas les minuteries.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const donnees = vi.hoisted(() => ({ aap: [] as Record<string, unknown>[] }));
const service = vi.hoisted(() => ({ getFinanceurAaps: vi.fn() }));
vi.mock('../services/aapService', () => ({ aapService: service }));
vi.mock('../config/firebase', () => ({ db: {} }));
// La doublure de la lecture applique les filtres where(), bornes du mois du calendrier comprises (relecture du
// 2026-11-25 : la doublure qui les ignorait montrait une échéance que la vraie requête ne charge pas)
type Filtre = { champ: string; op: string; valeur: unknown };
const valeurComparee = (v: unknown) => (v instanceof Date ? v.getTime() : v) as number | string;
// Champ à point (« validation.statut », question 49 du 2026-11-26) lu dans le bloc imbriqué, comme Firestore
const lireChamp = (fiche: Record<string, unknown>, champ: string): unknown =>
  champ.split('.').reduce<unknown>((v, cle) => (v as Record<string, unknown> | undefined)?.[cle], fiche);
const respecte = (fiche: Record<string, unknown>, { champ, op, valeur }: Filtre): boolean => {
  const a = valeurComparee(lireChamp(fiche, champ));
  const b = valeurComparee(valeur);
  if (op === '==') return a === b;
  if (op === '>=') return a >= b;
  if (op === '<=') return a <= b;
  throw new Error(`Opérateur non doublé : ${op}`);
};
vi.mock('firebase/firestore', () => ({
  collection: (_db: unknown, nom: string) => nom,
  query: (nom: string, ...filtres: Filtre[]) => ({ nom, filtres }),
  where: (champ: string, op: string, valeur: unknown): Filtre => ({ champ, op, valeur }),
  doc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  setDoc: vi.fn(),
  Timestamp: { fromDate: (d: Date) => d },
  getDocs: (cible: string | { nom: string; filtres: Filtre[] }) => {
    const { nom, filtres } = typeof cible === 'string' ? { nom: cible, filtres: [] } : cible;
    const lues = (nom === 'aap' ? donnees.aap : []).filter((a) => filtres.every((f) => respecte(a, f)));
    return Promise.resolve({ docs: lues.map((a) => ({ id: a.id as string, data: () => a })) });
  },
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
  // Appel visible du candidat : le calendrier ne lit que les appels validés (question 49, 2026-11-26)
  validation: { statut: 'validee', commentaire: '', date: '2026-11-20', par: 'Monsieur DUCOUT' },
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

  // Le calendrier ne lit que les clôtures du mois affiché, qui est celui du jour : l'horloge passe au 1er décembre à 10 h
  // en Martinique (mois de décembre, échéance du jour, toujours ouverte donc urgente). Avant la correction, la requête
  // partait du 1er décembre à minuit local (4 h UTC) et n'aurait pas chargé la clôture de minuit UTC.
  it('calendrier : échéance urgente datée du 1er décembre, sur la case du 1er décembre', async () => {
    vi.setSystemTime(new Date('2026-12-01T10:00:00-04:00'));
    compte.userProfile.userType = 'porteur';
    afficher(<CalendarPage />);
    const titres = await screen.findAllByText('Appel du 1er décembre');
    // Liste des échéances urgentes : la date suit le titre
    expect(titres.map((t) => t.nextElementSibling?.textContent).filter(Boolean)).toEqual(['01 déc. 2026']);
    // Grille : numéro de la case qui porte l'échéance
    expect(titres.map((t) => t.parentElement?.previousElementSibling?.textContent).filter(Boolean)).toEqual(['1']);
  });

  // Panneau du jour choisi : il affichait l'heure locale de minuit UTC (« 20:00 » en Martinique, « 01:00 » à Paris), alors
  // qu'une clôture désigne un jour, sans heure
  it('calendrier : le panneau du jour choisi n’affiche pas d’heure', async () => {
    vi.setSystemTime(new Date('2026-12-01T10:00:00-04:00'));
    compte.userProfile.userType = 'porteur';
    afficher(<CalendarPage />);
    const [caseDuJour] = await screen.findAllByText('Appel du 1er décembre');
    fireEvent.click(caseDuJour.parentElement!.parentElement!);
    const panneau = screen.getByRole('heading', { name: '01 décembre 2026' }).parentElement!;
    expect(within(panneau).getByText('Appel du 1er décembre')).toBeInTheDocument();
    expect(panneau.textContent).not.toMatch(/\d{2}:\d{2}/);
  });
});
