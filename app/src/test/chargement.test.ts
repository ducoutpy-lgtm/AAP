// Chargement de l'application (plan niveau A, lot 3.6, 2026-11-25) : le script de Stripe était ajouté à toutes les pages
// (accueil compris) alors que le paiement n'est pas ouvert, et toutes les pages partaient dans un seul fichier de plus
// d'un mégaoctet.
import { describe, expect, it } from 'vitest';

const SOURCES = import.meta.glob(['../**/*.tsx', '../**/*.ts', '!../**/*.test.tsx', '!../**/*.test.ts'], {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

describe('chargement', () => {
  it('Stripe : seule sa version « pure » est importée, et appelée au paiement, jamais au chargement d’un fichier', () => {
    const imports = Object.entries(SOURCES)
      .filter(([, t]) => /from '@stripe\/stripe-js'/.test(t))
      .map(([c]) => c);
    expect(imports).toEqual([]);
    const auChargement = Object.entries(SOURCES)
      .filter(([, t]) => /^(export )?const \w+ = loadStripe\(/m.test(t))
      .map(([c]) => c);
    expect(auChargement).toEqual([]);
  });

  it('les pages des comptes connectés sont chargées à la demande', () => {
    const app = SOURCES['../App.tsx'];
    for (const dossier of ['admin', 'financeur', 'porteur', 'subscription', 'profile']) {
      expect(app).not.toMatch(new RegExp(`^import \\w+ from '\\./pages/${dossier}/`, 'm'));
    }
    expect(app).toMatch(/lazy\(\(\) => import\('\.\/pages\/admin\/AdminDashboard'\)\)/);
  });
});
