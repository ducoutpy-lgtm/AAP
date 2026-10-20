// Parcours d'intégration en trois écrans (changement parcours-integration, 2026-10-20, point 1 du relevé
// helloDarwin). Pourquoi un fichier à part : les listes du secteur, la déduction de la région et la complétude des
// écrans se testent par Vitest sans React ni Firebase ; la page ParcoursIntegrationPage ne fait que les afficher.
import type { UserType } from '../../types';

export interface Option {
  value: string;
  label: string;
}

// Formes juridiques des porteurs du secteur santé et médico-social. Les anciennes valeurs (entreprise, association,
// collectivite, laboratoire, autre) restent valides pour les profils enregistrés avant ce changement.
export const FORMES_JURIDIQUES: Option[] = [
  { value: 'etablissement-public', label: 'Établissement public de santé ou médico-social' },
  { value: 'espic', label: "Établissement privé d'intérêt collectif (ESPIC)" },
  { value: 'association', label: 'Association' },
  { value: 'fondation', label: 'Fondation' },
  { value: 'prive-lucratif', label: 'Établissement privé à but lucratif' },
  { value: 'gcs', label: 'Groupement de coopération (GCS, GCSMS)' },
  { value: 'collectivite', label: 'Collectivité territoriale ou CCAS' },
  { value: 'exercice-coordonne', label: 'Exercice coordonné (CPTS, MSP, centre de santé)' },
  { value: 'laboratoire', label: 'Laboratoire ou équipe de recherche' },
  { value: 'entreprise', label: 'Entreprise' },
  { value: 'autre', label: 'Autre' },
];

// Types d'établissement, groupés d'après la nomenclature FINESS (catégories les plus courantes)
export const TYPES_ETABLISSEMENT: { groupe: string; options: Option[] }[] = [
  {
    groupe: 'Sanitaire',
    options: [
      { value: 'mco', label: 'Médecine, chirurgie, obstétrique (MCO)' },
      { value: 'smr', label: 'Soins médicaux et de réadaptation (SMR, ex-SSR)' },
      { value: 'psychiatrie', label: 'Psychiatrie et santé mentale' },
      { value: 'had', label: 'Hospitalisation à domicile (HAD)' },
      { value: 'usld', label: 'Unité de soins de longue durée (USLD)' },
      { value: 'centre-sante', label: 'Centre de santé' },
      { value: 'msp', label: 'Maison de santé pluriprofessionnelle (MSP)' },
      { value: 'cpts', label: 'Communauté professionnelle territoriale de santé (CPTS)' },
    ],
  },
  {
    groupe: 'Personnes âgées',
    options: [
      { value: 'ehpad', label: 'EHPAD' },
      { value: 'ssiad', label: 'SSIAD ou SPASAD' },
      { value: 'residence-autonomie', label: 'Résidence autonomie' },
      { value: 'accueil-jour', label: "Accueil de jour, plateforme de répit" },
    ],
  },
  {
    groupe: 'Handicap',
    options: [
      { value: 'ime', label: 'IME, ITEP, IEM' },
      { value: 'sessad', label: 'SESSAD' },
      { value: 'esat', label: 'ESAT, entreprise adaptée' },
      { value: 'fam-mas', label: 'FAM, MAS, EAM' },
      { value: 'foyer-vie', label: "Foyer de vie, foyer d'hébergement" },
      { value: 'samsah-savs', label: 'SAMSAH, SAVS' },
    ],
  },
  {
    groupe: 'Autres',
    options: [
      { value: 'addictologie', label: 'Addictologie (CSAPA, CAARUD)' },
      { value: 'precarite', label: 'Précarité et insertion (CHRS, LHSS, LAM)' },
      { value: 'protection-enfance', label: "Protection de l'enfance (MECS, placement familial)" },
      { value: 'prevention', label: 'Association de prévention ou de promotion de la santé' },
      { value: 'recherche', label: 'Recherche, université, société savante' },
      { value: 'autre', label: 'Autre' },
    ],
  },
];

export const TAILLES: Option[] = [
  { value: '1-10', label: '1 à 10 ETP' },
  { value: '11-50', label: '11 à 50 ETP' },
  { value: '51-200', label: '51 à 200 ETP' },
  { value: '201-500', label: '201 à 500 ETP' },
  { value: '500+', label: 'Plus de 500 ETP' },
];

