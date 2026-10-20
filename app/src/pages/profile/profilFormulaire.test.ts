// Tests du pré-remplissage des formulaires de profil (changement profil-et-edition-aap, tâche 1.1).
import { describe, expect, it } from 'vitest';
import type { FinanceurProfile, PorteurProfile } from '../../types';
import { formulaireFinanceurDepuisProfil, formulairePorteurDepuisProfil } from './profilFormulaire';

describe('formulairePorteurDepuisProfil', () => {
  it('reprend chaque valeur enregistrée, les nombres en texte, les absences en vide', () => {
    const profil: PorteurProfile = {
      userId: 'u1',
      structureName: 'EHPAD Les Lilas',
      siret: '12345678900012',
      structureType: 'association',
      secteurActivite: 'sante',
      domainesIntervention: ['sante', 'social'],
      address: { city: 'Evry', postalCode: '91000', region: 'ile-de-france', country: 'France' },
      contactPerson: { firstName: 'Pierre', lastName: 'Durand', email: 'p@exemple.fr', phone: undefined },
      teamSize: 12,
      updatedAt: new Date('2026-10-01'),
    };
    const f = formulairePorteurDepuisProfil(profil);
    expect(f.structureName).toBe('EHPAD Les Lilas');
    expect(f.teamSize).toBe('12');
    expect(f.phone).toBe('');
    expect(f.website).toBe('');
    expect(f.region).toBe('ile-de-france');
    expect(f.domainesIntervention).toEqual(['sante', 'social']);
  });

  it('un profil antérieur au parcours a les nouveaux champs vides ; un profil du parcours les reprend', () => {
    const ancien: PorteurProfile = {
      userId: 'u1', structureName: 'X', structureType: 'association', secteurActivite: 'sante',
      domainesIntervention: [], updatedAt: new Date('2026-10-01'),
    };
    expect(formulairePorteurDepuisProfil(ancien).typeEtablissement).toBe('');
    expect(formulairePorteurDepuisProfil(ancien).publics).toEqual([]);
    const nouveau: PorteurProfile = {
      ...ancien, typeEtablissement: 'ehpad', tailleTranche: '51-200', budgetTranche: null, publics: ['personnes-agees'],
    };
    const f = formulairePorteurDepuisProfil(nouveau);
    expect(f.typeEtablissement).toBe('ehpad');
    expect(f.tailleTranche).toBe('51-200');
    expect(f.budgetTranche).toBe('');
    expect(f.publics).toEqual(['personnes-agees']);
  });
});

describe('formulaireFinanceurDepuisProfil', () => {
  it('reprend l organisation, les secteurs et la personne de contact', () => {
    const profil: FinanceurProfile = {
      userId: 'u2',
      organisationName: 'Fondation Test',
      organisationType: 'fondation',
      sectorsSupported: ['sante'],
      contactPerson: { firstName: 'Anne', lastName: 'Martin', email: 'a@exemple.fr', position: 'Directrice' },
      website: 'https://exemple.fr',
      updatedAt: new Date('2026-10-01'),
    };
    const f = formulaireFinanceurDepuisProfil(profil);
    expect(f.organisationName).toBe('Fondation Test');
    expect(f.position).toBe('Directrice');
    expect(f.city).toBe('');
    expect(f.website).toBe('https://exemple.fr');
  });
});
