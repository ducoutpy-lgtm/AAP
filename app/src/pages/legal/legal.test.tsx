// Tests de rendu des pages légales (changement degel-application-complete 5.1) : texte présent, aucune mention
// « en cours de développement », champs à valider signalés. Rendu dans jsdom avec un routeur en mémoire.
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import MentionsLegalesPage from './MentionsLegalesPage';
import CguPage from './CguPage';
import ConfidentialitePage from './ConfidentialitePage';
import { EDITEUR } from './editeur';

const rendre = (page: React.ReactElement) => render(<MemoryRouter>{page}</MemoryRouter>);

describe('pages légales', () => {
  it('les mentions légales nomment l’éditeur, le directeur de la publication et l’hébergeur', () => {
    rendre(<MentionsLegalesPage />);
    expect(screen.getByRole('heading', { level: 1, name: 'Mentions légales' })).toBeInTheDocument();
    expect(screen.getAllByText(/ARCADIA SASU/).length).toBeGreaterThan(0);
    expect(screen.getByText(/Directeur de la publication/)).toHaveTextContent(EDITEUR.directeurPublication);
    expect(screen.getByText(/Netlify, Inc\./)).toBeInTheDocument();
    expect(screen.queryByText(/en cours de développement/)).toBeNull();
  });

  it('les CGU décrivent la période d’essai et le rôle de l’annonce officielle', () => {
    rendre(<CguPage />);
    expect(screen.getByRole('heading', { level: 1, name: "Conditions générales d'utilisation" })).toBeInTheDocument();
    expect(screen.getByText(/quatorze jours/)).toBeInTheDocument();
    expect(screen.getByText(/Seule l'annonce officielle fait foi/)).toBeInTheDocument();
  });

  it('la politique de confidentialité nomme le délégué à la protection des données et la CNIL', () => {
    rendre(<ConfidentialitePage />);
    expect(screen.getByRole('heading', { level: 1, name: 'Politique de confidentialité' })).toBeInTheDocument();
    expect(screen.getAllByText(new RegExp(EDITEUR.dpo)).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/CNIL/).length).toBeGreaterThan(0);
    // Les données d'entreprise inconnues du dépôt sont marquées, jamais inventées
    expect(screen.getAllByText(/À VALIDER/).length).toBeGreaterThan(0);
  });
});
