// Messagerie (question 50, « construire » de Monsieur DUCOUT, 2026-11-26) : la page Messages lisait une collection
// `conversations` que rien n'écrivait. Une conversation par candidature envoyée par l'application (identifiant = celui
// de la candidature), entre le candidat et le financeur ; les messages restent dans la collection `messages`, que
// l'export des données personnelles lit déjà. Les règles Firestore contrôlent les mêmes bornes que ce service.
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  type Timestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';

export const LONGUEUR_MAX_MESSAGE = 5000;
const LONGUEUR_APERCU = 200;
const LONGUEUR_TITRE = 300;

export interface Conversation {
  id: string;
  participants: string[];
  applicationId: string;
  titre: string;
  appel: string;
  lastMessage: string;
  lastMessageAt?: Timestamp;
  // Participant qui n'a pas encore lu le dernier message (posé à l'envoi pour l'autre, effacé à la lecture)
  nonLuPar: string | null;
}

export interface MessageConversation {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt?: Timestamp;
  read: boolean;
}

interface CandidatureSource {
  id: string;
  porteurId: string;
  financeurId: string;
  projectTitle?: string;
  aapTitle?: string;
}

/** Données d'une conversation neuve pour une candidature (fonction pure ; la date est posée à l'écriture). */
export function conversationDeCandidature(c: CandidatureSource) {
  return {
    participants: [c.porteurId, c.financeurId],
    applicationId: c.id,
    titre: (c.projectTitle ?? '').slice(0, LONGUEUR_TITRE),
    appel: (c.aapTitle ?? '').slice(0, LONGUEUR_TITRE),
    lastMessage: '',
    nonLuPar: null,
  };
}

/** Une candidature envoyée par l'application ouvre une conversation ; ni un brouillon, ni un suivi externe, ni un
 * participant fantôme (fiche importée, compte supprimé, financeur absent : relecture du 2026-11-27). */
export function peutEcrire(c: { status?: string; externe?: boolean; porteurId?: string; financeurId?: string }): boolean {
  return (
    !!c.status &&
    c.status !== 'draft' &&
    !c.externe &&
    !!c.financeurId &&
    c.financeurId !== 'scraped' &&
    !!c.porteurId &&
    c.porteurId !== 'compte-supprime'
  );
}

/** Millisecondes d'une date Firestore, ou null si elle manque ou ne se lit pas (fonction pure). */
function millis(t: unknown): number | null {
  const m = (t as { toMillis?: () => number } | null | undefined)?.toMillis;
  return typeof m === 'function' ? m.call(t) : null;
}

export function contenuValide(texte: string): boolean {
  return texte.trim().length >= 1 && texte.length <= LONGUEUR_MAX_MESSAGE;
}

/** Aperçu du dernier message dans la liste des conversations. */
export function apercu(texte: string): string {
  return texte.replace(/\s+/g, ' ').trim().slice(0, LONGUEUR_APERCU);
}

/** Messages envoyés et reçus (deux requêtes, que les règles savent prouver), réunis sans doublon et dans l'ordre ;
 * un message sans date (en cours d'envoi) reste en bas du fil. */
export function fusionnerMessages<T extends { id: string; createdAt?: unknown }>(envoyes: T[], recus: T[]): T[] {
  const parId = new Map<string, T>();
  for (const m of [...envoyes, ...recus]) parId.set(m.id, m);
  return [...parId.values()].sort((a, b) => (millis(a.createdAt) ?? Infinity) - (millis(b.createdAt) ?? Infinity));
}

// Date du serveur estimée par le poste tant que l'écriture n'est pas revenue (relecture du 2026-11-27 : le message
// envoyé sautait un instant en haut du fil)
const AVEC_DATE_ESTIMEE = { serverTimestamps: 'estimate' } as const;

/** Ouvre la conversation d'une candidature, en la créant au premier usage ; rend son identifiant. */
export async function ouvrirConversation(c: CandidatureSource): Promise<string> {
  const ref = doc(db, 'conversations', c.id);
  if (!(await getDoc(ref)).exists()) {
    await setDoc(ref, { ...conversationDeCandidature(c), lastMessageAt: serverTimestamp() });
  }
  return c.id;
}

/** Envoie un message à l'autre participant ; la conversation passe en non lue pour lui, dans la même écriture. */
export async function envoyerMessage(conversation: Conversation, expediteur: string, contenu: string): Promise<void> {
  const destinataire = conversation.participants.find((p) => p !== expediteur);
  if (!destinataire || !contenuValide(contenu)) throw new Error('message invalide');
  const lot = writeBatch(db);
  lot.set(doc(collection(db, 'messages')), {
    conversationId: conversation.id,
    senderId: expediteur,
    receiverId: destinataire,
    content: contenu,
    createdAt: serverTimestamp(),
    read: false,
  });
  lot.update(doc(db, 'conversations', conversation.id), {
    lastMessage: apercu(contenu),
    lastMessageAt: serverTimestamp(),
    nonLuPar: destinataire,
  });
  await lot.commit();
}

export async function marquerLue(conversationId: string): Promise<void> {
  await updateDoc(doc(db, 'conversations', conversationId), { nonLuPar: null });
}

/** Conversations du compte, la plus récente en premier (tri sur le poste : pas d'index composé à déployer) ; une
 * date illisible ne casse pas la liste (relecture du 2026-11-27), la conversation va en fin de liste. */
export function ecouterConversations(uid: string, rappel: (c: Conversation[]) => void, erreur: (e: Error) => void) {
  return onSnapshot(
    query(collection(db, 'conversations'), where('participants', 'array-contains', uid)),
    (snap) =>
      rappel(
        snap.docs
          .map((d) => ({ id: d.id, ...d.data(AVEC_DATE_ESTIMEE) }) as Conversation)
          .sort((a, b) => (millis(b.lastMessageAt) ?? -Infinity) - (millis(a.lastMessageAt) ?? -Infinity)),
      ),
    erreur,
  );
}

/** Messages d'une conversation, envoyés et reçus par le compte, à jour en temps réel. */
export function ecouterMessages(
  conversationId: string,
  uid: string,
  rappel: (m: MessageConversation[]) => void,
  erreur?: (e: Error) => void,
) {
  let envoyes: MessageConversation[] = [];
  let recus: MessageConversation[] = [];
  const lire = (champ: 'senderId' | 'receiverId', poser: (m: MessageConversation[]) => void) =>
    onSnapshot(
      query(collection(db, 'messages'), where('conversationId', '==', conversationId), where(champ, '==', uid)),
      (snap) => {
        poser(snap.docs.map((d) => ({ id: d.id, ...d.data(AVEC_DATE_ESTIMEE) }) as MessageConversation));
        rappel(fusionnerMessages(envoyes, recus));
      },
      erreur,
    );
  const arreterEnvoyes = lire('senderId', (m) => (envoyes = m));
  const arreterRecus = lire('receiverId', (m) => (recus = m));
  return () => {
    arreterEnvoyes();
    arreterRecus();
  };
}
