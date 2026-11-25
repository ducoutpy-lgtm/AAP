// Menu sur téléphone (plan niveau A, lot 3.2, 2026-11-25) : la barre latérale de l'espace connecté restait affichée sur
// un écran de 375 px (256 px pour elle, environ 119 pour la page), sans bouton de menu. Sous 768 px elle est masquée ; le
// bouton « Ouvrir le menu » de la barre haute l'affiche par-dessus la page, et le choix d'une entrée la referme.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

const compte = vi.hoisted(() => ({
  currentUser: { uid: 'p1' },
  userProfile: { userType: 'porteur', profileComplete: true, email: 'c@test.local', subscriptionStatus: 'active' },
  logout: vi.fn(),
}));
vi.mock('../../contexts/AuthContext', () => ({ useAuth: () => compte }));

import Gabarit from './Gabarit';

const masque = (el: HTMLElement) => /(^|\s)hidden(\s|$)/.test(el.className);

describe('menu de l’espace connecté sur téléphone', () => {
  afterEach(cleanup);

  it('bouton « Ouvrir le menu », menu affiché puis refermé au choix d’une entrée ou par Échap', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard/porteur']}>
        <Routes>
          <Route element={<Gabarit />}>
            <Route path="*" element={<p>Contenu de la page</p>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );
    const bouton = screen.getByRole('button', { name: 'Ouvrir le menu' });
    const menu = screen.getByRole('complementary');
    expect(bouton).toHaveAttribute('aria-expanded', 'false');
    expect(masque(menu)).toBe(true);

    fireEvent.click(bouton);
    expect(bouton).toHaveAttribute('aria-expanded', 'true');
    expect(masque(menu)).toBe(false);
    fireEvent.click(within(menu).getByRole('link', { name: 'FAQ' }));
    expect(bouton).toHaveAttribute('aria-expanded', 'false');
    expect(masque(menu)).toBe(true);

    fireEvent.click(bouton);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(bouton).toHaveAttribute('aria-expanded', 'false');
  });
});
