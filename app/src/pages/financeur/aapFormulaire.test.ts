// Tests de l'aller-retour appel -> formulaire -> données (changement profil-et-edition-aap, tâche 1.1).
import { describe, expect, it } from 'vitest';
import type { AAP } from '../../types';
import { donneesDepuisFormulaire, formulaireDepuisAap, FORMULAIRE_VIDE } from './aapFormulaire';

const appel: AAP = {
  financeurId: 'f1',
  title: 'Soutien aux maisons de santé',
  description: 'Description longue de l appel.',
  sectorsTargeted: ['sante'],
  territoriesEligible: ['bretagne', 'normandie'],
  budgetMin: 5000,
  budgetMax: 20000,
  deadline: new Date('2026-12-31'),
  eligibilityCriteria: 'Structures de soins',
  contactEmail: 'contact@exemple.fr',
  tags: ['soins', 'territoire'],
  status: 'published',
  createdAt: new Date('2026-10-01'),
  updatedAt: new Date('2026-10-01'),
};

describe('formulaireDepuisAap', () => {
  it('pré-remplit chaque champ du formulaire, la date au format du navigateur, les étiquettes jointes', () => {
    const f = formulaireDepuisAap(appel);
    expect(f.title).toBe(appel.title);
    expect(f.deadline).toBe('2026-12-31');
    expect(f.budgetMin).toBe('5000');
    expect(f.budgetTotal).toBe('');
    expect(f.tags).toBe('soins, territoire');
    expect(f.evaluationCriteria).toBe('');
  });

  it('laisse la date vide quand la clôture n est pas précisée', () => {
    expect(formulaireDepuisAap({ ...appel, deadline: null, tags: undefined })).toMatchObject({ deadline: '', tags: '' });
  });
});

describe('donneesDepuisFormulaire', () => {
  it('retrouve les valeurs de l appel après un aller-retour', () => {
    const d = donneesDepuisFormulaire(formulaireDepuisAap(appel));
    expect(d.title).toBe(appel.title);
    expect(d.deadline).toEqual(new Date('2026-12-31'));
    expect(d.budgetMin).toBe(5000);
    expect(d.budgetMax).toBe(20000);
    expect(d.budgetTotal).toBeUndefined();
    expect(d.tags).toEqual(['soins', 'territoire']);
    expect(d.evaluationCriteria).toBeUndefined();
    expect(d.contactEmail).toBe('contact@exemple.fr');
  });

  it('ignore les champs vides et les étiquettes vides', () => {
    const d = donneesDepuisFormulaire({ ...FORMULAIRE_VIDE, title: 'T', tags: 'a, , b,' });
    expect(d.tags).toEqual(['a', 'b']);
    expect(d.budgetMin).toBeUndefined();
    expect(d.externalUrl).toBeUndefined();
  });
});
