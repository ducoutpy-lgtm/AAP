// Tests des aides d'écriture Firestore (changement publication-appel-financeur, tâche 1.1).
import { describe, expect, it } from 'vitest';
import { deleteField } from 'firebase/firestore';
import { pourMiseAJour } from './firestore';

describe('pourMiseAJour', () => {
  it('un champ vidé devient deleteField(), les autres restent', () => {
    const r = pourMiseAJour({ titre: 'T', budgetMin: undefined });
    expect(r.titre).toBe('T');
    expect((r.budgetMin as ReturnType<typeof deleteField>).isEqual(deleteField())).toBe(true);
  });
});
