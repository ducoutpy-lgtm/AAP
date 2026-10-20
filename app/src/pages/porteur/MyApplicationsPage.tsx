// Mes candidatures en colonnes par étape (réécrit le 2026-10-20, changement parcours-candidat-jour-1, transposition du
// tableau en colonnes de helloDarwin). Pas de tri côté Firestore : « where + orderBy » exigeait un index composite
// absent et laissait la liste vide (constat du jour).
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { Calendar, Search } from 'lucide-react';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import type { ApplicationStatus } from '../../types';
import { COLONNES_CANDIDATURES, repartirCandidatures } from '../../utils/candidat';

interface Candidature {
  id: string;
  aapId: string;
  aapTitle?: string;
  projectTitle: string;
  status: ApplicationStatus;
  submittedAt?: Timestamp;
  createdAt?: Timestamp;
  budget?: { total?: number };
}

export default function MyApplicationsPage() {
  const { currentUser } = useAuth();
  const [candidatures, setCandidatures] = useState<Candidature[]>([]);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState('');
  // Confirmation passée par le formulaire après l'envoi (« soumise, mais à qui, quoi, quand ? »)
  const envoyee = (useLocation().state as { envoyee?: { aapTitle: string; financeurName: string } } | null)?.envoyee;

  useEffect(() => {
    if (!currentUser) return;
    getDocs(query(collection(db, 'applications'), where('porteurId', '==', currentUser.uid)))
      .then(snap => {
        const dateDe = (c: Candidature) => (c.submittedAt ?? c.createdAt)?.toMillis() ?? 0;
        setCandidatures((snap.docs.map(d => ({ id: d.id, ...d.data() })) as Candidature[]).sort((a, b) => dateDe(b) - dateDe(a)));
      })
      .catch(err => {
        console.error('Error loading applications:', err);
        setErreur(err instanceof Error ? err.message : "Les candidatures n'ont pas pu être chargées");
      })
      .finally(() => setLoading(false));
  }, [currentUser]);

  const colonnes = repartirCandidatures(candidatures);
  const dateFr = (c: Candidature) => (c.submittedAt ?? c.createdAt)?.toDate().toLocaleDateString('fr-FR') ?? '';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de vos candidatures...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Mes candidatures</h1>
            <p className="text-gray-600">{candidatures.length} dossier{candidatures.length > 1 ? 's' : ''}, suivis par étape</p>
          </div>
          <Link to="/aap/search"><Button variant="secondary"><Search className="h-4 w-4 mr-2" />Trouver un appel</Button></Link>
        </div>

        {envoyee && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
            <p className="font-medium">Candidature envoyée</p>
            <p className="text-sm mt-1">
              Votre dossier pour « {envoyee.aapTitle} » a été transmis à {envoyee.financeurName} le{' '}
              {new Date().toLocaleDateString('fr-FR')}. Le financeur l'examine ; il passera dans la colonne « En cours
              d'examen », puis « Acceptée », « Refusée » ou « Complément demandé », et vous serez prévenu par une alerte.
            </p>
          </div>
        )}
        {erreur && <div className="mb-6 p-4 bg-error-50 border border-error-200 rounded-lg text-error-600 text-sm">{erreur}</div>}

        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4">
          {COLONNES_CANDIDATURES.map(col => (
            <div key={col.cle} className="bg-gray-100 rounded-lg p-3 min-h-[200px]">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">
                {col.libelle} <span className="text-gray-400">({colonnes[col.cle].length})</span>
              </h2>
              {colonnes[col.cle].length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-6">Aucune</p>
              ) : (
                <ul className="space-y-3">
                  {colonnes[col.cle].map(c => (
                    <li key={c.id}>
                      <Link to={`/candidature/${c.id}`} className="block">
                        <Card className="!p-3 hover:shadow-md">
                          <p className="font-medium text-gray-900 text-sm line-clamp-2">{c.projectTitle}</p>
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">{c.aapTitle}</p>
                          <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />{dateFr(c)}
                          </p>
                        </Card>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
