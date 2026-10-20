// Page Mon profil (changement profil-et-edition-aap, 2026-10-20) : le compte (adresse, rôle, abonnement) puis le
// formulaire de profil pré-rempli, en mode édition. Un profil jamais complété renvoie vers /complete-profile.
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Badge } from '../../components/ui/Badge';
import type { FinanceurProfile, PorteurProfile, SubscriptionStatus, UserType } from '../../types';
import { enDate } from '../../utils/dates';
import CompletePorteurProfile from './CompletePorteurProfile';
import CompleteFinanceurProfile from './CompleteFinanceurProfile';

const ROLES: Record<UserType, string> = { porteur: 'Porteur de projet', financeur: 'Financeur', admin: 'Administrateur' };
const ABONNEMENTS: Record<SubscriptionStatus, { libelle: string; variant: 'success' | 'warning' | 'error' | 'gray' }> = {
  active: { libelle: 'Abonnement actif', variant: 'success' },
  trial: { libelle: "Période d'essai", variant: 'warning' },
  expired: { libelle: 'Abonnement expiré', variant: 'error' },
  cancelled: { libelle: 'Abonnement résilié', variant: 'gray' },
};

export default function ProfilPage() {
  const { currentUser, userProfile, loading } = useAuth();
  const [profil, setProfil] = useState<PorteurProfile | FinanceurProfile | null>(null);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    if (!currentUser || !userProfile || userProfile.userType === 'admin') {
      setChargement(false);
      return;
    }
    const collectionProfil = userProfile.userType === 'porteur' ? 'porteurProfiles' : 'financeurProfiles';
    getDoc(doc(db, collectionProfil, currentUser.uid))
      .then((snap) => setProfil(snap.exists() ? (snap.data() as PorteurProfile | FinanceurProfile) : null))
      .finally(() => setChargement(false));
  }, [currentUser, userProfile]);

  if (loading || chargement) return <LoadingSpinner fullScreen />;
  if (!currentUser || !userProfile) return <Navigate to="/login" replace />;
  if (userProfile.userType !== 'admin' && (!userProfile.profileComplete || !profil)) {
    return <Navigate to="/complete-profile" replace />;
  }

  const abonnement = ABONNEMENTS[userProfile.subscriptionStatus] ?? ABONNEMENTS.trial;
  const finEssai = enDate(userProfile.trialEndsAt);

  return (
    <div>
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 max-w-3xl py-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Mon compte</h1>
          <dl className="grid sm:grid-cols-2 gap-x-8 gap-y-2 text-sm">
            <div>
              <dt className="text-gray-500">Adresse e-mail</dt>
              <dd className="text-gray-900">{userProfile.email}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Rôle</dt>
              <dd className="text-gray-900">{ROLES[userProfile.userType]}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Abonnement</dt>
              <dd><Badge variant={abonnement.variant}>{abonnement.libelle}</Badge></dd>
            </div>
            {finEssai && userProfile.subscriptionStatus === 'trial' && (
              <div>
                <dt className="text-gray-500">Fin de la période d'essai</dt>
                <dd className="text-gray-900">{finEssai.toLocaleDateString('fr-FR')}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>
      {userProfile.userType === 'porteur' && <CompletePorteurProfile profilExistant={profil as PorteurProfile} />}
      {userProfile.userType === 'financeur' && <CompleteFinanceurProfile profilExistant={profil as FinanceurProfile} />}
      {userProfile.userType === 'admin' && (
        <div className="container mx-auto px-4 max-w-3xl py-8 text-gray-600">
          Le compte administrateur n'a pas de profil de structure.
        </div>
      )}
    </div>
  );
}
