import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import CompletePorteurProfile from './CompletePorteurProfile';
import CompleteFinanceurProfile from './CompleteFinanceurProfile';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

export default function CompleteProfile() {
  const { userProfile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && userProfile) {
      // Si le profil est déjà complet, rediriger vers le dashboard
      if (userProfile.profileComplete) {
        const dashboardPath = userProfile.userType === 'porteur'
          ? '/dashboard/porteur'
          : '/dashboard/financeur';
        navigate(dashboardPath, { replace: true });
      }
    }
  }, [userProfile, loading, navigate]);

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!userProfile) {
    return <div>Erreur: Profil utilisateur non trouvé</div>;
  }

  // Afficher le bon formulaire selon le type d'utilisateur
  if (userProfile.userType === 'porteur') {
    return <CompletePorteurProfile />;
  } else if (userProfile.userType === 'financeur') {
    return <CompleteFinanceurProfile />;
  }

  return <div>Type d'utilisateur invalide</div>;
}
