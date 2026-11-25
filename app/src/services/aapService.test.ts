// Appels saisis par un financeur (plan niveau A, lot 1.2, décision « Validation admin » du 2026-11-24) : l'appel naît
// « Proposée » et ne paraît qu'après validation par l'administrateur ; une modification par l'auteur le repasse
// « Proposée ». Firestore est remplacé par une doublure.
import { beforeEach, describe, expect, it, vi } from 'vitest';

const appels = vi.hoisted(() => ({ addDoc: vi.fn(), updateDoc: vi.fn() }));
vi.mock('../config/firebase', () => ({ db: {}, storage: {} }));
vi.mock('firebase/storage', () => ({
  ref: vi.fn(),
  uploadBytes: vi.fn(),
  getDownloadURL: vi.fn(),
  deleteObject: vi.fn(),
}));
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  doc: vi.fn(),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  deleteDoc: vi.fn(),
  deleteField: vi.fn(() => 'supprime'),
  addDoc: appels.addDoc,
  updateDoc: appels.updateDoc,
  Timestamp: { now: () => 'maintenant', fromDate: (d: Date) => d },
}));

import { aapService } from './aapService';

const donnees = { title: 'Appel', description: 'd', sectorsTargeted: [], territoriesEligible: [], deadline: null };

describe('appels saisis par un financeur', () => {
  beforeEach(() => {
    appels.addDoc.mockReset().mockResolvedValue({ id: 'nouvel-appel' });
    appels.updateDoc.mockReset().mockResolvedValue(undefined);
  });

  it('un appel créé naît « Proposée »', async () => {
    await aapService.createAap('f1', 'Financeur', donnees);
    expect(appels.addDoc.mock.calls[0][1].validation).toMatchObject({ statut: 'proposee', par: '' });
  });

  it('une modification ou une publication par l’auteur repasse l’appel « Proposée » ; par l’administrateur, non', async () => {
    await aapService.updateAap('a1', { title: 'Nouveau titre' }, true);
    await aapService.publishAap('a1', true);
    expect(appels.updateDoc.mock.calls[0][1].validation).toMatchObject({ statut: 'proposee' });
    expect(appels.updateDoc.mock.calls[1][1].validation).toMatchObject({ statut: 'proposee' });
    await aapService.updateAap('a1', { title: 'Corrigé par l’administrateur' }, false);
    expect(appels.updateDoc.mock.calls[2][1].validation).toBeUndefined();
  });
});
