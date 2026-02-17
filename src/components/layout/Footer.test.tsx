import { render, screen } from '@testing-library/react';
import Footer from './Footer';

describe('Footer', () => {
  it('renders a footer element', () => {
    render(<Footer />);
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('displays the current year', () => {
    render(<Footer />);
    const currentYear = new Date().getFullYear().toString();
    expect(screen.getByText(new RegExp(currentYear))).toBeInTheDocument();
  });

  it('displays the brand name', () => {
    render(<Footer />);
    expect(screen.getByText(/AAP Meta-Moteur/)).toBeInTheDocument();
  });

  it('displays a copyright notice', () => {
    render(<Footer />);
    expect(screen.getByText(/Tous droits réservés/)).toBeInTheDocument();
  });
});
