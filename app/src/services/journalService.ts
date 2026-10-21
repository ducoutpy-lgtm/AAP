// Écriture du journal des actions (jour 4 du plan MVP, changement suivi-testeurs, 2026-10-21). Une ligne par action
// qui compte ; un échec n'est jamais montré à l'utilisateur (le suivi ne doit pas gêner l'usage).
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { UserType } from '../types';
import type { ActionJournal } from '../utils/journal';

export async function journaliser(userId: string, role: UserType, action: ActionJournal, cible = '', libelle = ''): Promise<void> {
  try {
    await addDoc(collection(db, 'journal'), { userId, role, action, cible, libelle, le: Timestamp.now() });
  } catch (err) {
    console.error('Journal non écrit :', action, err);
  }
}
