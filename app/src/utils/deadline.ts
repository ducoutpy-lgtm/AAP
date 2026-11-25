import { Timestamp } from 'firebase/firestore';

// Helper partagé par la liste, la fiche et l'administration (spec consultation-aap-scrapes) :
// un AAP dont la clôture est passée affiche « Clôturé », jamais un nombre négatif ; un AAP sans date de
// clôture (deadline null, réponse Q4 du rapport du 2026-10-14) affiche « Date de clôture non précisée »,
// n'est jamais « Clôturé » et se classe après les AAP datés.

export const SANS_DATE = 'Date de clôture non précisée';

// Jours avant la clôture, en jours du calendrier (décision 38 du 2026-11-24) : la date de clôture est enregistrée à
// minuit UTC (import, formulaire du financeur) et désigne un jour du calendrier, comparé à la date du jour du visiteur.
// L'appel reste ouvert tout son dernier jour, en métropole comme outre-mer (avant : décompte en heures depuis minuit UTC,
// « Clôturé » dès 20 h le dernier jour aux Antilles). Même règle dans scraping/alertes.py et l'import.
// null = pas de date de clôture connue
export const getDaysUntilDeadline = (deadline: Date | Timestamp | null | undefined, maintenant = new Date()): number | null => {
  if (!deadline) return null;
  const d = deadline instanceof Date ? deadline : deadline.toDate();
  const cloture = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  const aujourdhui = Date.UTC(maintenant.getFullYear(), maintenant.getMonth(), maintenant.getDate());
  return Math.round((cloture - aujourdhui) / (1000 * 60 * 60 * 24));
};

export const isClosed = (daysLeft: number | null): boolean => daysLeft !== null && daysLeft < 0;

// Libellé court pour la liste : « Clôturé », « 1 jour », « 12 jours », ou la mention sans date
export const deadlineLabel = (daysLeft: number | null): string => {
  if (daysLeft === null) return SANS_DATE;
  if (isClosed(daysLeft)) return 'Clôturé';
  return `${daysLeft} jour${daysLeft > 1 ? 's' : ''}`;
};

// Tri stable : les AAP datés d'abord, dans leur ordre d'origine, puis ceux sans date de clôture
export const datesDAbord = <T extends { deadline: Date | Timestamp | null }>(aaps: T[]): T[] => [
  ...aaps.filter(aap => aap.deadline),
  ...aaps.filter(aap => !aap.deadline),
];

// Urgence d'une échéance pour le calendrier (corrections-relecture 3.3, 2026-11-20) : un appel clos est « passé », jamais
// urgent ; sinon urgent sous 7 jours, moyen sous 30 jours.
export type UrgenceEcheance = 'passee' | 'high' | 'medium' | 'low';
export const urgenceEcheance = (daysLeft: number): UrgenceEcheance =>
  isClosed(daysLeft) ? 'passee' : daysLeft <= 7 ? 'high' : daysLeft <= 30 ? 'medium' : 'low';
