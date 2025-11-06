import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { XCircle } from 'lucide-react';

export default function SubscriptionCancelled() {
  const { userProfile } = useAuth();
  const navigate = useNavigate();

  const handleRetry = () => {
    navigate('/abonnement/choisir');
  };

  const handleContinue = () => {
    const dashboardPath = userProfile?.userType === 'porteur'
      ? '/dashboard/porteur'
      : '/dashboard/financeur';
    navigate(dashboardPath);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-lg text-center">
        <XCircle className="h-20 w-20 text-gray-400 mx-auto mb-6" />

        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Paiement annulé
        </h1>

        <p className="text-lg text-gray-600 mb-6">
          Votre paiement a été annulé. Aucune somme n'a été débitée.
        </p>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-700">
            {userProfile?.subscriptionStatus === 'trial' && (
              <>
                Vous pouvez continuer à utiliser la plateforme pendant votre période d'essai gratuite.
              </>
            )}
            {userProfile?.subscriptionStatus !== 'trial' && (
              <>
                Vous devez souscrire à un abonnement pour accéder aux fonctionnalités de la plateforme.
              </>
            )}
          </p>
        </div>

        <div className="space-y-3">
          <Button fullWidth onClick={handleRetry}>
            Choisir un abonnement
          </Button>

          {userProfile?.subscriptionStatus === 'trial' && (
            <button
              onClick={handleContinue}
              className="w-full text-gray-600 hover:text-gray-900 text-sm"
            >
              Continuer avec l'essai gratuit
            </button>
          )}
        </div>
      </Card>
    </div>
  );
}
