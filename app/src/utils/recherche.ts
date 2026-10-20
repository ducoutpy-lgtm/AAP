// Logique de la recherche guidée (changement recherche-guidee, 2026-10-20, point 3 du relevé helloDarwin) : statut à
// quatre valeurs, total des montants, étiquettes des filtres actifs, filtres dans l'adresse de la page, filtres d'après
// le profil, fiches consultées. Pourquoi un fichier à part : testable par Vitest sans React ni Firebase.
import type { AAP, PorteurProfile } from '../types';
import { getDaysUntilDeadline } from './deadline';
import { libelleTerritoire, LIBELLES_THEMATIQUES } from './territoires';

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
}

export const FILTRES_VIDES: FiltresRecherche = {
  q: '', thematique: '', territory: '', financeur: '', source: '', relecture: '', statut: '', budgetMin: '', budgetMax: '',
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
  if (f.statut) e.push({ cle: 'statut', libelle: LIBELLES_STATUT[f.statut as StatutAppel] ?? f.statut });
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
