// Urgence d'une échéance (corrections-relecture 3.3, 2026-11-20) : le calendrier classait « urgent » un appel déjà clos
// (nombre de jours négatif), qui figurait alors dans « Deadlines urgentes ».
import { describe, expect, it } from 'vitest';
import { urgenceEcheance } from './deadline';

describe('urgenceEcheance', () => {
  it('appel clos : passé, jamais urgent', () => {
    expect(urgenceEcheance(-15)).toBe('passee');
    expect(urgenceEcheance(-1)).toBe('passee');
  });
  it('clôture dans la semaine : urgent ; dans le mois : moyen ; au-delà : faible', () => {
    expect(urgenceEcheance(0)).toBe('high');
    expect(urgenceEcheance(7)).toBe('high');
    expect(urgenceEcheance(8)).toBe('medium');
    expect(urgenceEcheance(30)).toBe('medium');
    expect(urgenceEcheance(31)).toBe('low');
  });
});
