// Suspension et rétablissement d'un compte (changement securite-vues-messagerie, question 51, décision « Registre des
// suspensions » de Monsieur DUCOUT du 2026-11-26) : la suspension ne changeait que subscriptionStatus ; le compte
// supprimait son document users puis le recréait en essai. Elle écrit désormais, dans une même écriture groupée, les
// fiches suspensions/{uid} et suspensions/email:<adresse en minuscules> que la règle de création de users consulte ; le
// rétablissement les efface. Firestore et le compte sont remplacés par des doublures.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { lireAnnonces, retirerAnnonce } from '../../utils/annonces';

const firestore = vi.hoisted(() => ({
  lot: { update: vi.fn(), set: vi.fn(), delete: vi.fn(), commit: vi.fn() },
  updateDoc: vi.fn(),
}));
// Registre des suspensions : fiches de u2 (document users encore là) et de u3 (document supprimé par le compte)
const FICHES = vi.hoisted(() => {
  const fiche = (id: string, uid: string, email: string, le: Date) => ({
    id,
    data: () => ({ uid, email, le, par: 'admin@exemple.fr' }),
  });
  return [
    fiche('u2', 'u2', 'suspendu@exemple.fr', new Date(2026, 10, 20)),
    fiche('email:suspendu@exemple.fr', 'u2', 'suspendu@exemple.fr', new Date(2026, 10, 20)),
    fiche('u3', 'u3', 'parti@exemple.fr', new Date(2026, 10, 24)),
    fiche('email:parti@exemple.fr', 'u3', 'parti@exemple.fr', new Date(2026, 10, 24)),
  ];
});
vi.mock('../../config/firebase', () => ({ db: {} }));
vi.mock('firebase/firestore', () => ({
  collection: (_db: unknown, nom: string) => nom,
  doc: (_db: unknown, collection: string, id: string) => `${collection}/${id}`,
  getDocs: (nom: string) =>
    Promise.resolve({
      docs:
        nom === 'suspensions'
          ? FICHES
          : [
              {
                id: 'u1',
                data: () => ({
                  email: 'Candidat@Exemple.fr',
                  userType: 'porteur',
                  subscriptionStatus: 'trial',
                  createdAt: new Date(2026, 10, 1),
                }),
              },
              {
                id: 'u2',
                data: () => ({
                  email: 'suspendu@exemple.fr',
                  userType: 'financeur',
                  subscriptionStatus: 'cancelled',
                  createdAt: new Date(2026, 10, 2),
                }),
              },
            ],
    }),
  updateDoc: firestore.updateDoc,
  writeBatch: () => firestore.lot,
  Timestamp: { now: () => 'maintenant' },
}));
// Compte stable : un nouvel objet à chaque affichage relancerait le chargement sans fin
const compte = vi.hoisted(() => ({ currentUser: { uid: 'admin1', email: 'admin@exemple.fr' } }));
vi.mock('../../contexts/AuthContext', () => ({ useAuth: () => compte }));

import ManageUsersPage from './ManageUsersPage';

const afficher = () =>
  render(
    <MemoryRouter>
      <ManageUsersPage />
    </MemoryRouter>,
  );
// Les boutons de suspension et de rétablissement n'ont pas de libellé : ils sont retrouvés par leur icône
const bouton = async (conteneur: HTMLElement, icone: string) => {
  await waitFor(() => expect(conteneur.querySelector(icone)).not.toBeNull());
  return conteneur.querySelector(icone)!.closest('button')!;
};

describe('Gestion des utilisateurs : registre des suspensions', () => {
  beforeEach(() => {
    Object.values(firestore.lot).forEach((f) => f.mockReset());
    firestore.lot.commit.mockResolvedValue(undefined);
    firestore.updateDoc.mockReset();
    vi.stubGlobal('confirm', () => true);
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    lireAnnonces().forEach((a) => retirerAnnonce(a.id));
  });

  it('suspendre écrit le statut et les deux fiches de suspension dans une même écriture groupée', async () => {
    const { container } = afficher();
    fireEvent.click(await bouton(container, '.lucide-user-x'));
    await waitFor(() => expect(firestore.lot.commit).toHaveBeenCalledTimes(1));
    expect(firestore.lot.update).toHaveBeenCalledWith('users/u1', { subscriptionStatus: 'cancelled' });
    const fiche = { uid: 'u1', email: 'candidat@exemple.fr', le: 'maintenant', par: 'admin@exemple.fr' };
    expect(firestore.lot.set).toHaveBeenCalledWith('suspensions/u1', fiche);
    expect(firestore.lot.set).toHaveBeenCalledWith('suspensions/email:candidat@exemple.fr', fiche);
    expect(firestore.updateDoc).not.toHaveBeenCalled();
    expect(lireAnnonces().map((a) => a.type)).toContain('succes');
  });

  it('rétablir remet le compte actif et efface ses deux fiches dans une même écriture groupée', async () => {
    const { container } = afficher();
    fireEvent.click(await bouton(container, '.lucide-user-check'));
    await waitFor(() => expect(firestore.lot.commit).toHaveBeenCalledTimes(1));
    expect(firestore.lot.update).toHaveBeenCalledWith('users/u2', { subscriptionStatus: 'active' });
    expect(firestore.lot.delete).toHaveBeenCalledWith('suspensions/u2');
    expect(firestore.lot.delete).toHaveBeenCalledWith('suspensions/email:suspendu@exemple.fr');
    expect(firestore.updateDoc).not.toHaveBeenCalled();
  });

  it('si l’écriture groupée échoue, un message d’erreur le dit', async () => {
    firestore.lot.commit.mockRejectedValue(Object.assign(new Error('refus'), { code: 'permission-denied' }));
    const { container } = afficher();
    fireEvent.click(await bouton(container, '.lucide-user-x'));
    await waitFor(() => expect(lireAnnonces().map((a) => a.type)).toContain('erreur'));
  });

  // Contre-vérification du 2026-11-26 : un compte suspendu qui a supprimé son document users n'apparaissait plus dans la
  // liste, et l'écriture groupée du rétablissement échouait (mise à jour d'un document absent) ; ses fiches restaient
  it('un compte suspendu sans document users est listé avec son adresse et sa date ; « Rétablir » efface ses fiches', async () => {
    const { findByRole, getByText } = afficher();
    const titre = await findByRole('heading', { name: 'Comptes suspendus sans document' });
    const section = titre.closest('section')!;
    expect(section.textContent).toContain('parti@exemple.fr');
    expect(section.textContent).toContain(new Date(2026, 10, 24).toLocaleDateString('fr-FR'));
    // u2 a encore son document : il reste dans le tableau, pas dans cette section
    expect(section.textContent).not.toContain('suspendu@exemple.fr');
    expect(getByText('suspendu@exemple.fr')).toBeTruthy();

    fireEvent.click(within(section).getByRole('button', { name: 'Rétablir' }));
    await waitFor(() => expect(firestore.lot.commit).toHaveBeenCalledTimes(1));
    expect(firestore.lot.delete).toHaveBeenCalledWith('suspensions/u3');
    expect(firestore.lot.delete).toHaveBeenCalledWith('suspensions/email:parti@exemple.fr');
    expect(firestore.lot.delete).toHaveBeenCalledTimes(2);
    expect(firestore.lot.update).not.toHaveBeenCalled();
    expect(lireAnnonces().map((a) => a.type)).toContain('succes');
  });
});
