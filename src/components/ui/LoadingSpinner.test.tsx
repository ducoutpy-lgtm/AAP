import { render, screen } from '@testing-library/react';
import LoadingSpinner from './LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders with accessible status role', () => {
    render(<LoadingSpinner />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('has a screen reader label', () => {
    render(<LoadingSpinner />);
    expect(screen.getByText('Chargement...')).toBeInTheDocument();
  });

  it('renders full screen variant', () => {
    render(<LoadingSpinner fullScreen />);
    const container = screen.getByRole('status').parentElement;
    expect(container?.className).toContain('min-h-screen');
  });
});
