// Qualification des appels (jour 2 du plan MVP, changement qualification-appels, 2026-10-20) : les mêmes valeurs
// fermées que scraping/qualifier_fiches.py, avec leurs libellés, et la lecture d'un appel qualifié. Pourquoi un fichier
// à part : testable par Vitest sans React ni Firebase, partagé par la recherche, la fiche et l'administration.
import type { AAP, AapQualification } from '../types';

export const LIBELLES_DESTINATAIRES: Record<string, string> = {
  public: 'Établissements publics',
  'prive-non-lucratif': 'Privé non lucratif (associations, fondations, ESPIC)',
  'prive-lucratif': 'Privé lucratif (entreprises, cliniques commerciales)',
  collectivites: 'Collectivités',
  recherche: 'Équipes de recherche',
  tous: 'Toute structure',
};

export const LIBELLES_TYPES_APPEL: Record<string, string> = {
  'appel-a-projets': 'Appel à projets',
  'appel-a-candidatures': 'Appel à candidatures',
  ami: "Appel à manifestation d'intérêt",
  subvention: 'Subvention',
  prix: 'Prix, concours, bourse',
  mecenat: 'Mécénat',
  autre: 'Autre',
};

export const LIBELLES_OBJETS: Record<string, string> = {
  'creation-places': 'Création ou extension de places',
  immobilier: 'Rénovation et immobilier',
  equipement: 'Équipement',
  numerique: "Numérique et systèmes d'information",
  prevention: 'Prévention et promotion de la santé',
  'formation-attractivite': 'Formation et attractivité des métiers',
  'recherche-innovation': 'Recherche et innovation',
  'coordination-parcours': 'Coordination des parcours',
  qvt: 'Qualité de vie au travail',
  autre: 'Autre',
};

export const DESTINATAIRES = Object.keys(LIBELLES_DESTINATAIRES);
export const TYPES_APPEL = Object.keys(LIBELLES_TYPES_APPEL);
export const OBJETS = Object.keys(LIBELLES_OBJETS);

export const libelleDestinataire = (id: string): string => LIBELLES_DESTINATAIRES[id] ?? id;
export const libelleTypeAppel = (id: string): string => LIBELLES_TYPES_APPEL[id] ?? id;
export const libelleObjet = (id: string): string => LIBELLES_OBJETS[id] ?? id;

// Destinataires en clair d'un appel qualifié ; vide si non qualifié
export function destinatairesDe(aap: Pick<AAP, 'qualification'>): string[] {
  return (aap.qualification?.destinataires ?? []).map(libelleDestinataire);
}

// Un appel répond à un destinataire choisi s'il le cite ou s'il s'adresse à toute structure ; un appel non qualifié
// n'est pas écarté (on ne sait pas), pour ne pas cacher d'appels par manque d'information
export function correspondDestinataire(aap: Pick<AAP, 'qualification'>, destinataire: string): boolean {
  if (!destinataire) return true;
  const d = aap.qualification?.destinataires;
  if (!d || d.length === 0) return true;
  return d.includes(destinataire) || d.includes('tous');
}

export function correspondTypeAppel(aap: Pick<AAP, 'qualification'>, type: string): boolean {
  if (!type) return true;
  return (aap.qualification?.typeAppel ?? '') === type;
}

// Date AAAA-MM-JJ réellement valide (le 45 du treizième mois est refusé), sinon null
export function dateIsoValide(valeur: string | null | undefined): string | null {
  if (!valeur || !/^\d{4}-\d{2}-\d{2}$/.test(valeur)) return null;
  const d = new Date(`${valeur}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === valeur ? valeur : null;
}

// Qualification écrite à la main depuis l'administration
export function qualificationManuelle(valeurs: Pick<AapQualification, 'destinataires' | 'typeAppel' | 'objets' | 'dateOuverture'>, par: string): AapQualification {
  return {
    destinataires: valeurs.destinataires.filter(d => DESTINATAIRES.includes(d)),
    typeAppel: TYPES_APPEL.includes(valeurs.typeAppel) ? valeurs.typeAppel : 'autre',
    objets: valeurs.objets.filter(o => OBJETS.includes(o)),
    dateOuverture: dateIsoValide(valeurs.dateOuverture),
    par,
    le: new Date().toISOString().slice(0, 10),
  };
}
