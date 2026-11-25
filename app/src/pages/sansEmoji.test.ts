// Pas d'emoji dans les fichiers produits (règle du projet ; relecture du 2026-11-25, constat 36) : la fiche annonçait
// « il ne reste que n jours » derrière un emoji d'avertissement, l'évaluation et l'inscription en gardaient deux autres.
// Le contrôle porte sur toutes les sources de src, tests exceptés.
import { describe, expect, it } from 'vitest';

const SOURCES = import.meta.glob(
  ['../**/*.tsx', '../**/*.ts', '../**/*.css', '!../**/*.test.tsx', '!../**/*.test.ts'],
  {
    query: '?raw',
    import: 'default',
    eager: true,
  },
) as Record<string, string>;

// ©, ® et ™ comptent aussi comme « pictographiques » pour Unicode, mais ne sont pas des emojis : ils restent permis
const EMOJI = /(?![©®™])\p{Extended_Pictographic}/u;

describe('sources sans emoji', () => {
  it('aucune source de l’application ne contient d’emoji', () => {
    // Garde-fou : la lecture couvre bien tout src (pages, reste du code, styles), tests exceptés
    expect(Object.keys(SOURCES)).toEqual(
      expect.arrayContaining(['./porteur/AapDetailPage.tsx', '../App.tsx', '../utils/datesCloture.ts', '../index.css']),
    );
    expect(Object.keys(SOURCES).some((chemin) => chemin.includes('.test.'))).toBe(false);
    const fautifs = Object.entries(SOURCES).flatMap(([chemin, texte]) =>
      texte
        .split('\n')
        .map((ligne, i) => (EMOJI.test(ligne) ? `${chemin}:${i + 1}` : null))
        .filter((repere): repere is string => repere !== null),
    );
    expect(fautifs).toEqual([]);
  });
});
