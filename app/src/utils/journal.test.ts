// Tests du journal des actions (changement suivi-testeurs, tâche 4.1).
import { describe, expect, it } from 'vitest';
import { chiffresDepuis, libelleFiltres, resumerParCompte, type CompteSuivi, type LigneJournal } from './journal';

const jour = (n: number, h = 10) => new Date(2026, 9, 21 - n, h, 0, 0); // n jours avant le 21 octobre 2026, à h heures

const comptes: CompteSuivi[] = [
  { uid: 'a', email: 'a@test.local', role: 'porteur', structure: 'EHPAD A', inscritLe: jour(10) },
  { uid: 'b', email: 'b@test.local', role: 'financeur', structure: 'Fondation B', inscritLe: jour(3) },
  { uid: 'c', email: 'c@test.local', role: 'porteur', structure: 'CHU C', inscritLe: jour(1) },
];

const journal: LigneJournal[] = [
  { userId: 'a', role: 'porteur', action: 'connexion', le: jour(2, 9) },
  { userId: 'a', role: 'porteur', action: 'recherche', libelle: 'Normandie', le: jour(2, 10) },
  { userId: 'a', role: 'porteur', action: 'fiche', cible: 'x1', libelle: 'Appel 1', le: jour(2, 11) },
  { userId: 'a', role: 'porteur', action: 'fiche', cible: 'x2', libelle: 'Appel 2', le: jour(1, 9) },
  { userId: 'a', role: 'porteur', action: 'candidature', cible: 'x2', libelle: 'Appel 2', le: jour(1, 10) },
  { userId: 'a', role: 'porteur', action: 'connexion', le: jour(0) },
  { userId: 'b', role: 'financeur', action: 'connexion', le: jour(9) },
  { userId: 'b', role: 'financeur', action: 'appel', cible: 'y', libelle: 'Mon appel', le: jour(9) },
];

describe('resumerParCompte', () => {
  it('compte les actions, trouve la dernière connexion, liste les dernières actions, trie par activité récente', () => {
    const r = resumerParCompte(comptes, journal);
    expect(r.map(x => x.uid)).toEqual(['a', 'b', 'c']);
    const a = r[0];
    expect([a.connexions, a.recherches, a.fiches, a.candidatures, a.appels]).toEqual([2, 1, 2, 1, 0]);
    expect(a.derniereConnexion).toEqual(jour(0));
    expect(a.dernieres[0].action).toBe('connexion');
    expect(a.dernieres[a.dernieres.length - 1].action).toBe('connexion');
    const c = r[2];
    expect(c.connexions).toBe(0);
    expect(c.derniereConnexion).toBeNull();
    expect(c.dernieres).toEqual([]);
    expect(r[1].appels).toBe(1);
  });

  it('limite les dernières actions', () => {
    expect(resumerParCompte(comptes, journal, 2)[0].dernieres).toHaveLength(2);
  });
});

describe('chiffresDepuis', () => {
  it('ne compte que la période et les comptes distincts', () => {
    expect(chiffresDepuis(journal, jour(7))).toEqual({ comptesActifs: 1, connexions: 2, recherches: 1, fiches: 2, candidatures: 1 });
    expect(chiffresDepuis(journal, jour(30)).comptesActifs).toBe(2);
  });
});

describe('libelleFiltres', () => {
  it('joint les libellés, ou dit sans filtre', () => {
    expect(libelleFiltres([{ libelle: 'Normandie' }, { libelle: 'Bientôt clôturé' }])).toBe('Normandie · Bientôt clôturé');
    expect(libelleFiltres([])).toBe('sans filtre');
  });
});
