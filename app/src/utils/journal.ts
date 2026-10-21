// Journal des actions des testeurs (jour 4 du plan MVP, changement suivi-testeurs, 2026-10-21) : actions, libellés,
// résumé par compte, chiffres de la semaine. Pourquoi un fichier à part : testable par Vitest sans React ni Firebase.
import type { Timestamp } from 'firebase/firestore';
import type { UserType } from '../types';

export type ActionJournal = 'connexion' | 'recherche' | 'fiche' | 'recherche-sauvegardee' | 'candidature' | 'appel';

export const LIBELLES_ACTIONS: Record<ActionJournal, string> = {
  connexion: 'Connexion',
  recherche: 'Recherche',
  fiche: 'Fiche ouverte',
  'recherche-sauvegardee': 'Recherche sauvegardée',
  candidature: 'Candidature envoyée',
  appel: 'Appel publié',
};

export interface LigneJournal {
  id?: string;
  userId: string;
  role: UserType;
  action: ActionJournal;
  // Identifiant de la cible (appel, candidature) et son libellé lisible (titre, filtres), vides pour une connexion
  cible?: string;
  libelle?: string;
  le: Timestamp | Date;
}

export interface CompteSuivi {
  uid: string;
  email: string;
  role: UserType;
  structure: string;
  inscritLe: Date | null;
}

export interface ResumeCompte extends CompteSuivi {
  derniereConnexion: Date | null;
  connexions: number;
  recherches: number;
  fiches: number;
  candidatures: number;
  appels: number;
  dernieres: LigneJournal[];
}

const enDate = (v: Timestamp | Date | null | undefined): Date | null => {
  if (!v) return null;
  return v instanceof Date ? v : v.toDate();
};

export const dateLigne = (l: LigneJournal): Date => enDate(l.le) ?? new Date(0);

// Un résumé par compte : compteurs par action, dernière connexion, vingt dernières actions (la plus récente d'abord) ;
// les comptes sans action apparaissent avec des zéros ; tri : dernière action la plus récente en tête
export function resumerParCompte(comptes: CompteSuivi[], journal: LigneJournal[], maxDernieres = 20): ResumeCompte[] {
  const parCompte = new Map<string, LigneJournal[]>();
  for (const l of journal) {
    const liste = parCompte.get(l.userId) ?? [];
    liste.push(l);
    parCompte.set(l.userId, liste);
  }
  const resumes = comptes.map(c => {
    const lignes = (parCompte.get(c.uid) ?? []).sort((a, b) => dateLigne(b).getTime() - dateLigne(a).getTime());
    const compter = (action: ActionJournal) => lignes.filter(l => l.action === action).length;
    const connexion = lignes.find(l => l.action === 'connexion');
    return {
      ...c,
      derniereConnexion: connexion ? dateLigne(connexion) : null,
      connexions: compter('connexion'),
      recherches: compter('recherche'),
      fiches: compter('fiche'),
      candidatures: compter('candidature'),
      appels: compter('appel'),
      dernieres: lignes.slice(0, maxDernieres),
    };
  });
  const derniere = (r: ResumeCompte) => (r.dernieres[0] ? dateLigne(r.dernieres[0]).getTime() : 0);
  return resumes.sort((a, b) => derniere(b) - derniere(a));
}

export interface ChiffresSemaine {
  comptesActifs: number;
  connexions: number;
  recherches: number;
  fiches: number;
  candidatures: number;
}

export function chiffresDepuis(journal: LigneJournal[], depuis: Date): ChiffresSemaine {
  const recentes = journal.filter(l => dateLigne(l) >= depuis);
  const compter = (action: ActionJournal) => recentes.filter(l => l.action === action).length;
  return {
    comptesActifs: new Set(recentes.map(l => l.userId)).size,
    connexions: compter('connexion'),
    recherches: compter('recherche'),
    fiches: compter('fiche'),
    candidatures: compter('candidature'),
  };
}

// Libellé lisible des filtres actifs d'une recherche, pour la ligne du journal (ex : « Normandie · Bientôt clôturé »)
export function libelleFiltres(etiquettes: { libelle: string }[]): string {
  return etiquettes.map(e => e.libelle).join(' · ') || 'sans filtre';
}
