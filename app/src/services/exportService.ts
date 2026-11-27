// Lecture des données d'un compte pour l'export RGPD (changement export-donnees-personnelles, 2026-11-16). Tout est lu
// dans le navigateur avec les droits du compte : les fonctions serveur ne sont pas déployées. Une partie illisible est
// notée « nonLue » avec son motif, sans arrêter l'export.
import type { User } from 'firebase/auth';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import { EDITEUR } from '../pages/legal/editeur';
import type { UserType } from '../types';
import { pourExport, SUR_DEMANDE_AU_DPO } from '../utils/exportDonnees';

async function lire<T>(lecture: () => Promise<T>): Promise<T | { nonLue: string }> {
  try {
    return await lecture();
  } catch (err) {
    return { nonLue: err instanceof Error ? err.message : String(err) };
  }
}

const documentDe = (chemin: string, id: string) =>
  lire(async () => {
    const snap = await getDoc(doc(db, chemin, id));
    return snap.exists() ? snap.data() : null;
  });

const listeDe = (chemin: string, champ: string, uid: string) =>
  lire(async () =>
    (await getDocs(query(collection(db, chemin), where(champ, '==', uid)))).docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })),
  );

// Conversations du compte (question 50 et relecture du 2026-11-27) : lues par participant, comme le permettent les règles
const conversationsDe = (uid: string) =>
  lire(async () =>
    (await getDocs(query(collection(db, 'conversations'), where('participants', 'array-contains', uid)))).docs.map(
      (d) => ({ id: d.id, ...d.data() }),
    ),
  );

export async function exporterMesDonnees(utilisateur: User, role: UserType) {
  const uid = utilisateur.uid;
  // Lectures indépendantes lancées ensemble ; chacune note son échec sans arrêter les autres (lire)
  const [
    utilisateurDoc,
    profilDeStructure,
    candidatures,
    recherchesSauvegardees,
    favoris,
    notifications,
    messagesEnvoyes,
    messagesRecus,
    conversations,
    paiements,
    appelsPublies,
  ] = await Promise.all([
    documentDe('users', uid),
    role === 'admin' ? null : documentDe(role === 'porteur' ? 'porteurProfiles' : 'financeurProfiles', uid),
    listeDe('applications', 'porteurId', uid),
    listeDe('savedSearches', 'userId', uid),
    listeDe('favoriteAap', 'userId', uid),
    listeDe('notifications', 'userId', uid),
    listeDe('messages', 'senderId', uid),
    listeDe('messages', 'receiverId', uid),
    conversationsDe(uid),
    listeDe('payments', 'userId', uid),
    role === 'financeur' ? listeDe('aap', 'financeurId', uid) : [],
  ]);
  const donnees = {
    exporteLe: new Date(),
    responsableDuTraitement: `${EDITEUR.raisonSociale}, contact du délégué à la protection des données : ${EDITEUR.contact}`,
    compteDeConnexion: {
      uid,
      email: utilisateur.email,
      emailVerifie: utilisateur.emailVerified,
      creeLe: utilisateur.metadata.creationTime ?? null,
      derniereConnexion: utilisateur.metadata.lastSignInTime ?? null,
      fournisseurs: utilisateur.providerData.map((p) => p.providerId),
    },
    utilisateur: utilisateurDoc,
    profilDeStructure,
    candidatures,
    recherchesSauvegardees,
    favoris,
    notifications,
    messagesEnvoyes,
    messagesRecus,
    conversations,
    paiements,
    appelsPublies,
    surDemandeAuDpo: SUR_DEMANDE_AU_DPO,
  };
  return pourExport(donnees);
}
