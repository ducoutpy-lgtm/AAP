// Urgence d'une échéance (corrections-relecture 3.3, 2026-11-20) : le calendrier classait « urgent » un appel déjà clos
// (nombre de jours négatif), qui figurait alors dans « Deadlines urgentes ».
import { afterEach, describe, expect, it, vi } from 'vitest';
import { getDaysUntilDeadline, isClosed, urgenceEcheance } from './deadline';

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

// Décision 38 du 2026-11-24 : la clôture se compte en jours du calendrier. Une date de clôture est enregistrée à minuit UTC
// (import, formulaire du financeur) ; avant, le décompte en heures faisait paraître l'appel « Clôturé » dès 20 h le soir
// de son dernier jour aux Antilles et en Guyane.
describe('jours avant la clôture, en jours du calendrier', () => {
  const fuseau = process.env.TZ;
  afterEach(() => {
    vi.useRealTimers();
    if (fuseau === undefined) delete process.env.TZ;
    else process.env.TZ = fuseau;
  });
  const le1erDecembre = new Date(Date.UTC(2026, 11, 1));

  it('en Martinique, l’appel reste ouvert tout son dernier jour et clôt le lendemain', () => {
    process.env.TZ = 'America/Martinique';
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-12-01T20:00:00-04:00'));
    expect(getDaysUntilDeadline(le1erDecembre)).toBe(0);
    expect(isClosed(getDaysUntilDeadline(le1erDecembre))).toBe(false);
    vi.setSystemTime(new Date('2026-12-02T00:30:00-04:00'));
    expect(getDaysUntilDeadline(le1erDecembre)).toBe(-1);
  });

  it('en métropole : la veille au soir 1 jour, le dernier jour au soir 0, le lendemain clos', () => {
    process.env.TZ = 'Europe/Paris';
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-30T23:30:00+01:00'));
    expect(getDaysUntilDeadline(le1erDecembre)).toBe(1);
    vi.setSystemTime(new Date('2026-12-01T23:30:00+01:00'));
    expect(getDaysUntilDeadline(le1erDecembre)).toBe(0);
    vi.setSystemTime(new Date('2026-12-02T00:30:00+01:00'));
    expect(isClosed(getDaysUntilDeadline(le1erDecembre))).toBe(true);
  });

  // Relecture, constat 47 : sans TZ au départ (cas du poste), « process.env.TZ = undefined » écrivait la chaîne
  // « undefined » (fuseau Etc/Unknown, lu comme UTC) ; les tests suivants du fichier ne tournaient plus à l'heure du poste
  it('rétablit le fuseau de départ après chaque test, y compris quand TZ était absent', () => {
    expect(process.env.TZ).toBe(fuseau);
  });
});
