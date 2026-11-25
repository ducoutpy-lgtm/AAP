// Palette (plan niveau A, lot 3.3, 2026-11-24) : success, warning, error et info ne définissaient que les teintes 500 et
// 600 ; les classes error-50, warning-200, error-800... utilisées par les bandeaux d'erreur et d'alerte ne produisaient
// aucune couleur. Chaque teinte utilisée dans le code doit exister dans tailwind.config.js.
import { describe, expect, it } from 'vitest';
import configuration from '../../tailwind.config.js?raw';

const SOURCES = import.meta.glob(['../**/*.tsx', '../**/*.ts', '!../**/*.test.tsx', '!../**/*.test.ts'], {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;
const MOTIF =
  /\b(?:bg|text|border|ring|from|to|via|fill|stroke|divide|outline|placeholder)-(primary|secondary|success|warning|error|info)-(\d+)\b/g;

describe('palette de couleurs', () => {
  it('chaque teinte utilisée existe dans la configuration', () => {
    // Bloc « nom: { … } » de la configuration, lu comme texte, et teinte « 50: » à l'intérieur
    const definie = (nom: string, teinte: string) =>
      new RegExp(String.raw`\b${nom}: \{[^}]*\b${teinte}: '#`).test(configuration);
    const utilisees = new Set(
      Object.values(SOURCES).flatMap((t) => [...t.matchAll(MOTIF)].map((m) => `${m[1]}-${m[2]}`)),
    );
    expect(utilisees.size).toBeGreaterThan(20);
    expect(definie('error', '600') && !definie('error', '950')).toBe(true);
    expect(
      [...utilisees]
        .filter((c) => {
          const [nom, teinte] = c.split('-');
          return !definie(nom, teinte);
        })
        .sort(),
    ).toEqual([]);
  });
});
