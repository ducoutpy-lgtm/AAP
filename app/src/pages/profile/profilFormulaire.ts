// Pré-remplissage des formulaires de profil à partir d'un profil enregistré (changement profil-et-edition-aap,
// 2026-10-20). Pourquoi un fichier à part : testable par Vitest sans React ni Firebase ; les formulaires
// CompletePorteurProfile et CompleteFinanceurProfile l'utilisent en mode édition (page Mon profil).
import type { FinanceurProfile, PorteurProfile } from '../../types';

export interface FormulairePorteur {
  structureName: string;
  siret: string;
  structureType: string;
  secteurActivite: string;
  domainesIntervention: string[];
  city: string;
  postalCode: string;
  region: string;
  firstName: string;
  lastName: string;
  phone: string;
  teamSize: string;
  website: string;
  description: string;
  // Champs du parcours d'intégration (parcours-integration, 2026-10-20)
  typeEtablissement: string;
  tailleTranche: string;
  budgetTranche: string;
  publics: string[];
}

export interface FormulaireFinanceur {
  organisationName: string;
  organisationType: string;
  sectorsSupported: string[];
  city: string;
  postalCode: string;
  region: string;
  firstName: string;
  lastName: string;
  phone: string;
  position: string;
  website: string;
  description: string;
}

export const FORMULAIRE_PORTEUR_VIDE: FormulairePorteur = {
  structureName: '', siret: '', structureType: '', secteurActivite: '', domainesIntervention: [],
  city: '', postalCode: '', region: '', firstName: '', lastName: '', phone: '', teamSize: '', website: '', description: '',
  typeEtablissement: '', tailleTranche: '', budgetTranche: '', publics: [],
};

export const FORMULAIRE_FINANCEUR_VIDE: FormulaireFinanceur = {
  organisationName: '', organisationType: '', sectorsSupported: [],
  city: '', postalCode: '', region: '', firstName: '', lastName: '', phone: '', position: '', website: '', description: '',
};

function texte(valeur: number | string | null | undefined): string {
  return valeur === null || valeur === undefined ? '' : String(valeur);
}

export function formulairePorteurDepuisProfil(p: PorteurProfile): FormulairePorteur {
  return {
    structureName: p.structureName ?? '',
    siret: texte(p.siret),
    structureType: p.structureType ?? '',
    secteurActivite: p.secteurActivite ?? '',
    domainesIntervention: p.domainesIntervention ?? [],
    city: p.address?.city ?? '',
    postalCode: p.address?.postalCode ?? '',
    region: p.address?.region ?? '',
    firstName: p.contactPerson?.firstName ?? '',
    lastName: p.contactPerson?.lastName ?? '',
    phone: texte(p.contactPerson?.phone),
    teamSize: texte(p.teamSize),
    website: texte(p.website),
    description: texte(p.description),
    typeEtablissement: p.typeEtablissement ?? '',
    tailleTranche: texte(p.tailleTranche),
    budgetTranche: texte(p.budgetTranche),
    publics: p.publics ?? [],
  };
}

export function formulaireFinanceurDepuisProfil(p: FinanceurProfile): FormulaireFinanceur {
  return {
    organisationName: p.organisationName ?? '',
    organisationType: p.organisationType ?? '',
    sectorsSupported: p.sectorsSupported ?? [],
    city: p.address?.city ?? '',
    postalCode: p.address?.postalCode ?? '',
    region: p.address?.region ?? '',
    firstName: p.contactPerson?.firstName ?? '',
    lastName: p.contactPerson?.lastName ?? '',
    phone: texte(p.contactPerson?.phone),
    position: texte(p.contactPerson?.position),
    website: texte(p.website),
    description: texte(p.description),
  };
}
