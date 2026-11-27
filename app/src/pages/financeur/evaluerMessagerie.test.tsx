// Page d'évaluation d'une candidature (question 50, « construire », 2026-11-26) : le financeur écrit au candidat depuis
// la candidature ; « Écrire au candidat » ouvre la conversation de cette candidature, puis la page Messages.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

const etat = vi.hoisted(() => ({
  candidature: {} as Record<string, unknown>,
  ouvrir: vi.fn((c: { id: string }) => Promise.resolve(c.id)),
}));
vi.mock('../../config/firebase', () => ({ db: {} }));
vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  updateDoc: vi.fn(() => Promise.resolve()),
  getDoc: vi.fn(() => Promise.resolve({ exists: () => true, id: 'c2', data: () => etat.candidature })),
  Timestamp: { now: () => ({}) },
}));
vi.mock('../../services/messagerieService', async (original) => ({
  ...(await original<typeof import('../../services/messagerieService')>()),
  ouvrirConversation: (c: { id: string }) => etat.ouvrir(c),
}));

import EvaluateApplicationPage from './EvaluateApplicationPage';

const ouvrir = (candidature: Record<string, unknown>) => {
  etat.candidature = {
    aapId: 'a1',
    aapTitle: 'Prévention des chutes',
    porteurId: 'p1',
    financeurId: 'f1',
    projectTitle: 'Ateliers équilibre',
    status: 'submitted',
    budget: { total: 18000, breakdown: '' },
    documents: [],
    submittedAt: { toDate: () => new Date('2026-11-25') },
    ...candidature,
  };
  render(
    <MemoryRouter initialEntries={['/aap/a1/candidature/c2/evaluer']}>
      <Routes>
        <Route path="/aap/:aapId/candidature/:applicationId/evaluer" element={<EvaluateApplicationPage />} />
        <Route path="/messages" element={<p>Page Messages</p>} />
      </Routes>
    </MemoryRouter>,
  );
};

describe('évaluation : écrire au candidat', () => {
  afterEach(cleanup);

  it('« Écrire au candidat » ouvre la conversation de la candidature', async () => {
    ouvrir({});
    fireEvent.click(await screen.findByRole('button', { name: 'Écrire au candidat' }));
    expect(await screen.findByText('Page Messages')).toBeInTheDocument();
    expect(etat.ouvrir).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'c2', porteurId: 'p1', financeurId: 'f1', projectTitle: 'Ateliers équilibre' }),
    );
  });
});
