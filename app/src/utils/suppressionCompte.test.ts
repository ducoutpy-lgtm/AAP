// Tests de la suppression du compte (changement suppression-compte, question 25, 2026-11-19).
import { describe, expect, it } from 'vitest';
import { ANONYME, connexionRecente, planDeSuppression, connexionRecenteSelonServeur } from './suppressionCompte';

describe('planDeSuppression', () => {
  it('supprime les candidatures aux appels importés et les brouillons, garde sans identifiant celles envoyées à un financeur inscrit', () => {
    const plan = planDeSuppression([
      { id: 'importe', financeurId: 'scraped', status: 'submitted' },
      { id: 'brouillon', financeurId: 'f1', status: 'draft' },
      { id: 'envoyee', financeurId: 'f1', status: 'under_review' },
    ]);
    expect(plan).toEqual({ supprimer: ['importe', 'brouillon'], anonymiser: ['envoyee'] });
    expect(ANONYME).toBe('compte-supprime');
  });
});

describe('connexionRecente', () => {
  it('cinq minutes au plus depuis la dernière connexion', () => {
    const maintenant = new Date('2026-11-19T10:00:00Z');
    expect(connexionRecente('Thu, 19 Nov 2026 09:56:00 GMT', maintenant)).toBe(true);
    expect(connexionRecente('Thu, 19 Nov 2026 09:54:00 GMT', maintenant)).toBe(false);
    expect(connexionRecente(undefined, maintenant)).toBe(false);
  });
});

// corrections-relecture 3.5 (2026-11-20) : l'horloge du poste (décalée de 6 minutes, ou en retard) refusait la suppression
// alors que Firebase l'aurait acceptée ; les deux heures comparées viennent maintenant du serveur
describe('connexionRecenteSelonServeur', () => {
  it('juge sur l’heure de connexion et l’heure du jeton renouvelé, toutes deux du serveur', () => {
    expect(connexionRecenteSelonServeur({ authTime: '2026-11-20T10:00:00Z', issuedAtTime: '2026-11-20T10:02:00Z' })).toBe(true);
    expect(connexionRecenteSelonServeur({ authTime: '2026-11-20T10:00:00Z', issuedAtTime: '2026-11-20T10:06:00Z' })).toBe(false);
  });
});
