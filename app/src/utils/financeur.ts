// Espace financeur (changement financeur-vendable, jour 6 du plan MVP, 2026-10-21) : agrégats du tableau de bord et
// colonnes des candidatures reçues. Pourquoi un fichier à part : testable par Vitest sans React ni Firebase.
import type { Timestamp } from 'firebase/firestore';
import type { AAP, Application, ApplicationStatus } from '../types';

export const LIBELLES_STATUTS_CANDIDATURE: Record<ApplicationStatus, string> = {
  draft: 'Brouillon',
  submitted: 'Reçue',
  under_review: 'En examen',
  pending_info: 'Complément demandé',
  shortlisted: 'Présélectionnée',
  accepted: 'Acceptée',
  rejected: 'Refusée',
};

// Colonnes de la page « Candidatures reçues », dans l'ordre du parcours ; « complément demandé » rejoint « en examen »
export const COLONNES: ApplicationStatus[] = ['submitted', 'under_review', 'shortlisted', 'accepted', 'rejected'];

export const dateDe = (d: Timestamp | Date | undefined | null): Date | null =>
  d ? (d instanceof Date ? d : d.toDate()) : null;

export function colonneDe(statut: ApplicationStatus): ApplicationStatus | null {
  if (statut === 'draft') return null;
  return statut === 'pending_info' ? 'under_review' : statut;
}

export function parColonne(candidatures: Application[]): Record<ApplicationStatus, Application[]> {
  const colonnes = Object.fromEntries(COLONNES.map(c => [c, [] as Application[]])) as Record<ApplicationStatus, Application[]>;
  for (const c of candidatures) {
    const col = colonneDe(c.status);
    if (col) colonnes[col].push(c);
  }
  return colonnes;
}

export interface ResumeFinanceur {
  publies: number;
  brouillons: number;
  clos: number;
  candidatures: number;
  parStatut: Record<ApplicationStatus, number>;
  vues: number;
  dernieres: Application[];
  prochaineEcheance: AAP | null;
}

export function resumeFinanceur(aaps: AAP[], candidatures: Application[], maintenant = new Date()): ResumeFinanceur {
  const parStatut = Object.fromEntries(COLONNES.map(c => [c, 0])) as Record<ApplicationStatus, number>;
  const recues = candidatures.filter(c => c.status !== 'draft');
  for (const c of recues) {
    const col = colonneDe(c.status);
    if (col) parStatut[col] += 1;
  }
  const dernieres = [...recues]
    .sort((a, b) => (dateDe(b.submittedAt ?? b.createdAt)?.getTime() ?? 0) - (dateDe(a.submittedAt ?? a.createdAt)?.getTime() ?? 0))
    .slice(0, 5);
  const aVenir = aaps
    .filter(a => a.status === 'published' && dateDe(a.deadline) && (dateDe(a.deadline) as Date) >= maintenant)
    .sort((a, b) => (dateDe(a.deadline) as Date).getTime() - (dateDe(b.deadline) as Date).getTime());
  return {
    publies: aaps.filter(a => a.status === 'published').length,
    brouillons: aaps.filter(a => a.status === 'draft').length,
    clos: aaps.filter(a => a.status === 'closed' || a.status === 'archived').length,
    candidatures: recues.length,
    parStatut,
    vues: aaps.reduce((t, a) => t + (a.views || 0), 0),
    dernieres,
    prochaineEcheance: aVenir[0] ?? null,
  };
}

// Nombre de candidatures reçues par appel, calculé depuis les candidatures (le compteur du document peut être en retard)
export function candidaturesParAppel(candidatures: Application[]): Record<string, number> {
  const n: Record<string, number> = {};
  for (const c of candidatures) if (c.status !== 'draft') n[c.aapId] = (n[c.aapId] || 0) + 1;
  return n;
}
