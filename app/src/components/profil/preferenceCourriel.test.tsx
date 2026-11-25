// Case « Recevoir le courriel du lundi » (décision 42 du 2026-11-24) : aucun écran ne permettait d'arrêter le courriel ;
// la case écrit notificationPreferences.email, que scraping/alertes.py lit avant tout envoi. Firestore est remplacé.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';

const appels = vi.hoisted(() => ({ setDoc: vi.fn() }));
vi.mock('../../config/firebase', () => ({ db: {} }));
vi.mock('firebase/firestore', () => ({ doc: vi.fn(() => 'reference'), setDoc: appels.setDoc }));
// Profil du contexte de connexion : refreshUserProfile relit le document users, ici la dernière valeur écrite
const profil = vi.hoisted(() => ({
  userProfile: { notificationPreferences: { email: true } } as { notificationPreferences?: { email?: boolean } },
  ecrit: undefined as boolean | undefined,
}));
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    userProfile: profil.userProfile,
    refreshUserProfile: async () => {
      if (profil.ecrit !== undefined) profil.userProfile = { notificationPreferences: { email: profil.ecrit } };
    },
  }),
}));

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

  // Relecture du 2026-11-25 (constat 3) : la carte ne relisait pas le profil du contexte ; au retour sur Mon profil, elle
  // repartait de l'ancienne valeur et s'affichait cochée alors que le courriel était arrêté
  it('aller-retour : la case décochée reste décochée quand Mon profil est rouvert', async () => {
    profil.userProfile = { notificationPreferences: { email: true } };
    profil.ecrit = undefined;
    appels.setDoc
      .mockReset()
      .mockImplementation(async (_ref, donnees: { notificationPreferences: { email: boolean } }) => {
        profil.ecrit = donnees.notificationPreferences.email;
      });
    // Même lecture que ProfilPage : actif={userProfile.notificationPreferences?.email !== false}
    const ouvrirMonProfil = () =>
      render(<PreferenceCourrielCarte uid="p1" actif={profil.userProfile.notificationPreferences?.email !== false} />);
    ouvrirMonProfil();
    fireEvent.click(screen.getByLabelText(/Recevoir le courriel du lundi/));
    expect(await screen.findByText(/n'est plus envoyé/)).toBeInTheDocument();
    cleanup();
    ouvrirMonProfil();
    expect(screen.getByLabelText(/Recevoir le courriel du lundi/)).not.toBeChecked();
  });
});
