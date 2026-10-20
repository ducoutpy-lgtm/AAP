// Tests du parcours candidat (changement parcours-candidat-jour-1, tâche 1.1).
import { describe, expect, it } from 'vitest';
import { appelsPourProfil, aQuiSAdresse, colonneDe, echeancesProches, famillesDepuisCriteres, libelleMontant, repartirCandidatures } from './candidat';

const dans = (jours: number) => new Date(Date.now() + jours * 24 * 3600 * 1000);

describe('libelleMontant', () => {
  it('écrit le montant en français selon ce que la fiche porte', () => {
    expect(libelleMontant({ budgetMin: 10000, budgetMax: 50000 })).toMatch(/^De 10\s000 € à 50\s000 €$/);
    expect(libelleMontant({ budgetMax: 50000 })).toMatch(/^Jusqu'à 50\s000 €$/);
    expect(libelleMontant({ budgetMin: 5000 })).toMatch(/^À partir de 5\s000 €$/);
    expect(libelleMontant({ budgetTotal: 2000000 })).toMatch(/^Enveloppe 2\s000\s000 €$/);
    expect(libelleMontant({})).toBe('Montant non précisé');
  });
});

describe('aQuiSAdresse', () => {
  it('reprend les types éligibles sans doublon ni vide', () => {
    expect(aQuiSAdresse({ structureTypeEligible: ['EHPAD', ' EHPAD', '', 'Associations'] })).toEqual(['EHPAD', 'Associations']);
    expect(aQuiSAdresse({})).toEqual([]);
  });

  it('sans types structurés, lit les familles dans les critères', () => {
    expect(aQuiSAdresse({ eligibilityCriteria: '- Structures éligibles : associations loi 1901' })).toEqual(['Associations']);
    expect(famillesDepuisCriteres('Établissements publics de santé et ESPIC, EHPAD'))
      .toEqual(['Établissements publics', 'Privé non lucratif', 'Établissements de santé', 'Établissements médico-sociaux']);
    expect(famillesDepuisCriteres('Dossier à déposer avant le 30 juin')).toEqual([]);
  });
});

describe('appelsPourProfil et echeancesProches', () => {
  const aaps = [
    { id: 'national-loin', territoriesEligible: ['france'], deadline: dans(60) },
    { id: 'region-proche', territoriesEligible: ['normandie'], deadline: dans(10) },
    { id: 'autre-region', territoriesEligible: ['bretagne'], deadline: dans(5) },
    { id: 'region-clos', territoriesEligible: ['normandie'], deadline: dans(-1) },
    { id: 'region-sans-date', territoriesEligible: ['normandie'], deadline: null },
  ];

  it('garde la région et le national, écarte les clôturés, trie par clôture puis sans date', () => {
    expect(appelsPourProfil(aaps, 'normandie').map(a => a.id)).toEqual(['region-proche', 'national-loin', 'region-sans-date']);
  });

  it('sans région connue, garde tout ce qui est ouvert', () => {
    expect(appelsPourProfil(aaps, '').map(a => a.id)).toEqual(['autre-region', 'region-proche', 'national-loin', 'region-sans-date']);
  });

  it('échéances proches : 0 à 30 jours', () => {
    expect(echeancesProches(aaps).map(a => a.id)).toEqual(['region-proche', 'autre-region']);
  });
});

describe('colonnes des candidatures', () => {
  it('chaque statut tombe dans sa colonne, les inconnus en cours d examen', () => {
    expect(colonneDe('submitted')).toBe('envoyee');
    expect(colonneDe('pending_info')).toBe('complement');
    expect(colonneDe('accepted')).toBe('acceptee');
    expect(colonneDe('rejected')).toBe('refusee');
    expect(colonneDe('under_review')).toBe('examen');
    expect(colonneDe('shortlisted')).toBe('examen');
    const r = repartirCandidatures([{ status: 'submitted' }, { status: 'submitted' }, { status: 'accepted' }]);
    expect(r.envoyee).toHaveLength(2);
    expect(r.acceptee).toHaveLength(1);
    expect(r.refusee).toHaveLength(0);
  });
});
