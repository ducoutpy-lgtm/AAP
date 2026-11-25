// Case « Recevoir le courriel du lundi » de Mon profil (décision 42 du 2026-11-24) : aucun écran ne permettait d'arrêter
// le courriel. Elle écrit notificationPreferences.email (champ que la règle users laisse au propriétaire) ;
// scraping/alertes.py n'envoie rien à un compte qui l'a décochée.
import { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../ui/Card';

export function PreferenceCourrielCarte({ uid, actif }: { uid: string; actif: boolean }) {
  const { refreshUserProfile } = useAuth();
  const [coche, setCoche] = useState(actif);
  const [message, setMessage] = useState('');

  const basculer = async () => {
    const valeur = !coche;
    setCoche(valeur);
    setMessage('');
    try {
      await setDoc(doc(db, 'users', uid), { notificationPreferences: { email: valeur } }, { merge: true });
      setMessage(valeur ? 'Le courriel du lundi vous sera envoyé.' : "Le courriel du lundi n'est plus envoyé.");
    } catch {
      setCoche(!valeur);
      setMessage("Le réglage n'a pas pu être enregistré : réessayez dans un instant.");
      return;
    }
    // Profil du contexte relu après l'écriture (relecture du 2026-11-25, constat 3) : sinon Mon profil, rouvert, et la
    // recherche repartaient de l'ancienne valeur. Hors du try : un échec de relecture n'annule pas le réglage enregistré.
    refreshUserProfile().catch((err) => console.warn('Profil non relu après le réglage du courriel :', err));
  };

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-2">Courriel du lundi</h2>
      <label className="flex items-start gap-3 text-sm text-gray-700">
        <input type="checkbox" checked={coche} onChange={basculer} className="mt-1 h-4 w-4" />
        <span>
          Recevoir le courriel du lundi : nouveaux appels pour votre structure et alertes de vos recherches
          enregistrées.
        </span>
      </label>
      {message && (
        <p className="mt-2 text-sm text-gray-600" role="status">
          {message}
        </p>
      )}
    </Card>
  );
}
