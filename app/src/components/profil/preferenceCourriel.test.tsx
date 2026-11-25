// Case « Recevoir le courriel du lundi » (décision 42 du 2026-11-24) : aucun écran ne permettait d'arrêter le courriel ;
// la case écrit notificationPreferences.email, que scraping/alertes.py lit avant tout envoi. Firestore est remplacé.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';

const appels = vi.hoisted(() => ({ setDoc: vi.fn() }));
vi.mock('../../config/firebase', () => ({ db: {} }));
vi.mock('firebase/firestore', () => ({ doc: vi.fn(() => 'reference'), setDoc: appels.setDoc }));

import { PreferenceCourrielCarte } from './PreferenceCourrielCarte';

describe('préférence du courriel du lundi', () => {
  afterEach(cleanup);

  it('décocher la case arrête le courriel ; la recocher le rétablit', async () => {
    appels.setDoc.mockReset().mockResolvedValue(undefined);
    render(<PreferenceCourrielCarte uid="p1" actif />);
    const caseACocher = screen.getByLabelText(/Recevoir le courriel du lundi/);
    expect(caseACocher).toBeChecked();
    fireEvent.click(caseACocher);
    await waitFor(() =>
      expect(appels.setDoc).toHaveBeenCalledWith(
        'reference',
        { notificationPreferences: { email: false } },
        { merge: true },
      ),
    );
    expect(await screen.findByText(/n'est plus envoyé/)).toBeInTheDocument();
    fireEvent.click(caseACocher);
    await waitFor(() =>
      expect(appels.setDoc).toHaveBeenLastCalledWith(
        'reference',
        { notificationPreferences: { email: true } },
        { merge: true },
      ),
    );
  });
});
