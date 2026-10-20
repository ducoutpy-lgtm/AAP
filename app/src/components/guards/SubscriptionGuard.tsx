import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface SubscriptionGuardProps {
  children: ReactNode;
}

export function SubscriptionGuard({ children }: SubscriptionGuardProps) {
  const { userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!userProfile) {
    return <Navigate to="/login" replace />;
  }

  // Seuls « expiré » et « résilié » ferment l'accès ; un statut absent (profil en cours de rafraîchissement, compte
  // administrateur) ne renvoie pas vers les offres (constat du 2026-10-20 sur les émulateurs)
  const hasActiveSubscription =
    userProfile.subscriptionStatus !== 'expired' && userProfile.subscriptionStatus !== 'cancelled';

  if (!hasActiveSubscription) {
    return <Navigate to="/abonnement/choisir" replace />;
  }

  return <>{children}</>;
}
