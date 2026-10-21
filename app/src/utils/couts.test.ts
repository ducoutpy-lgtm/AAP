// Tests du suivi des coûts externes (changement suivi-couts-externes, tâche 6.2).
import { describe, expect, it } from 'vitest';
import { coutParFicheQualifiee, cumuls, lundiDe, parCle, parSemaine, type LigneCout } from './couts';

const l = (etape: string, modele: string, cout: number, le: Date): LigneCout => ({ source: 'collecte', etape, modele, coutEuros: cout, le });

const lignes: LigneCout[] = [
  l('extraction', 'claude-haiku-5-5', 1.0, new Date(2026, 9, 19)),
  l('qualification', 'claude-haiku-5-5', 0.087, new Date(2026, 9, 20)),
  l('verification', 'claude-haiku-5-5', 0.013, new Date(2026, 9, 20)),
  l('extraction', 'claude-sonnet-4-6', 0.05, new Date(2026, 3, 21)),
];

describe('cumuls et répartitions', () => {
  it('total, mois en cours, par étape, par modèle', () => {
    const c = cumuls(lignes, new Date(2026, 9, 21));
    expect(c.appels).toBe(4);
    expect(c.total).toBeCloseTo(1.15, 6);
    expect(c.mois).toBeCloseTo(1.1, 6);
    expect(c.appelsMois).toBe(3);
    const etapes = parCle(lignes, x => x.etape);
    expect(etapes[0]).toEqual({ cle: 'extraction', cout: 1.05, appels: 2 });
    expect(parCle(lignes, x => x.modele).map(x => x.cle)).toEqual(['claude-haiku-5-5', 'claude-sonnet-4-6']);
  });

  it('par semaine, lundi ISO, ordre chronologique', () => {
    expect(lundiDe(new Date(2026, 9, 21))).toBe('2026-10-19'); // mercredi 21 octobre 2026 -> lundi 19
    expect(lundiDe(new Date(2026, 9, 19))).toBe('2026-10-19');
    const s = parSemaine(lignes);
    expect(s[0].semaine).toBe('2026-04-20');
    expect(s[s.length - 1].semaine).toBe('2026-10-19');
    expect(s[s.length - 1].cout).toBeCloseTo(1.1, 6);
    expect(s[s.length - 1].appels).toBe(3);
  });

  it('coût par fiche qualifiée', () => {
    expect(coutParFicheQualifiee(2.2, 250)).toBeCloseTo(0.0088, 6);
    expect(coutParFicheQualifiee(2.2, 0)).toBeNull();
  });
});
