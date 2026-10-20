// Page Contact (changement navigation-et-pages-publiques, 2026-10-20) : sujet et message, comme sur helloDarwin,
// enregistrés dans la collection messagesContact (règle Firestore à déployer après accord) ; coordonnées à côté.
import { FormEvent, useState } from 'react';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { EDITEUR } from '../legal/editeur';

const SUJETS = [
  { value: 'question', label: 'Une question sur le service' },
  { value: 'offres', label: 'Les offres et tarifs' },
  { value: 'fiche', label: 'Une erreur sur une fiche' },
  { value: 'source', label: 'Proposer un financeur ou une source' },
  { value: 'compte', label: 'Mon compte' },
  { value: 'autre', label: 'Autre' },
];

export default function ContactPage() {
  const { currentUser } = useAuth();
  const [sujet, setSujet] = useState('');
  const [email, setEmail] = useState(currentUser?.email ?? '');
  const [message, setMessage] = useState('');
  const [envoi, setEnvoi] = useState(false);
  const [resultat, setResultat] = useState<{ ok: boolean; texte: string } | null>(null);

  const envoyer = async (e: FormEvent) => {
    e.preventDefault();
    setEnvoi(true);
    setResultat(null);
    try {
      await addDoc(collection(db, 'messagesContact'), {
        sujet,
        email: email.trim() || null,
        message: message.trim(),
        userId: currentUser?.uid ?? null,
        createdAt: Timestamp.now(),
      });
      setResultat({ ok: true, texte: 'Message envoyé. Nous vous répondons dès que possible.' });
      setSujet('');
      setMessage('');
    } catch {
      setResultat({ ok: false, texte: "L'envoi n'a pas abouti. Vous pouvez nous écrire directement aux coordonnées ci-contre." });
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <div className="bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Nous contacter</h1>
        <div className="grid md:grid-cols-3 gap-8">
          <form onSubmit={envoyer} className="md:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
            {resultat && (
              <div className={`p-3 rounded-lg text-sm border ${resultat.ok ? 'bg-green-50 border-green-200 text-green-700' : 'bg-error-50 border-error-200 text-error-600'}`}>
                {resultat.texte}
              </div>
            )}
            <Select label="Sujet" value={sujet} onChange={(e) => setSujet(e.target.value)} options={SUJETS} required />
            <Input label="Votre adresse e-mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} helperText="Pour vous répondre" required />
            <Textarea label="Message" value={message} onChange={(e) => setMessage(e.target.value)} rows={6} required />
            <div className="flex justify-end">
              <Button type="submit" loading={envoi}>Envoyer</Button>
            </div>
          </form>
          <aside className="text-sm text-gray-700 space-y-4">
            <div>
              <h2 className="font-semibold text-gray-900 mb-1">Autres moyens</h2>
              <p>{EDITEUR.raisonSociale}</p>
              <p>{EDITEUR.siege}</p>
              <p>{EDITEUR.contact}</p>
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 mb-1">Délégué à la protection des données</h2>
              <p>{EDITEUR.dpo}</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
