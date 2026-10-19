// Conversion d'une date Firestore (Timestamp) ou JavaScript en Date, ou null si absente. Ajouté le 2026-10-19
// (changement degel-application-complete) : les pages de statistiques lisaient createdAt.toDate() sans savoir si la
// valeur était un Timestamp ou une Date.
import { Timestamp } from 'firebase/firestore';

export function enDate(valeur: Timestamp | Date | null | undefined): Date | null {
  if (!valeur) return null;
  return valeur instanceof Date ? valeur : valeur.toDate();
}
