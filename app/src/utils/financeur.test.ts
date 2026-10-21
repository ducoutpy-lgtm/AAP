// Tests de l'espace financeur (changement financeur-vendable, tâche 1.1).
import { describe, expect, it } from 'vitest';
import { candidaturesParAppel, colonneDe, parColonne, resumeFinanceur } from './financeur';
import type { AAP, Application, ApplicationStatus } from '../types';

const aap = (id: string, status: AAP['status'], deadline: Date | null, views = 0): AAP =>
  ({ id, title: id, status, deadline, views, financeurId: 'f' } as unknown as AAP);
const cand = (id: string, aapId: string, status: ApplicationStatus, jour: number): Application =>
  ({ id, aapId, status, financeurId: 'f', porteurId: 'p', projectTitle: id, submittedAt: new Date(2026, 9, jour), createdAt: new Date(2026, 9, jour) } as unknown as Application);

const aaps = [aap('a', 'published', new Date(2026, 10, 30), 12), aap('b', 'published', new Date(2026, 10, 5), 30), aap('c', 'draft', null), aap('d', 'closed', new Date(2026, 8, 1), 8)];
const candidatures = [cand('1', 'a', 'submitted', 20), cand('2', 'a', 'under_review', 18), cand('3', 'b', 'accepted', 15), cand('4', 'b', 'rejected', 10), cand('5', 'a', 'pending_info', 19), cand('6', 'a', 'draft', 21)];

describe('espace financeur', () => {
  it('résumé du tableau de bord', () => {
    const r = resumeFinanceur(aaps, candidatures, new Date(2026, 9, 21));
    expect([r.publies, r.brouillons, r.clos]).toEqual([2, 1, 1]);
    expect(r.candidatures).toBe(5); // le brouillon du candidat n'est pas reçu
    expect(r.parStatut).toEqual({ submitted: 1, under_review: 2, shortlisted: 0, accepted: 1, rejected: 1 });
    expect(r.vues).toBe(50);
    expect(r.dernieres.map(c => c.id)).toEqual(['1', '5', '2', '3', '4']);
    expect(r.prochaineEcheance?.id).toBe('b'); // la plus proche des échéances à venir
  });

  it('colonnes des candidatures reçues', () => {
    expect(colonneDe('pending_info')).toBe('under_review');
    expect(colonneDe('draft')).toBeNull();
    const cols = parColonne(candidatures);
    expect(cols.submitted.map(c => c.id)).toEqual(['1']);
    expect(cols.under_review.map(c => c.id)).toEqual(['2', '5']);
    expect(cols.shortlisted).toEqual([]);
    expect(candidaturesParAppel(candidatures)).toEqual({ a: 3, b: 2 });
  });
});
