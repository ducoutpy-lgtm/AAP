// Export CSV (plan niveau A, lot 3.4, 2026-11-25) : les exports des candidatures et des utilisateurs assemblaient les
// champs par des virgules, sans guillemets. Une virgule ou un retour à la ligne dans un titre décalait les colonnes, une
// cellule « =SOMME(...) » devenait une formule dans Excel, et les accents étaient mal lus.
import { describe, expect, it } from 'vitest';
import { champCsv, versCsv } from './csv';

describe('versCsv', () => {
  it('virgule, point-virgule, guillemet et retour à la ligne restent dans leur cellule', () => {
    expect(champCsv('Projet, phase 1; suite')).toBe('"Projet, phase 1; suite"');
    expect(champCsv('Le « projet "pilote" »')).toBe('"Le « projet ""pilote"" »"');
    expect(champCsv('ligne 1\nligne 2')).toBe('"ligne 1\nligne 2"');
  });

  it('une cellule qui commence par = + - @ est lue comme du texte, pas comme une formule', () => {
    expect(champCsv('=SOMME(A1:A9)')).toBe('"\'=SOMME(A1:A9)"');
    expect(champCsv('+33 1 23')).toBe('"\'+33 1 23"');
    expect(champCsv('@cmd')).toBe('"\'@cmd"');
    expect(champCsv(-5)).toBe('"-5"');
    expect(champCsv('-')).toBe('"-"');
  });

  // Relecture du 2026-11-25 (constat 7) : seule une chaîne recevait l'apostrophe ; un tableau écrit par le SDK dans un
  // titre ou une adresse (« =HYPERLINK(...) ») restait une formule. Seuls les nombres sont exemptés.
  it('une valeur qui n’est pas une chaîne, tableau ou objet, est neutralisée elle aussi', () => {
    expect(champCsv(['=HYPERLINK("http://x","clic")'])).toBe('"\'=HYPERLINK(""http://x"",""clic"")"');
    expect(champCsv({ toString: () => '+SOMME(A1)' })).toBe('"\'+SOMME(A1)"');
    expect(versCsv(['a'], [[['@SUM(1)']]])).toBe('\uFEFF"a"\r\n"\'@SUM(1)"');
    expect(champCsv(-12.5)).toBe('"-12.5"');
  });

  it('valeurs absentes vides ; en-tête, séparateur point-virgule et indicateur UTF-8 pour Excel', () => {
    expect(champCsv(null)).toBe('""');
    expect(champCsv(undefined)).toBe('""');
    const csv = versCsv(
      ['Titre', 'Budget'],
      [
        ['Équipe mobile', 12000],
        ['Répit', null],
      ],
    );
    expect(csv.startsWith('\uFEFF')).toBe(true);
    expect(csv.slice(1).split('\r\n')).toEqual(['"Titre";"Budget"', '"Équipe mobile";"12000"', '"Répit";""']);
  });

  it('liste vide : l’en-tête seul (l’ancien export plantait sur une liste vide)', () => {
    expect(versCsv(['Email'], [])).toBe('\uFEFF"Email"');
  });
});
