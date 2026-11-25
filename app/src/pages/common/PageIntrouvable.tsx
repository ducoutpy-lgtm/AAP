// Page 404 (plan niveau A, lot 3.7, 2026-11-25) : remplace le gabarit provisoire, sans lien ; retour à l'accueil,
// et au tableau de bord pour un compte connecté.
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { destinationApresConnexion } from '../../utils/connexion';

export default function PageIntrouvable() {
  const { currentUser, userProfile } = useAuth();
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Page introuvable</h1>
        <p className="text-gray-600 mb-6">
          Cette adresse ne correspond à aucune page : le lien est peut-être incomplet, ou la page a été retirée.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {currentUser && (
            <Link to={destinationApresConnexion(undefined, userProfile)}
              className="px-4 py-2 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700">
              Mon tableau de bord
            </Link>
          )}
          <Link to="/" className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-100">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
