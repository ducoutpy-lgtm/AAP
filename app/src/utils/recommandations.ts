// Recommandations d'appels depuis le profil du candidat (changement recommandations-profil, 2026-11-13, semaine 2 du
// plan de quatre semaines). Pourquoi des règles et pas un score en pourcentage : chaque appel recommandé dit pourquoi et
// ce qui reste à vérifier ; une donnée fermée qui contredit le profil écarte l'appel (critère de la semaine : dix-huit
// recommandations pertinentes sur vingt tirées au sort). Fichier pur, testable par Vitest sans React ni Firebase.
import type { AAP, PorteurProfile } from '../types';
import { getDaysUntilDeadline, SANS_DATE } from './deadline';
import { formatDateFr, visiblePubliquement } from './relecture';
import { libelleDestinataire, libelleObjet } from './qualification';
import { libelleTerritoire } from './territoires';
import { regionDepuisCodePostal } from '../pages/onboarding/parcours';

export type ProfilReco = Pick<PorteurProfile, 'structureType' | 'typeEtablissement' | 'objetsProjet' | 'address'>;
export type AppelReco = Pick<AAP, 'territoriesEligible' | 'deadline' | 'qualification' | 'structureTypeEligible'
  | 'scrapeMetadata' | 'validation'>;
export interface Recommandation<T> { aap: T; points: number; raisons: string[]; aVerifier: string[] }

export const SEUIL_RECOMMANDATION = 3;

// Forme juridique -> destinataires de la qualification. Choix par défaut à valider par Monsieur DUCOUT : GCS public et
// privé non lucratif ; exercice coordonné et « autre » sans statut déduit.
const DESTINATAIRES_PAR_FORME: Record<string, string[]> = {
  'etablissement-public': ['public'], espic: ['prive-non-lucratif'], association: ['prive-non-lucratif'],
  fondation: ['prive-non-lucratif'], 'prive-lucratif': ['prive-lucratif'], entreprise: ['prive-lucratif'],
  collectivite: ['collectivites'], laboratoire: ['recherche'], gcs: ['public', 'prive-non-lucratif'],
};
// Type d'établissement -> catégories lues par l'extraction (structureTypeEligible)
const CODES_PAR_TYPE: Record<string, string[]> = {
  mco: ['MCO'], smr: ['SSR', 'SMR'], had: ['HAD'], ehpad: ['EHPAD'], ssiad: ['SSIAD', 'SAD', 'SPASAD'], ime: ['IME'],
  'fam-mas': ['MAS', 'FAM', 'EAM'],
};
const CODES_CONNUS = new Set(Object.values(CODES_PAR_TYPE).flat());
const SANITAIRE = new Set(['mco', 'smr', 'psychiatrie', 'had', 'usld', 'centre-sante', 'msp', 'cpts', 'prevention', 'recherche']);
const MEDICO_SOCIAL = new Set(['ehpad', 'ssiad', 'residence-autonomie', 'accueil-jour', 'ime', 'sessad', 'esat', 'fam-mas',
  'foyer-vie', 'samsah-savs', 'addictologie', 'precarite', 'protection-enfance']);

export function destinatairesDuProfil(structureType?: string): string[] {
  return DESTINATAIRES_PAR_FORME[structureType ?? ''] ?? [];
}

export function regionDuProfil(p: ProfilReco): string {
  return p.address?.region || regionDepuisCodePostal(p.address?.postalCode ?? '');
}

export function champDuProfil(typeEtablissement?: string): string {
  if (SANITAIRE.has(typeEtablissement ?? '')) return 'sante';
  if (MEDICO_SOCIAL.has(typeEtablissement ?? '')) return 'medico-social';
  return '';
}

export function manquesDuProfil(p: ProfilReco): string[] {
  const manques: string[] = [];
  if (!regionDuProfil(p)) manques.push('région');
  if (destinatairesDuProfil(p.structureType).length === 0) manques.push('statut juridique');
  if (!p.typeEtablissement || p.typeEtablissement === 'autre') manques.push("type d'établissement");
  return manques;
}

