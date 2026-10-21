// Écriture du journal des actions (jour 4 du plan MVP, changement suivi-testeurs, 2026-10-21). Une ligne par action
// qui compte ; un échec n'est jamais montré à l'utilisateur (le suivi ne doit pas gêner l'usage).
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { UserType } from '../types';
import type { ActionJournal } from '../utils/journal';

// En développement, React monte deux fois chaque page (mode strict) : la même action dans les cinq secondes n'est
// écrite qu'une fois
const dernieres = new Map<string, number>();
const DELAI_DOUBLON_MS = 5000;

export function estUnDoublon(cle: string, maintenant: number, memoire: Map<string, number> = dernieres): boolean {
  const precedent = memoire.get(cle);
  memoire.set(cle, maintenant);
  return precedent !== undefined && maintenant - precedent < DELAI_DOUBLON_MS;
}

export async function journaliser(userId: string, role: UserType, action: ActionJournal, cible = '', libelle = ''): Promise<void> {
  if (role === 'admin') return; // l'administrateur n'est pas un testeur
  if (estUnDoublon(`${userId}|${action}|${cible}|${libelle}`, Date.now())) return;
  try {
    await addDoc(collection(db, 'journal'), { userId, role, action, cible, libelle, le: Timestamp.now() });
  } catch (err) {
    console.error('Journal non écrit :', action, err);
  }
}
