// Messagerie (question 50, « construire » de Monsieur DUCOUT, 2026-11-26) : la page lisait une collection
// `conversations` que rien n'écrivait. Elle passe par le service de messagerie : une conversation par candidature
// envoyée, ouverte depuis la candidature (candidat ou financeur), choisie ici par l'adresse (?conversation=).
import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Timestamp } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { MessageSquare, Send, Search, User } from 'lucide-react';
import { annoncer } from '../../utils/annonces';
import { activableAuClavier } from '../../utils/clavier';
import {
  contenuValide,
  ecouterConversations,
  ecouterMessages,
  envoyerMessage,
  marquerLue,
  type Conversation,
  type MessageConversation,
} from '../../services/messagerieService';

export default function MessagesPage() {
  const { currentUser, userProfile } = useAuth();
  const [parametres] = useSearchParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(parametres.get('conversation'));
  const [messages, setMessages] = useState<MessageConversation[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  // Envoi en cours : un second clic ou la touche Entrée n'envoient pas deux fois (relecture du 2026-11-27)
  const [envoi, setEnvoi] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const uid = currentUser?.uid;
  const selectedConversation = conversations.find((c) => c.id === selectedId) ?? null;

  // Conversations du compte, à jour en temps réel (une réponse ou une conversation ouverte par l'autre apparaît)
  useEffect(() => {
    if (!uid) return;
    return ecouterConversations(
      uid,
      (liste) => {
        setConversations(liste);
        setLoading(false);
      },
      (err) => {
        console.error('Error loading conversations:', err);
        setLoading(false);
      },
    );
  }, [uid]);

  // Changement de conversation : les messages de la précédente disparaissent tout de suite (relecture du 2026-11-27)
  useEffect(() => {
    setMessages([]);
    if (!uid || !selectedId) return;
    return ecouterMessages(selectedId, uid, setMessages, (err) => {
      console.error('Error loading messages:', err);
      annoncer("Les messages n'ont pas pu être chargés : réessayez dans un instant.", 'erreur');
    });
  }, [uid, selectedId]);

  // Conversation ouverte : sa marque « non lu » est effacée pour le compte qui la lit
  const nonLuPourMoi = !!uid && selectedConversation?.nonLuPar === uid;
  useEffect(() => {
    if (nonLuPourMoi && selectedId) {
      marquerLue(selectedId).catch((err) => console.warn('Conversation non marquée lue :', err));
    }
  }, [nonLuPourMoi, selectedId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (envoi || !newMessage.trim() || !selectedConversation || !uid) return;
    if (!contenuValide(newMessage)) {
      annoncer('Le message dépasse 5 000 caractères : raccourcissez-le.', 'erreur');
      return;
    }
    setEnvoi(true);
    try {
      await envoyerMessage(selectedConversation, uid, newMessage);
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
      annoncer("Le message n'a pas pu être envoyé : réessayez dans un instant.", 'erreur');
    } finally {
      setEnvoi(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView?.({ behavior: 'smooth' });
  };

  // Date posée par le serveur : absente un instant après l'envoi, le temps que l'écriture revienne
  const formatMessageTime = (timestamp?: Timestamp | null): string => {
    if (typeof timestamp?.toDate !== 'function') return "À l'instant";
    const date = timestamp.toDate();
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "À l'instant";
    if (diffMins < 60) return `${diffMins} min`;
    if (diffMs < 86400000) {
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  // L'autre participant : le financeur pour le candidat, le candidat pour le financeur
  const getOtherParticipantName = (): string =>
    userProfile?.userType === 'porteur' ? 'Financeur de l’appel' : 'Candidat';

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.appel.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Messagerie</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Conversations list */}
          <Card className="p-4 overflow-hidden flex flex-col">
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2">
              {filteredConversations.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Aucune conversation</p>
                </div>
              ) : (
                filteredConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    onClick={() => setSelectedId(conversation.id)}
                    {...activableAuClavier(() => setSelectedId(conversation.id))}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedConversation?.id === conversation.id
                        ? 'bg-primary-50 border border-primary-200'
                        : 'hover:bg-gray-50 border border-transparent'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <User className="h-5 w-5 text-gray-400" />
                        <span className="font-semibold text-sm text-gray-900">
                          {getOtherParticipantName()}
                        </span>
                      </div>
                      {conversation.nonLuPar === uid && <Badge variant="primary">Non lu</Badge>}
                    </div>

                    <div className="text-xs text-gray-500 mb-1">
                      {conversation.titre}
                      {conversation.appel && ` · ${conversation.appel}`}
                    </div>

                    <p className="text-sm text-gray-600 truncate">{conversation.lastMessage}</p>
                    <span className="text-xs text-gray-400 mt-1 block">
                      {formatMessageTime(conversation.lastMessageAt)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Messages */}
          <Card className="lg:col-span-2 p-0 overflow-hidden flex flex-col">
            {selectedConversation ? (
              <>
                {/* Header */}
                <div className="p-4 border-b bg-white">
                  <div className="flex items-center gap-3">
                    <User className="h-8 w-8 text-gray-400" />
                    <div>
                      <h3 className="font-semibold text-gray-900">{getOtherParticipantName()}</h3>
                      <p className="text-sm text-gray-600">
                        {selectedConversation.titre}
                        {selectedConversation.appel && ` · ${selectedConversation.appel}`}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                  {messages.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Aucun message. Commencez la conversation !</p>
                    </div>
                  ) : (
                    messages.map((message) => {
                      const isOwnMessage = message.senderId === uid;

                      return (
                        <div key={message.id} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                          <div
                            className={`max-w-[70%] rounded-lg p-3 ${
                              isOwnMessage
                                ? 'bg-primary-600 text-white'
                                : 'bg-white text-gray-900 border border-gray-200'
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                            <span
                              className={`text-xs mt-1 block ${isOwnMessage ? 'text-primary-100' : 'text-gray-500'}`}
                            >
                              {formatMessageTime(message.createdAt)}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t bg-white">
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="Écrivez votre message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      className="flex-1"
                    />
                    <Button onClick={handleSendMessage} disabled={envoi || !newMessage.trim()} aria-label="Envoyer">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Sélectionnez une conversation pour commencer</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