// null : appel écarté (non contrôlé, clos, autre région, destinataires ou établissements qui contredisent le profil)
export function evaluerAppel<T extends AppelReco>(aap: T, p: ProfilReco): Recommandation<T> | null {
  if (!visiblePubliquement(aap)) return null;
  const jours = getDaysUntilDeadline(aap.deadline);
  if (jours !== null && jours < 0) return null;
  let points = 0;
  const raisons: string[] = [];
  const aVerifier: string[] = [];

  const region = regionDuProfil(p);
  const territoires = (aap.territoriesEligible ?? []).filter(t => t && t !== 'non-precise');
  let national = false;
  if (!region) aVerifier.push('Région de votre structure inconnue');
  else if (territoires.includes(region)) { points += 3; raisons.push(`Appel de votre région (${libelleTerritoire(region)})`); }
  else if (territoires.includes('france')) { national = true; points += 1; raisons.push('Appel national, ouvert à toutes les régions'); }
  else if (territoires.length === 0) aVerifier.push('Territoire non précisé sur la fiche');
  else return null;

  const destinataires = aap.qualification?.destinataires ?? [];
  const statut = destinatairesDuProfil(p.structureType);
  if (destinataires.length === 0) aVerifier.push("À qui s'adresse l'appel : non précisé");
  else if (destinataires.includes('tous')) { points += 1; raisons.push('Ouvert à toute structure'); }
  else if (statut.length === 0) aVerifier.push("À qui s'adresse l'appel : à comparer à votre statut");
  else {
    const communs = destinataires.filter(d => statut.includes(d));
    if (communs.length === 0) return null;
    points += 3;
    raisons.push(`Ouvert aux ${communs.map(libelleDestinataire).join(', ')}, votre statut`);
  }

  const codesProfil = CODES_PAR_TYPE[p.typeEtablissement ?? ''] ?? [];
  const codesFiche = (aap.structureTypeEligible ?? []).map(c => c.trim().toUpperCase()).filter(Boolean);
  const cites = codesFiche.filter(c => codesProfil.includes(c));
  if (cites.length > 0) { points += 3; raisons.push(`Cite votre type d'établissement (${cites[0]})`); }
  else if (codesProfil.length > 0 && codesFiche.length > 0 && codesFiche.every(c => CODES_CONNUS.has(c))) return null;

  const objets = (aap.qualification?.objets ?? []).filter(o => (p.objetsProjet ?? []).includes(o));
  if (objets.length > 0) { points += 2; raisons.push(`Finance : ${objets.map(libelleObjet).join(', ')} (un de vos objets)`); }

  const champ = champDuProfil(p.typeEtablissement);
  const champFiche = aap.scrapeMetadata?.champ ?? '';
  const champEgal = champ !== '' && champFiche === champ;
  if (champEgal) {
    points += 1;
    raisons.push(champ === 'sante' ? 'Appel de la santé, comme votre établissement' : 'Appel du médico-social, comme votre établissement');
  }

  // Domaine (tirage du 2026-11-13 sur les émulateurs : appels nationaux de recherche ou d'industrie proposés à un EHPAD
  // parce qu'ouverts aux associations) : un appel qui ne finance que de la recherche, ou dont le champ contredit celui du
  // profil, est écarté sauf s'il cite le type d'établissement ou un objet du profil ; sans champ connu, il reste, avec
  // une réserve.
  const objetsFiche = aap.qualification?.objets ?? [];
  const rechercheSeule = objetsFiche.includes('recherche-innovation') && objetsFiche.every(o => o === 'recherche-innovation' || o === 'autre');
  const faitDeLaRecherche = (p.objetsProjet ?? []).includes('recherche-innovation') || p.typeEtablissement === 'recherche'
    || p.structureType === 'laboratoire';
  if (cites.length === 0 && objets.length === 0) {
    if (rechercheSeule && !faitDeLaRecherche) return null;
    // Un appel national ne se recommande que sur un élément concret commun (« Première Usine » de Bpifrance, ouvert
    // aux associations, proposé à un EHPAD le 2026-11-13) ; un appel de la région sans domaine connu reste, avec réserve.
    if (national && !champEgal) return null;
    if (!champEgal && champ !== '' && (champFiche === 'sante' || champFiche === 'medico-social')) return null;
    if (!champEgal && (champFiche === '' || champFiche === 'incertain')) aVerifier.push("Domaine de l'appel non précisé");
  }

  if (jours === null) aVerifier.push(SANS_DATE);
  else if (jours === 0) raisons.push("Clôture aujourd'hui");
  else if (jours <= 30) raisons.push(`Clôture dans ${jours} jour${jours > 1 ? 's' : ''}`);
  const ouverture = aap.qualification?.dateOuverture;
  if (ouverture && new Date(ouverture).getTime() > Date.now()) raisons.push(`Candidatures à partir du ${formatDateFr(ouverture)}`);

  return { aap, points, raisons, aVerifier };
}

// Appels au seuil, les plus concordants d'abord, puis la clôture la plus proche, les appels sans date en dernier
export function recommander<T extends AppelReco>(aaps: T[], p: ProfilReco, seuil = SEUIL_RECOMMANDATION): Recommandation<T>[] {
  const rang = (r: Recommandation<T>) => getDaysUntilDeadline(r.aap.deadline) ?? Number.MAX_SAFE_INTEGER;
  return aaps.map(aap => evaluerAppel(aap, p)).filter((r): r is Recommandation<T> => r !== null && r.points >= seuil)
    .sort((a, b) => b.points - a.points || rang(a) - rang(b));
}
