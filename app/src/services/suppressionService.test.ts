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
          : q.source === 'messages'
            ? [{ ref: 'messages/m1' }]
            : q.source === 'conversations'
              ? [{ ref: 'conversations/c2' }]
              : [],
    }),
  deleteDoc: (ref: string) => (journal.push(`effacé ${ref}`), Promise.resolve()),
  updateDoc: (ref: string, donnees: Record<string, unknown>) => (
    journal.push(`modifié ${ref} ${JSON.stringify(donnees)}`), Promise.resolve()
  ),
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

  // Question 54 (« Effacer », 2026-11-27) : ses messages envoyés disparaissent, l'aperçu de ses conversations est vidé
  it('efface ses messages envoyés et vide l’aperçu de ses conversations, avant le compte de connexion', async () => {
    journal.length = 0;
    await supprimerMonCompte({ uid: 'p1' } as never, 'porteur');
    const rang = (ligne: string) => journal.indexOf(ligne);
    expect(rang('effacé messages/m1')).toBeGreaterThan(rang('effacé users/p1'));
    expect(rang('modifié conversations/c2 {"lastMessage":""}')).toBeGreaterThan(rang('effacé users/p1'));
    expect(rang('compte de connexion')).toBeGreaterThan(rang('effacé messages/m1'));
  });
});
