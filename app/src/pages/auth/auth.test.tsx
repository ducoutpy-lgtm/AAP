// Tests de l'inscription (2026-11-20) : le rôle choisi par le lien de l'accueil (« /signup?type=financeur ») est celui
// du compte créé, et deux mots de passe différents ou trop courts bloquent l'envoi. Le compte (AuthContext) est remplacé
// par une doublure : aucun appel à Firebase.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

const compte = vi.hoisted(() => ({ signup: vi.fn(), loginWithGoogle: vi.fn() }));
vi.mock('../../contexts/AuthContext', () => ({ useAuth: () => compte }));

import SignupPage from './SignupPage';

const ouvrir = (adresse: string) => render(
  <MemoryRouter initialEntries={[adresse]}>
    <Routes>
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/complete-profile" element={<p>Profil à compléter</p>} />
    </Routes>
  </MemoryRouter>,
);

const remplir = (email: string, mdp: string, confirmation: string) => {
  fireEvent.change(screen.getByLabelText(/Email/), { target: { value: email } });
  fireEvent.change(screen.getByLabelText(/^Mot de passe/), { target: { value: mdp } });
  fireEvent.change(screen.getByLabelText(/Confirmer le mot de passe/), { target: { value: confirmation } });
  fireEvent.click(screen.getByRole('button', { name: 'Créer mon compte' }));
};

describe('inscription', () => {
  beforeEach(() => {
    compte.signup.mockReset().mockResolvedValue(undefined);
  });
  afterEach(cleanup);

  it('le lien « financeur » de l’accueil crée un compte financeur, puis mène au profil à compléter', async () => {
    ouvrir('/signup?type=financeur');
    remplir('f@test.local', 'secret12', 'secret12');
    await waitFor(() => expect(compte.signup).toHaveBeenCalledWith('f@test.local', 'secret12', 'financeur'));
    expect(await screen.findByText('Profil à compléter')).toBeInTheDocument();
  });

  it('sans paramètre, le compte est un compte candidat', async () => {
    ouvrir('/signup');
    remplir('c@test.local', 'secret12', 'secret12');
    await waitFor(() => expect(compte.signup).toHaveBeenCalledWith('c@test.local', 'secret12', 'porteur'));
  });

  it('deux mots de passe différents : message, aucun compte créé', () => {
    ouvrir('/signup');
    remplir('c@test.local', 'secret12', 'secret13');
    expect(screen.getByText('Les mots de passe ne correspondent pas')).toBeInTheDocument();
    expect(compte.signup).not.toHaveBeenCalled();
  });

  it('mot de passe de moins de 6 caractères : message, aucun compte créé', () => {
    ouvrir('/signup');
    remplir('c@test.local', 'abc', 'abc');
    expect(screen.getByText(/au moins 6 caractères/)).toBeInTheDocument();
    expect(compte.signup).not.toHaveBeenCalled();
  });
});
