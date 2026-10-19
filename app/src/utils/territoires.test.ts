// Tests des libellés de territoire et de thématique (changement filtres-recherche, testés dans degel-application-complete 5.1).
import { describe, expect, it } from 'vitest';
import type { AAP } from '../types';
import { LIBELLES_TERRITOIRES, LIBELLES_THEMATIQUES, libelleTerritoire, thematique, valeursPresentes } from './territoires';

describe('libelleTerritoire', () => {
  it('traduit un identifiant connu et rend tel quel un identifiant inconnu', () => {
    expect(libelleTerritoire('ile-de-france')).toBe(LIBELLES_TERRITOIRES['ile-de-france']);
    expect(LIBELLES_TERRITOIRES['ile-de-france']).toMatch(/Île-de-France/);
    expect(libelleTerritoire('mayotte')).toBe(LIBELLES_TERRITOIRES['mayotte']);
    expect(libelleTerritoire('inconnu-xyz')).toBe('inconnu-xyz');
  });
});

describe('thematique : champ classé par le modèle', () => {
  const fiche = (champ?: string) => ({ scrapeMetadata: champ ? { source: 's', signature: 'x', champ } : undefined }) as Pick<AAP, 'scrapeMetadata'>;

  it('santé et médico-social gardent leur identifiant, le reste devient « non-classee »', () => {
    expect(thematique(fiche('sante'))).toBe('sante');
    expect(thematique(fiche('medico-social'))).toBe('medico-social');
    expect(thematique(fiche(undefined))).toBe('non-classee');
    expect(thematique(fiche('incertain'))).toBe('non-classee');
    expect(LIBELLES_THEMATIQUES[thematique(fiche('incertain'))]).toBe('Non classée');
  });
});

describe('valeursPresentes : options de filtre construites à partir des fiches', () => {
  it('dédoublonne les identifiants et les trie par libellé', () => {
    expect(valeursPresentes(['normandie', 'bretagne', 'normandie'], libelleTerritoire)).toEqual(['bretagne', 'normandie']);
    // « National, toute la France » (france) se range après Bretagne malgré l'ordre alphabétique des identifiants
    expect(valeursPresentes(['france', 'bretagne'], libelleTerritoire)).toEqual(['bretagne', 'france']);
  });
});
