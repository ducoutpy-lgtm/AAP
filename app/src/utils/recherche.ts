// Logique de la recherche guidée (changement recherche-guidee, 2026-10-20, point 3 du relevé helloDarwin) : statut à
// quatre valeurs, total des montants, étiquettes des filtres actifs, filtres dans l'adresse de la page, filtres d'après
// le profil, fiches consultées. Pourquoi un fichier à part : testable par Vitest sans React ni Firebase.
import type { AAP, PorteurProfile } from '../types';
import { datesDAbord, getDaysUntilDeadline } from './deadline';
import { libelleTerritoire, LIBELLES_THEMATIQUES, thematique } from './territoires';
import { correspondDestinataire, correspondTypeAppel, libelleDestinataire, libelleTypeAppel } from './qualification';

export interface FiltresRecherche {
  q: string;
  thematique: string;
  territory: string;
  financeur: string;
  source: string;
  relecture: string;
  statut: string;
  budgetMin: string;
  budgetMax: string;
  // Qualification (jour 2 du plan MVP) : à qui s'adresse l'appel, type d'appel
  destinataire: string;
  typeAppel: string;
}

export const FILTRES_VIDES: FiltresRecherche = {
  q: '', thematique: '', territory: '', financeur: '', source: '', relecture: '', statut: '', budgetMin: '', budgetMax: '',
  destinataire: '', typeAppel: '',
};

export type StatutAppel = 'ouvert' | 'bientot-clos' | 'clos' | 'sans-date';

export const LIBELLES_STATUT: Record<StatutAppel, string> = {
  ouvert: 'Ouvert',
  'bientot-clos': 'Bientôt clôturé',
  clos: 'Clôturé',
  'sans-date': 'Date non précisée',
};

export const SEUIL_BIENTOT_CLOS_JOURS = 30;

// Statut d'après la date de clôture : clôturé si passée, bientôt clôturé à 30 jours ou moins, sans date sinon ouvert.
export function statutAppel(aap: Pick<AAP, 'deadline'>): StatutAppel {
  const jours = getDaysUntilDeadline(aap.deadline);
  if (jours === null) return 'sans-date';
  if (jours < 0) return 'clos';
  if (jours <= SEUIL_BIENTOT_CLOS_JOURS) return 'bientot-clos';
  return 'ouvert';
}

// Pièce de candidature que le stockage a refusée (facturation Firebase fermée) : la candidature part quand même, la
// pièce est notée « non déposée » pour que le candidat l'adresse au financeur (parcours-candidat-sans-impasse).
export function pieceNonDeposee(file: Pick<File, 'name' | 'type'>) {
  return { name: file.name, url: '', type: file.type, uploadedAt: new Date(), nonDeposee: true };
}

// Filtre de statut (changement appels-clos-masques, 2026-11-13) : sans choix, les appels clos sont masqués ;
// « tous » les montre aussi ; sinon le statut choisi seulement.
export const STATUT_TOUS = 'tous';
export function garderSelonStatut(aap: Pick<AAP, 'deadline'>, statut: string): boolean {
  if (statut === STATUT_TOUS) return true;
  if (!statut) return statutAppel(aap) !== 'clos';
  return statutAppel(aap) === statut;
}

// Montant annoncé d'une fiche : enveloppe totale si connue, sinon plafond par projet, sinon rien
export function montantAnnonce(aap: Pick<AAP, 'budgetTotal' | 'budgetMax'>): number | null {
  if (aap.budgetTotal != null && aap.budgetTotal > 0) return aap.budgetTotal;
  if (aap.budgetMax != null && aap.budgetMax > 0) return aap.budgetMax;
  return null;
}

export function totalMontants(aaps: Pick<AAP, 'budgetTotal' | 'budgetMax'>[]): { total: number; chiffrees: number } {
  let total = 0;
  let chiffrees = 0;
  for (const aap of aaps) {
    const m = montantAnnonce(aap);
    if (m !== null) {
      total += m;
      chiffrees += 1;
    }
  }
  return { total, chiffrees };
}

export const euros = (n: number): string => `${Math.round(n).toLocaleString('fr-FR')} €`;

export interface Etiquette {
  cle: keyof FiltresRecherche;
  libelle: string;
}

// Étiquettes des filtres actifs, dans l'ordre d'affichage des filtres
export function etiquettesActives(f: FiltresRecherche): Etiquette[] {
  const e: Etiquette[] = [];
  if (f.q) e.push({ cle: 'q', libelle: `« ${f.q} »` });
  if (f.thematique) e.push({ cle: 'thematique', libelle: LIBELLES_THEMATIQUES[f.thematique] ?? f.thematique });
  if (f.territory) e.push({ cle: 'territory', libelle: libelleTerritoire(f.territory) });
  if (f.financeur) e.push({ cle: 'financeur', libelle: f.financeur });
  if (f.source) e.push({ cle: 'source', libelle: `Source : ${f.source}` });
  if (f.relecture === 'relues') e.push({ cle: 'relecture', libelle: 'Fiches relues ou contrôlées' });
  if (f.statut) e.push({ cle: 'statut', libelle: f.statut === STATUT_TOUS ? 'Clôturés compris' : LIBELLES_STATUT[f.statut as StatutAppel] ?? f.statut });
  if (f.destinataire) e.push({ cle: 'destinataire', libelle: libelleDestinataire(f.destinataire) });
  if (f.typeAppel) e.push({ cle: 'typeAppel', libelle: libelleTypeAppel(f.typeAppel) });
  if (f.budgetMin) e.push({ cle: 'budgetMin', libelle: `Budget min. ${euros(Number(f.budgetMin))}` });
  if (f.budgetMax) e.push({ cle: 'budgetMax', libelle: `Budget max. ${euros(Number(f.budgetMax))}` });
  return e;
}

