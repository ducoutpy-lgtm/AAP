// Liste de démarrage (changement liste-demarrage, 2026-10-20, point 2 du relevé helloDarwin) : les quatre premières
// actions d'un compte et leur état. Pourquoi un fichier à part : testable par Vitest sans React ni Firebase.
import type { Option } from '../../pages/onboarding/parcours';
import type { User, UserType } from '../../types';

export type ActionDemarrage = 'profil' | 'recherche' | 'fiche' | 'candidature' | 'appel';

export interface DefinitionAction {
  cle: ActionDemarrage;
  libelle: string;
  // Adresse ouverte par le lien ; absente pour « profil », qui ouvre une fenêtre sur place
  lien?: string;
}

export const ACTIONS_PORTEUR: DefinitionAction[] = [
  { cle: 'profil', libelle: 'Préciser mon profil' },
  { cle: 'recherche', libelle: 'Explorer les appels à projets', lien: '/aap/search' },
  { cle: 'fiche', libelle: "Consulter la fiche d'un appel", lien: '/aap/search' },
  { cle: 'candidature', libelle: 'Commencer une candidature', lien: '/aap/search' },
];

export const ACTIONS_FINANCEUR: DefinitionAction[] = [
  { cle: 'profil', libelle: 'Préciser mon organisation' },
  { cle: 'appel', libelle: 'Publier un premier appel à projets', lien: '/aap/nouveau' },
  { cle: 'recherche', libelle: 'Explorer les appels existants', lien: '/aap/search' },
  { cle: 'fiche', libelle: "Consulter la fiche d'un appel", lien: '/aap/search' },
];

export interface EtatDemarrage {
  actions: (DefinitionAction & { faite: boolean })[];
  faites: number;
  total: number;
  termine: boolean;
}

// État des actions d'un compte d'après users.demarrage (absent pour un compte neuf : rien n'est fait)
export function etatDemarrage(role: UserType, user: Pick<User, 'demarrage'> | null | undefined): EtatDemarrage {
  const definitions = role === 'financeur' ? ACTIONS_FINANCEUR : ACTIONS_PORTEUR;
  const actions = definitions.map(a => ({ ...a, faite: user?.demarrage?.[a.cle] === true }));
  const faites = actions.filter(a => a.faite).length;
  return { actions, faites, total: actions.length, termine: faites === actions.length };
}

// Trois champs de la fenêtre « Préciser mon profil » (transposition des « objectifs de financement », « année de
// fondation » et « envergure » de helloDarwin)
export const OBJETS_PROJET: Option[] = [
  { value: 'creation-places', label: 'Création ou extension de places' },
  { value: 'immobilier', label: 'Rénovation et immobilier' },
  { value: 'equipement', label: 'Équipement' },
  { value: 'numerique', label: "Numérique et systèmes d'information" },
  { value: 'prevention', label: 'Prévention et promotion de la santé' },
  { value: 'formation-attractivite', label: 'Formation et attractivité des métiers' },
  { value: 'recherche-innovation', label: 'Recherche et innovation' },
  { value: 'coordination-parcours', label: 'Coordination des parcours' },
  { value: 'qvt', label: 'Qualité de vie au travail' },
];

export const RAYONS_ACTION: Option[] = [
  { value: 'local', label: 'Local (commune, quartier)' },
  { value: 'departemental', label: 'Départemental' },
  { value: 'regional', label: 'Régional' },
  { value: 'national', label: 'National' },
];

// Année d'ouverture lisible : quatre chiffres entre 1800 et l'année courante ; sinon null (champ laissé vide)
export function anneeOuvertureValide(texte: string, anneeCourante = new Date().getFullYear()): number | null {
  if (!/^\d{4}$/.test(texte.trim())) return null;
  const annee = Number(texte.trim());
  return annee >= 1800 && annee <= anneeCourante ? annee : null;
}
