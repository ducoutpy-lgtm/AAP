// Tests de la recherche guidée (changement recherche-guidee, tâche 1.1).
import { describe, expect, it } from 'vitest';
import {
  ajouterFicheConsultee, correspondTerritoire, etiquettesActives, FILTRES_VIDES, filtresDepuisParams,
  filtresDepuisProfil, garderSelonStatut, montantAnnonce, paramsDepuisFiltres, pieceNonDeposee,
  statutAppel, totalMontants, filtrerAppels, rechercheAEnregistrer, resultatsRecherche,
} from './recherche';
import cas from './cas_filtres_recherche.json';
import type { AAP } from '../types';

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

describe('pieceNonDeposee (parcours-candidat-sans-impasse)', () => {
  it("garde la trace d'une pièce que le stockage a refusée", () => {
    const p = pieceNonDeposee({ name: 'dossier.pdf', type: 'application/pdf' } as File);
    expect(p).toMatchObject({ name: 'dossier.pdf', url: '', type: 'application/pdf', nonDeposee: true });
  });
});

describe('statut par défaut (appels-clos-masques)', () => {
  it('masque les clos sans filtre, les montre avec « tous » ou « clos »', () => {
    expect(garderSelonStatut({ deadline: dans(-1) }, '')).toBe(false);
    expect(garderSelonStatut({ deadline: dans(10) }, '')).toBe(true);
    expect(garderSelonStatut({ deadline: null }, '')).toBe(true);
    expect(garderSelonStatut({ deadline: dans(-1) }, 'tous')).toBe(true);
    expect(garderSelonStatut({ deadline: dans(-1) }, 'clos')).toBe(true);
    expect(garderSelonStatut({ deadline: dans(45) }, 'clos')).toBe(false);
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

// Cas communs avec scraping/alertes.py (changement alertes-recherches-sauvegardees, tâche 1.1) : si la règle Python et
// la règle TypeScript divergent, un des deux jeux de tests échoue.
describe('filtrerAppels (cas communs)', () => {
  const fiches = cas.fiches.map(f => ({
    id: f.id, title: f.title, description: f.description, financeurName: f.financeurName ?? undefined,
    territoriesEligible: f.territoriesEligible,
    deadline: f.deadline_jours === null ? null : dans(f.deadline_jours),
    scrapeMetadata: f.champ ? { champ: f.champ } : undefined,
    qualification: { destinataires: f.destinataires, typeAppel: f.typeAppel },
    budgetMin: f.budgetMin ?? undefined, budgetMax: f.budgetMax ?? undefined,
    sectorsTargeted: (f as { sectorsTargeted?: string[] }).sectorsTargeted ?? [],
  })) as unknown as (AAP & { id: string })[];
  for (const c of cas.cas) {
    it(c.nom, () => {
      const filtres = filtresDepuisParams(new URLSearchParams(c.params));
      expect(filtrerAppels(fiches, filtres).map(f => f.id)).toEqual(c.attendus);
    });
  }
});

describe('rechercheAEnregistrer (alertes-recherches-sauvegardees, 2.1)', () => {
  it('aucun filtre : rien à enregistrer', () => {
    expect(rechercheAEnregistrer(FILTRES_VIDES, 'u1')).toBeNull();
  });
  it('garde l adresse de la recherche, alerte du lundi active', () => {
    const r = rechercheAEnregistrer({ ...FILTRES_VIDES, territory: 'ile-de-france', thematique: 'medico-social' }, 'u1');
    expect(r).toEqual({ userId: 'u1', name: 'Médico-social · Île-de-France', params: 'thematique=medico-social&territory=ile-de-france', alertEnabled: true, frequency: 'weekly' });
  });
  it('sans nom : nom tiré des étiquettes', () => {
    expect(rechercheAEnregistrer({ ...FILTRES_VIDES, q: 'chutes', territory: 'france' }, 'u1')?.name).toBe('« chutes » · National, toute la France');
  });
});

// Liste affichée par /aap/search, calculée au lieu d'être un état recopié par un effet (2026-11-20) : même ordre
// qu'avant, montants chiffrés d'abord quand un filtre de montant est posé, puis appels datés avant les appels sans date.
describe('resultatsRecherche (ordre de la liste affichée)', () => {
  const fiche = (id: string, jours: number | null, budgetMax?: number) => ({
    id, title: id, description: '', financeurName: 'F', territoriesEligible: ['france'],
    deadline: jours === null ? null : dans(jours), budgetMax,
  }) as unknown as AAP & { id: string };
  const fiches = [fiche('sans-date-chiffree', null, 5000), fiche('datee', 60), fiche('datee-chiffree', 90, 8000)];

  it('sans filtre de montant : appels datés d abord, ordre d arrivée conservé', () => {
    expect(resultatsRecherche(fiches, FILTRES_VIDES).map(f => f.id)).toEqual(['datee', 'datee-chiffree', 'sans-date-chiffree']);
  });
  it('avec un filtre de montant : chiffrés d abord parmi les datés, puis parmi les sans date', () => {
    const filtres = { ...FILTRES_VIDES, budgetMin: '1000' };
    expect(resultatsRecherche(fiches, filtres).map(f => f.id)).toEqual(['datee-chiffree', 'datee', 'sans-date-chiffree']);
  });
  it('les fiches écartées par les filtres ne figurent pas', () => {
    expect(resultatsRecherche(fiches, { ...FILTRES_VIDES, q: 'chiffree' }).map(f => f.id)).toEqual(['datee-chiffree', 'sans-date-chiffree']);
  });
});
