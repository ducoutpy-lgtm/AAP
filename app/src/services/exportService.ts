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
  lire(async () => (await getDocs(query(collection(db, chemin), where(champ, '==', uid)))).docs.map(d => ({ id: d.id, ...d.data() })));

export async function exporterMesDonnees(utilisateur: User, role: UserType) {
  const uid = utilisateur.uid;
  const donnees = {
    exporteLe: new Date(),
    responsableDuTraitement: `${EDITEUR.raisonSociale}, contact du délégué à la protection des données : ${EDITEUR.contact}`,
    compteDeConnexion: {
      uid, email: utilisateur.email, emailVerifie: utilisateur.emailVerified,
      creeLe: utilisateur.metadata.creationTime ?? null, derniereConnexion: utilisateur.metadata.lastSignInTime ?? null,
      fournisseurs: utilisateur.providerData.map(p => p.providerId),
    },
    utilisateur: await documentDe('users', uid),
    profilDeStructure: role === 'admin' ? null : await documentDe(role === 'porteur' ? 'porteurProfiles' : 'financeurProfiles', uid),
    candidatures: await listeDe('applications', 'porteurId', uid),
    recherchesSauvegardees: await listeDe('savedSearches', 'userId', uid),
    favoris: await listeDe('favoriteAap', 'userId', uid),
    notifications: await listeDe('notifications', 'userId', uid),
    messagesEnvoyes: await listeDe('messages', 'senderId', uid),
    messagesRecus: await listeDe('messages', 'receiverId', uid),
    paiements: await listeDe('payments', 'userId', uid),
    appelsPublies: role === 'financeur' ? await listeDe('aap', 'financeurId', uid) : [],
    surDemandeAuDpo: SUR_DEMANDE_AU_DPO,
  };
  return pourExport(donnees);
}
