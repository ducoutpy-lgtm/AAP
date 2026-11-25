// Conversions entre un appel à projets et le formulaire en cinq étapes de CreateAapPage (changement
// profil-et-edition-aap, 2026-10-20). Pourquoi un fichier à part : ces fonctions ne touchent ni React ni Firebase,
// elles se testent donc par Vitest sans monter la page ; et la construction des données enregistrées, copiée deux fois
// dans CreateAapPage (sauvegarde, publication), n'existe plus qu'ici.
import type { AAP } from '../../types';
import type { CreateAapData } from '../../services/aapService';
import { enDate } from '../../utils/dates';
import { lienSur } from '../../utils/liens';

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
  const etiquettes = f.tags
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
  return {
    title: f.title,
    description: f.description,
    sectorsTargeted: f.sectorsTargeted,
    territoriesEligible: f.territoriesEligible,
    budgetMin: f.budgetMin ? parseFloat(f.budgetMin) : undefined,
    budgetMax: f.budgetMax ? parseFloat(f.budgetMax) : undefined,
    budgetTotal: f.budgetTotal ? parseFloat(f.budgetTotal) : undefined,
    // Date vide : échéance nulle (type AAP nullable depuis le lot 0) ; new Date('') faisait échouer l'écriture
    deadline: f.deadline ? new Date(f.deadline) : null,
    eligibilityCriteria: f.eligibilityCriteria || undefined,
    evaluationCriteria: f.evaluationCriteria || undefined,
    contactEmail: f.contactEmail || undefined,
    contactPhone: f.contactPhone || undefined,
    externalUrl: f.externalUrl || undefined,
    tags: etiquettes.length ? etiquettes : undefined,
  };
}

// Contrôle d'une étape du formulaire (plan niveau A, lot 3.4, 2026-11-25) : un message en français par champ, affiché sous
// le champ. La page ne vérifiait que la présence d'une date (les attributs min des champs ne jouent que dans un <form>).
// aujourdhui : date du jour du poste, « aaaa-mm-jj » (comparée comme texte à la date saisie).
export type ErreursFormulaire = Partial<Record<keyof FormulaireAap, string>>;

const jourLocal = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const montantInvalide = (valeur: string) => valeur.trim() !== '' && !(Number(valeur) >= 0);

export function erreursEtape(etape: number, f: FormulaireAap, aujourdhui = jourLocal(new Date())): ErreursFormulaire {
  const e: ErreursFormulaire = {};
  if (etape === 0) {
    if (f.title.trim().length < 10) e.title = 'Le titre doit compter au moins 10 caractères.';
    if (f.description.trim().length < 100) {
      e.description = `La description doit compter au moins 100 caractères (${f.description.trim().length} actuellement).`;
    }
    if (f.externalUrl.trim() && !lienSur(f.externalUrl))
      e.externalUrl = "L'adresse doit commencer par http:// ou https://.";
  } else if (etape === 1) {
    if (f.sectorsTargeted.length === 0) e.sectorsTargeted = 'Choisissez au moins un secteur.';
    if (f.territoriesEligible.length === 0) e.territoriesEligible = 'Choisissez au moins un territoire.';
  } else if (etape === 2) {
    for (const champ of ['budgetMin', 'budgetMax', 'budgetTotal'] as const) {
      if (montantInvalide(f[champ])) e[champ] = 'Indiquez un montant positif en euros.';
    }
    if (
      !e.budgetMin &&
      !e.budgetMax &&
      f.budgetMin.trim() &&
      f.budgetMax.trim() &&
      Number(f.budgetMin) > Number(f.budgetMax)
    ) {
      e.budgetMax = 'Le budget maximum doit être supérieur ou égal au minimum.';
    }
    if (!f.deadline) e.deadline = 'Indiquez la date limite de candidature.';
    else if (f.deadline < aujourdhui) e.deadline = 'La date limite est déjà passée.';
  } else if (etape === 3) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.contactEmail.trim()))
      e.contactEmail = 'Indiquez une adresse électronique valide.';
  }
  return e;
}
