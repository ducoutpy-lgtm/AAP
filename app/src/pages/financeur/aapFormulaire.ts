// Conversions entre un appel à projets et le formulaire en cinq étapes de CreateAapPage (changement
// profil-et-edition-aap, 2026-10-20). Pourquoi un fichier à part : ces fonctions ne touchent ni React ni Firebase,
// elles se testent donc par Vitest sans monter la page ; et la construction des données enregistrées, copiée deux fois
// dans CreateAapPage (sauvegarde, publication), n'existe plus qu'ici.
import type { AAP } from '../../types';
import type { CreateAapData } from '../../services/aapService';
import { enDate } from '../../utils/dates';

export interface FormulaireAap {
  title: string;
  description: string;
  sectorsTargeted: string[];
  territoriesEligible: string[];
  budgetMin: string;
  budgetMax: string;
  budgetTotal: string;
  deadline: string; // aaaa-mm-jj, vide si non précisée
  eligibilityCriteria: string;
  evaluationCriteria: string;
  contactEmail: string;
  contactPhone: string;
  externalUrl: string;
  tags: string; // mots-clés séparés par des virgules
}

export const FORMULAIRE_VIDE: FormulaireAap = {
  title: '',
  description: '',
  sectorsTargeted: [],
  territoriesEligible: [],
  budgetMin: '',
  budgetMax: '',
  budgetTotal: '',
  deadline: '',
  eligibilityCriteria: '',
  evaluationCriteria: '',
  contactEmail: '',
  contactPhone: '',
  externalUrl: '',
  tags: '',
};

// Le champ de date du navigateur donne « aaaa-mm-jj », que new Date() lit comme minuit UTC : on relit la date en UTC
// pour retrouver le même jour quel que soit le fuseau du poste.
function jourIso(valeur: AAP['deadline']): string {
  const date = enDate(valeur);
  if (!date) return '';
  const mois = String(date.getUTCMonth() + 1).padStart(2, '0');
  const jour = String(date.getUTCDate()).padStart(2, '0');
  return `${date.getUTCFullYear()}-${mois}-${jour}`;
}

function texte(valeur: number | string | null | undefined): string {
  return valeur === null || valeur === undefined ? '' : String(valeur);
}

export function formulaireDepuisAap(aap: AAP): FormulaireAap {
  return {
    title: aap.title ?? '',
    description: aap.description ?? '',
    sectorsTargeted: aap.sectorsTargeted ?? [],
    territoriesEligible: aap.territoriesEligible ?? [],
    budgetMin: texte(aap.budgetMin),
    budgetMax: texte(aap.budgetMax),
    budgetTotal: texte(aap.budgetTotal),
    deadline: jourIso(aap.deadline),
    eligibilityCriteria: aap.eligibilityCriteria ?? '',
    evaluationCriteria: aap.evaluationCriteria ?? '',
    contactEmail: aap.contactEmail ?? '',
    contactPhone: aap.contactPhone ?? '',
    externalUrl: aap.externalUrl ?? '',
    tags: (aap.tags ?? []).join(', '),
  };
}

export function donneesDepuisFormulaire(f: FormulaireAap): CreateAapData {
  const etiquettes = f.tags.split(',').map((t) => t.trim()).filter(Boolean);
  return {
    title: f.title,
    description: f.description,
    sectorsTargeted: f.sectorsTargeted,
    territoriesEligible: f.territoriesEligible,
    budgetMin: f.budgetMin ? parseFloat(f.budgetMin) : undefined,
    budgetMax: f.budgetMax ? parseFloat(f.budgetMax) : undefined,
    budgetTotal: f.budgetTotal ? parseFloat(f.budgetTotal) : undefined,
    deadline: new Date(f.deadline),
    eligibilityCriteria: f.eligibilityCriteria || undefined,
    evaluationCriteria: f.evaluationCriteria || undefined,
    contactEmail: f.contactEmail || undefined,
    contactPhone: f.contactPhone || undefined,
    externalUrl: f.externalUrl || undefined,
    tags: etiquettes.length ? etiquettes : undefined,
  };
}
