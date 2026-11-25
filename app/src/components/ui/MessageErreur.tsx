// Erreur de lecture d'une page (plan niveau A, lot 3.1, 2026-11-25) : une panne s'affichait comme « aucun résultat » ou
// comme un chargement sans fin. Sur le modèle de SavedSearchesPage : un message et un bouton « Réessayer », qui relance
// la lecture (ou recharge la page quand elle n'a pas de fonction de lecture à part).
import { Button } from './Button';

interface MessageErreurProps {
  onReessayer?: () => void;
  texte?: string;
}

export function MessageErreur({
  onReessayer,
  texte = "Les données n'ont pas pu être chargées. Vérifiez votre connexion, puis réessayez.",
}: MessageErreurProps) {
  return (
    <div className="container mx-auto px-4 py-12 max-w-xl">
      <div role="alert" className="p-4 rounded-lg border border-error-200 bg-error-50 text-error-800">
        <p>{texte}</p>
        <Button variant="secondary" className="mt-3" onClick={onReessayer ?? (() => window.location.reload())}>
          Réessayer
        </Button>
      </div>
    </div>
  );
}
