// Affichage des dates de clôture (constat 4 de la relecture du plan niveau A, 2026-11-25) : une date de clôture est
// enregistrée à minuit UTC et désigne un jour du calendrier (décision 38). Affichée en heure locale, elle montrait la
// veille aux Antilles, en Guyane et en Polynésie (« Clôture le 30 novembre » pour un appel du 1er décembre), et le
// calendrier plaçait l'échéance sur la case de la veille.
import { afterEach, describe, expect, it } from 'vitest';
import { bornesMoisCloture, formatDateCloture, memeJourCloture } from './datesCloture';

// Fuseau rétabli tel qu'il était : s'il n'était pas défini, la variable est supprimée, car écrire undefined donnerait
// la chaîne « undefined », lue comme UTC par Node (constat 47)
const fuseauInitial = process.env.TZ;
afterEach(() => {
  if (fuseauInitial === undefined) delete process.env.TZ;
  else process.env.TZ = fuseauInitial;
});

const le1erDecembre = new Date(Date.UTC(2026, 11, 1));

describe('formatDateCloture', () => {
  it('en Martinique, une clôture du 1er décembre s’affiche le 1er décembre, pas la veille', () => {
    process.env.TZ = 'America/Martinique';
    // Garde-fou : le fuseau est bien appliqué (en heure locale, cet instant tombe le 30 novembre à 20 h)
    expect(le1erDecembre.getDate()).toBe(30);
    expect(formatDateCloture(le1erDecembre, { day: 'numeric', month: 'long', year: 'numeric' })).toBe(
      '1 décembre 2026',
    );
    expect(formatDateCloture(le1erDecembre)).toBe('01/12/2026');
  });

  it('même jour en métropole, en Polynésie et à La Réunion', () => {
    for (const fuseau of ['Europe/Paris', 'Pacific/Tahiti', 'Indian/Reunion']) {
      process.env.TZ = fuseau;
      expect(formatDateCloture(le1erDecembre)).toBe('01/12/2026');
    }
  });

  it('accepte un Timestamp Firestore (objet muni de toDate)', () => {
    process.env.TZ = 'America/Martinique';
    const horodatage = { toDate: () => le1erDecembre } as unknown as Parameters<typeof formatDateCloture>[0];
    expect(formatDateCloture(horodatage, { day: '2-digit', month: 'short', year: 'numeric' })).toBe('01 déc. 2026');
  });
});

describe('calendrier : case du jour et mois chargé', () => {
  it('en Martinique, l’échéance du 1er décembre est sur la case du 1er décembre, pas sur celle du 30 novembre', () => {
    process.env.TZ = 'America/Martinique';
    expect(memeJourCloture(le1erDecembre, new Date(2026, 11, 1))).toBe(true);
    expect(memeJourCloture(le1erDecembre, new Date(2026, 10, 30))).toBe(false);
  });

  it('en métropole aussi', () => {
    process.env.TZ = 'Europe/Paris';
    expect(memeJourCloture(le1erDecembre, new Date(2026, 11, 1))).toBe(true);
    expect(memeJourCloture(le1erDecembre, new Date(2026, 10, 30))).toBe(false);
  });

  it('en Martinique, le mois de décembre charge la clôture du 1er décembre et pas celle du 1er janvier', () => {
    process.env.TZ = 'America/Martinique';
    const { debut, fin } = bornesMoisCloture(new Date(2026, 11, 15));
    const dansLeMois = (d: Date) => d.getTime() >= debut.getTime() && d.getTime() <= fin.getTime();
    expect(dansLeMois(le1erDecembre)).toBe(true);
    expect(dansLeMois(new Date(Date.UTC(2026, 11, 31)))).toBe(true);
    expect(dansLeMois(new Date(Date.UTC(2027, 0, 1)))).toBe(false);
    expect(dansLeMois(new Date(Date.UTC(2026, 10, 30)))).toBe(false);
  });
});
