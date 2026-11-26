// Mention de relecture d'une fiche scrapée (changement mention-relecture-fiches, instruction 11 du rapport de
// critique, 2026-10-19). Une seule règle pour la liste et la fiche : validation.statut est la seule source de
// fiabilité (lot 0), validation.par dit qui a tranché (Monsieur DUCOUT ou un modèle depuis le 2026-10-15).
import { AAP } from '../types';

export const RELECTEUR_HUMAIN = 'Monsieur DUCOUT';

export interface MentionRelecture {
  libelle: string;
  variant: 'success' | 'primary' | 'warning';
  // Précision affichée après le libellé : relecteur et date du verdict, quand ils existent
  detail: string;
}

// Rien pour un appel saisi à la main (pas de bloc validation) ; « rejetée » n'arrive jamais ici (fiche archivée).
export function mentionRelecture(aap: AAP): MentionRelecture | null {
  const v = aap.validation;
  if (!v) return null;
  const quand = v.date ? ` le ${formatDateFr(v.date)}` : '';
  if (v.statut === 'validee') {
    if (v.par === RELECTEUR_HUMAIN) {
      return { libelle: `Relue par ${RELECTEUR_HUMAIN}`, variant: 'success', detail: quand };
    }
    return { libelle: 'Contrôlée par le modèle', variant: 'primary', detail: `${v.par ? ` (${v.par})` : ''}${quand}` };
  }
  if (v.statut === 'proposee' || v.statut === 'a_corriger') {
    return { libelle: 'Non relue : informations extraites automatiquement', variant: 'warning', detail: '' };
  }
  return null;
}

// Filtre « fiches relues ou contrôlées seulement » : validée, par un humain ou par le modèle (décision du 2026-10-15).
export function estRelue(aap: AAP): boolean {
  return aap.validation?.statut === 'validee';
}

// Visibilité publique (administration-controle, décision du 2026-10-20) : un candidat ne voit qu'une fiche contrôlée
// (validée) ou saisie à la main par un financeur (sans bloc validation). Les fiches proposées ou à corriger restent
// dans l'espace d'administration jusqu'au verdict.
export function visiblePubliquement(aap: Pick<AAP, 'validation'>): boolean {
  return !aap.validation || aap.validation.statut === 'validee';
}

// Date à laquelle le moteur a lu la page (scrapeMetadata.extraitLe, posé par l'import), ou null si inconnue.
export function dateExtraction(aap: AAP): string | null {
  const brut = aap.scrapeMetadata?.extraitLe;
  return brut ? formatDateFr(brut) : null;
}

// « 2026-10-19T10:12:00 » ou « 2026-10-19 » -> « 19/10/2026 » ; une valeur illisible est rendue telle quelle.
export function formatDateFr(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : iso;
}

// Fiches cochées réellement traitées par l'action groupée de /admin/aaps (corrections-relecture 2.3, 2026-11-20) : mêmes
// conditions que les boutons unitaires. Valider ignore les fiches sans contrôle, déjà validées, archivées (les rejetées
// le sont) ou clôturées ; rejeter ignore les fiches sans contrôle ou déjà rejetées.
export function selectionATraiter(
  fiches: (Pick<AAP, 'status' | 'validation'> & { id: string })[],
  verdict: 'validee' | 'rejetee',
): { aTraiter: string[]; ignorees: number } {
  const garder = (a: Pick<AAP, 'status' | 'validation'>) =>
    Boolean(a.validation) &&
    (verdict === 'validee'
      ? a.validation!.statut !== 'validee' && a.status !== 'archived' && a.status !== 'closed'
      : a.validation!.statut !== 'rejetee');
  const aTraiter = fiches.filter(garder).map((a) => a.id);
  return { aTraiter, ignorees: fiches.length - aTraiter.length };
}

// Fiche classée hors champ par le modèle (étiquette posée par l'import ou champ de scrapeMetadata) : la valider demande
// une confirmation qui le dit (selection-des-appels, 2026-11-26).
export function horsChamp(fiche: Pick<AAP, 'tags' | 'scrapeMetadata'>): boolean {
  return (fiche.tags ?? []).includes('hors-champ') || fiche.scrapeMetadata?.champ === 'hors-champ';
}

// Phrase ajoutée à la confirmation de validation (vide quand aucune fiche n'est hors champ)
export function messageHorsChamp(fiches: Pick<AAP, 'tags' | 'scrapeMetadata'>[]): string {
  const n = fiches.filter(horsChamp).length;
  if (n === 0) return '';
  return n === 1
    ? ' Attention : 1 fiche est classée hors champ par le modèle.'
    : ` Attention : ${n} fiches sont classées hors champ par le modèle.`;
}
