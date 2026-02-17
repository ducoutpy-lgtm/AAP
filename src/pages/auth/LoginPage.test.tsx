import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from './LoginPage';

function renderPage() {
  return render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>,
  );
}

describe('LoginPage', () => {
  it('renders the page heading', () => {
    renderPage();
    expect(screen.getByText('Connexion')).toBeInTheDocument();
  });

  it('renders the subtitle', () => {
    renderPage();
    expect(
      screen.getByText('Accédez à votre espace personnel'),
    ).toBeInTheDocument();
  });

  it('renders an email input', () => {
    renderPage();
    const emailInput = screen.getByLabelText('Email');
    expect(emailInput).toBeInTheDocument();
    expect(emailInput).toHaveAttribute('type', 'email');
  });

  it('renders a password input', () => {
    renderPage();
    const passwordInput = screen.getByLabelText('Mot de passe');
    expect(passwordInput).toBeInTheDocument();
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('renders a submit button', () => {
    renderPage();
    const button = screen.getByRole('button', { name: 'Se connecter' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('type', 'submit');
  });

  it('shows a link to the signup page', () => {
    renderPage();
    const signupLink = screen.getByText("S'inscrire");
    expect(signupLink.closest('a')).toHaveAttribute('href', '/signup');
  });

  it('has the correct placeholder on email input', () => {
    renderPage();
    expect(screen.getByPlaceholderText('vous@exemple.fr')).toBeInTheDocument();
  });

  it('renders a form element', () => {
    const { container } = renderPage();
    expect(container.querySelector('form')).toBeInTheDocument();
  });
});
