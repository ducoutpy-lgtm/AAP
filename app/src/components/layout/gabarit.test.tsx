// Écran d'erreur passager (corrections-relecture 2.2, 2026-11-20) : après une erreur d'affichage, un clic dans le menu
// doit afficher la page demandée ; l'écran « Cette page a rencontré une erreur » restait sinon sur toutes les pages
// jusqu'au lien « Retour à l'accueil ».
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({ currentUser: null, userProfile: null, logout: vi.fn() }),
}));

import Gabarit from './Gabarit';

function PageCassee(): JSX.Element {
  throw new Error('panne de test');
}

describe('gabarit après une erreur d’affichage', () => {
  afterEach(cleanup);

  it('un lien du menu affiche la page demandée', () => {
    const silence = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <MemoryRouter initialEntries={['/casse']}>
        <Routes>
          <Route element={<Gabarit />}>
            <Route path="/casse" element={<PageCassee />} />
            <Route path="/faq" element={<p>Page des questions</p>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByText('Cette page a rencontré une erreur')).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole('link', { name: 'FAQ' })[0]);
    expect(screen.getByText('Page des questions')).toBeInTheDocument();
    expect(screen.queryByText('Cette page a rencontré une erreur')).toBeNull();
    silence.mockRestore();
  });
});
