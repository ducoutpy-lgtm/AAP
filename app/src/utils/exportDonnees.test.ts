// Tests de l'export des données personnelles (changement export-donnees-personnelles, tâche 1.1).
import { describe, expect, it } from 'vitest';
import { Timestamp } from 'firebase/firestore';
import { nomFichierExport, pourExport, SUR_DEMANDE_AU_DPO } from './exportDonnees';

describe('pourExport', () => {
  it('dates Firestore et JavaScript en ISO 8601, tableaux et objets parcourus, autres valeurs gardées', () => {
    const quand = new Date('2026-11-16T09:30:00.000Z');
    expect(
      pourExport({
        createdAt: Timestamp.fromDate(quand),
        le: quand,
        budget: { total: 18000, saisiLe: Timestamp.fromDate(quand) },
        documents: [{ nom: 'statuts.pdf', depose: Timestamp.fromDate(quand) }, 'texte'],
        vide: null,
        actif: true,
      }),
    ).toEqual({
      createdAt: '2026-11-16T09:30:00.000Z',
      le: '2026-11-16T09:30:00.000Z',
      budget: { total: 18000, saisiLe: '2026-11-16T09:30:00.000Z' },
      documents: [{ nom: 'statuts.pdf', depose: '2026-11-16T09:30:00.000Z' }, 'texte'],
      vide: null,
      actif: true,
    });
  });
});

describe('nomFichierExport', () => {
  it('date du jour dans le nom', () => {
    expect(nomFichierExport(new Date(2026, 10, 16, 23, 50))).toBe('mes-donnees-aap-sante-2026-11-16.json');
  });
});

describe('SUR_DEMANDE_AU_DPO', () => {
  it('nomme les données que le compte ne lit pas lui-même', () => {
    expect(SUR_DEMANDE_AU_DPO).toEqual(['journal des actions', 'retours de test', 'messages du formulaire de contact']);
  });
});