export const BUDGETS: Option[] = [
  { value: '<500k', label: "Moins de 500 000 euros" },
  { value: '500k-2m', label: '500 000 à 2 millions' },
  { value: '2m-10m', label: '2 à 10 millions' },
  { value: '10m-50m', label: '10 à 50 millions' },
  { value: '>50m', label: 'Plus de 50 millions' },
];

export const PUBLICS: Option[] = [
  { value: 'personnes-agees', label: 'Personnes âgées' },
  { value: 'handicap', label: 'Personnes en situation de handicap' },
  { value: 'enfance-famille', label: 'Enfance et famille' },
  { value: 'sante-mentale', label: 'Santé mentale' },
  { value: 'addictions', label: 'Addictions' },
  { value: 'precarite', label: 'Personnes en situation de précarité' },
  { value: 'aidants', label: 'Aidants' },
  { value: 'detenus', label: 'Personnes détenues' },
  { value: 'tout-public', label: 'Tout public' },
];

// Listes du financeur (celles déjà utilisées par le formulaire long, pour rester compatible avec le type)
export const TYPES_ORGANISATION: Option[] = [
  { value: 'ministere', label: 'Ministère' },
  { value: 'agence', label: "Agence d'État (ARS, CNSA, Santé publique France...)" },
  { value: 'fondation', label: 'Fondation, fonds de dotation' },
  { value: 'collectivite', label: 'Collectivité territoriale' },
  { value: 'entreprise', label: 'Entreprise, mutuelle, assurance' },
];

export const SECTEURS_FINANCES: Option[] = [
  { value: 'sante', label: 'Santé' },
  { value: 'social', label: 'Médico-social et social' },
  { value: 'recherche', label: 'Recherche et innovation' },
  { value: 'numerique', label: 'Numérique en santé' },
  { value: 'education', label: 'Formation des professionnels' },
];

// Département -> identifiant de région (mêmes identifiants que utils/territoires.ts, donc que l'import des fiches)
const REGION_PAR_DEPARTEMENT: Record<string, string> = {
  '01': 'auvergne-rhone-alpes', '03': 'auvergne-rhone-alpes', '07': 'auvergne-rhone-alpes', '15': 'auvergne-rhone-alpes',
  '26': 'auvergne-rhone-alpes', '38': 'auvergne-rhone-alpes', '42': 'auvergne-rhone-alpes', '43': 'auvergne-rhone-alpes',
  '63': 'auvergne-rhone-alpes', '69': 'auvergne-rhone-alpes', '73': 'auvergne-rhone-alpes', '74': 'auvergne-rhone-alpes',
  '21': 'bourgogne-franche-comte', '25': 'bourgogne-franche-comte', '39': 'bourgogne-franche-comte',
  '58': 'bourgogne-franche-comte', '70': 'bourgogne-franche-comte', '71': 'bourgogne-franche-comte',
  '89': 'bourgogne-franche-comte', '90': 'bourgogne-franche-comte',
  '22': 'bretagne', '29': 'bretagne', '35': 'bretagne', '56': 'bretagne',
  '18': 'centre-val-de-loire', '28': 'centre-val-de-loire', '36': 'centre-val-de-loire', '37': 'centre-val-de-loire',
  '41': 'centre-val-de-loire', '45': 'centre-val-de-loire',
  '20': 'corse',
  '08': 'grand-est', '10': 'grand-est', '51': 'grand-est', '52': 'grand-est', '54': 'grand-est', '55': 'grand-est',
  '57': 'grand-est', '67': 'grand-est', '68': 'grand-est', '88': 'grand-est',
  '02': 'hauts-de-france', '59': 'hauts-de-france', '60': 'hauts-de-france', '62': 'hauts-de-france', '80': 'hauts-de-france',
  '75': 'ile-de-france', '77': 'ile-de-france', '78': 'ile-de-france', '91': 'ile-de-france', '92': 'ile-de-france',
  '93': 'ile-de-france', '94': 'ile-de-france', '95': 'ile-de-france',
  '14': 'normandie', '27': 'normandie', '50': 'normandie', '61': 'normandie', '76': 'normandie',
  '16': 'nouvelle-aquitaine', '17': 'nouvelle-aquitaine', '19': 'nouvelle-aquitaine', '23': 'nouvelle-aquitaine',
  '24': 'nouvelle-aquitaine', '33': 'nouvelle-aquitaine', '40': 'nouvelle-aquitaine', '47': 'nouvelle-aquitaine',
  '64': 'nouvelle-aquitaine', '79': 'nouvelle-aquitaine', '86': 'nouvelle-aquitaine', '87': 'nouvelle-aquitaine',
  '09': 'occitanie', '11': 'occitanie', '12': 'occitanie', '30': 'occitanie', '31': 'occitanie', '32': 'occitanie',
  '34': 'occitanie', '46': 'occitanie', '48': 'occitanie', '65': 'occitanie', '66': 'occitanie', '81': 'occitanie',
  '82': 'occitanie',
  '44': 'pays-de-la-loire', '49': 'pays-de-la-loire', '53': 'pays-de-la-loire', '72': 'pays-de-la-loire',
  '85': 'pays-de-la-loire',
  '04': 'provence-alpes-cote-d-azur', '05': 'provence-alpes-cote-d-azur', '06': 'provence-alpes-cote-d-azur',
  '13': 'provence-alpes-cote-d-azur', '83': 'provence-alpes-cote-d-azur', '84': 'provence-alpes-cote-d-azur',
  '971': 'guadeloupe', '972': 'martinique', '973': 'guyane', '974': 'la-reunion', '976': 'mayotte',
};

