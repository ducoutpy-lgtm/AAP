// Tests du parcours candidat (changement parcours-candidat-jour-1, tâche 1.1).
import { describe, expect, it } from 'vitest';
import { candidatureSurSiteOfficiel, suiviCandidatureExterne, candidatureOuverte, ficheConsultable } from './candidat';

describe('suiviCandidatureExterne (suivi-candidature-externe)', () => {
  it('note une candidature déposée sur le site officiel, sans prétendre la transmettre', () => {
    const suivi = suiviCandidatureExterne({ id: 'a1', title: 'AAP EHPAD', financeurId: 'scraped' }, 'p1');
    expect(suivi).toMatchObject({ aapId: 'a1', aapTitle: 'AAP EHPAD', porteurId: 'p1', financeurId: 'scraped',
      projectTitle: 'AAP EHPAD', status: 'submitted', externe: true, documents: [] });
    expect(suivi.projectDescription).toContain('site officiel');
  });
});

describe('candidatureSurSiteOfficiel (candidature-site-officiel, question 21)', () => {
  it("renvoie au site officiel pour une fiche importée qui a une adresse, au formulaire sinon", () => {
    expect(candidatureSurSiteOfficiel({ source: 'scraped', financeurId: 'scraped', externalUrl: 'https://ars.fr/aap' })).toBe(true);
    expect(candidatureSurSiteOfficiel({ financeurId: 'scraped', externalUrl: 'https://ars.fr/aap' })).toBe(true);
    expect(candidatureSurSiteOfficiel({ source: 'manual', financeurId: 'f1', externalUrl: '' })).toBe(false);
    expect(candidatureSurSiteOfficiel({ source: 'scraped', financeurId: 'scraped', externalUrl: '' })).toBe(false);
  });
});
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

  it('la qualification prime sur les types lus et les critères', () => {
    expect(aQuiSAdresse({ structureTypeEligible: ['EHPAD'], qualification: { destinataires: ['public', 'tous'], typeAppel: 'ami', objets: [], dateOuverture: null, par: 'm', le: '' } }))
      .toEqual(['Établissements publics', 'Toute structure']);
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

// Appel clos (corrections-relecture 2.1, 2026-11-20) : la fiche montrait « Candidatures fermées » mais gardait le bouton
// « Candidater », et le formulaire envoyait la candidature au financeur après la clôture.
describe('candidatureOuverte', () => {
  const jours = (n: number) => new Date(Date.now() + n * 24 * 3600 * 1000);
  it('appel publié avant sa date : ouvert ; sans date : ouvert', () => {
    expect(candidatureOuverte({ status: 'published', deadline: jours(10) })).toBe(true);
    expect(candidatureOuverte({ status: 'published', deadline: null })).toBe(true);
  });
  it('date passée : fermé', () => {
    expect(candidatureOuverte({ status: 'published', deadline: jours(-2) })).toBe(false);
  });
  it('appel clôturé, archivé ou brouillon : fermé, même avant sa date', () => {
    for (const status of ['closed', 'archived', 'draft'] as const) {
      expect(candidatureOuverte({ status, deadline: jours(10) })).toBe(false);
    }
  });
});

// Plan niveau A, lot 3.4 (2026-11-25) : une fiche proposée, en brouillon ou archivée s'ouvrait par son adresse directe et
// acceptait une candidature. Un candidat ne lit que les fiches de la recherche ; l'administrateur et l'auteur, toutes.
describe('ficheConsultable', () => {
  const PROPOSEE = { statut: 'proposee' as const, commentaire: '', date: '2026-11-25', par: '' };
  const VALIDEE = { ...PROPOSEE, statut: 'validee' as const };
  it('candidat : appel publié ou clôturé et contrôlé seulement', () => {
    expect(ficheConsultable({ status: 'published', validation: VALIDEE, financeurId: 'f1' }, 'porteur', 'p1')).toBe(true);
    expect(ficheConsultable({ status: 'closed', validation: VALIDEE, financeurId: 'f1' }, 'porteur', 'p1')).toBe(true);
    expect(ficheConsultable({ status: 'published', validation: PROPOSEE, financeurId: 'f1' }, 'porteur', 'p1')).toBe(false);
    expect(ficheConsultable({ status: 'draft', financeurId: 'f1' }, 'porteur', 'p1')).toBe(false);
    expect(ficheConsultable({ status: 'archived', validation: VALIDEE, financeurId: 'scraped' }, 'financeur', 'f2')).toBe(false);
  });
  it('administrateur et financeur auteur : toutes leurs fiches, pour l’aperçu', () => {
    expect(ficheConsultable({ status: 'draft', validation: PROPOSEE, financeurId: 'scraped' }, 'admin', 'a1')).toBe(true);
    expect(ficheConsultable({ status: 'draft', validation: PROPOSEE, financeurId: 'f1' }, 'financeur', 'f1')).toBe(true);
  });
  it('candidature fermée sur une fiche non contrôlée, même publiée', () => {
    expect(candidatureOuverte({ status: 'published', deadline: null, validation: PROPOSEE })).toBe(false);
  });
});
