// Affichage des dates de clôture (constat 4 de la relecture du plan niveau A, 2026-11-25). Une date de clôture est
// enregistrée à minuit UTC (import, formulaire du financeur) et désigne un jour du calendrier (décision 38). Lue en heure
// locale, elle tombait la veille à l'ouest de Greenwich : « Clôture le 30 novembre » aux Antilles pour un appel du
// 1er décembre, alors que le décompte (getDaysUntilDeadline) le donnait ouvert jusqu'au 1er au soir. Le jour est donc lu
// en UTC, partout où une clôture s'affiche.
import type { Timestamp } from 'firebase/firestore';

// Date de clôture en français, lue en UTC. Les options sont celles de toLocaleDateString ; le fuseau est toujours UTC.
export const formatDateCloture = (date: Date | Timestamp, options: Intl.DateTimeFormatOptions = {}): string => {
  const d = date instanceof Date ? date : date.toDate();
  return d.toLocaleDateString('fr-FR', { ...options, timeZone: 'UTC' });
};

// Calendrier : la case d'un jour (jour local du visiteur) porte les clôtures de ce jour du calendrier (jour UTC)
export const memeJourCloture = (cloture: Date, jour: Date): boolean =>
  cloture.getUTCFullYear() === jour.getFullYear() &&
  cloture.getUTCMonth() === jour.getMonth() &&
  cloture.getUTCDate() === jour.getDate();

// Calendrier : bornes de la lecture des clôtures d'un mois affiché (mois local), du 1er à minuit UTC au dernier jour inclus
export const bornesMoisCloture = (mois: Date): { debut: Date; fin: Date } => ({
  debut: new Date(Date.UTC(mois.getFullYear(), mois.getMonth(), 1)),
  fin: new Date(Date.UTC(mois.getFullYear(), mois.getMonth() + 1, 1) - 1),
});
