// Plan niveau A, lot 3.7 (2026-11-25) : aucun écran « en cours de développement » ni bouton factice ne reste dans
// l'application. La page 404 et deux boutons de l'administration menaient à un gabarit provisoire, et le cœur de la
// recherche n'exécutait qu'un commentaire.
import { describe, expect, it } from 'vitest';

const SOURCES = import.meta.glob(['../**/*.tsx', '../**/*.ts', '!../**/*.test.tsx', '!../**/*.test.ts'], {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

describe('écrans finis', () => {
  it('aucun texte « en cours de développement » ni favori factice dans les sources', () => {
    const fautifs = Object.entries(SOURCES)
      .filter(([, texte]) => /en cours de d[ée]veloppement|Toggle favorite/i.test(texte))
      .map(([chemin]) => chemin);
    expect(fautifs).toEqual([]);
  });

  // Lot 3.1 : retours par bandeau (utils/annonces.ts) au lieu des fenêtres alert() du navigateur
  it('aucun alert() dans les sources', () => {
    const fautifs = Object.entries(SOURCES)
      .filter(([, texte]) => /\balert\(/.test(texte))
      .map(([chemin]) => chemin);
    expect(fautifs).toEqual([]);
  });

  it('aucune route vers les écrans vides de l’administration', () => {
    const app = SOURCES['../App.tsx'];
    expect(app).toBeDefined();
    expect(app).not.toMatch(/admin\/paiements|admin\/parametres/);
  });
});
