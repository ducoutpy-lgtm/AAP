// Tests de la recherche guidée (changement recherche-guidee, tâche 1.1).
import { describe, expect, it } from 'vitest';
import {
  ajouterFicheConsultee, correspondTerritoire, etiquettesActives, FILTRES_VIDES, filtresDepuisParams,
  filtresDepuisProfil, montantAnnonce, paramsDepuisFiltres, statutAppel, totalMontants,
} from './recherche';

const dans = (jours: number) => new Date(Date.now() + jours * 24 * 3600 * 1000);

describe('statutAppel', () => {
  it('quatre valeurs d après la date de clôture', () => {
    expect(statutAppel({ deadline: null })).toBe('sans-date');
    expect(statutAppel({ deadline: dans(-1) })).toBe('clos');
    expect(statutAppel({ deadline: dans(10) })).toBe('bientot-clos');
    expect(statutAppel({ deadline: dans(30) })).toBe('bientot-clos');
    expect(statutAppel({ deadline: dans(45) })).toBe('ouvert');
  });
});

describe('montants', () => {
  it('enveloppe totale d abord, sinon plafond, sinon rien ; total et nombre de fiches chiffrées', () => {
    expect(montantAnnonce({ budgetTotal: 100000, budgetMax: 5000 })).toBe(100000);
    expect(montantAnnonce({ budgetMax: 5000 })).toBe(5000);
    expect(montantAnnonce({})).toBeNull();
    expect(totalMontants([{ budgetTotal: 100000 }, { budgetMax: 5000 }, {}])).toEqual({ total: 105000, chiffrees: 2 });
  });
});

describe('étiquettes et adresse', () => {
  it('une étiquette lisible par filtre actif, dans l ordre', () => {
    const e = etiquettesActives({ ...FILTRES_VIDES, q: 'ehpad', territory: 'normandie', statut: 'bientot-clos', budgetMin: '1000' });
    expect(e.map(x => x.cle)).toEqual(['q', 'territory', 'statut', 'budgetMin']);
    expect(e[1].libelle).toBe('Normandie');
    expect(e[2].libelle).toBe('Bientôt clôturé');
    expect(e[3].libelle).toMatch(/1\s000 €/);
    expect(etiquettesActives(FILTRES_VIDES)).toEqual([]);
  });

  it('les filtres font l aller-retour par l adresse, les vides n y figurent pas', () => {
    const f = { ...FILTRES_VIDES, territory: 'normandie', statut: 'ouvert' };
    const params = paramsDepuisFiltres(f);
    expect(params.toString()).toBe('territory=normandie&statut=ouvert');
    expect(filtresDepuisParams(new URLSearchParams('territory=normandie&statut=ouvert&inconnu=1'))).toEqual(f);
  });
});

describe('profil et territoire', () => {
  it('la région du profil devient le territoire ; sans région, rien', () => {
    expect(filtresDepuisProfil({ address: { city: 'Évry', postalCode: '91000', region: 'ile-de-france', country: 'France' } }))
      .toEqual({ territory: 'ile-de-france' });
    expect(filtresDepuisProfil(null)).toEqual({});
  });

  it('un appel national reste visible dans une région, pas une autre région', () => {
    expect(correspondTerritoire({ territoriesEligible: ['france'] }, 'normandie')).toBe(true);
    expect(correspondTerritoire({ territoriesEligible: ['bretagne'] }, 'normandie')).toBe(false);
    expect(correspondTerritoire({ territoriesEligible: ['normandie'] }, 'france')).toBe(false);
    expect(correspondTerritoire({ territoriesEligible: [] }, '')).toBe(true);
  });
});

describe('fiches consultées', () => {
  it('la plus récente en tête, sans doublon, vingt au plus', () => {
    expect(ajouterFicheConsultee(['a', 'b'], 'c')).toEqual(['c', 'a', 'b']);
    expect(ajouterFicheConsultee(['a', 'b'], 'b')).toEqual(['b', 'a']);
    const vingt = Array.from({ length: 20 }, (_, i) => `f${i}`);
    expect(ajouterFicheConsultee(vingt, 'nouveau')).toHaveLength(20);
    expect(ajouterFicheConsultee(vingt, 'nouveau')[0]).toBe('nouveau');
  });
});
