// Formulaire de retour des testeurs (jour 7 du plan MVP, changement mise-en-ligne-testeurs, 2026-10-21) : un compte
// connecté dit ce qui ne va pas ou ce qui manque ; l'administrateur le lit dans /admin/testeurs.
import { useState, type FormEvent } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { MessageCircle } from 'lucide-react';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { controlerMessage, pageDepuis, TYPES_RETOUR, type TypeRetour } from '../../utils/retours';

export default function RetourPage() {
  const { currentUser, userProfile } = useAuth();
  const location = useLocation();
  const pageInitiale = (location.state as { page?: string } | null)?.page ?? pageDepuis(document.referrer, window.location.origin);
  const [type, setType] = useState<TypeRetour>('anomalie');
  const [page, setPage] = useState(pageInitiale);
  const [message, setMessage] = useState('');
  const [erreur, setErreur] = useState('');
  const [envoi, setEnvoi] = useState(false);
  const [envoye, setEnvoye] = useState(false);

  const envoyer = async (e: FormEvent) => {
    e.preventDefault();
    const motif = controlerMessage(message);
    if (motif) { setErreur(motif); return; }
    if (!currentUser || !userProfile) { setErreur('Connectez-vous pour envoyer un retour.'); return; }
    setErreur('');
    setEnvoi(true);
    try {
      await addDoc(collection(db, 'retours'), {
        userId: currentUser.uid, role: userProfile.userType, email: currentUser.email ?? '',
        type, page: page.trim().slice(0, 200), message: message.replace(/\s+/g, ' ').trim(), le: Timestamp.now(),
      });
      setEnvoye(true);
    } catch (err) {
      console.error('Retour non envoyé :', err);
      setErreur("L'envoi a échoué. Réessayez dans un instant ; si cela persiste, écrivez-nous depuis la page Contact.");
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-1 flex items-center gap-2"><MessageCircle className="h-7 w-7 text-primary-600" />Donner mon avis</h1>
        <p className="text-gray-600 mb-6">Vous testez l'application : chaque remarque compte, même courte. Une anomalie, une idée, un écran pas clair.</p>
        {envoye ? (
          <Card>
            <p className="text-gray-900 font-medium mb-2">Merci, votre retour est bien arrivé.</p>
            <p className="text-gray-600 text-sm mb-4">Il sera lu par l'administrateur de la plateforme. Vous pouvez en envoyer un autre à tout moment.</p>
            <div className="flex gap-3">
              <Button onClick={() => { setEnvoye(false); setMessage(''); }}>Envoyer un autre retour</Button>
              <Link to={page || '/'}><Button variant="secondary">Revenir</Button></Link>
            </div>
          </Card>
        ) : (
          <Card>
            <form onSubmit={envoyer} className="space-y-5">
              <fieldset>
                <legend className="text-sm font-medium text-gray-700 mb-2">De quoi s'agit-il ?</legend>
                <div className="grid sm:grid-cols-2 gap-2">
                  {TYPES_RETOUR.map(t => (
                    <label key={t.cle} className={`flex items-start gap-2 p-3 rounded-lg border cursor-pointer ${type === t.cle ? 'border-primary-500 bg-primary-50' : 'border-gray-200'}`}>
                      <input type="radio" name="type" value={t.cle} checked={type === t.cle} onChange={() => setType(t.cle)} className="mt-1" />
                      <span><span className="font-medium text-gray-900">{t.libelle}</span><br /><span className="text-xs text-gray-500">{t.aide}</span></span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <div>
                <label htmlFor="page" className="block text-sm font-medium text-gray-700 mb-1">Page concernée (facultatif)</label>
                <input id="page" value={page} onChange={e => setPage(e.target.value)} placeholder="Exemple : /aap/search" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Votre message</label>
                <textarea id="message" value={message} onChange={e => setMessage(e.target.value)} rows={6} placeholder="Ce que vous avez fait, ce que vous attendiez, ce qui s'est passé." className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              {erreur && <div className="p-3 bg-error-50 border border-error-200 rounded-lg text-error-600 text-sm" role="alert">{erreur}</div>}
              <div className="flex gap-3">
                <Button type="submit" disabled={envoi}>{envoi ? 'Envoi...' : 'Envoyer'}</Button>
                <Link to={page || '/'}><Button type="button" variant="ghost">Annuler</Button></Link>
              </div>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
}
