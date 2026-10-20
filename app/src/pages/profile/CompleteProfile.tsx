// Entrée du parcours d'intégration (changement parcours-integration, 2026-10-20) : un profil déjà complet va au
// tableau de bord ; sinon le parcours en trois écrans s'ouvre. Un compte sans document utilisateur (connexion
// Google) suit le même parcours et choisit son rôle à l'accueil.
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import ParcoursIntegrationPage from '../onboarding/ParcoursIntegrationPage';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

export default function CompleteProfile() {
  const { userProfile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && userProfile?.profileComplete) {
      const dashboardPath = userProfile.userType === 'admin'
        ? '/admin'
        : userProfile.userType === 'porteur' ? '/dashboard/porteur' : '/dashboard/financeur';
      navigate(dashboardPath, { replace: true });
    }
  }, [userProfile, loading, navigate]);

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  const role = userProfile?.userType;
  return <ParcoursIntegrationPage roleInitial={role === 'porteur' || role === 'financeur' ? role : undefined} />;
}
