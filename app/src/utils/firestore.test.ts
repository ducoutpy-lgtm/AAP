// Tests des aides d'écriture Firestore (changement publication-appel-financeur, tâche 1.1).
import { describe, expect, it } from 'vitest';
import { deleteField } from 'firebase/firestore';
import { pourMiseAJour, sansIndefinis } from './firestore';

describe('sansIndefinis', () => {
  it('retire les champs undefined, garde null, 0, chaîne vide et tableaux', () => {
    expect(sansIndefinis({ titre: 'T', budgetMin: undefined, budgetMax: 0, note: null, tags: [], url: '' }))
      .toEqual({ titre: 'T', budgetMax: 0, note: null, tags: [], url: '' });
  });
});

describe('pourMiseAJour', () => {
  it('un champ vidé devient deleteField(), les autres restent', () => {
    const r = pourMiseAJour({ titre: 'T', budgetMin: undefined });
    expect(r.titre).toBe('T');
    expect((r.budgetMin as ReturnType<typeof deleteField>).isEqual(deleteField())).toBe(true);
  });
});
