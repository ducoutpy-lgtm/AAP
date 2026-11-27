// Écritures et écoutes du service de messagerie (relecture adverse du chantier 50, 2026-11-27) : envoi au seul autre
// participant avec la marque « non lu » pour lui, conversation existante jamais réécrite, date du serveur estimée
// pendant l'envoi (le message ne saute plus en haut du fil), tri qui résiste à une date illisible.
import { beforeEach, describe, expect, it, vi } from 'vitest';

const f = vi.hoisted(() => ({
  lot: { set: vi.fn(), update: vi.fn(), commit: vi.fn(() => Promise.resolve()) },
  existe: false,
  setDoc: vi.fn(() => Promise.resolve()),
  instantanes: [] as ((snap: unknown) => void)[],
  optionsLues: [] as unknown[],
}));
vi.mock('../config/firebase', () => ({ db: {} }));
vi.mock('firebase/firestore', () => ({
  collection: (_db: unknown, nom: string) => ({ nom }),
  doc: (_a: unknown, ...chemin: string[]) => ({ chemin: chemin.join('/') }),
  getDoc: () => Promise.resolve({ exists: () => f.existe }),
  setDoc: f.setDoc,
  updateDoc: vi.fn(() => Promise.resolve()),
  writeBatch: () => f.lot,
  serverTimestamp: () => 'DATE_DU_SERVEUR',
  query: (...a: unknown[]) => a,
  where: (...a: unknown[]) => a,
  onSnapshot: (_q: unknown, suivant: (snap: unknown) => void) => {
    f.instantanes.push(suivant);
    return () => {};
  },
}));

import { ecouterConversations, ecouterMessages, envoyerMessage, ouvrirConversation } from './messagerieService';

const CONVERSATION = {
  id: 'c2',
  participants: ['p1', 'f1'],
  applicationId: 'c2',
  titre: 'Projet',
  appel: 'Appel',
  lastMessage: '',
  nonLuPar: null,
};
const instantane = (docs: { id: string; donnees: Record<string, unknown> }[]) => ({
  docs: docs.map((d) => ({
    id: d.id,
    data: (options?: unknown) => {
      f.optionsLues.push(options);
      return d.donnees;
    },
  })),
});

describe('écritures', () => {
  beforeEach(() => {
    f.lot.set.mockClear();
    f.lot.update.mockClear();
    f.lot.commit.mockClear();
    f.setDoc.mockClear();
  });

  it('envoi : message à l’autre participant, conversation en non lue pour lui, dans la même écriture', async () => {
    await envoyerMessage(CONVERSATION, 'f1', '  Pouvez-vous   préciser ?  ');
    expect(f.lot.set).toHaveBeenCalledWith(expect.anything(), {
      conversationId: 'c2',
      senderId: 'f1',
      receiverId: 'p1',
      content: '  Pouvez-vous   préciser ?  ',
      createdAt: 'DATE_DU_SERVEUR',
      read: false,
    });
    expect(f.lot.update).toHaveBeenCalledWith(
      { chemin: 'conversations/c2' },
      { lastMessage: 'Pouvez-vous préciser ?', lastMessageAt: 'DATE_DU_SERVEUR', nonLuPar: 'p1' },
    );
    expect(f.lot.commit).toHaveBeenCalledTimes(1);
  });

  it('envoi refusé sans écriture : contenu vide ou trop long', async () => {
    await expect(envoyerMessage(CONVERSATION, 'f1', '   ')).rejects.toThrow();
    await expect(envoyerMessage(CONVERSATION, 'f1', 'a'.repeat(5001))).rejects.toThrow();
    expect(f.lot.commit).not.toHaveBeenCalled();
  });

  it('ouverture : une conversation existante n’est pas réécrite, une absente est créée à la date du serveur', async () => {
    const candidature = { id: 'c2', porteurId: 'p1', financeurId: 'f1', projectTitle: 'Projet', aapTitle: 'Appel' };
    f.existe = true;
    expect(await ouvrirConversation(candidature)).toBe('c2');
    expect(f.setDoc).not.toHaveBeenCalled();
    f.existe = false;
    await ouvrirConversation(candidature);
    expect(f.setDoc).toHaveBeenCalledWith(
      { chemin: 'conversations/c2' },
      expect.objectContaining({ participants: ['p1', 'f1'], lastMessageAt: 'DATE_DU_SERVEUR', nonLuPar: null }),
    );
  });
});

describe('écoutes', () => {
  beforeEach(() => {
    f.instantanes = [];
    f.optionsLues = [];
  });

  it('messages : date du serveur estimée pendant l’envoi, le message en attente reste en bas du fil', () => {
    const recus: { id: string }[][] = [];
    ecouterMessages('c2', 'p1', (m) => recus.push(m));
    const t = (s: number) => ({ toMillis: () => s });
    f.instantanes[0](instantane([{ id: 'envoye', donnees: { createdAt: null } }]));
    f.instantanes[1](instantane([{ id: 'ancien', donnees: { createdAt: t(1) } }]));
    expect(f.optionsLues).toContainEqual({ serverTimestamps: 'estimate' });
    expect(recus[recus.length - 1].map((m) => m.id)).toEqual(['ancien', 'envoye']);
  });

  it('conversations : une date illisible ne casse pas la liste', () => {
    const listes: { id: string }[][] = [];
    ecouterConversations('p1', (c) => listes.push(c), () => {});
    const t = (s: number) => ({ toMillis: () => s });
    f.instantanes[0](
      instantane([
        { id: 'abimee', donnees: { lastMessageAt: 'x' } },
        { id: 'recente', donnees: { lastMessageAt: t(2) } },
        { id: 'ancienne', donnees: { lastMessageAt: t(1) } },
      ]),
    );
    expect(listes[listes.length - 1].map((c) => c.id)).toEqual(['recente', 'ancienne', 'abimee']);
  });
});
