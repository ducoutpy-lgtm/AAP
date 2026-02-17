import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LandingPage from './LandingPage';

function renderPage() {
  return render(
    <MemoryRouter>
      <LandingPage />
    </MemoryRouter>,
  );
}

describe('LandingPage', () => {
  it('renders the hero heading', () => {
    renderPage();
    expect(
      screen.getByText(/meta-moteur des appels à projets/i),
    ).toBeInTheDocument();
  });

  it('renders the hero subtext', () => {
    renderPage();
    expect(
      screen.getByText(/Centralisez, recherchez et candidatez/),
    ).toBeInTheDocument();
  });

  it('shows a CTA button for porteurs', () => {
    renderPage();
    expect(
      screen.getByText('Je suis porteur de projet'),
    ).toBeInTheDocument();
  });

  it('shows a CTA button for financeurs', () => {
    renderPage();
    expect(screen.getByText('Je suis financeur')).toBeInTheDocument();
  });

  it('renders all four feature cards', () => {
    renderPage();
    expect(screen.getByText('Recherche centralisée')).toBeInTheDocument();
    expect(screen.getByText('Candidature guidée')).toBeInTheDocument();
    expect(screen.getByText('Statistiques & Analytics')).toBeInTheDocument();
    expect(screen.getByText('Alertes personnalisées')).toBeInTheDocument();
  });

  it('renders feature descriptions', () => {
    renderPage();
    expect(
      screen.getByText(/Trouvez tous les appels à projets/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Un formulaire étape par étape/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Suivez vos performances/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Soyez notifié dès qu'un AAP/),
    ).toBeInTheDocument();
  });

  it('links CTA buttons to signup', () => {
    renderPage();
    const links = screen.getAllByRole('link');
    const signupLinks = links.filter(
      (link) => link.getAttribute('href') === '/signup',
    );
    expect(signupLinks.length).toBeGreaterThanOrEqual(2);
  });

  it('renders the features section heading', () => {
    renderPage();
    expect(screen.getByText('Fonctionnalités clés')).toBeInTheDocument();
  });
});
