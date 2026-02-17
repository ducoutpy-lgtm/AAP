import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import NotFoundPage from './NotFoundPage';

function renderPage() {
  return render(
    <MemoryRouter>
      <NotFoundPage />
    </MemoryRouter>,
  );
}

describe('NotFoundPage', () => {
  it('renders the 404 code', () => {
    renderPage();
    expect(screen.getByText('404')).toBeInTheDocument();
  });

  it('renders the not found message', () => {
    renderPage();
    expect(screen.getByText('Page introuvable')).toBeInTheDocument();
  });

  it('has a button linking back to home', () => {
    renderPage();
    const link = screen.getByText("Retour à l'accueil").closest('a');
    expect(link).toHaveAttribute('href', '/');
  });
});
