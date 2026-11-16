// Export des données personnelles d'un compte (changement export-donnees-personnelles, 2026-11-16 ; RGPD, droits
// d'accès et de portabilité, articles 15 et 20). Fonctions pures, testables sans Firebase.
import { Timestamp } from 'firebase/firestore';

// Collections que le compte ne lit pas lui-même (règles du chantier suivi-testeurs) : communiquées sur demande au DPO
export const SUR_DEMANDE_AU_DPO = ['journal des actions', 'retours de test', 'messages du formulaire de contact'];

// Valeur prête pour le fichier JSON : dates Firestore et JavaScript en ISO 8601, tableaux et objets parcourus
export function pourExport(valeur: unknown): unknown {
  if (valeur instanceof Timestamp) return valeur.toDate().toISOString();
  if (valeur instanceof Date) return valeur.toISOString();
  if (Array.isArray(valeur)) return valeur.map(pourExport);
  if (valeur !== null && typeof valeur === 'object') {
    return Object.fromEntries(Object.entries(valeur).map(([cle, v]) => [cle, pourExport(v)]));
  }
  return valeur;
}

// Nom du fichier : date locale du jour
export function nomFichierExport(maintenant: Date): string {
  const deux = (n: number) => String(n).padStart(2, '0');
  return `mes-donnees-aap-sante-${maintenant.getFullYear()}-${deux(maintenant.getMonth() + 1)}-${deux(maintenant.getDate())}.json`;
}
