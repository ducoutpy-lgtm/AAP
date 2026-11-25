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
import { Button } from '../../components/ui/Button';
import { EDITEUR } from '../legal/editeur';
import { exporterMesDonnees } from '../../services/exportService';
import { supprimerMonCompte } from '../../services/suppressionService';
import { connexionRecenteSelonServeur } from '../../utils/suppressionCompte';
import { TextesReutilisablesCarte } from '../../components/profil/TextesReutilisablesCarte';
import { PreferenceCourrielCarte } from '../../components/profil/PreferenceCourrielCarte';
import { nomFichierExport, SUR_DEMANDE_AU_DPO } from '../../utils/exportDonnees';

const ROLES: Record<UserType, string> = {
  porteur: 'Candidat (établissement)',
  financeur: 'Financeur',
  admin: 'Administrateur',
};
const ABONNEMENTS: Record<SubscriptionStatus, { libelle: string; variant: 'success' | 'warning' | 'error' | 'gray' }> =
  {
    active: { libelle: 'Abonnement actif', variant: 'success' },
    trial: { libelle: "Période d'essai", variant: 'warning' },
    expired: { libelle: 'Abonnement expiré', variant: 'error' },
    cancelled: { libelle: 'Abonnement résilié', variant: 'gray' },
  };

export default function ProfilPage() {
  const { currentUser, userProfile, loading } = useAuth();
  const [profil, setProfil] = useState<PorteurProfile | FinanceurProfile | null>(null);
  const [chargement, setChargement] = useState(true);
  // Export RGPD (export-donnees-personnelles, 2026-11-16) : fichier JSON construit dans le navigateur
  const [exportEtat, setExportEtat] = useState<'' | 'en-cours' | 'echec'>('');
  // Suppression du compte (suppression-compte, question 25, 2026-11-19)
  const [suppression, setSuppression] = useState<'' | 'en-cours' | 'reconnexion' | 'echec'>('');
  const supprimerCompte = async () => {
    if (!currentUser || !userProfile) return;
    // Heures du serveur (jeton renouvelé), pas celle du poste (corrections-relecture 3.5)
    let recente = false;
    try {
      recente = connexionRecenteSelonServeur(await currentUser.getIdTokenResult(true));
    } catch {
      setSuppression('echec');
      return;
    }
    if (!recente) {
      setSuppression('reconnexion');
      return;
    }
    if (
      !confirm(
        'Supprimer définitivement votre compte ? Votre profil, vos recherches, vos favoris, vos notifications et ' +
          'vos candidatures aux appels importés seront effacés ; les candidatures déjà reçues par un financeur resteront chez ' +
          'lui, sans votre identifiant. Cette action est irréversible.',
      )
    )
      return;
    setSuppression('en-cours');
    try {
      await supprimerMonCompte(currentUser, userProfile.userType);
      window.location.assign('/');
    } catch (err) {
      console.error('Error deleting account:', err);
      setSuppression('echec');
    }
  };
  const telechargerMesDonnees = async () => {
    if (!currentUser || !userProfile) return;
    setExportEtat('en-cours');
    try {
      const donnees = await exporterMesDonnees(currentUser, userProfile.userType);
      const lien = document.createElement('a');
      lien.href = URL.createObjectURL(new Blob([JSON.stringify(donnees, null, 2)], { type: 'application/json' }));
      lien.download = nomFichierExport(new Date());
      lien.click();
      URL.revokeObjectURL(lien.href);
      setExportEtat('');
    } catch (err) {
      console.error('Error exporting data:', err);
      setExportEtat('echec');
    }
  };

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
              <dd>
                <Badge variant={abonnement.variant}>{abonnement.libelle}</Badge>
              </dd>
            </div>
            {finEssai && userProfile.subscriptionStatus === 'trial' && (
              <div>
                <dt className="text-gray-500">Fin de la période d'essai</dt>
                <dd className="text-gray-900">{finEssai.toLocaleDateString('fr-FR')}</dd>
              </div>
            )}
          </dl>
          <div className="mt-4 pt-4 border-t text-sm">
            <h2 className="font-semibold text-gray-900 mb-1">Mes données personnelles</h2>
            <p className="text-gray-600 mb-2">
              Fichier JSON de vos données : compte, profil, candidatures, recherches, favoris, notifications, messages.
              Sur demande au délégué à la protection des données ({EDITEUR.contact}) : {SUR_DEMANDE_AU_DPO.join(', ')}.
            </p>
            <Button variant="secondary" onClick={telechargerMesDonnees} disabled={exportEtat === 'en-cours'}>
              {exportEtat === 'en-cours' ? 'Préparation du fichier...' : 'Télécharger mes données'}
            </Button>
            {exportEtat === 'echec' && (
              <p className="text-error-600 mt-2">
                Le fichier n'a pas pu être produit. Réessayez, ou écrivez au délégué à la protection des données.
              </p>
            )}
            <div className="mt-3">
              <Button variant="danger" onClick={supprimerCompte} disabled={suppression === 'en-cours'}>
                {suppression === 'en-cours' ? 'Suppression...' : 'Supprimer mon compte'}
              </Button>
              {suppression === 'reconnexion' && (
                <p className="text-amber-700 mt-2">
                  Par sécurité, la suppression demande une connexion récente : déconnectez-vous, reconnectez-vous, puis
                  recommencez dans les cinq minutes.
                </p>
              )}
              {suppression === 'echec' && (
                <p className="text-error-600 mt-2">
                  La suppression n'a pas abouti. Reconnectez-vous et recommencez, ou écrivez au délégué à la protection
                  des données ({EDITEUR.contact}).
                </p>
              )}
            </div>
          </div>
          {userProfile.userType === 'porteur' && (
            <>
              <TextesReutilisablesCarte
                uid={currentUser.uid}
                initial={(profil as PorteurProfile | null)?.textesReutilisables}
              />
              <PreferenceCourrielCarte
                uid={currentUser.uid}
                actif={userProfile.notificationPreferences?.email !== false}
              />
            </>
          )}
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
