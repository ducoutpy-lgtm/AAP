// Recommandations : « Candidater sur le site officiel » ouvre l'adresse de l'appel. Liens sûrs (relecture du 2026-11-25,
// constat 46) : cette ouverture échappait à lienSur, une adresse « javascript: » ou « data: » s'y serait exécutée.
// Firestore et les règles de recommandation sont remplacés par des doublures.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const etat = vi.hoisted(() => ({ adresse: '' }));
vi.mock('../../config/firebase', () => ({ db: {} }));
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  doc: vi.fn(),
  getDoc: vi.fn(() => Promise.resolve({ exists: () => false })),
  getDocs: vi.fn(() => Promise.resolve({ docs: [] })),
}));
// Compte stable : un nouvel objet à chaque affichage relancerait le chargement sans fin
const compte = vi.hoisted(() => ({ currentUser: { uid: 'p1' } }));
vi.mock('../../contexts/AuthContext', () => ({ useAuth: () => compte }));
vi.mock('../../utils/recommandations', () => ({
  manquesDuProfil: () => [],
  recommander: () => [
    {
      aap: {
        id: 'a1',
        title: 'Appel importé',
        description: 'Description',
        source: 'scraped',
        financeurId: 'scraped',
        externalUrl: etat.adresse,
        deadline: null,
        territoriesEligible: [],
      },
      points: 5,
      raisons: ['Appel national, ouvert à toutes les régions'],
      aVerifier: [],
    },
  ],
}));

import RecommendationsPage from './RecommendationsPage';

const cliquerCandidater = async () => {
  render(
    <MemoryRouter>
      <RecommendationsPage />
    </MemoryRouter>,
  );
  fireEvent.click(await screen.findByRole('button', { name: 'Candidater sur le site officiel' }));
};

describe('recommandations : ouverture du site officiel', () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('une adresse « javascript: » n’est pas ouverte', async () => {
    etat.adresse = 'javascript:alert(1)';
    const ouvrir = vi.fn();
    vi.stubGlobal('open', ouvrir);
    await cliquerCandidater();
    expect(ouvrir).not.toHaveBeenCalled();
  });

  it('une adresse web est ouverte dans un nouvel onglet', async () => {
    etat.adresse = 'https://www.ars.sante.fr/appel';
    const ouvrir = vi.fn();
    vi.stubGlobal('open', ouvrir);
    await cliquerCandidater();
    expect(ouvrir).toHaveBeenCalledWith('https://www.ars.sante.fr/appel', '_blank', 'noopener');
  });
});
