// Aides d'écriture Firestore (changement publication-appel-financeur, 2026-11-16) : Firestore refuse une valeur
// undefined, et un formulaire laisse ses champs facultatifs vides à undefined.
import { deleteField, type FieldValue } from 'firebase/firestore';

// Création : les champs vides sont omis
export function sansIndefinis<T extends Record<string, unknown>>(objet: T): Partial<T> {
  return Object.fromEntries(Object.entries(objet).filter(([, v]) => v !== undefined)) as Partial<T>;
}

// Mise à jour : un champ vidé est supprimé du document (sinon l'ancienne valeur resterait)
export function pourMiseAJour(objet: Record<string, unknown>): Record<string, unknown | FieldValue> {
  return Object.fromEntries(Object.entries(objet).map(([cle, v]) => [cle, v === undefined ? deleteField() : v]));
}
