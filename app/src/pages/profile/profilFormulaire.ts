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
  // Fenêtre « Préciser mon profil » (liste-demarrage, 2026-10-20)
  objetsProjet: string[];
  anneeOuverture: string;
  rayonAction: string;
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
  objetsProjet: [], anneeOuverture: '', rayonAction: '',
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
    objetsProjet: p.objetsProjet ?? [],
    anneeOuverture: texte(p.anneeOuverture),
    rayonAction: texte(p.rayonAction),
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

// Régions proposées dans Mon profil : les 13 de métropole et les 5 d'outre-mer, avec les identifiants qu'écrit le parcours
// d'intégration (décision 41 du 2026-11-24 : sans l'outre-mer, le champ obligatoire bloquait l'enregistrement)
export const REGIONS: { value: string; label: string }[] = [
  { value: 'auvergne-rhone-alpes', label: 'Auvergne-Rhône-Alpes' },
  { value: 'bourgogne-franche-comte', label: 'Bourgogne-Franche-Comté' },
  { value: 'bretagne', label: 'Bretagne' },
  { value: 'centre-val-de-loire', label: 'Centre-Val de Loire' },
  { value: 'corse', label: 'Corse' },
  { value: 'grand-est', label: 'Grand Est' },
  { value: 'hauts-de-france', label: 'Hauts-de-France' },
  { value: 'ile-de-france', label: 'Île-de-France' },
  { value: 'normandie', label: 'Normandie' },
  { value: 'nouvelle-aquitaine', label: 'Nouvelle-Aquitaine' },
  { value: 'occitanie', label: 'Occitanie' },
  { value: 'pays-de-la-loire', label: 'Pays de la Loire' },
  { value: 'provence-alpes-cote-d-azur', label: "Provence-Alpes-Côte d'Azur" },
  { value: 'guadeloupe', label: 'Guadeloupe' },
  { value: 'martinique', label: 'Martinique' },
  { value: 'guyane', label: 'Guyane' },
  { value: 'la-reunion', label: 'La Réunion' },
  { value: 'mayotte', label: 'Mayotte' },
];
