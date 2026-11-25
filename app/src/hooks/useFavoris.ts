// Favoris du compte connecté pour la recherche et la fiche (plan niveau A, lot 3.7) : lus une fois, la bascule change
// l'écran aussitôt et revient en arrière si l'enregistrement échoue.
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { basculerFavori, lireFavoris } from '../services/favorisService';

export function useFavoris() {
  const { currentUser } = useAuth();
  const uid = currentUser?.uid;
  const [favoris, setFavoris] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!uid) return;
    let actif = true;
    lireFavoris(uid)
      .then(lus => { if (actif) setFavoris(lus); })
      .catch(err => console.error('Favoris non lus :', err));
    return () => { actif = false; };
  }, [uid]);

  const basculer = (aapId: string) => {
    if (!uid) return;
    const etait = favoris.has(aapId);
    const marquer = (favori: boolean) => setFavoris(avant => {
      const apres = new Set(avant);
      if (favori) apres.add(aapId);
      else apres.delete(aapId);
      return apres;
    });
    marquer(!etait);
    basculerFavori(uid, aapId, etait).catch(err => {
      console.error('Favori non enregistré :', err);
      marquer(etait);
    });
  };

  return { favoris, basculer };
}
