// Tests des textes réutilisables (changement textes-reutilisables, question 23 (b), 2026-11-19).
import { describe, expect, it } from 'vitest';
import { ajouterTexte, LIBELLES_TEXTES, textesRemplis } from './textesReutilisables';

describe('textes réutilisables', () => {
  it('ajoute le texte avec son intitulé, après ce qui est déjà écrit', () => {
    expect(ajouterTexte('', 'presentation', ' EHPAD de 80 places. ')).toBe(
      'Présentation de la structure : EHPAD de 80 places.',
    );
    expect(ajouterTexte('Ateliers de répit.', 'moyens', 'Deux animatrices.')).toBe(
      'Ateliers de répit.\n\nMoyens humains et matériels : Deux animatrices.',
    );
  });

  it('ne garde que les textes remplis, dans l ordre des intitulés', () => {
    expect(Object.keys(LIBELLES_TEXTES)).toEqual(['presentation', 'references', 'moyens']);
    expect(textesRemplis({ moyens: 'Deux animatrices', references: '  ', presentation: 'EHPAD' })).toEqual([
      ['presentation', 'EHPAD'],
      ['moyens', 'Deux animatrices'],
    ]);
    expect(textesRemplis(undefined)).toEqual([]);
  });
});
