// Corbeille des notifications (relecture du plan niveau A, 2026-11-25) : le bouton retirait la notification de l'écran
// seulement ; elle revenait au rechargement. La règle Firestore notifications autorise la suppression au destinataire
// (allow read, delete: if isOwner(resource.data.userId)). Firestore et le compte sont remplacés par des doublures.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { lireAnnonces, retirerAnnonce } from '../../utils/annonces';

const firestore = vi.hoisted(() => ({
  deleteDoc: vi.fn(),
  updateDoc: vi.fn(),
}));
vi.mock('../../config/firebase', () => ({ db: {} }));
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  doc: (_db: unknown, collection: string, id: string) => `${collection}/${id}`,
  getDocs: () =>
    Promise.resolve({
      docs: [
        {
          id: 'n1',
          data: () => ({
            userId: 'u1',
            type: 'system',
            title: 'Notification à supprimer',
            message: 'Message',
            read: true,
            createdAt: { toDate: () => new Date() },
          }),
        },
      ],
    }),
  deleteDoc: firestore.deleteDoc,
  updateDoc: firestore.updateDoc,
}));
// Compte stable : un nouvel objet à chaque affichage relancerait le chargement sans fin
const compte = vi.hoisted(() => ({ currentUser: { uid: 'u1' } }));
vi.mock('../../contexts/AuthContext', () => ({ useAuth: () => compte }));

import NotificationsPage from './NotificationsPage';

const afficher = () =>
  render(
    <MemoryRouter>
      <NotificationsPage />
    </MemoryRouter>,
  );
// Le bouton corbeille n'a pas de libellé : il est retrouvé par son icône
const corbeille = (conteneur: HTMLElement) => conteneur.querySelector('.lucide-trash2')!.closest('button')!;

describe('Notifications : la corbeille supprime la notification', () => {
  beforeEach(() => {
    firestore.deleteDoc.mockReset();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    lireAnnonces().forEach((a) => retirerAnnonce(a.id));
  });

  it('la notification est supprimée en base, puis retirée de l’écran', async () => {
    firestore.deleteDoc.mockResolvedValue(undefined);
    const { container } = afficher();
    await screen.findByText('Notification à supprimer');
    fireEvent.click(corbeille(container));
    await waitFor(() => expect(screen.queryByText('Notification à supprimer')).not.toBeInTheDocument());
    expect(firestore.deleteDoc).toHaveBeenCalledWith('notifications/n1');
  });

  it('si la suppression échoue, la notification reste affichée et un message le dit', async () => {
    firestore.deleteDoc.mockRejectedValue(new Error('permission-denied'));
    const { container } = afficher();
    await screen.findByText('Notification à supprimer');
    fireEvent.click(corbeille(container));
    await waitFor(() => expect(lireAnnonces().map((a) => a.type)).toContain('erreur'));
    expect(screen.getByText('Notification à supprimer')).toBeInTheDocument();
  });
});
