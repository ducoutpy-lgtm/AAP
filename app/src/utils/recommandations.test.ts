// Tests des recommandations depuis le profil (changement recommandations-profil, semaine 2 du plan, 2026-11-13).
import { describe, expect, it } from 'vitest';
import { champDuProfil, destinatairesDuProfil, evaluerAppel, manquesDuProfil, recommander, regionDuProfil } from './recommandations';

const dans = (jours: number) => new Date(Date.now() + jours * 24 * 3600 * 1000);
const ehpad = {
  structureType: 'association', typeEtablissement: 'ehpad', objetsProjet: ['prevention'],
  address: { street: '', city: '', postalCode: '91000', region: 'ile-de-france' },
};
const appel = (id: string, modifs: Record<string, unknown> = {}) => ({
  id, territoriesEligible: ['ile-de-france'], deadline: dans(60), validation: { statut: 'validee' },
  qualification: undefined, structureTypeEligible: undefined, scrapeMetadata: undefined, ...modifs,
}) as never;

describe('profil', () => {
  it('déduit le statut, la région et le champ, et dit ce qui manque', () => {
    expect(destinatairesDuProfil('association')).toEqual(['prive-non-lucratif']);
    expect(destinatairesDuProfil('exercice-coordonne')).toEqual([]);
    expect(regionDuProfil({ address: { street: '', city: '', postalCode: '76000', region: '' } } as never)).toBe('normandie');
    expect(champDuProfil('ehpad')).toBe('medico-social');
    expect(champDuProfil('mco')).toBe('sante');
    expect(manquesDuProfil({} as never)).toEqual(['région', 'statut juridique', "type d'établissement"]);
    expect(manquesDuProfil(ehpad as never)).toEqual([]);
  });
});

describe('evaluerAppel', () => {
  it('garde la région avec sa raison, écarte une autre région, un appel clos ou non contrôlé', () => {
    const r = evaluerAppel(appel('a'), ehpad as never);
    expect(r?.points).toBe(3);
    expect(r?.raisons).toContain('Appel de votre région (Île-de-France)');
    expect(evaluerAppel(appel('b', { territoriesEligible: ['bretagne'] }), ehpad as never)).toBeNull();
    expect(evaluerAppel(appel('c', { deadline: dans(-2) }), ehpad as never)).toBeNull();
    expect(evaluerAppel(appel('d', { validation: { statut: 'proposee' } }), ehpad as never)).toBeNull();
  });

  it('compare le statut aux destinataires de l\'appel', () => {
    const ouvert = evaluerAppel(appel('a', { qualification: { destinataires: ['prive-non-lucratif', 'public'], objets: [] } }), ehpad as never);
    expect(ouvert?.points).toBe(6);
    expect(ouvert?.raisons).toContain('Ouvert aux Privé non lucratif (associations, fondations, ESPIC), votre statut');
    expect(evaluerAppel(appel('b', { qualification: { destinataires: ['recherche'], objets: [] } }), ehpad as never)).toBeNull();
    const tous = evaluerAppel(appel('c', { qualification: { destinataires: ['tous'], objets: [] } }), ehpad as never);
    expect(tous?.raisons).toContain('Ouvert à toute structure');
    expect(evaluerAppel(appel('d'), ehpad as never)?.aVerifier).toContain("À qui s'adresse l'appel : non précisé");
  });

  it("compare le type d'établissement, les objets et le champ", () => {
    const cite = evaluerAppel(appel('a', { structureTypeEligible: ['EHPAD', 'autre'] }), ehpad as never);
    expect(cite?.raisons).toContain("Cite votre type d'établissement (EHPAD)");
    expect(evaluerAppel(appel('b', { structureTypeEligible: ['IME', 'MAS'] }), ehpad as never)).toBeNull();
    const objets = evaluerAppel(appel('c', { qualification: { destinataires: [], objets: ['prevention'] } }), ehpad as never);
    expect(objets?.raisons.some(r => r.startsWith('Finance : '))).toBe(true);
    const champ = evaluerAppel(appel('d', { scrapeMetadata: { champ: 'medico-social' } }), ehpad as never);
    expect(champ?.raisons).toContain('Appel du médico-social, comme votre établissement');
  });

  it('écarte un champ ou un objet qui contredit le profil, garde une fiche sans domaine avec réserve', () => {
    const recherche = { destinataires: ['prive-non-lucratif'], objets: ['recherche-innovation'] };
    expect(evaluerAppel(appel('a', { territoriesEligible: ['france'], scrapeMetadata: { champ: 'sante' },
      qualification: { destinataires: ['prive-non-lucratif'], objets: [] } }), ehpad as never)).toBeNull();
    expect(evaluerAppel(appel('b', { qualification: recherche }), ehpad as never)).toBeNull();
    expect(evaluerAppel(appel('c', { scrapeMetadata: { champ: 'sante' }, structureTypeEligible: ['EHPAD'] }), ehpad as never)).not.toBeNull();
    expect(evaluerAppel(appel('d'), ehpad as never)?.aVerifier).toContain("Domaine de l'appel non précisé");
    // clôture à minuit ce jour : getDaysUntilDeadline arrondit à 0, l'appel n'est pas encore clos
    expect(evaluerAppel(appel('e', { deadline: dans(-0.3) }), ehpad as never)?.raisons).toContain("Clôture aujourd'hui");
  });

  it('signale les appels nationaux, sans date ou proches de la clôture', () => {
    const national = evaluerAppel(appel('a', { territoriesEligible: ['france'], deadline: null, scrapeMetadata: { champ: 'medico-social' } }), ehpad as never);
    expect(national?.points).toBe(2);
    // un appel national sans rien de concret en commun (type, objet, champ) n'est pas recommandé
    expect(evaluerAppel(appel('n', { territoriesEligible: ['france'], qualification: { destinataires: ['prive-non-lucratif'], objets: [] } }), ehpad as never)).toBeNull();
    expect(national?.aVerifier).toContain('Date de clôture non précisée');
    expect(evaluerAppel(appel('b', { deadline: dans(12) }), ehpad as never)?.raisons).toContain('Clôture dans 12 jours');
  });
});

describe('recommander', () => {
  it("garde les appels au seuil, les plus concordants d'abord, puis la clôture la plus proche", () => {
    const liste = recommander([
      appel('national', { territoriesEligible: ['france'], scrapeMetadata: { champ: 'medico-social' },
        qualification: { destinataires: ['prive-non-lucratif'], objets: [] } }),
      appel('loin', { deadline: dans(90) }),
      appel('proche', { deadline: dans(20) }),
      appel('faible', { territoriesEligible: ['france'] }),
      appel('autre', { territoriesEligible: ['bretagne'] }),
    ], ehpad as never);
    expect(liste.map(r => (r.aap as { id: string }).id)).toEqual(['national', 'proche', 'loin']);
  });
});
