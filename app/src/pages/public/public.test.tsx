// Tests de rendu des pages publiques (2026-11-20) : chaque page s'affiche avec son titre, et chaque lien interne mène à
// une route déclarée dans App.tsx (un lien mort renverrait le visiteur sur « Page non trouvée »). Firebase et le compte
// connecté sont remplacés par des doublures : ces pages se lisent sans compte.
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ROUTES, routeExiste as existe } from '../../test/routes';

vi.mock('../../config/firebase', () => ({ db: {} }));
vi.mock('firebase/firestore', () => ({
  doc: vi.fn(() => ({})),
  getDoc: vi.fn(() => Promise.resolve({ exists: () => false, data: () => undefined })),
  addDoc: vi.fn(() => Promise.resolve({ id: 'x' })),
  collection: vi.fn(() => ({})),
  Timestamp: { now: () => ({}) },
}));
vi.mock('../../contexts/AuthContext', () => ({ useAuth: () => ({ currentUser: null, userProfile: null }) }));

import LandingPage from './LandingPage';
import FonctionnalitesPage from './FonctionnalitesPage';
import TarifsPage from './TarifsPage';
import FinanceursPage from './FinanceursPage';
import FaqPage from './FaqPage';
import AProposPage from './AProposPage';
import ContactPage from './ContactPage';
import MentionsLegalesPage from '../legal/MentionsLegalesPage';
import CguPage from '../legal/CguPage';
import ConfidentialitePage from '../legal/ConfidentialitePage';

const PAGES: [string, () => React.ReactElement, RegExp][] = [
  ['accueil', () => <LandingPage />, /./],
  ['fonctionnalités', () => <FonctionnalitesPage />, /^Fonctionnalités$/],
  ['tarifs', () => <TarifsPage />, /^Tarifs$/],
  ['financeurs', () => <FinanceursPage />, /Publiez vos appels à projets/],
  ['questions fréquentes', () => <FaqPage />, /^Questions fréquentes$/],
  ['à propos', () => <AProposPage />, /^À propos$/],
  ['contact', () => <ContactPage />, /^Nous contacter$/],
  ['mentions légales', () => <MentionsLegalesPage />, /^Mentions légales$/],
  ['conditions d’utilisation', () => <CguPage />, /^Conditions générales d'utilisation$/],
  ['confidentialité', () => <ConfidentialitePage />, /^Politique de confidentialité$/],
];

describe('pages publiques', () => {
  let liensControles = 0;
  it('les routes de App.tsx sont lues', () => {
    expect(ROUTES).toContain('/');
    expect(ROUTES).toContain('/aap/:aapId');
    expect(existe('/aap/abc')).toBe(true);
    expect(existe('/page-inexistante')).toBe(false);
  });

  for (const [nom, page, titre] of PAGES) {
    it(`${nom} : titre affiché et liens internes vers des routes existantes`, () => {
      const { container, unmount } = render(<MemoryRouter>{page()}</MemoryRouter>);
      expect(screen.getByRole('heading', { level: 1, name: titre })).toBeInTheDocument();
      const internes = [...container.querySelectorAll('a[href^="/"]')].map(a => a.getAttribute('href') ?? '');
      expect(internes.filter(h => !existe(h))).toEqual([]);
      liensControles += internes.length;
      unmount();
    });
  }

  it('le contrôle a porté sur des liens réels', () => {
    expect(liensControles).toBeGreaterThan(20);
  });
});
