// Formulaire d'appel en cinq étapes (CreateAapPage). Relecture du 2026-11-25 :
// - constat 5 : la liste « Territoires éligibles » ignorait les cinq régions d'outre-mer, que Mon profil propose depuis
//   la décision 41 ; un financeur de La Réunion ne pouvait pas cibler sa région ;
// - publication du brouillon d'un financeur par l'administrateur : le message disait « Appel publié » mais la fiche
//   restait « Proposée », donc invisible des candidats.
// Firestore, le service des appels et le compte connecté sont remplacés par des doublures.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { AAP } from '../../types';

const doublures = vi.hoisted(() => ({
  compte: { currentUser: { uid: 'f1' }, userProfile: { userType: 'financeur', email: 'f1@exemple.fr' } },
  updateAap: vi.fn<(id: string, donnees: Record<string, unknown>, revalider?: boolean) => Promise<void>>(),
  publishAap: vi.fn<(id: string, revalider?: boolean) => Promise<void>>(),
  updateDoc: vi.fn<(ref: unknown, donnees: Record<string, unknown>) => Promise<void>>(),
  annoncer: vi.fn(),
}));
vi.mock('../../config/firebase', () => ({ db: {} }));
vi.mock('firebase/firestore', () => ({
  doc: vi.fn(() => 'reference'),
  getDoc: vi.fn(),
  updateDoc: (ref: unknown, donnees: Record<string, unknown>) => doublures.updateDoc(ref, donnees),
}));
vi.mock('../../services/aapService', () => ({
  aapService: {
    updateAap: (id: string, donnees: Record<string, unknown>, revalider?: boolean) =>
      doublures.updateAap(id, donnees, revalider),
    publishAap: (id: string, revalider?: boolean) => doublures.publishAap(id, revalider),
    createAap: vi.fn(),
  },
}));
vi.mock('../../contexts/AuthContext', () => ({ useAuth: () => doublures.compte }));
vi.mock('../../services/journalService', () => ({ journaliser: vi.fn(() => Promise.resolve()) }));
vi.mock('../../hooks/useMarquerDemarrage', () => ({ useMarquerDemarrage: vi.fn() }));
vi.mock('../../utils/annonces', () => ({ annoncer: (texte: string) => doublures.annoncer(texte) }));

import CreateAapPage from './CreateAapPage';

// Brouillon complet d'un financeur : chaque étape passe le contrôle du formulaire
const brouillon: AAP = {
  id: 'a1',
  financeurId: 'f1',
  financeurName: 'Fondation test',
  title: 'Soutien aux maisons de santé',
  description: 'x'.repeat(120),
  sectorsTargeted: ['sante'],
  territoriesEligible: ['bretagne'],
  deadline: new Date('2099-12-31'),
  contactEmail: 'contact@exemple.fr',
  status: 'draft',
  validation: { statut: 'proposee', commentaire: '', date: '2026-11-25', par: '' },
  createdAt: new Date('2026-11-01'),
  updatedAt: new Date('2026-11-01'),
};

const ouvrir = () =>
  render(
    <MemoryRouter>
      <CreateAapPage aapExistant={brouillon} />
    </MemoryRouter>,
  );
const suivant = () => fireEvent.click(screen.getByRole('button', { name: 'Suivant' }));

describe('formulaire d’appel', () => {
  beforeEach(() => {
    vi.stubGlobal('scrollTo', vi.fn());
    doublures.updateAap.mockReset().mockResolvedValue(undefined);
    doublures.publishAap.mockReset().mockResolvedValue(undefined);
    doublures.updateDoc.mockReset().mockResolvedValue(undefined);
    doublures.annoncer.mockReset();
    doublures.compte = {
      currentUser: { uid: 'f1' },
      userProfile: { userType: 'financeur', email: 'f1@exemple.fr' },
    };
  });
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('les territoires d’outre-mer sont proposés, avec les identifiants de Mon profil', async () => {
    ouvrir();
    suivant();
    for (const region of ['Toute la France', 'Guadeloupe', 'Martinique', 'Guyane', 'La Réunion', 'Mayotte']) {
      expect(screen.getByLabelText(region)).toBeInTheDocument();
    }
    fireEvent.click(screen.getByLabelText('La Réunion'));
    suivant();
    suivant();
    suivant();
    fireEvent.click(screen.getByRole('button', { name: "Publier l'AAP" }));
    await waitFor(() => expect(doublures.updateAap).toHaveBeenCalled());
    expect(doublures.updateAap.mock.calls[0][1].territoriesEligible).toEqual(['bretagne', 'la-reunion']);
  });

  it('l’administrateur qui publie le brouillon d’un financeur le valide : la fiche paraît dans la recherche', async () => {
    doublures.compte = { currentUser: { uid: 'admin1' }, userProfile: { userType: 'admin', email: 'a@exemple.fr' } };
    ouvrir();
    for (let i = 0; i < 4; i++) suivant();
    fireEvent.click(screen.getByRole('button', { name: "Publier l'AAP" }));
    await waitFor(() => expect(doublures.annoncer).toHaveBeenCalledWith('Appel publié'));
    expect(doublures.publishAap).toHaveBeenCalledWith('a1', false);
    expect(doublures.updateDoc).toHaveBeenCalledWith('reference', {
      validation: {
        statut: 'validee',
        commentaire: '',
        date: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
        par: 'Monsieur DUCOUT',
      },
    });
  });

  it('le financeur qui publie son brouillon ne le valide pas : il reste à valider', async () => {
    ouvrir();
    for (let i = 0; i < 4; i++) suivant();
    fireEvent.click(screen.getByRole('button', { name: "Publier l'AAP" }));
    await waitFor(() => expect(doublures.annoncer).toHaveBeenCalled());
    expect(doublures.annoncer.mock.calls[0][0]).toMatch(/après validation par l'administrateur/);
    expect(doublures.publishAap).toHaveBeenCalledWith('a1', true);
    expect(doublures.updateDoc).not.toHaveBeenCalled();
  });
});

// Relecture du 2026-11-25, constat 4 : le récapitulatif lisait le jour saisi (« aaaa-mm-jj », minuit UTC) en heure
// locale, donc la veille outre-mer
describe('récapitulatif du formulaire en Martinique', () => {
  const fuseauInitial = process.env.TZ;
  beforeEach(() => {
    process.env.TZ = 'America/Martinique';
    vi.stubGlobal('scrollTo', vi.fn());
    doublures.compte = {
      currentUser: { uid: 'f1' },
      userProfile: { userType: 'financeur', email: 'f1@exemple.fr' },
    };
  });
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    if (fuseauInitial === undefined) delete process.env.TZ;
    else process.env.TZ = fuseauInitial;
  });

  it('la date limite récapitulée est le jour saisi', () => {
    // Garde-fou : le fuseau est bien appliqué (minuit UTC du 1er décembre tombe le 30 novembre en heure locale)
    expect(new Date('2099-12-01').getDate()).toBe(30);
    render(
      <MemoryRouter>
        <CreateAapPage aapExistant={{ ...brouillon, deadline: new Date('2099-12-01') }} />
      </MemoryRouter>,
    );
    for (let i = 0; i < 4; i++) suivant();
    expect(screen.getByText('Date limite').nextElementSibling?.textContent).toBe('01/12/2099');
  });
});
