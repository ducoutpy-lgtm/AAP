// Tests de l'inscription et de la connexion (2026-11-20) : le rôle choisi par le lien de l'accueil
// (« /signup?type=financeur ») est celui du compte créé, deux mots de passe différents ou trop courts bloquent l'envoi, et
// la connexion ramène sur la page demandée avec ses filtres. Le compte (AuthContext) et Firestore sont remplacés par des
// doublures : aucun appel à Firebase.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';

// Compte simulé : changerCompte() modifie l'état et redessine la page, comme le ferait AuthContext quand Firebase répond
const compte = vi.hoisted(() => ({
  signup: vi.fn(), login: vi.fn(), loginWithGoogle: vi.fn(),
  currentUser: null as { uid: string } | null, userProfile: null as { userType: string } | null, loading: false,
  version: 0, ecouteurs: new Set<() => void>(),
}));
const changerCompte = (etat: Partial<Pick<typeof compte, 'currentUser' | 'userProfile' | 'loading'>>) => {
  Object.assign(compte, etat);
  compte.version += 1;
  compte.ecouteurs.forEach(f => f());
};
vi.mock('../../contexts/AuthContext', async () => {
  const { useSyncExternalStore } = await import('react');
  const abonner = (f: () => void) => { compte.ecouteurs.add(f); return () => { compte.ecouteurs.delete(f); }; };
  return { useAuth: () => { useSyncExternalStore(abonner, () => compte.version); return compte; } };
});
vi.mock('../../config/firebase', () => ({ db: {} }));
vi.mock('firebase/firestore', () => ({ doc: vi.fn(), getDoc: vi.fn() }));

import SignupPage from './SignupPage';
import LoginPage from './LoginPage';
import { destinationApresConnexion } from '../../utils/connexion';

beforeEach(() => changerCompte({ currentUser: null, userProfile: null, loading: false }));

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
    compte.login.mockReset().mockImplementation(async () => changerCompte({ currentUser: { uid: 'c1' }, userProfile: { userType: 'porteur' } }));
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

describe('connexion refusée', () => {
  afterEach(cleanup);

  it('un mauvais mot de passe affiche un message en français, pas le texte technique de Firebase', async () => {
    compte.login.mockReset().mockRejectedValue(Object.assign(new Error('Firebase: Error (auth/invalid-credential).'),
      { code: 'auth/invalid-credential' }));
    render(<MemoryRouter initialEntries={['/login']}><Routes><Route path="/login" element={<LoginPage />} /></Routes></MemoryRouter>);
    fireEvent.change(screen.getByLabelText(/Email/), { target: { value: 'c@test.local' } });
    fireEvent.change(screen.getByLabelText(/^Mot de passe/), { target: { value: 'mauvais' } });
    fireEvent.click(screen.getByRole('button', { name: 'Se connecter' }));
    expect(await screen.findByText('Adresse ou mot de passe incorrect.')).toBeInTheDocument();
    expect(screen.queryByText(/Firebase/)).toBeNull();
  });
});

describe('Se souvenir de moi (décision 36 du 2026-11-24)', () => {
  afterEach(cleanup);

  it('case décochée : session fermée à la fermeture du navigateur ; cochée : session gardée', async () => {
    compte.login.mockReset().mockResolvedValue(undefined);
    render(<MemoryRouter initialEntries={['/login']}><Routes><Route path="/login" element={<LoginPage />} /></Routes></MemoryRouter>);
    fireEvent.change(screen.getByLabelText(/Email/), { target: { value: 'c@test.local' } });
    fireEvent.change(screen.getByLabelText(/^Mot de passe/), { target: { value: 'secret12' } });
    fireEvent.click(screen.getByRole('button', { name: 'Se connecter' }));
    await waitFor(() => expect(compte.login).toHaveBeenCalledWith('c@test.local', 'secret12', false));
    cleanup();
    render(<MemoryRouter initialEntries={['/login']}><Routes><Route path="/login" element={<LoginPage />} /></Routes></MemoryRouter>);
    fireEvent.change(screen.getByLabelText(/Email/), { target: { value: 'c@test.local' } });
    fireEvent.change(screen.getByLabelText(/^Mot de passe/), { target: { value: 'secret12' } });
    fireEvent.click(screen.getByLabelText(/Se souvenir de moi/));
    fireEvent.click(screen.getByRole('button', { name: 'Se connecter' }));
    await waitFor(() => expect(compte.login).toHaveBeenLastCalledWith('c@test.local', 'secret12', true));
  });
});

// Plan niveau A, lot 3.5 (2026-11-25) : la page attendait une seconde fixe, puis lisait le compte d'avant la connexion
// (aucun) : toute connexion sans page d'origine menait à « compléter le profil », jamais au tableau de bord du rôle.
describe('connexion : le profil est attendu, puis le tableau de bord du rôle', () => {
  afterEach(cleanup);

  it('profil lu 1,5 s après la connexion : arrivée sur le tableau de bord du financeur', async () => {
    compte.login.mockReset().mockImplementation(async () => {
      changerCompte({ currentUser: { uid: 'f1' }, loading: true, userProfile: null });
      setTimeout(() => changerCompte({ loading: false, userProfile: { userType: 'financeur' } }), 1500);
    });
    const Arrivee = () => <p>arrivée {useLocation().pathname}</p>;
    render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard/financeur" element={<Arrivee />} />
          <Route path="/complete-profile" element={<Arrivee />} />
        </Routes>
      </MemoryRouter>,
    );
    fireEvent.change(screen.getByLabelText(/Email/), { target: { value: 'f@test.local' } });
    fireEvent.change(screen.getByLabelText(/^Mot de passe/), { target: { value: 'secret12' } });
    fireEvent.click(screen.getByRole('button', { name: 'Se connecter' }));
    expect(await screen.findByText(/^arrivée/, {}, { timeout: 4000 })).toHaveTextContent('arrivée /dashboard/financeur');
  }, 8000);

  it('destination : la page demandée d’abord, sinon le tableau de bord du rôle, sinon le profil à compléter', () => {
    expect(destinationApresConnexion('/aap/search?q=ehpad', { userType: 'porteur' })).toBe('/aap/search?q=ehpad');
    expect(destinationApresConnexion('/', { userType: 'admin' })).toBe('/admin');
    expect(destinationApresConnexion(undefined, { userType: 'porteur' })).toBe('/dashboard/porteur');
    expect(destinationApresConnexion(undefined, { userType: 'financeur' })).toBe('/dashboard/financeur');
    expect(destinationApresConnexion(undefined, null)).toBe('/complete-profile');
  });
});
