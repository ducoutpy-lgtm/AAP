// Annonces (plan niveau A, lot 3.1, 2026-11-25) : les retours « AAP publié avec succès », « Erreur lors de la
// suppression »... passaient par alert(), une fenêtre du navigateur qui bloque la page et n'est pas lue de la même façon
// par les lecteurs d'écran. Ils s'affichent maintenant dans un bandeau, qui se ferme au clic ou après huit secondes.
import { act } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Annonces } from './Annonces';
import { annoncer } from '../../utils/annonces';

describe('annonces', () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('succès en « status », erreur en « alert », fermeture au clic', () => {
    render(<Annonces />);
    act(() => annoncer('Appel publié'));
    expect(screen.getByRole('status')).toHaveTextContent('Appel publié');
    act(() => annoncer('Erreur lors de la suppression', 'erreur'));
    expect(screen.getByRole('alert')).toHaveTextContent('Erreur lors de la suppression');
    fireEvent.click(screen.getAllByRole('button', { name: 'Fermer le message' })[0]);
    expect(screen.queryByText('Appel publié')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Fermer le message' }));
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('le bandeau disparaît seul après huit secondes', () => {
    vi.useFakeTimers();
    render(<Annonces />);
    act(() => annoncer('Évaluation sauvegardée'));
    expect(screen.getByText('Évaluation sauvegardée')).toBeInTheDocument();
    act(() => { vi.advanceTimersByTime(8000); });
    expect(screen.queryByText('Évaluation sauvegardée')).toBeNull();
  });
});
