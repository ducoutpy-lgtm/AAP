// Tests du vrai AuthProvider (relecture, constat 44) : auth.test.tsx remplace useAuth par une doublure, donc le choix de
// persistance de « Se souvenir de moi » (décision 36, lot 6.2) et le chargement tenu jusqu'à la lecture du profil
// (lot 3.5) n'étaient couverts par aucun test. Ici seuls firebase/auth, firebase/firestore, la configuration Firebase et
// le journal sont simulés : aucun appel à Firebase.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, render } from '@testing-library/react';

const simu = vi.hoisted(() => ({
  auth: { nom: 'auth-simule' },
  db: { nom: 'db-simule' },
  locale: { type: 'LOCAL' },
  session: { type: 'SESSION' },
  // rappel passé à onAuthStateChanged par le contexte, appelé par le test comme Firebase le ferait
  rappel: null as null | ((user: { uid: string } | null) => Promise<void>),
}));

vi.mock('../config/firebase', () => ({ auth: simu.auth, db: simu.db }));
vi.mock('firebase/auth', () => ({
  browserLocalPersistence: simu.locale,
  browserSessionPersistence: simu.session,
  setPersistence: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  onAuthStateChanged: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signInWithPopup: vi.fn(),
  GoogleAuthProvider: vi.fn(),
  signOut: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
  sendEmailVerification: vi.fn(),
}));
vi.mock('firebase/firestore', () => ({
  doc: vi.fn((_db: unknown, collection: string, id: string) => `${collection}/${id}`),
  getDoc: vi.fn(),
  setDoc: vi.fn(),
  Timestamp: { now: vi.fn(), fromDate: vi.fn() },
}));
vi.mock('../services/journalService', () => ({ journaliser: vi.fn() }));

import { onAuthStateChanged, setPersistence, signInWithEmailAndPassword } from 'firebase/auth';
import { getDoc } from 'firebase/firestore';
import { AuthProvider, useAuth } from './AuthContext';

type Contexte = ReturnType<typeof useAuth>;
type Etat = { uid: string | null; loading: boolean; role: string | null };

// Composant témoin : garde le contexte courant et note l'état vu à chaque rendu
let contexte: Contexte;
let etats: Etat[];
function Temoin() {
  contexte = useAuth();
  etats.push({
    uid: contexte.currentUser?.uid ?? null,
    loading: contexte.loading,
    role: (contexte.userProfile?.userType as string | undefined) ?? null,
  });
  return null;
}
const monter = () =>
  render(
    <AuthProvider>
      <Temoin />
    </AuthProvider>,
  );

beforeEach(() => {
  etats = [];
  simu.rappel = null;
  vi.mocked(onAuthStateChanged)
    .mockReset()
    .mockImplementation(((_auth: unknown, rappel: typeof simu.rappel) => {
      simu.rappel = rappel;
      return () => {};
    }) as never);
  vi.mocked(setPersistence).mockReset().mockResolvedValue(undefined);
  vi.mocked(signInWithEmailAndPassword)
    .mockReset()
    .mockResolvedValue({ user: { uid: 'u1' } } as never);
  // compte sans document users : la connexion n'écrit pas de ligne de journal
  vi.mocked(getDoc)
    .mockReset()
    .mockResolvedValue({ exists: () => false } as never);
});
afterEach(cleanup);

describe('connexion et « Se souvenir de moi » (décision 36)', () => {
  it('case décochée : session fermée avec le navigateur, réglée avant la connexion', async () => {
    monter();
    await act(() => contexte.login('a@test.local', 'secret12', false));
    expect(setPersistence).toHaveBeenCalledWith(simu.auth, simu.session);
    expect(signInWithEmailAndPassword).toHaveBeenCalledWith(simu.auth, 'a@test.local', 'secret12');
    expect(vi.mocked(setPersistence).mock.invocationCallOrder[0]).toBeLessThan(
      vi.mocked(signInWithEmailAndPassword).mock.invocationCallOrder[0],
    );
  });

  it('case cochée ou non précisée : session gardée', async () => {
    monter();
    await act(() => contexte.login('a@test.local', 'secret12', true));
    expect(setPersistence).toHaveBeenLastCalledWith(simu.auth, simu.locale);
    await act(() => contexte.login('a@test.local', 'secret12'));
    expect(setPersistence).toHaveBeenLastCalledWith(simu.auth, simu.locale);
    expect(setPersistence).not.toHaveBeenCalledWith(simu.auth, simu.session);
  });
});

