// Tests de la qualification côté application (changement qualification-appels, tâche 2.4).
import { describe, expect, it } from 'vitest';
import { correspondDestinataire, correspondTypeAppel, destinatairesDe, qualificationManuelle } from './qualification';

const q = (destinataires: string[], typeAppel = 'appel-a-projets') => ({
  qualification: { destinataires, typeAppel, objets: [], dateOuverture: null, par: 'modele', le: '2026-10-20' },
});

describe('correspondDestinataire', () => {
  it('cite le destinataire, ou « tous » ; un appel non qualifié n est pas écarté', () => {
    expect(correspondDestinataire(q(['public']), 'public')).toBe(true);
    expect(correspondDestinataire(q(['public']), 'prive-lucratif')).toBe(false);
    expect(correspondDestinataire(q(['tous']), 'prive-lucratif')).toBe(true);
    expect(correspondDestinataire({}, 'public')).toBe(true);
    expect(correspondDestinataire(q([]), 'public')).toBe(true);
    expect(correspondDestinataire(q(['public']), '')).toBe(true);
  });
});

describe('correspondTypeAppel et destinatairesDe', () => {
  it('compare le type, traduit les destinataires', () => {
    expect(correspondTypeAppel(q(['public'], 'ami'), 'ami')).toBe(true);
    expect(correspondTypeAppel(q(['public'], 'ami'), 'prix')).toBe(false);
    expect(correspondTypeAppel({}, '')).toBe(true);
    expect(destinatairesDe(q(['public', 'recherche']))).toEqual(['Établissements publics', 'Équipes de recherche']);
    expect(destinatairesDe({})).toEqual([]);
  });
});

describe('qualificationManuelle', () => {
  it('écarte les valeurs hors liste, valide la date, signe au nom donné', () => {
    const r = qualificationManuelle({ destinataires: ['public', 'inconnu'], typeAppel: 'bizarre', objets: ['qvt', 'x'], dateOuverture: '2026-13-45' }, 'Monsieur DUCOUT');
    expect(r.destinataires).toEqual(['public']);
    expect(r.typeAppel).toBe('autre');
    expect(r.objets).toEqual(['qvt']);
    expect(r.dateOuverture).toBeNull();
    expect(r.par).toBe('Monsieur DUCOUT');
    expect(qualificationManuelle({ destinataires: [], typeAppel: 'ami', objets: [], dateOuverture: '2026-11-02' }, 'x').dateOuverture).toBe('2026-11-02');
  });
});
