// Liens internes de toutes les pages et de tous les composants (2026-11-20) : chaque adresse écrite dans le code
// (to="/…", navigate('/…'), href="/…", propriétés lien, link ou adresse, y compris les adresses composées comme
// `/aap/${id}`) doit mener à une route de App.tsx. Les pages des comptes connectés ne se rendent pas sans Firebase :
// leur texte est lu tel quel.
import { describe, expect, it } from 'vitest';
import { routeExiste } from './routes';

const SOURCES = import.meta.glob(['../**/*.tsx', '../**/*.ts', '!../**/*.test.tsx', '!../**/*.test.ts'], { query: '?raw', import: 'default', eager: true }) as Record<string, string>;

// Adresse entre guillemets, apostrophes ou accents graves, juste après to=, to={, navigate(, href=, href={ ou une
// propriété lien:, link:, adresse: ; une partie calculée `${…}` devient un segment quelconque.
const MOTIF = /(?:\bto=\{?|\bnavigate\(|\bhref=\{?|\b(?:lien|link|adresse)\s*:)\s*(["'`])(\/[^"'`\s]*)\1/g;

function adressesDuCode(texte: string): string[] {
  return [...texte.matchAll(MOTIF)].map(m => m[2].replace(/\$\{[^}]*\}/g, 'x'));
}

describe('liens internes du code', () => {
  it('le repérage lit les quatre formes et les adresses composées', () => {
    expect(adressesDuCode(`<Link to="/faq">  navigate('/profil')  <a href={\`/aap/\${a.id}/candidater\`}>  { lien: '/retour' }`))
      .toEqual(['/faq', '/profil', '/aap/x/candidater', '/retour']);
  });

  const trouves = Object.entries(SOURCES).flatMap(([fichier, texte]) => adressesDuCode(texte).map(a => ({ fichier, a })));

  it('des liens ont bien été lus', () => {
    expect(trouves.length).toBeGreaterThan(50);
  });

  it('aucun lien ne mène à une route absente', () => {
    expect(trouves.filter(t => !routeExiste(t.a)).map(t => `${t.fichier} -> ${t.a}`)).toEqual([]);
  });
});
