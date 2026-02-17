import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SignupPage from './SignupPage';

function renderPage() {
  return render(
    <MemoryRouter>
      <SignupPage />
    </MemoryRouter>,
  );
}

describe('SignupPage', () => {
  it('renders the page heading', () => {
    renderPage();
    expect(screen.getByText('Inscription')).toBeInTheDocument();
  });

  it('renders the subtitle', () => {
    renderPage();
    expect(
      screen.getByText('Créez votre compte pour commencer'),
    ).toBeInTheDocument();
  });

  it('renders a user type selector with porteur and financeur options', () => {
    renderPage();
    const select = screen.getByLabelText('Je suis');
    expect(select).toBeInTheDocument();

    const options = select.querySelectorAll('option');
    expect(options).toHaveLength(2);
    expect(options[0]).toHaveTextContent('Porteur de projet');
    expect(options[1]).toHaveTextContent('Financeur');
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
    const button = screen.getByRole('button', { name: 'Créer mon compte' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('type', 'submit');
  });

  it('shows a link to the login page', () => {
    renderPage();
    const loginLink = screen.getByText('Se connecter');
    expect(loginLink.closest('a')).toHaveAttribute('href', '/login');
  });

  it('defaults the user type to porteur', () => {
    renderPage();
    const select = screen.getByLabelText('Je suis') as HTMLSelectElement;
    expect(select.value).toBe('porteur');
  });
});
