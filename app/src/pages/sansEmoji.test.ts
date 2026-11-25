// Pas d'emoji dans les fichiers produits (règle du projet ; relecture du 2026-11-25, constat 36) : la fiche annonçait
// « il ne reste que n jours » derrière un emoji d'avertissement. Contrôle limité aux pages de ce lot ; les autres pages
// signalées (évaluation, inscription) relèvent d'un autre lot.
import { describe, expect, it } from 'vitest';
import fiche from './porteur/AapDetailPage.tsx?raw';
import formulaireAppel from './financeur/CreateAapPage.tsx?raw';

const EMOJI = /\p{Extended_Pictographic}/u;

describe('pages sans emoji', () => {
  it('ni la fiche ni le formulaire d’appel ne contiennent d’emoji', () => {
    const fautifs = Object.entries({ AapDetailPage: fiche, CreateAapPage: formulaireAppel })
      .filter(([, texte]) => EMOJI.test(texte))
      .map(([nom]) => nom);
    expect(fautifs).toEqual([]);
  });
});
