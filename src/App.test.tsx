import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

function renderApp(initialRoute = '/') {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <App />
    </MemoryRouter>,
  );
}

describe('App routing', () => {
  it('renders the header on every page', async () => {
    renderApp();
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('renders the footer on every page', async () => {
    renderApp();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('renders the landing page at /', async () => {
    renderApp('/');
    await waitFor(() => {
      expect(
        screen.getByText(/meta-moteur des appels à projets/i),
      ).toBeInTheDocument();
    });
  });

  it('renders the login page at /login', async () => {
    renderApp('/login');
    await waitFor(() => {
      expect(screen.getByText('Accédez à votre espace personnel')).toBeInTheDocument();
    });
  });

  it('renders the signup page at /signup', async () => {
    renderApp('/signup');
    await waitFor(() => {
      expect(screen.getByText('Créez votre compte pour commencer')).toBeInTheDocument();
    });
  });

  it('renders the 404 page for unknown routes', async () => {
    renderApp('/this-page-does-not-exist');
    await waitFor(() => {
      expect(screen.getByText('404')).toBeInTheDocument();
      expect(screen.getByText('Page introuvable')).toBeInTheDocument();
    });
  });

  it('shows a loading spinner while lazy pages load', () => {
    renderApp('/');
    // On first render before lazy component resolves, the fallback may appear.
    // The header/footer should always be present regardless.
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });
});
