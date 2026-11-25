// Tests des libellés de territoire et de thématique (changement filtres-recherche, testés dans degel-application-complete 5.1).
import { describe, expect, it } from 'vitest';
import type { AAP } from '../types';
import {
  LIBELLES_TERRITOIRES,
  LIBELLES_THEMATIQUES,
  libelleTerritoire,
  thematique,
  valeursPresentes,
} from './territoires';

describe('libelleTerritoire', () => {
  it('traduit un identifiant connu et rend tel quel un identifiant inconnu', () => {
    expect(libelleTerritoire('ile-de-france')).toBe(LIBELLES_TERRITOIRES['ile-de-france']);
    expect(LIBELLES_TERRITOIRES['ile-de-france']).toMatch(/Île-de-France/);
    expect(libelleTerritoire('mayotte')).toBe(LIBELLES_TERRITOIRES['mayotte']);
    expect(libelleTerritoire('inconnu-xyz')).toBe('inconnu-xyz');
  });
});

describe('thematique : champ classé par le modèle', () => {
  const fiche = (champ?: string) =>
    ({ scrapeMetadata: champ ? { source: 's', signature: 'x', champ } : undefined }) as Pick<AAP, 'scrapeMetadata'>;

  it('santé et médico-social gardent leur identifiant, le reste devient « non-classee »', () => {
    expect(thematique(fiche('sante'))).toBe('sante');
    expect(thematique(fiche('medico-social'))).toBe('medico-social');
    expect(thematique(fiche(undefined))).toBe('non-classee');
    expect(thematique(fiche('incertain'))).toBe('non-classee');
    expect(LIBELLES_THEMATIQUES[thematique(fiche('incertain'))]).toBe('Non classée');
  });

  // Relecture du 2026-11-25 (constats 1, 17 et 37) : l'import écrit sectorsTargeted ["sante", "social"] sur toute fiche
  // collectée ; la décision 37 ne vise que les appels saisis à la main, sans bloc scrapeMetadata.
  it('une fiche importée « incertain » ou pas encore classée reste non classée malgré les secteurs de l import', () => {
    const importee = (champ?: string) => ({
      scrapeMetadata: { source: 's', signature: 'x', ...(champ ? { champ } : {}) },
      sectorsTargeted: ['sante', 'social'],
    });
    expect(thematique(importee('incertain'))).toBe('non-classee');
    expect(thematique(importee(undefined))).toBe('non-classee');
    expect(thematique(importee('medico-social'))).toBe('medico-social');
  });

  it('un appel saisi à la main tire sa thématique de ses secteurs ciblés (décision 37)', () => {
    expect(thematique({ scrapeMetadata: undefined, sectorsTargeted: ['sante', 'social'] })).toBe('sante');
    expect(thematique({ scrapeMetadata: undefined, sectorsTargeted: ['social'] })).toBe('medico-social');
    expect(thematique({ scrapeMetadata: undefined, sectorsTargeted: [] })).toBe('non-classee');
  });
});

describe('valeursPresentes : options de filtre construites à partir des fiches', () => {
  it('dédoublonne les identifiants et les trie par libellé', () => {
    expect(valeursPresentes(['normandie', 'bretagne', 'normandie'], libelleTerritoire)).toEqual([
      'bretagne',
      'normandie',
    ]);
    // « National, toute la France » (france) se range après Bretagne malgré l'ordre alphabétique des identifiants
    expect(valeursPresentes(['france', 'bretagne'], libelleTerritoire)).toEqual(['bretagne', 'france']);
  });
});
