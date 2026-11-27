// Suppression du compte (décision « Effacer avec le compte » du 2026-11-27, RGPD) : les marques de vue du compte
// (aap/{id}/vues/{uid}) sont effacées après son document users (les règles l'exigent) et avant son compte de connexion.
import { describe, expect, it, vi } from 'vitest';

const journal = vi.hoisted(() => [] as string[]);
vi.mock('../config/firebase', () => ({ db: {} }));
vi.mock('firebase/auth', () => ({ deleteUser: () => (journal.push('compte de connexion'), Promise.resolve()) }));
vi.mock('firebase/firestore', () => ({
  collection: (_db: unknown, nom: string) => nom,
  collectionGroup: (_db: unknown, nom: string) => `groupe:${nom}`,
  doc: (_db: unknown, ...chemin: string[]) => chemin.join('/'),
  query: (source: string, ...filtres: unknown[]) => ({ source, filtres }),
  where: (...a: unknown[]) => a,
  getDocs: (q: { source: string }) =>
    Promise.resolve({
      docs:
        q.source === 'groupe:vues'
          ? [{ ref: 'aap/a1/vues/p1' }, { ref: 'aap/a2/vues/p1' }]
          : [],
    }),
  deleteDoc: (ref: string) => (journal.push(`effacé ${ref}`), Promise.resolve()),
  updateDoc: () => Promise.resolve(),
}));

import { supprimerMonCompte } from './suppressionService';

describe('suppression du compte', () => {
  it('efface les marques de vue après le document users et avant le compte de connexion', async () => {
    await supprimerMonCompte({ uid: 'p1' } as never, 'porteur');
    const rang = (ligne: string) => journal.indexOf(ligne);
    expect(rang('effacé aap/a1/vues/p1')).toBeGreaterThan(rang('effacé users/p1'));
    expect(rang('effacé aap/a2/vues/p1')).toBeGreaterThan(rang('effacé users/p1'));
    expect(rang('compte de connexion')).toBeGreaterThan(rang('effacé aap/a2/vues/p1'));
  });
});
