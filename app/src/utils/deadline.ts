import { Timestamp } from 'firebase/firestore';

// Helper partagé par la liste, la fiche et l'administration (spec consultation-aap-scrapes) :
// un AAP dont la clôture est passée affiche « Clôturé », jamais un nombre négatif ; un AAP sans date de
// clôture (deadline null, réponse Q4 du rapport du 2026-10-14) affiche « Date de clôture non précisée »,
// n'est jamais « Clôturé » et se classe après les AAP datés.

export const SANS_DATE = 'Date de clôture non précisée';

// null = pas de date de clôture connue
export const getDaysUntilDeadline = (deadline: Date | Timestamp | null | undefined): number | null => {
  if (!deadline) return null;
  const deadlineDate = deadline instanceof Date ? deadline : deadline.toDate();
  const diff = deadlineDate.getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
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
