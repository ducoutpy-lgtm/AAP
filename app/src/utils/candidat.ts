// Logique du parcours candidat (changement parcours-candidat-jour-1, 2026-10-20, jour 1 du plan MVP) : montant
// lisible, « à qui s'adresse », appels pour un profil, échéances proches, colonnes des candidatures. Pourquoi un
// fichier à part : testable par Vitest sans React ni Firebase.
import type { AAP, ApplicationStatus } from '../types';
import { getDaysUntilDeadline } from './deadline';
import { euros } from './recherche';
import { destinatairesDe } from './qualification';

// « De 10 000 € à 50 000 € », « Jusqu'à 50 000 € », « Enveloppe 2 000 000 € », sinon « Montant non précisé »
export function libelleMontant(aap: Pick<AAP, 'budgetMin' | 'budgetMax' | 'budgetTotal'>): string {
  const min = aap.budgetMin ?? null;
  const max = aap.budgetMax ?? null;
  if (min && max) return `De ${euros(min)} à ${euros(max)}`;
  if (max) return `Jusqu'à ${euros(max)}`;
  if (min) return `À partir de ${euros(min)}`;
  if (aap.budgetTotal) return `Enveloppe ${euros(aap.budgetTotal)}`;
  return 'Montant non précisé';
}

export const LIBELLES_THEMATIQUES_FICHE: Record<string, string> = {
  sante: 'Santé',
  social: 'Médico-social et social',
};

// Familles de structures reconnues dans le texte des critères (retour de Monsieur DUCOUT du 2026-10-20 : la fiche
// disait « types non précisés » alors que les critères écrivaient « structures éligibles : associations »). Heuristique
// de mots, en attendant le champ extrait par le modèle (jour 2 du plan MVP).
const FAMILLES: [RegExp, string][] = [
  [/\bassociations?\b/i, 'Associations'],
  [/\bfondations?\b|fonds de dotation/i, 'Fondations'],
  [/[ée]tablissements? publics?|secteur public|\bpublics?\b/i, 'Établissements publics'],
  [/priv[ée]s? (?:à but )?non lucratif|\bespic\b|non lucratif/i, 'Privé non lucratif'],
  [/priv[ée]s? (?:à but )?lucratif|\bentreprises?\b|\bsoci[ée]t[ée]s?\b/i, 'Entreprises, privé lucratif'],
  [/collectivit[ée]s?|\bcommunes?\b|\bccas\b|conseils? d[ée]partementa/i, 'Collectivités'],
  [/[ée]tablissements?(?: publics?| priv[ée]s?)? de sant[ée]|h[ôo]pita|hospitali|\bchu\b|cliniques?/i, 'Établissements de santé'],
  [/m[ée]dico-socia|\besms\b|\behpad\b|\besat\b|\bime\b|\bfam\b|\bmas\b|\bssiad\b/i, 'Établissements médico-sociaux'],
  [/chercheurs?|laboratoires?|[ée]quipes? de recherche|universit/i, 'Équipes de recherche'],
  [/\bcpts\b|maisons? de sant[ée]|centres? de sant[ée]|professionnels? de sant[ée] lib[ée]ra/i, 'Exercice coordonné et libéraux'],
];

export function famillesDepuisCriteres(texte: string | null | undefined): string[] {
  if (!texte) return [];
  return FAMILLES.filter(([motif]) => motif.test(texte)).map(([, libelle]) => libelle);
}

// À qui s'adresse l'appel : la qualification (modèle ou administrateur) d'abord, sinon les types lus par l'extraction
// (structureTypeEligible), sinon les familles reconnues dans les critères ; vide si rien
export function aQuiSAdresse(aap: Pick<AAP, 'structureTypeEligible' | 'eligibilityCriteria' | 'qualification'>): string[] {
  const qualifies = destinatairesDe(aap);
  if (qualifies.length > 0) return qualifies;
  const lus = Array.from(new Set((aap.structureTypeEligible ?? []).map(t => t.trim()).filter(Boolean)));
  return lus.length > 0 ? lus : famillesDepuisCriteres(aap.eligibilityCriteria);
}

// Appels pour une structure : sa région ou national, non clôturés, clôture la plus proche d'abord puis sans date
export function appelsPourProfil<T extends Pick<AAP, 'territoriesEligible' | 'deadline'>>(aaps: T[], region: string): T[] {
  const concernes = aaps.filter(aap => {
    const jours = getDaysUntilDeadline(aap.deadline);
    if (jours !== null && jours < 0) return false;
    const t = aap.territoriesEligible ?? [];
    return !region || t.includes(region) || t.includes('france');
  });
  const rang = (aap: T) => getDaysUntilDeadline(aap.deadline) ?? Number.MAX_SAFE_INTEGER;
  return [...concernes].sort((a, b) => rang(a) - rang(b));
}

export function echeancesProches<T extends Pick<AAP, 'deadline'>>(aaps: T[], jours = 30): T[] {
  return aaps.filter(aap => {
    const j = getDaysUntilDeadline(aap.deadline);
    return j !== null && j >= 0 && j <= jours;
  });
}

export type ColonneCandidature = 'envoyee' | 'examen' | 'complement' | 'acceptee' | 'refusee';

export const COLONNES_CANDIDATURES: { cle: ColonneCandidature; libelle: string }[] = [
  { cle: 'envoyee', libelle: 'Envoyée' },
  { cle: 'examen', libelle: "En cours d'examen" },
  { cle: 'complement', libelle: 'Complément demandé' },
  { cle: 'acceptee', libelle: 'Acceptée' },
  { cle: 'refusee', libelle: 'Refusée' },
];

export const LIBELLES_STATUT_CANDIDATURE: Record<ApplicationStatus, string> = {
  draft: 'Brouillon',
  submitted: 'Envoyée',
  under_review: "En cours d'examen",
  pending_info: 'Complément demandé',
  accepted: 'Acceptée',
  rejected: 'Refusée',
};

export function colonneDe(status: string): ColonneCandidature {
  switch (status) {
    case 'submitted': return 'envoyee';
    case 'pending_info': return 'complement';
    case 'accepted': return 'acceptee';
    case 'rejected': return 'refusee';
    default: return 'examen'; // under_review, draft, valeurs anciennes (shortlisted) : rien n'est perdu
  }
}

export function repartirCandidatures<T extends { status: string }>(apps: T[]): Record<ColonneCandidature, T[]> {
  const colonnes: Record<ColonneCandidature, T[]> = { envoyee: [], examen: [], complement: [], acceptee: [], refusee: [] };
  for (const a of apps) colonnes[colonneDe(a.status)].push(a);
  return colonnes;
}
