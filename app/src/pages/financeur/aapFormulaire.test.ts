// Tests de l'aller-retour appel -> formulaire -> données (changement profil-et-edition-aap, tâche 1.1).
import { describe, expect, it } from 'vitest';
import type { AAP } from '../../types';
import { donneesDepuisFormulaire, erreursEtape, formulaireDepuisAap, FORMULAIRE_VIDE } from './aapFormulaire';

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
    expect(formulaireDepuisAap({ ...appel, deadline: null, tags: undefined })).toMatchObject({
      deadline: '',
      tags: '',
    });
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

  // corrections-relecture 1.4 (2026-11-20) : une date invalide faisait échouer l'écriture (« Invalid time value »)
  it('date de clôture vide : échéance nulle, pas une date invalide', () => {
    expect(donneesDepuisFormulaire({ ...FORMULAIRE_VIDE, title: 'T' }).deadline).toBeNull();
  });

  it('ignore les champs vides et les étiquettes vides', () => {
    const d = donneesDepuisFormulaire({ ...FORMULAIRE_VIDE, title: 'T', tags: 'a, , b,' });
    expect(d.tags).toEqual(['a', 'b']);
    expect(d.budgetMin).toBeUndefined();
    expect(d.externalUrl).toBeUndefined();
  });
});

// Plan niveau A, lot 3.4 (2026-11-25) : la page ne contrôlait que la présence d'une date ; un minimum supérieur au
// maximum, un montant négatif ou une date passée passaient, et tout échec donnait le même message vague.
describe('erreursEtape', () => {
  const valide = {
    ...FORMULAIRE_VIDE,
    title: 'Soutien aux maisons de santé',
    description: 'x'.repeat(100),
    sectorsTargeted: ['sante'],
    territoriesEligible: ['bretagne'],
    budgetMin: '5000',
    budgetMax: '20000',
    deadline: '2026-12-31',
    contactEmail: 'contact@exemple.fr',
  };
  const AUJOURDHUI = '2026-11-25';

  it('formulaire valide : aucune erreur, à chaque étape', () => {
    for (const etape of [0, 1, 2, 3, 4]) expect(erreursEtape(etape, valide, AUJOURDHUI)).toEqual({});
  });
  it('étape 1 : titre court, description courte, lien qui n’est pas une adresse web', () => {
    const e = erreursEtape(
      0,
      { ...valide, title: 'Court', description: 'Trop court', externalUrl: 'javascript:alert(1)' },
      AUJOURDHUI,
    );
    expect(Object.keys(e).sort()).toEqual(['description', 'externalUrl', 'title']);
    expect(e.description).toMatch(/100 caractères/);
  });
  it('étape 2 : au moins un secteur et un territoire', () => {
    expect(
      Object.keys(erreursEtape(1, { ...valide, sectorsTargeted: [], territoriesEligible: [] }, AUJOURDHUI)).sort(),
    ).toEqual(['sectorsTargeted', 'territoriesEligible']);
  });
  it('étape 3 : montant négatif, minimum supérieur au maximum, date d’hier ou absente', () => {
    expect(erreursEtape(2, { ...valide, budgetTotal: '-1' }, AUJOURDHUI)).toHaveProperty('budgetTotal');
    expect(erreursEtape(2, { ...valide, budgetMin: '30000', budgetMax: '20000' }, AUJOURDHUI)).toHaveProperty(
      'budgetMax',
    );
    expect(erreursEtape(2, { ...valide, deadline: '2026-11-24' }, AUJOURDHUI).deadline).toMatch(/passée/);
    expect(erreursEtape(2, { ...valide, deadline: '2026-11-25' }, AUJOURDHUI)).toEqual({});
    expect(erreursEtape(2, { ...valide, deadline: '' }, AUJOURDHUI)).toHaveProperty('deadline');
  });
  it('étape 4 : adresse électronique invalide', () => {
    expect(erreursEtape(3, { ...valide, contactEmail: 'contact' }, AUJOURDHUI)).toHaveProperty('contactEmail');
  });
});
