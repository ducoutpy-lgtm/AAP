// Tests de la mention de relecture (changement mention-relecture-fiches, testé dans degel-application-complete 5.1).
import { describe, expect, it } from 'vitest';
import type { AAP } from '../types';
import { dateExtraction, estRelue, formatDateFr, mentionRelecture, RELECTEUR_HUMAIN, visiblePubliquement } from './relecture';

const base: AAP = {
  financeurId: 'scraped',
  title: 'Appel test',
  description: 'd',
  sectorsTargeted: [],
  territoriesEligible: [],
  structureTypeEligible: [],
  requiredDocuments: [],
  externalUrl: 'https://exemple.fr/appel',
  tags: [],
  status: 'published',
  createdAt: new Date(),
  updatedAt: new Date(),
} as unknown as AAP;

const avec = (validation: AAP['validation'], extraitLe?: string): AAP =>
  ({ ...base, validation, scrapeMetadata: { source: 's', signature: 'x', extraitLe } }) as AAP;

describe('mentionRelecture : ce que lit le visiteur, déduit de validation', () => {
  it('rend « Contrôlée par le modèle » pour une validation au nom du modèle', () => {
    const m = mentionRelecture(avec({ statut: 'validee', commentaire: '', date: '2026-10-15', par: 'claude-haiku-5-5' }));
    expect(m?.libelle).toBe('Contrôlée par le modèle');
    expect(m?.variant).toBe('primary');
    expect(m?.detail).toContain('claude-haiku-5-5');
    expect(m?.detail).toContain('15/10/2026');
  });

  it('rend « Relue par Monsieur DUCOUT » pour un verdict humain', () => {
    const m = mentionRelecture(avec({ statut: 'validee', commentaire: '', date: '2026-10-20', par: RELECTEUR_HUMAIN }));
    expect(m?.libelle).toBe(`Relue par ${RELECTEUR_HUMAIN}`);
    expect(m?.variant).toBe('success');
  });

  it('rend « Non relue » pour une fiche proposée ou à corriger', () => {
    expect(mentionRelecture(avec({ statut: 'proposee', commentaire: '', date: '', par: '' }))?.libelle).toMatch(/^Non relue/);
    expect(mentionRelecture(avec({ statut: 'a_corriger', commentaire: 'c', date: '', par: 'x' }))?.variant).toBe('warning');
  });

  it('ne dit rien pour un appel saisi à la main ou une fiche rejetée', () => {
    expect(mentionRelecture(base)).toBeNull();
    expect(mentionRelecture(avec({ statut: 'rejetee', commentaire: '', date: '', par: 'm' }))).toBeNull();
  });
});

describe('estRelue et dates', () => {
  it('estRelue ne garde que les fiches validées, humaines ou modèle', () => {
    expect(estRelue(avec({ statut: 'validee', commentaire: '', date: '', par: 'm' }))).toBe(true);
    expect(estRelue(avec({ statut: 'proposee', commentaire: '', date: '', par: '' }))).toBe(false);
    expect(estRelue(base)).toBe(false);
  });

  it('formatDateFr et dateExtraction rendent une date française, ou rien si inconnue', () => {
    expect(formatDateFr('2026-10-19T10:12:00')).toBe('19/10/2026');
    expect(formatDateFr('n importe quoi')).toBe('n importe quoi');
    expect(dateExtraction(avec(undefined, '2026-10-19T10:12:00'))).toBe('19/10/2026');
    expect(dateExtraction(base)).toBeNull();
  });
});

describe('visiblePubliquement', () => {
  it('validée ou sans bloc validation : visible ; proposée, à corriger, rejetée : invisible', () => {
    expect(visiblePubliquement({ validation: undefined })).toBe(true);
    expect(visiblePubliquement({ validation: { statut: 'validee', commentaire: '', date: '', par: 'modele' } })).toBe(true);
    expect(visiblePubliquement({ validation: { statut: 'proposee', commentaire: '', date: '', par: '' } })).toBe(false);
    expect(visiblePubliquement({ validation: { statut: 'a_corriger', commentaire: '', date: '', par: '' } })).toBe(false);
    expect(visiblePubliquement({ validation: { statut: 'rejetee', commentaire: '', date: '', par: '' } })).toBe(false);
  });
});
