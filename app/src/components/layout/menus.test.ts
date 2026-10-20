// Tests des entrées de menu (changement navigation-et-pages-publiques, tâche 1.1).
import { describe, expect, it } from 'vitest';
import { entreeActive, entreesMenu, tableauDeBord } from './menus';

describe('entreesMenu', () => {
  it.each(['porteur', 'financeur', 'admin'] as const)('%s : tableau de bord en tête, Support et Paramètres, aucune adresse en double', (role) => {
    const sections = entreesMenu(role);
    expect(sections[0].entrees[0].libelle).toBe('Tableau de bord');
    expect(sections.map(s => s.titre)).toContain('Support');
    expect(sections.map(s => s.titre)).toContain('Paramètres');
    const adresses = sections.flatMap(s => s.entrees.map(e => e.adresse));
    expect(new Set(adresses).size).toBe(adresses.length);
  });

  it('chaque rôle a son tableau de bord', () => {
    expect(tableauDeBord('porteur')).toBe('/dashboard/porteur');
    expect(tableauDeBord('financeur')).toBe('/dashboard/financeur');
    expect(tableauDeBord('admin')).toBe('/admin');
  });
});

describe('entreeActive', () => {
  it('adresse exacte, sinon le préfixe le plus long, sinon rien', () => {
    const admin = entreesMenu('admin');
    expect(entreeActive(admin, '/admin/aaps')).toBe('/admin/aaps');
    expect(entreeActive(admin, '/admin/aaps/123')).toBe('/admin/aaps');
    expect(entreeActive(admin, '/aap/42')).toBeNull();
    expect(entreeActive(entreesMenu('porteur'), '/aap/search')).toBe('/aap/search');
  });
});
