// Carte « Textes réutilisables » de Mon profil (changement textes-reutilisables, 2026-11-19) : trois textes enregistrés
// dans le profil du candidat, repris d'un clic dans le résumé d'une candidature.
import { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Button } from '../ui/Button';
import { LIBELLES_TEXTES, type CleTexte, type TextesReutilisables } from '../../utils/textesReutilisables';

export function TextesReutilisablesCarte({ uid, initial }: { uid: string; initial?: TextesReutilisables }) {
  const [textes, setTextes] = useState<TextesReutilisables>(initial ?? {});
  const [etat, setEtat] = useState<'' | 'en-cours' | 'enregistre' | 'echec'>('');

  const enregistrer = async () => {
    setEtat('en-cours');
    try {
      await setDoc(doc(db, 'porteurProfiles', uid), { textesReutilisables: textes }, { merge: true });
      setEtat('enregistre');
    } catch (err) {
      console.error('Error saving reusable texts:', err);
      setEtat('echec');
    }
  };

  return (
    <div className="mt-4 pt-4 border-t text-sm">
      <h2 className="font-semibold text-gray-900 mb-1">Textes réutilisables</h2>
      <p className="text-gray-600 mb-3">Écrits une fois, ajoutés d'un clic au résumé de chaque candidature.</p>
      <div className="space-y-3">
        {(Object.keys(LIBELLES_TEXTES) as CleTexte[]).map((cle) => (
          <div key={cle}>
            <label className="block text-gray-700 mb-1" htmlFor={`texte-${cle}`}>
              {LIBELLES_TEXTES[cle]}
            </label>
            <textarea
              id={`texte-${cle}`}
              rows={3}
              className="input-field"
              value={textes[cle] ?? ''}
              onChange={(e) => {
                setTextes({ ...textes, [cle]: e.target.value });
                setEtat('');
              }}
            />
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-3">
        <Button variant="secondary" onClick={enregistrer} disabled={etat === 'en-cours'}>
          {etat === 'en-cours' ? 'Enregistrement...' : 'Enregistrer les textes'}
        </Button>
        {etat === 'enregistre' && <span className="text-green-700">Textes enregistrés.</span>}
        {etat === 'echec' && (
          <span className="text-error-600">Les textes n'ont pas pu être enregistrés. Réessayez.</span>
        )}
      </div>
    </div>
  );
}