// Région d'après le code postal : deux premiers chiffres, trois pour l'outre-mer ; '' si inconnu ou incomplet.
export function regionDepuisCodePostal(codePostal: string): string {
  const cp = codePostal.trim();
  if (!/^\d{5}$/.test(cp)) return '';
  if (cp.startsWith('97')) return REGION_PAR_DEPARTEMENT[cp.slice(0, 3)] ?? '';
  return REGION_PAR_DEPARTEMENT[cp.slice(0, 2)] ?? '';
}

export interface FormulaireParcours {
  // Écran 1 : la structure (porteur et financeur)
  nom: string;
  forme: string;
  ville: string;
  codePostal: string;
  // Écran 2, porteur
  typeEtablissement: string;
  taille: string;
  budget: string;
  publics: string[];
  // Écran 2, financeur
  secteurs: string[];
  prenom: string;
  nomContact: string;
  fonction: string;
}

export const PARCOURS_VIDE: FormulaireParcours = {
  nom: '', forme: '', ville: '', codePostal: '',
  typeEtablissement: '', taille: '', budget: '', publics: [],
  secteurs: [], prenom: '', nomContact: '', fonction: '',
};

// Un écran est complet quand ses champs obligatoires sont remplis ; « Suivant » reste grisé sinon.
export function etapeComplete(etape: 1 | 2, f: FormulaireParcours, role: UserType): boolean {
  if (etape === 1) {
    return f.nom.trim() !== '' && f.forme !== '' && f.ville.trim() !== '' && /^\d{5}$/.test(f.codePostal.trim());
  }
  if (role === 'porteur') return f.typeEtablissement !== '' && f.publics.length > 0;
  return f.secteurs.length > 0 && f.prenom.trim() !== '' && f.nomContact.trim() !== '';
}

// Documents à enregistrer. secteurActivite « sante » et domainesIntervention vide : la page des recommandations lit
// encore ces deux champs hérités ; aucun profil existant n'est modifié.
export function profilPorteurDepuisParcours(f: FormulaireParcours, userId: string, email: string) {
  return {
    userId,
    structureName: f.nom.trim(),
    structureType: f.forme,
    secteurActivite: 'sante',
    domainesIntervention: [] as string[],
    typeEtablissement: f.typeEtablissement,
    tailleTranche: f.taille || null,
    budgetTranche: f.budget || null,
    publics: f.publics,
    address: {
      city: f.ville.trim(),
      postalCode: f.codePostal.trim(),
      region: regionDepuisCodePostal(f.codePostal),
      country: 'France',
    },
    contactPerson: { firstName: '', lastName: '', email },
  };
}

export function profilFinanceurDepuisParcours(f: FormulaireParcours, userId: string, email: string) {
  return {
    userId,
    organisationName: f.nom.trim(),
    organisationType: f.forme,
    sectorsSupported: f.secteurs,
    address: {
      city: f.ville.trim(),
      postalCode: f.codePostal.trim(),
      region: regionDepuisCodePostal(f.codePostal),
      country: 'France',
    },
    contactPerson: {
      firstName: f.prenom.trim(),
      lastName: f.nomContact.trim(),
      email,
      position: f.fonction.trim() || null,
    },
  };
}
