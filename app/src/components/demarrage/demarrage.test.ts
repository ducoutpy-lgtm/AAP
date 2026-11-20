// Tests de la liste de démarrage (changement liste-demarrage, tâche 1.1).
import { describe, expect, it } from 'vitest';
import { ACTIONS_FINANCEUR, ACTIONS_PORTEUR, anneeOuvertureValide, etatDemarrage, precisionsAEnregistrer } from './demarrage';

describe('etatDemarrage', () => {
  it('compte neuf : quatre actions, aucune faite, non terminé', () => {
    const e = etatDemarrage('porteur', null);
    expect(e.total).toBe(4);
    expect(e.faites).toBe(0);
    expect(e.termine).toBe(false);
    expect(e.actions.map(a => a.cle)).toEqual(['profil', 'recherche', 'fiche', 'candidature']);
  });

  it('coche les actions marquées dans users.demarrage et se termine à quatre', () => {
    const partiel = etatDemarrage('porteur', { demarrage: { recherche: true } });
    expect(partiel.faites).toBe(1);
    expect(partiel.actions.find(a => a.cle === 'recherche')?.faite).toBe(true);
    const complet = etatDemarrage('porteur', { demarrage: { profil: true, recherche: true, fiche: true, candidature: true } });
    expect(complet.termine).toBe(true);
  });

  it('le financeur a ses propres actions, dont publier un appel ; une clé étrangère ne compte pas', () => {
    const e = etatDemarrage('financeur', { demarrage: { candidature: true, appel: true } });
    expect(e.actions.map(a => a.cle)).toEqual(['profil', 'appel', 'recherche', 'fiche']);
    expect(e.faites).toBe(1);
  });

  it('les définitions portent un lien sauf le profil, qui ouvre une fenêtre', () => {
    for (const liste of [ACTIONS_PORTEUR, ACTIONS_FINANCEUR]) {
      expect(liste.find(a => a.cle === 'profil')?.lien).toBeUndefined();
      expect(liste.filter(a => a.cle !== 'profil').every(a => a.lien)).toBe(true);
    }
  });
});

describe('anneeOuvertureValide', () => {
  it('accepte quatre chiffres plausibles, refuse le reste', () => {
    expect(anneeOuvertureValide('1998', 2026)).toBe(1998);
    expect(anneeOuvertureValide(' 2026 ', 2026)).toBe(2026);
    expect(anneeOuvertureValide('2027', 2026)).toBeNull();
    expect(anneeOuvertureValide('98', 2026)).toBeNull();
    expect(anneeOuvertureValide('', 2026)).toBeNull();
  });
});

// Fenêtre « Préciser mon profil » (corrections-relecture 1.2, 2026-11-20) : elle s'ouvre vide ; un champ laissé vide
// n'est pas écrit, sinon il effaçait la valeur déjà enregistrée dans Mon profil (site, présentation, objets).
describe('precisionsAEnregistrer', () => {
  const vide = { objets: [], annee: '', rayon: '', site: '', presentation: '' };
  it('rien de saisi : aucun champ du profil écrit', () => {
    expect(precisionsAEnregistrer('financeur', vide)).toEqual({});
    expect(precisionsAEnregistrer('porteur', vide)).toEqual({});
  });
  it('financeur : seuls les champs saisis, sans espaces autour', () => {
    expect(precisionsAEnregistrer('financeur', { ...vide, site: ' https://f.fr ' })).toEqual({ website: 'https://f.fr' });
  });
  it('porteur : objets, année valide et rayon saisis', () => {
    expect(precisionsAEnregistrer('porteur', { ...vide, objets: ['investissement'], annee: '2001', rayon: 'regional' }))
      .toEqual({ objetsProjet: ['investissement'], anneeOuverture: 2001, rayonAction: 'regional' });
  });
  it('porteur : année illisible non écrite', () => {
    expect(precisionsAEnregistrer('porteur', { ...vide, annee: 'deux mille' })).toEqual({});
  });
});
