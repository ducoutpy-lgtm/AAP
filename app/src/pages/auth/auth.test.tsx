// Tests de l'inscription et de la connexion (2026-11-20) : le rôle choisi par le lien de l'accueil
// (« /signup?type=financeur ») est celui du compte créé, deux mots de passe différents ou trop courts bloquent l'envoi, et
// la connexion ramène sur la page demandée avec ses filtres. Le compte (AuthContext) et Firestore sont remplacés par des
// doublures : aucun appel à Firebase.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';

const compte = vi.hoisted(() => ({ signup: vi.fn(), login: vi.fn(), loginWithGoogle: vi.fn(), currentUser: null }));
vi.mock('../../contexts/AuthContext', () => ({ useAuth: () => compte }));
vi.mock('../../config/firebase', () => ({ db: {} }));
vi.mock('firebase/firestore', () => ({ doc: vi.fn(), getDoc: vi.fn() }));

import SignupPage from './SignupPage';
import LoginPage from './LoginPage';

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

describe('connexion', () => {
  afterEach(cleanup);

  // Depuis le 2026-10-20 la recherche demande un compte : un lien de recherche partagé passe par la connexion
  it('un lien de recherche avec filtres, ouvert sans compte, revient sur la recherche avec ses filtres', async () => {
    compte.login.mockReset().mockResolvedValue(undefined);
    const Arrivee = () => <p>arrivée {useLocation().pathname}{useLocation().search}</p>;
    render(
      <MemoryRouter initialEntries={[{ pathname: '/login', state: { from: { pathname: '/aap/search', search: '?territory=normandie&q=chutes', hash: '' } } }]}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/aap/search" element={<Arrivee />} />
          <Route path="/complete-profile" element={<p>arrivée /complete-profile</p>} />
        </Routes>
      </MemoryRouter>,
    );
    fireEvent.change(screen.getByLabelText(/Email/), { target: { value: 'c@test.local' } });
    fireEvent.change(screen.getByLabelText(/^Mot de passe/), { target: { value: 'secret12' } });
    fireEvent.click(screen.getByRole('button', { name: 'Se connecter' }));
    expect(await screen.findByText(/^arrivée/, {}, { timeout: 3000 })).toHaveTextContent('arrivée /aap/search?territory=normandie&q=chutes');
  });
});
