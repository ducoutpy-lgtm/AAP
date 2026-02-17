import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Header from './Header';

function renderWithRouter() {
  return render(
    <MemoryRouter>
      <Header />
    </MemoryRouter>,
  );
}

describe('Header', () => {
  it('renders the brand name', () => {
    renderWithRouter();
    expect(screen.getByText('AAP')).toBeInTheDocument();
  });

  it('has a link to the homepage on the brand', () => {
    renderWithRouter();
    const brandLink = screen.getByText('AAP').closest('a');
    expect(brandLink).toHaveAttribute('href', '/');
  });

  it('shows a Connexion link pointing to /login', () => {
    renderWithRouter();
    const loginLink = screen.getByText('Connexion');
    expect(loginLink).toBeInTheDocument();
    expect(loginLink.closest('a')).toHaveAttribute('href', '/login');
  });

  it('shows a S\'inscrire link pointing to /signup', () => {
    renderWithRouter();
    const signupLink = screen.getByText("S'inscrire");
    expect(signupLink).toBeInTheDocument();
    expect(signupLink.closest('a')).toHaveAttribute('href', '/signup');
  });

  it('renders a header element', () => {
    renderWithRouter();
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('renders a nav element', () => {
    renderWithRouter();
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });
});
