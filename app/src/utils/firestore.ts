// Aide d'écriture Firestore (changement publication-appel-financeur, 2026-11-16). Les champs undefined sont omis par le
// réglage ignoreUndefinedProperties (config/firebase.ts) ; à la modification, un champ vidé doit au contraire être effacé.
import { deleteField, type FieldValue } from 'firebase/firestore';

// Mise à jour : un champ vidé est supprimé du document (sinon l'ancienne valeur resterait)
export function pourMiseAJour(objet: Record<string, unknown>): Record<string, unknown | FieldValue> {
  return Object.fromEntries(Object.entries(objet).map(([cle, v]) => [cle, v === undefined ? deleteField() : v]));
}
