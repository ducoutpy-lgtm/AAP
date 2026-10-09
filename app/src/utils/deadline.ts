import { Timestamp } from 'firebase/firestore';

// Helper partagé par la liste et la fiche d'un AAP (spec consultation-aap-scrapes) :
// un AAP dont la clôture est passée doit afficher « Clôturé », jamais un nombre négatif.

export const getDaysUntilDeadline = (deadline: Date | Timestamp): number => {
  const deadlineDate = deadline instanceof Date ? deadline : deadline.toDate();
  const diff = deadlineDate.getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

export const isClosed = (daysLeft: number): boolean => daysLeft < 0;

// Libellé court pour la liste : « Clôturé », « 1 jour », « 12 jours »
export const deadlineLabel = (daysLeft: number): string => {
  if (isClosed(daysLeft)) return 'Clôturé';
  return `${daysLeft} jour${daysLeft > 1 ? 's' : ''}`;
};
