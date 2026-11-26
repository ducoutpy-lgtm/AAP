import { fusionnerProfil } from './profil';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  sendEmailVerification,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from 'firebase/auth';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { User, UserType } from '../types';
import { journaliser } from '../services/journalService';

// Journal des actions (suivi-testeurs, 2026-10-21) : une ligne « connexion » après une connexion réussie, avec le rôle
// lu dans users ; un compte sans document (première connexion Google) n'est pas journalisé ici
async function journaliserConnexion(user: FirebaseUser) {
  const snap = await getDoc(doc(db, 'users', user.uid));
  const role = snap.exists() ? (snap.data().userType as UserType | undefined) : undefined;
  if (role) await journaliser(user.uid, role, 'connexion');
}

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: User | null;
  loading: boolean;
  signup: (email: string, password: string, userType: UserType) => Promise<void>;
  login: (email: string, password: string, seSouvenir?: boolean) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshUserProfile: () => Promise<void>;
  // Crée le document users et le profil vide d'un compte déjà connecté (compte Google sans document, changement
  // parcours-integration, 2026-10-20) ; même contenu que l'inscription par e-mail
  creerDocumentUtilisateur: (userType: UserType) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Le contexte et son hook vivent dans le même fichier (patron courant) ; la règle du rechargement à chaud
// n'accepte que des composants, elle est désactivée pour cette seule ligne.
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Document users (essai de 14 jours) et profil vide, pour un compte Firebase donné
  const creerDocumentsDuCompte = async (user: FirebaseUser, userType: UserType) => {
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 14); // 14 jours de trial

    // Refus de la création : le document neuf est celui du compte, au rôle ouvert, en essai et à l'adresse de connexion
    // (user.email, la valeur que la règle compare) ; la règle ne le refuse alors qu'à un compte inscrit au registre des
    // suspensions (question 51, 2026-11-26). Le code « compte-suspendu » fait dire la suspension à l'écran
    // (utils/erreurs.ts) au lieu de « Action refusée ». Seulement si le document est absent : présent (profil illisible
    // au chargement, puis parcours d'intégration), l'écriture est une mise à jour et son refus garde le message générique
    await setDoc(doc(db, 'users', user.uid), {
      email: user.email,
      userType,
      createdAt: Timestamp.now(),
      subscriptionStatus: 'trial',
      subscriptionPlan: null,
      trialEndsAt: Timestamp.fromDate(trialEndsAt),
      profileComplete: false,
      notificationPreferences: {
        email: true,
        inApp: true,
        frequency: 'realtime',
      },
    }).catch(async (err: unknown) => {
      if ((err as { code?: unknown } | null)?.code !== 'permission-denied') throw err;
      // Relecture en échec (null) : on ne sait pas, message générique
      const existant = await getDoc(doc(db, 'users', user.uid)).catch(() => null);
      if (existant?.exists() !== false) throw err;
      throw Object.assign(new Error('Compte suspendu'), { code: 'compte-suspendu' });
    });

    // Création du document profil selon le type
    const profileCollection = userType === 'porteur' ? 'porteurProfiles' : 'financeurProfiles';
    await setDoc(doc(db, profileCollection, user.uid), {
      userId: user.uid,
      updatedAt: Timestamp.now(),
    });
  };

  const signup = async (email: string, password: string, userType: UserType) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Envoi email de vérification
    await sendEmailVerification(user);

    await creerDocumentsDuCompte(user, userType);
  };

  const creerDocumentUtilisateur = async (userType: UserType) => {
    if (!currentUser) throw new Error('Non authentifié');
    await creerDocumentsDuCompte(currentUser, userType);
  };

  // « Se souvenir de moi » (décision 36 du 2026-11-24) : case décochée, la session se ferme à la fermeture du navigateur
  // (poste partagé d'établissement) ; cochée, elle est gardée
  const login = async (email: string, password: string, seSouvenir = true) => {
    await setPersistence(auth, seSouvenir ? browserLocalPersistence : browserSessionPersistence);
    const credential = await signInWithEmailAndPassword(auth, email, password);
    await journaliserConnexion(credential.user);
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.addScope('profile');
    provider.addScope('email');
    // Toujours proposer le choix du compte Google (retour de Monsieur DUCOUT du 2026-10-20 : le navigateur reprenait
    // d'office le dernier compte utilisé, impossible de passer d'un compte de test à l'autre)
    provider.setCustomParameters({ prompt: 'select_account' });

    const credential = await signInWithPopup(auth, provider);
    await journaliserConnexion(credential.user);
    // La gestion du profil se fera dans le composant après la redirection
  };

  const logout = async () => {
    await signOut(auth);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const refreshUserProfile = async () => {
    if (currentUser) {
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (userDoc.exists()) {
        // Complète le profil connu au lieu de le remplacer (premier-clic-candidater, 2026-11-16)
        const relu = userDoc.data();
        setUserProfile((connu) => fusionnerProfil(connu, currentUser.uid, relu) as User);
      }
    }
  };

  useEffect(() => {
    // Numéro du dernier rappel reçu (relecture, lecture périmée) : une déconnexion ou un changement de compte pendant la
    // lecture du profil rend sa réponse périmée ; elle est ignorée, le rappel le plus récent fixe seul profil et chargement
    let dernierRappel = 0;
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      const rappel = ++dernierRappel;
      // Chargement remis à vrai jusqu'à la lecture du profil (plan niveau A, lot 3.5) : sinon une page voyait le compte
      // connecté sans son profil, et la connexion menait à « compléter le profil » au lieu du tableau de bord
      if (user) setLoading(true);
      setCurrentUser(user);

      if (user) {
        try {
          // Récupération du profil utilisateur
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (rappel !== dernierRappel) return;
          if (userDoc.exists()) {
            setUserProfile({
              uid: user.uid,
              ...userDoc.data(),
            } as User);
          } else {
            // Utilisateur Google sans profil complet
            setUserProfile(null);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          if (rappel !== dernierRappel) return;
          setUserProfile(null);
        }
      } else {
        setUserProfile(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    currentUser,
    userProfile,
    loading,
    signup,
    login,
    loginWithGoogle,
    logout,
    resetPassword,
    refreshUserProfile,
    creerDocumentUtilisateur,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