// Adresse <-> filtres : seuls les filtres non vides sont inscrits, dans l'ordre des clés
export function filtresDepuisParams(params: URLSearchParams): FiltresRecherche {
  const f = { ...FILTRES_VIDES };
  for (const cle of Object.keys(FILTRES_VIDES) as (keyof FiltresRecherche)[]) {
    f[cle] = params.get(cle) ?? '';
  }
  return f;
}

export function paramsDepuisFiltres(f: FiltresRecherche): URLSearchParams {
  const params = new URLSearchParams();
  for (const cle of Object.keys(FILTRES_VIDES) as (keyof FiltresRecherche)[]) {
    if (f[cle]) params.set(cle, f[cle]);
  }
  return params;
}

// Filtres d'après le profil d'un porteur : sa région pour l'instant (seul champ comparable aux fiches aujourd'hui)
export function filtresDepuisProfil(profil: Pick<PorteurProfile, 'address'> | null | undefined): Partial<FiltresRecherche> {
  const region = profil?.address?.region;
  return region ? { territory: region } : {};
}

// Un appel national est éligible dans chaque région : le filtre territoire le garde, sauf si « national » est choisi
export function correspondTerritoire(aap: Pick<AAP, 'territoriesEligible'>, territoire: string): boolean {
  const t = aap.territoriesEligible ?? [];
  if (!territoire) return true;
  if (t.includes(territoire)) return true;
  return territoire !== 'france' && territoire !== 'non-precise' && t.includes('france');
}

// Fiches consultées sur ce navigateur : vingt identifiants, la plus récente en tête ; mémoire du navigateur protégée
// (navigation privée, stockage bloqué) : en cas d'échec, rien n'est mémorisé et la liste est vide.
export const CLE_FICHES_CONSULTEES = 'aap-fiches-consultees';
const MAX_FICHES_CONSULTEES = 20;

export function ajouterFicheConsultee(liste: string[], id: string): string[] {
  return [id, ...liste.filter(x => x !== id)].slice(0, MAX_FICHES_CONSULTEES);
}

export function fichesConsultees(): string[] {
  try {
    const brut = localStorage.getItem(CLE_FICHES_CONSULTEES);
    const liste = brut ? JSON.parse(brut) : [];
    return Array.isArray(liste) ? liste.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

export function memoriserFicheConsultee(id: string): void {
  try {
    localStorage.setItem(CLE_FICHES_CONSULTEES, JSON.stringify(ajouterFicheConsultee(fichesConsultees(), id)));
  } catch {
    // stockage indisponible : commodité perdue, rien d'autre
  }
}

// Filtrage de /aap/search sorti de la page (alertes-recherches-sauvegardees, 2026-11-16) pour que le courriel du lundi
// applique la même règle : copie Python dans scraping/alertes.py (correspond), cas communs dans
// cas_filtres_recherche.json. L'ordre d'entrée est conservé ; le tri (montants, dates) reste dans la page.
type AppelFiltrable = Pick<AAP, 'title' | 'description' | 'financeurName' | 'territoriesEligible' | 'deadline' |
  'scrapeMetadata' | 'qualification' | 'budgetMin' | 'budgetMax'>;
export function filtrerAppels<T extends AppelFiltrable>(aaps: T[], f: FiltresRecherche): T[] {
  const terme = f.q.toLowerCase();
  const min = f.budgetMin ? parseFloat(f.budgetMin) : null;
  const max = f.budgetMax ? parseFloat(f.budgetMax) : null;
  return aaps.filter(aap =>
    (!terme || aap.title.toLowerCase().includes(terme) || aap.description.toLowerCase().includes(terme) ||
      (aap.financeurName || 'Non spécifié').toLowerCase().includes(terme)) &&
    (!f.thematique || thematique(aap) === f.thematique) &&
    correspondTerritoire(aap, f.territory) &&
    garderSelonStatut(aap, f.statut) &&
    correspondDestinataire(aap, f.destinataire) &&
    correspondTypeAppel(aap, f.typeAppel) &&
    (!f.financeur || (aap.financeurName || 'Non spécifié') === f.financeur) &&
    (min === null || aap.budgetMax == null || aap.budgetMax >= min) &&
    (max === null || aap.budgetMin == null || aap.budgetMin <= max));
}

// Liste affichée par /aap/search (2026-11-20) : calculée à chaque rendu au lieu d'être recopiée dans un état par un
// effet, qui laissait un rendu avec l'ancienne liste. Avec un filtre de montant, les fiches chiffrées passent d'abord ;
// les appels sans date de clôture restent après les datés (réponse Q4, 2026-10-14).
export function resultatsRecherche<T extends AppelFiltrable>(aaps: T[], f: FiltresRecherche): T[] {
  let result = filtrerAppels(aaps, f);
  if (f.budgetMin || f.budgetMax) {
    const chiffree = (aap: T) => aap.budgetMin != null || aap.budgetMax != null;
    result = [...result.filter(chiffree), ...result.filter(aap => !chiffree(aap))];
  }
  return datesDAbord(result);
}

// Recherche sauvegardée (alertes-recherches-sauvegardees) : l'adresse de /aap/search, pour que « Lancer » rouvre les
// mêmes résultats et que le courriel du lundi applique les mêmes filtres. Seule fréquence tenue : chaque lundi.
export function rechercheAEnregistrer(f: FiltresRecherche, userId: string) {
  const params = paramsDepuisFiltres(f).toString();
  if (!params) return null;
  const name = etiquettesActives(f).map(e => e.libelle).join(' · ');
  return { userId, name, params, alertEnabled: true, frequency: 'weekly' as const };
}
