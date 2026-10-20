// Tests du parcours d'intégration (changement parcours-integration, tâche 1.1).
import { describe, expect, it } from 'vitest';
import {
  etapeComplete,
  PARCOURS_VIDE,
  profilFinanceurDepuisParcours,
  profilPorteurDepuisParcours,
  regionDepuisCodePostal,
  TYPES_ETABLISSEMENT,
} from './parcours';

describe('regionDepuisCodePostal', () => {
  it('déduit la région des codes postaux de métropole, de Corse et d outre-mer', () => {
    expect(regionDepuisCodePostal('91000')).toBe('ile-de-france');
    expect(regionDepuisCodePostal('75014')).toBe('ile-de-france');
    expect(regionDepuisCodePostal('20000')).toBe('corse');
    expect(regionDepuisCodePostal('20200')).toBe('corse');
    expect(regionDepuisCodePostal('97200')).toBe('martinique');
    expect(regionDepuisCodePostal('97400')).toBe('la-reunion');
    expect(regionDepuisCodePostal('59000')).toBe('hauts-de-france');
  });

  it('laisse la région vide pour un code incomplet ou inconnu', () => {
    expect(regionDepuisCodePostal('910')).toBe('');
    expect(regionDepuisCodePostal('')).toBe('');
    expect(regionDepuisCodePostal('99000')).toBe('');
    expect(regionDepuisCodePostal('98000')).toBe('');
  });
});

describe('etapeComplete', () => {
  const structure = { ...PARCOURS_VIDE, nom: 'EHPAD Les Lilas', forme: 'association', ville: 'Évry', codePostal: '91000' };

  it('écran 1 : nom, forme, ville et code postal à cinq chiffres obligatoires', () => {
    expect(etapeComplete(1, PARCOURS_VIDE, 'porteur')).toBe(false);
    expect(etapeComplete(1, { ...structure, codePostal: '9100' }, 'porteur')).toBe(false);
    expect(etapeComplete(1, structure, 'porteur')).toBe(true);
  });

  it('écran 2 porteur : type d établissement et au moins un public', () => {
    expect(etapeComplete(2, structure, 'porteur')).toBe(false);
    expect(etapeComplete(2, { ...structure, typeEtablissement: 'ehpad' }, 'porteur')).toBe(false);
    expect(etapeComplete(2, { ...structure, typeEtablissement: 'ehpad', publics: ['personnes-agees'] }, 'porteur')).toBe(true);
  });

  it('écran 2 financeur : un secteur et la personne de contact', () => {
    expect(etapeComplete(2, { ...structure, secteurs: ['sante'] }, 'financeur')).toBe(false);
    expect(etapeComplete(2, { ...structure, secteurs: ['sante'], prenom: 'Anne', nomContact: 'Martin' }, 'financeur')).toBe(true);
  });
});

describe('profils construits depuis le parcours', () => {
  it('porteur : région déduite, champs hérités compatibles, nouveaux champs présents', () => {
    const p = profilPorteurDepuisParcours(
      { ...PARCOURS_VIDE, nom: ' EHPAD Les Lilas ', forme: 'association', ville: 'Évry', codePostal: '91000',
        typeEtablissement: 'ehpad', taille: '51-200', budget: '2m-10m', publics: ['personnes-agees'] },
      'u1', 'p@exemple.fr'
    );
    expect(p.structureName).toBe('EHPAD Les Lilas');
    expect(p.address.region).toBe('ile-de-france');
    expect(p.secteurActivite).toBe('sante');
    expect(p.domainesIntervention).toEqual([]);
    expect(p.typeEtablissement).toBe('ehpad');
    expect(p.tailleTranche).toBe('51-200');
    expect(p.budgetTranche).toBe('2m-10m');
    expect(p.publics).toEqual(['personnes-agees']);
    expect(p.contactPerson.email).toBe('p@exemple.fr');
  });

  it('financeur : organisation, secteurs et contact ; fonction absente enregistrée null', () => {
    const f = profilFinanceurDepuisParcours(
      { ...PARCOURS_VIDE, nom: 'Fondation Test', forme: 'fondation', ville: 'Paris', codePostal: '75008',
        secteurs: ['sante', 'social'], prenom: 'Anne', nomContact: 'Martin' },
      'u2', 'a@exemple.fr'
    );
    expect(f.organisationType).toBe('fondation');
    expect(f.sectorsSupported).toEqual(['sante', 'social']);
    expect(f.contactPerson.position).toBeNull();
    expect(f.address.region).toBe('ile-de-france');
  });

  it('les types d établissement ont des identifiants uniques', () => {
    const ids = TYPES_ETABLISSEMENT.flatMap(g => g.options.map(o => o.value));
    expect(new Set(ids).size).toBe(ids.length);
  });
});
