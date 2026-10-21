// Retours des testeurs (jour 7 du plan MVP, changement mise-en-ligne-testeurs, 2026-10-21). Fonctions pures testées
// par Vitest ; la page et l'administration s'appuient dessus.
import type { Timestamp } from 'firebase/firestore';
import type { UserType } from '../types';

export type TypeRetour = 'anomalie' | 'idee' | 'incomprehension' | 'autre';

export const TYPES_RETOUR: { cle: TypeRetour; libelle: string; aide: string }[] = [
  { cle: 'anomalie', libelle: 'Anomalie', aide: "Quelque chose ne marche pas ou s'affiche mal" },
  { cle: 'idee', libelle: 'Idée', aide: 'Ce qui manque ou ce qui rendrait service' },
  { cle: 'incomprehension', libelle: 'Incompréhension', aide: "Un écran ou un mot que vous n'avez pas compris" },
  { cle: 'autre', libelle: 'Autre', aide: 'Tout le reste' },
];

export const LIBELLES_TYPES_RETOUR: Record<TypeRetour, string> = Object.fromEntries(TYPES_RETOUR.map(t => [t.cle, t.libelle])) as Record<TypeRetour, string>;

export const LONGUEUR_MINIMALE = 10;

export interface Retour {
  id?: string;
  userId: string;
  role: UserType;
  email: string;
  type: TypeRetour;
  page: string;
  message: string;
  le: Timestamp | Date;
}

// Message accepté : au moins dix caractères une fois les espaces superflus retirés ; renvoie le motif du refus sinon
export function controlerMessage(message: string): string | null {
  const propre = message.replace(/\s+/g, ' ').trim();
  if (propre.length < LONGUEUR_MINIMALE) return `Décrivez un peu plus : au moins ${LONGUEUR_MINIMALE} caractères (${propre.length} pour l'instant).`;
  if (propre.length > 4000) return 'Message trop long : 4 000 caractères au plus.';
  return null;
}

// Page concernée : le chemin de l'application d'où l'on vient, sans le domaine ; vide si inconnu ou si c'est le
// formulaire lui-même
export function pageDepuis(referent: string | undefined, origine: string): string {
  if (!referent || !referent.startsWith(origine)) return '';
  const chemin = referent.slice(origine.length) || '/';
  return chemin.startsWith('/retour') ? '' : chemin;
}

export const dateRetour = (r: Retour): Date => (r.le instanceof Date ? r.le : r.le.toDate());

export function lesPlusRecents(retours: Retour[], n = 50): Retour[] {
  return [...retours].sort((a, b) => dateRetour(b).getTime() - dateRetour(a).getTime()).slice(0, n);
}
