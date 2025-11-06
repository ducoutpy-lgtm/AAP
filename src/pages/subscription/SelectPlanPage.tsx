import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { STRIPE_PLANS, TRIAL_DAYS } from '../../config/stripe';
import { Check, AlertCircle } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

export default function SelectPlanPage() {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState('');

  if (!userProfile) {
    return <div>Chargement...</div>;
  }

  const userType = userProfile.userType as 'porteur' | 'financeur';
  const plans = STRIPE_PLANS[userType];

  // Si l'utilisateur a déjà un abonnement actif
  if (userProfile.subscriptionStatus === 'active') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md text-center">
          <AlertCircle className="h-16 w-16 text-primary-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Abonnement actif
          </h2>
          <p className="text-gray-600 mb-6">
            Vous avez déjà un abonnement actif.
          </p>
          <Button onClick={() => navigate('/profil')}>
            Gérer mon abonnement
          </Button>
        </Card>
      </div>
    );
  }

  const handleSelectPlan = async (planType: 'monthly' | 'annual') => {
    setError('');
    setLoading(planType);

    try {
      const plan = plans[planType];

      // Appeler la Cloud Function pour créer la session Stripe
      const createCheckoutSession = httpsCallable(functions, 'createCheckoutSession');
      const result = await createCheckoutSession({
        priceId: plan.priceId,
        userType: userType,
      });

      const { sessionId } = result.data as { sessionId: string };

      // Rediriger vers Stripe Checkout
      const stripe = await stripePromise;
      if (!stripe) throw new Error('Stripe non initialisé');

      const { error: stripeError } = await stripe.redirectToCheckout({ sessionId });

      if (stripeError) {
        throw stripeError;
      }
    } catch (err: any) {
      console.error('Erreur:', err);
      setError(err.message || 'Une erreur est survenue');
      setLoading(null);
    }
  };

  const handleSkipTrial = () => {
    // Rediriger vers le dashboard avec la période d'essai
    const dashboardPath = userType === 'porteur' ? '/dashboard/porteur' : '/dashboard/financeur';
    navigate(dashboardPath);
  };

  const features = userType === 'porteur' ? [
    'Recherche illimitée d\'AAP',
    'Alertes personnalisées',
    'Candidatures en ligne',
    'Outil de préqualification',
    'Suivi des candidatures',
    'Messagerie avec financeurs',
  ] : [
    'Publication d\'AAP illimitée',
    'Gestion des candidatures',
    'Préqualification automatique',
    'Statistiques avancées',
    'Messagerie avec porteurs',
    'Support prioritaire',
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choisissez votre formule
          </h1>
          <p className="text-xl text-gray-600">
            {TRIAL_DAYS} jours d'essai gratuit • Aucune carte bancaire requise
          </p>
          {userProfile.subscriptionStatus === 'trial' && userProfile.trialEndsAt && (
            <p className="mt-2 text-sm text-primary-600">
              Votre période d'essai est en cours
            </p>
          )}
        </div>

        {error && (
          <div className="max-w-4xl mx-auto mb-6 p-4 bg-error-50 border border-error-200 rounded-lg text-error-600">
            {error}
          </div>
        )}

        {/* Pricing Cards */}
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8 mb-8">
          {/* Monthly Plan */}
          <Card className="!p-8">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Mensuel</h3>
              <div className="mb-4">
                <span className="text-5xl font-bold text-gray-900">
                  {plans.monthly.amount}€
                </span>
                <span className="text-gray-600">/mois</span>
              </div>
              <p className="text-sm text-gray-500">
                Facturation mensuelle • Annulable à tout moment
              </p>
            </div>

            <ul className="space-y-3 mb-8">
              {features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <Check className="h-5 w-5 text-success-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>

            <Button
              fullWidth
              onClick={() => handleSelectPlan('monthly')}
              loading={loading === 'monthly'}
              disabled={loading !== null}
            >
              {userProfile.subscriptionStatus === 'trial' ? 'S\'abonner' : 'Démarrer l\'essai gratuit'}
            </Button>
          </Card>

          {/* Annual Plan */}
          <Card className="!p-8 border-2 border-primary-600 relative">
            <div className="absolute top-0 right-8 transform -translate-y-1/2">
              <span className="inline-block bg-primary-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                2 mois offerts
              </span>
            </div>

            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Annuel</h3>
              <div className="mb-2">
                <span className="text-5xl font-bold text-gray-900">
                  {plans.annual.amount}€
                </span>
                <span className="text-gray-600">/an</span>
              </div>
              <div className="text-sm mb-4">
                <span className="text-gray-500">Soit </span>
                <span className="text-primary-600 font-semibold">
                  {(plans.annual.amount / 12).toFixed(2)}€/mois
                </span>
              </div>
              <p className="text-sm text-gray-500">
                Facturation annuelle • Économisez {((1 - plans.annual.amount / (plans.monthly.amount * 12)) * 100).toFixed(0)}%
              </p>
            </div>

            <ul className="space-y-3 mb-8">
              {features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <Check className="h-5 w-5 text-success-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>

            <Button
              fullWidth
              onClick={() => handleSelectPlan('annual')}
              loading={loading === 'annual'}
              disabled={loading !== null}
            >
              {userProfile.subscriptionStatus === 'trial' ? 'S\'abonner' : 'Démarrer l\'essai gratuit'}
            </Button>
          </Card>
        </div>

        {/* Skip for now (if in trial) */}
        {userProfile.subscriptionStatus === 'trial' && (
          <div className="text-center">
            <button
              onClick={handleSkipTrial}
              className="text-gray-600 hover:text-gray-900 underline"
            >
              Continuer avec la période d'essai
            </button>
          </div>
        )}

        {/* Features comparison */}
        <div className="max-w-4xl mx-auto mt-12">
          <Card>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Toutes les fonctionnalités incluses
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center">
                  <Check className="h-5 w-5 text-success-500 mr-2" />
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* FAQ */}
        <div className="max-w-4xl mx-auto mt-12 text-center text-sm text-gray-600">
          <p className="mb-2">
            <strong>Questions fréquentes:</strong>
          </p>
          <p>
            • Aucun engagement • Annulation en 1 clic • Données sécurisées • Support 7j/7
          </p>
        </div>
      </div>
    </div>
  );
}
