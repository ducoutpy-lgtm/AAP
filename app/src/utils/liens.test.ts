// Liens sûrs (plan niveau A, lot 1.3, 2026-11-24) : l'adresse d'un appel est saisie par un financeur ou lue sur une page
// collectée ; un lien « javascript: » ou « data: » s'exécutait au clic.
import { describe, expect, it } from 'vitest';
import { lienSur } from './liens';

describe('lienSur', () => {
  it('garde les adresses web', () => {
    expect(lienSur('https://www.ars.sante.fr/appel')).toBe('https://www.ars.sante.fr/appel');
    expect(lienSur('http://exemple.fr')).toBe('http://exemple.fr');
  });
  it('refuse tout autre schéma, et le vide', () => {
    for (const lien of ['javascript:alert(1)', ' JavaScript:alert(1)', 'data:text/html,<b>x</b>', 'vbscript:x', '', undefined, null]) {
      expect(lienSur(lien)).toBeUndefined();
    }
  });
});
