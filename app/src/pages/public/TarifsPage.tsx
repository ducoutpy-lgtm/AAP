// Page Tarifs (changement navigation-et-pages-publiques, 2026-10-20) : le gabarit à trois colonnes du parcours
// d'intégration, pour chaque rôle. Montants de config/stripe.ts, à valider par Monsieur DUCOUT ; paiement non branché.
import { Link } from 'react-router-dom';
import { GrilleOffres } from '../../components/offres/GrilleOffres';
import { TRIAL_DAYS } from '../../config/stripe';

export default function TarifsPage() {
  return (
    <div className="bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Tarifs</h1>
        <p className="text-gray-600 mb-10">
          {TRIAL_DAYS} jours d'essai gratuit à l'inscription, sans carte bancaire. Les montants ci-dessous sont provisoires
          et seront confirmés avant l'ouverture des paiements.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 mb-4">Établissements et associations candidats</h2>
        <GrilleOffres role="porteur" />

        <h2 className="text-xl font-semibold text-gray-900 mt-12 mb-4">Financeurs</h2>
        <GrilleOffres role="financeur" />

        <div className="mt-12 text-center">
          <Link to="/signup" className="inline-block bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium">
            Commencer l'essai gratuit
          </Link>
          <p className="text-sm text-gray-500 mt-3">
            Une question sur les offres ? <Link to="/contact" className="text-primary-600 hover:underline">Écrivez-nous</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
