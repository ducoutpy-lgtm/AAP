// Bandeau des annonces (utils/annonces.ts) : succès et informations lus comme « status », erreurs comme « alert » par les
// lecteurs d'écran ; chaque message se ferme par sa croix.
import { useSyncExternalStore } from 'react';
import { ecouterAnnonces, lireAnnonces, retirerAnnonce, type TypeAnnonce } from '../../utils/annonces';

const STYLES: Record<TypeAnnonce, string> = {
  succes: 'border-success-200 bg-success-50 text-success-800',
  erreur: 'border-error-200 bg-error-50 text-error-800',
  info: 'border-info-200 bg-info-50 text-info-800',
};

export function Annonces() {
  const liste = useSyncExternalStore(ecouterAnnonces, lireAnnonces);
  if (liste.length === 0) return null;
  return (
    <div className="fixed top-4 inset-x-4 z-50 flex flex-col items-center gap-2 pointer-events-none">
      {liste.map((annonce) => (
        <div
          key={annonce.id}
          role={annonce.type === 'erreur' ? 'alert' : 'status'}
          className={`pointer-events-auto w-full max-w-xl rounded-lg border px-4 py-3 shadow flex items-start gap-3 ${STYLES[annonce.type]}`}
        >
          <p className="flex-1 text-sm">{annonce.texte}</p>
          <button
            type="button"
            aria-label="Fermer le message"
            onClick={() => retirerAnnonce(annonce.id)}
            className="text-lg leading-none opacity-70 hover:opacity-100"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
