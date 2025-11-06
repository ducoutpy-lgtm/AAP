import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { CheckCircle } from 'lucide-react';

export default function SubscriptionSuccess() {
  const [searchParams] = useSearchParams();
  const { userProfile, refreshUserProfile } = useAuth();
  const navigate = useNavigate();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    // Rafraîchir le profil utilisateur pour obtenir le nouveau statut d'abonnement
    if (sessionId) {
      refreshUserProfile();
    }
  }, [sessionId, refreshUserProfile]);

  const handleContinue = () => {
    const dashboardPath = userProfile?.userType === 'porteur'
      ? '/dashboard/porteur'
      : '/dashboard/financeur';
    navigate(dashboardPath);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-lg text-center">
        <CheckCircle className="h-20 w-20 text-success-500 mx-auto mb-6" />

        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Abonnement activé !
        </h1>

        <p className="text-lg text-gray-600 mb-6">
          Votre abonnement a été activé avec succès. Vous pouvez maintenant profiter de toutes les fonctionnalités de la plateforme.
        </p>

        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-primary-900">
            Un email de confirmation vous a été envoyé avec les détails de votre abonnement.
          </p>
        </div>

        <div className="space-y-3">
          <Button fullWidth onClick={handleContinue}>
            Accéder à mon espace
          </Button>

          <button
            onClick={() => navigate('/profil')}
            className="w-full text-gray-600 hover:text-gray-900 text-sm"
          >
            Gérer mon abonnement
          </button>
        </div>
      </Card>
    </div>
  );
}
