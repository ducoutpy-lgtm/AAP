// Page Messages (question 50, « construire », 2026-11-26) : elle lisait une collection que rien n'écrivait. Elle passe
// par le service de messagerie : conversations du compte, conversation choisie par l'adresse, « non lu » effacé à
// l'ouverture, envoi borné à 5 000 caractères, échec annoncé à l'écran.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const etat = vi.hoisted(() => ({
  conversations: [] as unknown[],
  envoyer: vi.fn<(c: unknown, uid: string, texte: string) => Promise<void>>(() => Promise.resolve()),
  marquerLue: vi.fn<(id: string) => Promise<void>>(() => Promise.resolve()),
  annoncer: vi.fn(),
}));
vi.mock('../../config/firebase', () => ({ db: {} }));
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({ currentUser: { uid: 'p1' }, userProfile: { userType: 'porteur' } }),
}));
vi.mock('../../utils/annonces', () => ({ annoncer: etat.annoncer }));
vi.mock('../../services/messagerieService', async (original) => ({
  ...(await original<typeof import('../../services/messagerieService')>()),
  ecouterConversations: (_uid: string, rappel: (c: unknown[]) => void) => {
    rappel(etat.conversations);
    return () => {};
  },
  ecouterMessages: (id: string, _uid: string, rappel: (m: unknown[]) => void) => {
    // c2 a un message ; c3 n'a encore rien renvoyé (écoute en cours)
    if (id === 'c2') rappel([{ id: 'm1', senderId: 'f1', content: 'Message de c2', read: false }]);
    return () => {};
  },
  envoyerMessage: (c: unknown, uid: string, texte: string) => etat.envoyer(c, uid, texte),
  marquerLue: (id: string) => etat.marquerLue(id),
}));

import MessagesPage from './MessagesPage';

const CONVERSATION = {
  id: 'c2',
  participants: ['p1', 'f1'],
  applicationId: 'c2',
  titre: 'Ateliers équilibre',
  appel: 'Prévention des chutes',
  lastMessage: 'Pouvez-vous préciser votre budget ?',
  nonLuPar: 'p1',
};

const ouvrir = () =>
  render(
    <MemoryRouter initialEntries={['/messages?conversation=c2']}>
      <MessagesPage />
    </MemoryRouter>,
  );

describe('page Messages', () => {
  beforeEach(() => {
    etat.conversations = [CONVERSATION];
    etat.envoyer.mockReset().mockResolvedValue(undefined);
    etat.marquerLue.mockClear();
    etat.annoncer.mockClear();
  });
  afterEach(cleanup);

  it('ouvre la conversation de l’adresse et efface son « non lu »', async () => {
    ouvrir();
    expect(await screen.findByRole('heading', { name: 'Financeur de l’appel' })).toBeInTheDocument();
    expect(etat.marquerLue).toHaveBeenCalledWith('c2');
  });

  it('envoie le message à la conversation ouverte', async () => {
    ouvrir();
    const champ = await screen.findByPlaceholderText('Écrivez votre message...');
    fireEvent.change(champ, { target: { value: 'Oui, voici le détail.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Envoyer' }));
    await vi.waitFor(() => expect(etat.envoyer).toHaveBeenCalledWith(CONVERSATION, 'p1', 'Oui, voici le détail.'));
  });

  // Relecture du 2026-11-27 : deux clics rapides envoyaient deux fois ; changer de conversation laissait les messages
  // de la précédente sous le nouvel en-tête
  it('un seul envoi tant que le premier n’est pas revenu', async () => {
    let finir = () => {};
    etat.envoyer.mockImplementation(() => new Promise<void>((r) => (finir = r)));
    ouvrir();
    const champ = await screen.findByPlaceholderText('Écrivez votre message...');
    fireEvent.change(champ, { target: { value: 'Bonjour' } });
    fireEvent.click(screen.getByRole('button', { name: 'Envoyer' }));
    fireEvent.click(screen.getByRole('button', { name: 'Envoyer' }));
    expect(etat.envoyer).toHaveBeenCalledTimes(1);
    finir();
  });

  it('changer de conversation efface les messages de la précédente', async () => {
    etat.conversations = [CONVERSATION, { ...CONVERSATION, id: 'c3', titre: 'Autre projet', nonLuPar: null }];
    ouvrir();
    expect(await screen.findByText('Message de c2')).toBeInTheDocument();
    fireEvent.click(screen.getByText(/Autre projet/));
    await vi.waitFor(() => expect(screen.queryByText('Message de c2')).toBeNull());
  });

  it('un message de plus de 5 000 caractères n’est pas envoyé ; un envoi en échec est annoncé', async () => {
    ouvrir();
    const champ = await screen.findByPlaceholderText('Écrivez votre message...');
    fireEvent.change(champ, { target: { value: 'a'.repeat(5001) } });
    fireEvent.click(screen.getByRole('button', { name: 'Envoyer' }));
    expect(etat.envoyer).not.toHaveBeenCalled();
    expect(etat.annoncer).toHaveBeenCalledWith(expect.stringContaining('5 000 caractères'), 'erreur');
    etat.envoyer.mockRejectedValue(new Error('refus'));
    fireEvent.change(champ, { target: { value: 'Bonjour' } });
    fireEvent.click(screen.getByRole('button', { name: 'Envoyer' }));
    await vi.waitFor(() =>
      expect(etat.annoncer).toHaveBeenCalledWith("Le message n'a pas pu être envoyé : réessayez dans un instant.", 'erreur'),
    );
  });
});
