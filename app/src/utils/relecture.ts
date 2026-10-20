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
