// Modification d'un appel par son auteur (changement profil-et-edition-aap, 2026-10-20). Pourquoi une page mince :
// elle charge l'appel, vérifie que le compte connecté en est l'auteur, puis confie le formulaire à CreateAapPage ;
// la vérification se lit ici en quelques lignes au lieu d'être diluée dans le formulaire.
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { aapService } from '../../services/aapService';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import type { AAP } from '../../types';
import CreateAapPage from './CreateAapPage';

export default function EditAapPage() {
  const { aapId } = useParams<{ aapId: string }>();
  const { currentUser, userProfile } = useAuth();
  const [aap, setAap] = useState<AAP | null>(null);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    if (!aapId) return;
    aapService.getAapById(aapId)
      .then(setAap)
      .finally(() => setChargement(false));
  }, [aapId]);

  if (chargement) return <LoadingSpinner fullScreen />;

  // L'administrateur corrige toute fiche, importée comprise (administration-controle, 2026-10-20)
  const estAdmin = userProfile?.userType === 'admin';
  if (!aap || !currentUser || (aap.financeurId !== currentUser.uid && !estAdmin)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {aap ? "Cet appel n'est pas le vôtre" : 'Appel introuvable'}
          </h1>
          <p className="text-gray-600 mb-6">Seul le financeur qui a créé un appel peut le modifier.</p>
          <Link to="/mes-aap" className="text-primary-600 hover:underline">Retour à mes appels</Link>
        </div>
      </div>
    );
  }

  return <CreateAapPage aapExistant={aap} />;
}
