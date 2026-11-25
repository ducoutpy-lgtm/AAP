// Favoris d'un compte (décision du 2026-11-24 « Le brancher », plan niveau A, lot 3.7) : un document par compte et par
// appel dans favoriteAap, d'identifiant « uid_aapId », pour ajouter ou retirer sans recherche préalable. La règle
// Firestore n'accepte que les documents du compte ; l'export RGPD et la suppression du compte les lisent déjà.
import { collection, deleteDoc, doc, getDocs, query, setDoc, Timestamp, where } from 'firebase/firestore';
import { db } from '../config/firebase';

export async function lireFavoris(uid: string): Promise<Set<string>> {
  const snap = await getDocs(query(collection(db, 'favoriteAap'), where('userId', '==', uid)));
  return new Set(snap.docs.map(d => String(d.data().aapId)));
}

export async function basculerFavori(uid: string, aapId: string, dejaFavori: boolean): Promise<void> {
  const ref = doc(db, 'favoriteAap', `${uid}_${aapId}`);
  if (dejaFavori) await deleteDoc(ref);
  else await setDoc(ref, { userId: uid, aapId, savedAt: Timestamp.now() });
}
