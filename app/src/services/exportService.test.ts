// Export des données personnelles (relecture adverse du chantier 50, 2026-11-27) : les conversations du compte
// (participants, titres, aperçu du dernier message) manquaient à l'export ; elles y entrent, lues par participant.
import { describe, expect, it, vi } from 'vitest';

const lectures = vi.hoisted(() => [] as unknown[][]);
vi.mock('../config/firebase', () => ({ db: {} }));
vi.mock('firebase/firestore', () => ({
  collection: (_db: unknown, nom: string) => nom,
  doc: () => ({}),
  getDoc: () => Promise.resolve({ exists: () => false }),
  getDocs: (q: unknown[]) => {
    lectures.push(q);
    return Promise.resolve({ docs: q[0] === 'conversations' ? [{ id: 'c2', data: () => ({ titre: 'Projet' }) }] : [] });
  },
  query: (nom: string, filtre: unknown[]) => [nom, ...filtre],
  where: (...a: unknown[]) => a,
  Timestamp: class {},
}));

import { exporterMesDonnees } from './exportService';

describe('export des données personnelles', () => {
  it('contient les conversations du compte', async () => {
    const utilisateur = { uid: 'p1', email: 'p1@test', emailVerified: true, metadata: {}, providerData: [] };
    const donnees = (await exporterMesDonnees(utilisateur as never, 'porteur')) as Record<string, unknown>;
    expect(lectures).toContainEqual(['conversations', 'participants', 'array-contains', 'p1']);
    expect(donnees.conversations).toEqual([{ id: 'c2', titre: 'Projet' }]);
  });
});
