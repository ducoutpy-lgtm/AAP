// Recommandations d'appels pour le candidat (changement recommandations-profil, 2026-11-13, semaine 2 du plan) : règles
// de app/src/utils/recommandations.ts, raisons et réserves affichées, bandeau quand le profil est incomplet.
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { AAP, PorteurProfile } from '../../types';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Sparkles, Target, Calendar, Euro, MapPin, Building, AlertTriangle, CheckCircle } from 'lucide-react';
import { deadlineLabel, getDaysUntilDeadline } from '../../utils/deadline';
import { libelleMontant } from '../../utils/candidat';
import { libelleTerritoire } from '../../utils/territoires';
import { manquesDuProfil, recommander, type Recommandation } from '../../utils/recommandations';

type Appel = AAP & { id: string };

export default function RecommendationsPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [recommandations, setRecommandations] = useState<Recommandation<Appel>[]>([]);
  const [manques, setManques] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    const charger = async () => {
      try {
        const profilDoc = await getDoc(doc(db, 'porteurProfiles', currentUser.uid));
        const profil = (profilDoc.exists() ? profilDoc.data() : {}) as PorteurProfile;
        const snapshot = await getDocs(query(collection(db, 'aap'), where('status', '==', 'published')));
        const aaps = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Appel[];
        setManques(manquesDuProfil(profil));
        setRecommandations(recommander(aaps, profil));
      } catch (err) {
        console.error('Erreur au chargement des recommandations :', err);
      } finally {
        setLoading(false);
      }
    };
    charger();
  }, [currentUser]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Calcul des recommandations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="h-8 w-8 text-primary-600" />
            <h1 className="text-3xl font-bold text-gray-900">Appels recommandés pour votre structure</h1>
          </div>
          <p className="text-gray-600">
            {recommandations.length} appel{recommandations.length > 1 ? 's' : ''} à projets ouvert
            {recommandations.length > 1 ? 's' : ''} correspondant à votre profil
          </p>
        </div>

        <Card className="p-4 mb-6 bg-blue-50 border-blue-200">
          <p className="text-sm text-blue-900"><strong>Comment sont choisis ces appels ?</strong></p>
          <p className="text-sm text-blue-800 mt-1">
            Nous comparons chaque appel ouvert à votre région, à votre statut, à votre type d'établissement et à vos
            projets. Un appel d'une autre région, ou réservé à d'autres structures, n'est pas proposé. Chaque carte dit
            pourquoi elle vous est proposée et ce qu'il reste à vérifier sur l'annonce officielle.
          </p>
        </Card>

        {manques.length > 0 && (
          <Card className="p-4 mb-6 bg-amber-50 border-amber-200">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <p className="text-sm text-amber-900">
                Complétez votre profil pour des recommandations plus justes : {manques.join(', ')}.
              </p>
              <Button size="sm" variant="secondary" onClick={() => navigate('/profil')}>Compléter mon profil</Button>
            </div>
          </Card>
        )}

        {recommandations.length === 0 ? (
          <Card className="p-12 text-center">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun appel ouvert ne correspond pour l'instant</h3>
            <p className="text-gray-600 mb-4">De nouveaux appels arrivent chaque semaine. Vous pouvez aussi chercher librement.</p>
            <Button onClick={() => navigate('/aap/search')}>Rechercher des appels</Button>
          </Card>
        ) : (
          <div className="space-y-6">
            {recommandations.map(({ aap, raisons, aVerifier }) => {
              const jours = getDaysUntilDeadline(aap.deadline);
              const urgent = jours !== null && jours <= 7;
              return (
                <Card key={aap.id} className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(`/aap/${aap.id}`)}>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{aap.title}</h3>
                  {aap.financeurName && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                      <Building className="h-4 w-4" />
                      <span>{aap.financeurName}</span>
                    </div>
                  )}

                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                    <p className="text-sm font-medium text-green-900 mb-1 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" /> Pourquoi cet appel vous est proposé
                    </p>
                    <ul className="text-sm text-green-800 space-y-1">
                      {raisons.map(r => <li key={r}>• {r}</li>)}
                    </ul>
                  </div>
                  {aVerifier.length > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                      <p className="text-sm font-medium text-amber-900 mb-1 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-600" /> À vérifier sur l'annonce officielle
                      </p>
                      <ul className="text-sm text-amber-800 space-y-1">
                        {aVerifier.map(r => <li key={r}>• {r}</li>)}
                      </ul>
                    </div>
                  )}

                  <p className="text-gray-600 mb-4 line-clamp-2">{aap.description}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className={`h-4 w-4 ${urgent ? 'text-warning-500' : 'text-gray-400'}`} />
                      <span className={urgent ? 'text-warning-600 font-medium' : 'text-gray-600'}>{deadlineLabel(jours)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Euro className="h-4 w-4" />
                      <span>{libelleMontant(aap)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{(aap.territoriesEligible ?? []).map(libelleTerritoire).join(', ') || 'Territoire non précisé'}</span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <Button className="w-full" onClick={(e) => { e.stopPropagation(); navigate(`/aap/${aap.id}/candidater`); }}>
                      Candidater
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
