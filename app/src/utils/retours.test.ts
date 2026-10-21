// Tests des retours des testeurs (changement mise-en-ligne-testeurs, tâche 1.1).
import { describe, expect, it } from 'vitest';
import { controlerMessage, lesPlusRecents, pageDepuis, type Retour } from './retours';

describe('retours des testeurs', () => {
  it('contrôle du message', () => {
    expect(controlerMessage('   petit   ')).toContain("(5 pour l'instant)"); // espaces superflus retirés avant de compter
    expect(controlerMessage('court')).toContain('au moins 10');
    expect(controlerMessage('La date de clôture manque sur cette fiche')).toBeNull();
    expect(controlerMessage('a'.repeat(4001))).toContain('trop long');
  });

  it('page concernée depuis la page précédente', () => {
    expect(pageDepuis('http://localhost:3001/aap/abc', 'http://localhost:3001')).toBe('/aap/abc');
    expect(pageDepuis('http://localhost:3001/retour', 'http://localhost:3001')).toBe('');
    expect(pageDepuis('https://ailleurs.fr/page', 'http://localhost:3001')).toBe('');
    expect(pageDepuis(undefined, 'http://localhost:3001')).toBe('');
  });

  it('les plus récents d’abord', () => {
    const r = (id: string, jour: number): Retour => ({ id, userId: 'u', role: 'porteur', email: 'a@b', type: 'idee', page: '/', message: 'x'.repeat(12), le: new Date(2026, 9, jour) });
    expect(lesPlusRecents([r('a', 1), r('b', 9), r('c', 5)], 2).map(x => x.id)).toEqual(['b', 'c']);
  });
});