describe('chargement tenu jusqu’à la lecture du profil (lot 3.5)', () => {
  it('après une page vue déconnectée, la connexion garde loading vrai tant que le profil n’est pas lu', async () => {
    monter();
    // Firebase répond d'abord « aucun compte » : la page de connexion s'affiche
    await act(() => simu.rappel!(null));
    expect(etats[etats.length - 1]).toEqual({ uid: null, loading: false, role: null });

    // puis le compte arrive ; la lecture de son document users reste en attente
    let lireProfil!: (snap: unknown) => void;
    vi.mocked(getDoc).mockReturnValueOnce(new Promise((resoudre) => (lireProfil = resoudre)) as never);
    let arrivee!: Promise<void>;
    act(() => {
      arrivee = simu.rappel!({ uid: 'u1' });
    });
    expect(etats[etats.length - 1]).toEqual({ uid: 'u1', loading: true, role: null });

    await act(async () => {
      lireProfil({ exists: () => true, data: () => ({ userType: 'porteur' }) });
      await arrivee;
    });
    expect(etats[etats.length - 1]).toEqual({ uid: 'u1', loading: false, role: 'porteur' });
    // aucun rendu n'a montré le compte connecté, sans profil, comme chargé
    expect(etats.filter((e) => e.uid && !e.loading && !e.role)).toEqual([]);
  });
});

// Lecture de profil devenue périmée (relecture, défaut signalé par le groupe « tests-fuseau ») : une déconnexion ou un
// changement de compte survient pendant la lecture du document users ; sa réponse tardive ne doit plus rien écrire
describe('lecture du profil devenue périmée', () => {
  // getDoc reste en attente ; le test répond quand il veut
  const lectureEnAttente = () => {
    let repondre!: (role: string) => void;
    vi.mocked(getDoc).mockReturnValueOnce(
      new Promise((resoudre) => {
        repondre = (role) => resoudre({ exists: () => true, data: () => ({ userType: role }) });
      }) as never,
    );
    return (role: string) => repondre(role);
  };

  it('déconnexion pendant la lecture : aucun profil sans compte connecté', async () => {
    monter();
    const repondreU1 = lectureEnAttente();
    let arriveeU1!: Promise<void>;
    act(() => {
      arriveeU1 = simu.rappel!({ uid: 'u1' });
    });
    await act(() => simu.rappel!(null));

    await act(async () => {
      repondreU1('porteur');
      await arriveeU1;
    });
    expect(etats[etats.length - 1]).toEqual({ uid: null, loading: false, role: null });
  });

  it('changement de compte u1 puis u2, la lecture de u1 finit après celle de u2 : u2 garde son propre rôle', async () => {
    monter();
    const repondreU1 = lectureEnAttente();
    const repondreU2 = lectureEnAttente();
    let arriveeU1!: Promise<void>;
    let arriveeU2!: Promise<void>;
    act(() => {
      arriveeU1 = simu.rappel!({ uid: 'u1' });
    });
    act(() => {
      arriveeU2 = simu.rappel!({ uid: 'u2' });
    });

    await act(async () => {
      repondreU2('financeur');
      await arriveeU2;
    });
    expect(etats[etats.length - 1]).toEqual({ uid: 'u2', loading: false, role: 'financeur' });

    await act(async () => {
      repondreU1('porteur');
      await arriveeU1;
    });
    expect(etats[etats.length - 1]).toEqual({ uid: 'u2', loading: false, role: 'financeur' });
    expect(etats.filter((e) => e.uid === 'u2' && e.role === 'porteur')).toEqual([]);
  });
});
