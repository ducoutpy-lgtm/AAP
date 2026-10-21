// Suivi des appels aux services externes (changement suivi-couts-externes, 2026-10-21) : agrégations de la collection
// coutsIa. Pourquoi un fichier à part : testable par Vitest sans React ni Firebase.
import type { Timestamp } from 'firebase/firestore';

export interface LigneCout {
  id?: string;
  source: 'application' | 'collecte' | string;
  fournisseur?: string;
  etape: string;
  modele: string;
  origine?: string;
  cible?: string;
  tokensEntree?: number;
  tokensSortie?: number;
  tokensCacheLus?: number;
  coutEuros: number;
  le: Timestamp | Date;
}

export const PLAFOND_EUROS = 5;

export const LIBELLES_ETAPES: Record<string, string> = {
  extraction: 'Extraction des fiches',
  est_aap: 'Tri : page est-elle un appel',
  champ: 'Classement santé / médico-social',
  verification: 'Contrôle des fiches',
  qualification: 'Qualification (destinataires, type...)',
  preremplirCandidature: 'Lecture de dossier de candidature',
  inconnue: 'Autre',
};

export const libelleEtape = (e: string): string => LIBELLES_ETAPES[e] ?? e;

export const dateCout = (l: LigneCout): Date => (l.le instanceof Date ? l.le : l.le.toDate());

const somme = (lignes: LigneCout[]) => lignes.reduce((t, l) => t + (l.coutEuros || 0), 0);

export function cumuls(lignes: LigneCout[], maintenant = new Date()) {
  const debutMois = new Date(maintenant.getFullYear(), maintenant.getMonth(), 1);
  const duMois = lignes.filter(l => dateCout(l) >= debutMois);
  return { total: somme(lignes), appels: lignes.length, mois: somme(duMois), appelsMois: duMois.length };
}

export function parCle(lignes: LigneCout[], cle: (l: LigneCout) => string): { cle: string; cout: number; appels: number }[] {
  const m = new Map<string, { cout: number; appels: number }>();
  for (const l of lignes) {
    const k = cle(l) || '(vide)';
    const v = m.get(k) ?? { cout: 0, appels: 0 };
    v.cout += l.coutEuros || 0;
    v.appels += 1;
    m.set(k, v);
  }
  return Array.from(m.entries()).map(([k, v]) => ({ cle: k, ...v })).sort((a, b) => b.cout - a.cout);
}

// Lundi de la semaine d'une date (ISO), pour la courbe
export function lundiDe(d: Date): string {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const jour = (x.getDay() + 6) % 7;
  x.setDate(x.getDate() - jour);
  // Date locale écrite à la main : toISOString passerait en UTC et reculerait d'un jour en France
  const deux = (n: number) => String(n).padStart(2, '0');
  return `${x.getFullYear()}-${deux(x.getMonth() + 1)}-${deux(x.getDate())}`;
}

export function parSemaine(lignes: LigneCout[]): { semaine: string; cout: number; appels: number }[] {
  return parCle(lignes, l => lundiDe(dateCout(l))).map(x => ({ semaine: x.cle, cout: x.cout, appels: x.appels })).sort((a, b) => a.semaine.localeCompare(b.semaine));
}

// Coût par appel qualifié : tout ce qui a été dépensé rapporté aux fiches publiées et validées ; null sans fiche
export function coutParFicheQualifiee(total: number, fichesQualifiees: number): number | null {
  return fichesQualifiees > 0 ? total / fichesQualifiees : null;
}

export const euros3 = (n: number): string => `${n.toLocaleString('fr-FR', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} €`;
