// Libellés d'affichage des identifiants écrits par l'import (scripts/import_to_firestore.py, table REGIONS) et de la
// thématique (scrapeMetadata.champ, changement filtre-champ-sante). Pourquoi : les filtres de la recherche comparaient
// des libellés à des identifiants et ne renvoyaient rien (constat du 2026-10-14, changement filtres-recherche).
import { AAP } from '../types';

export const LIBELLES_TERRITOIRES: Record<string, string> = {
  'auvergne-rhone-alpes': 'Auvergne-Rhône-Alpes',
  'bourgogne-franche-comte': 'Bourgogne-Franche-Comté',
  bretagne: 'Bretagne',
  'centre-val-de-loire': 'Centre-Val de Loire',
  corse: 'Corse',
  'grand-est': 'Grand Est',
  'hauts-de-france': 'Hauts-de-France',
  'ile-de-france': 'Île-de-France',
  normandie: 'Normandie',
  'nouvelle-aquitaine': 'Nouvelle-Aquitaine',
  occitanie: 'Occitanie',
  'pays-de-la-loire': 'Pays de la Loire',
  'provence-alpes-cote-d-azur': "Provence-Alpes-Côte d'Azur",
  guadeloupe: 'Guadeloupe',
  martinique: 'Martinique',
  guyane: 'Guyane',
  'la-reunion': 'La Réunion',
  mayotte: 'Mayotte',
  france: 'National, toute la France',
  'non-precise': 'Territoire non précisé',
};

export const libelleTerritoire = (id: string): string => LIBELLES_TERRITOIRES[id] ?? id;

export const LIBELLES_THEMATIQUES: Record<string, string> = {
  sante: 'Santé',
  'medico-social': 'Médico-social',
  'non-classee': 'Non classée',
};

// Thématique d'une fiche pour le filtre : les fiches hors champ sont en brouillon et n'arrivent pas ici ;
// « incertain » et les fiches pas encore classées comptent comme non classées.
export const thematique = (aap: Pick<AAP, 'scrapeMetadata'>): string => {
  const champ = aap.scrapeMetadata?.champ;
  return champ === 'sante' || champ === 'medico-social' ? champ : 'non-classee';
};

// Liste triée des valeurs distinctes d'un champ, pour construire les options d'un filtre à partir des fiches.
export const valeursPresentes = (valeurs: string[], libelle: (v: string) => string = (v) => v): string[] =>
  Array.from(new Set(valeurs)).sort((a, b) => libelle(a).localeCompare(libelle(b), 'fr'));
