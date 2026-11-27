// Suppression du compte (changement suppression-compte, question 25, 2026-11-19). Tout se fait dans le navigateur avec
// les droits du compte : les fonctions serveur ne sont pas déployées. Le compte de connexion est effacé en dernier.
import { deleteUser, type User } from 'firebase/auth';
import { collection, collectionGroup, deleteDoc, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { UserType } from '../types';
import { ANONYME, planDeSuppression } from '../utils/suppressionCompte';

async function supprimerLesSiens(chemin: string, uid: string) {
  const snap = await getDocs(query(collection(db, chemin), where('userId', '==', uid)));
  await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
}

export async function supprimerMonCompte(utilisateur: User, role: UserType): Promise<void> {
  const uid = utilisateur.uid;
  const candidatures = await getDocs(query(collection(db, 'applications'), where('porteurId', '==', uid)));
  const plan = planDeSuppression(
    candidatures.docs.map((d) => ({
      id: d.id,
      financeurId: String(d.data().financeurId ?? ''),
      status: String(d.data().status ?? ''),
    })),
  );
  await Promise.all([
    ...plan.supprimer.map((id) => deleteDoc(doc(db, 'applications', id))),
    ...plan.anonymiser.map((id) => updateDoc(doc(db, 'applications', id), { porteurId: ANONYME })),
    supprimerLesSiens('savedSearches', uid),
    supprimerLesSiens('favoriteAap', uid),
    supprimerLesSiens('notifications', uid),
  ]);
  if (role !== 'admin') await deleteDoc(doc(db, role === 'porteur' ? 'porteurProfiles' : 'financeurProfiles', uid));
  await deleteDoc(doc(db, 'users', uid));
  // Marques de vue (aap/{id}/vues/{uid}) : effacées avec le compte (décision « Effacer avec le compte » du
  // 2026-11-27, RGPD) ; les règles ne le permettent qu'une fois le document users effacé
  const marques = await getDocs(query(collectionGroup(db, 'vues'), where('uid', '==', uid)));
  await Promise.all(marques.docs.map((d) => deleteDoc(d.ref)));
  await deleteUser(utilisateur);
}
