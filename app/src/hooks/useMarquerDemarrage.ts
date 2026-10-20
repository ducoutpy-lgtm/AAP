// Marque une action de la liste de démarrage comme faite dès qu'une page est ouverte par un compte connecté
// (changement liste-demarrage, 2026-10-20). Rien n'est écrit pour un visiteur sans compte ni pour une action déjà
// cochée. Pourquoi un hook : une seule ligne dans chaque page concernée.
import { useEffect } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import type { ActionDemarrage } from '../components/demarrage/demarrage';

export function useMarquerDemarrage(cle: ActionDemarrage) {
  const { currentUser, userProfile, refreshUserProfile } = useAuth();
  const dejaFaite = userProfile?.demarrage?.[cle] === true;

  useEffect(() => {
    if (!currentUser || !userProfile || dejaFaite) return;
    setDoc(doc(db, 'users', currentUser.uid), { demarrage: { [cle]: true } }, { merge: true })
      .then(() => refreshUserProfile())
      .catch(err => console.error('Liste de démarrage non mise à jour :', err));
    // refreshUserProfile est redéfinie à chaque rendu ; l'effet ne doit courir qu'au changement de compte ou d'action
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.uid, userProfile?.uid, cle, dejaFaite]);
}
