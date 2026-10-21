// Candidatures reçues en colonnes (changement financeur-vendable, jour 6, 2026-10-21) : toutes les candidatures sur les
// appels du financeur connecté, une colonne par étape ; chaque carte ouvre l'évaluation.
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { Columns } from 'lucide-react';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../../components/ui/Card';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import type { Application } from '../../types';
import { COLONNES, dateDe, LIBELLES_STATUTS_CANDIDATURE, parColonne } from '../../utils/financeur';

const BORDURES: Record<string, string> = {
  submitted: 'border-primary-400', under_review: 'border-warning-400', shortlisted: 'border-secondary-400', accepted: 'border-success-400', rejected: 'border-error-400',
};

export default function CandidaturesRecuesPage() {
  const { currentUser } = useAuth();
  const [candidatures, setCandidatures] = useState<Application[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');

  useEffect(() => {
    if (!currentUser) return;
    (async () => {
      try {
        const snap = await getDocs(query(collection(db, 'applications'), where('financeurId', '==', currentUser.uid)));
        setCandidatures(snap.docs.map(d => ({ id: d.id, ...d.data() }) as Application));
      } catch (err) {
        console.error('Candidatures non chargées :', err);
        setErreur(err instanceof Error ? err.message : 'Chargement impossible');
      } finally {
        setChargement(false);
      }
    })();
  }, [currentUser]);

  if (chargement) return <LoadingSpinner fullScreen />;
  const colonnes = parColonne(candidatures);
  const total = COLONNES.reduce((t, c) => t + colonnes[c].length, 0);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-1 flex items-center gap-2"><Columns className="h-7 w-7 text-primary-600" />Candidatures reçues</h1>
          <p className="text-gray-600">{total} candidature{total > 1 ? 's' : ''} sur vos appels, par étape. Ouvrez une carte pour l'évaluer.</p>
        </div>
        {erreur && <div className="mb-6 p-4 bg-error-50 border border-error-200 rounded-lg text-error-600 text-sm">{erreur}</div>}
        {total === 0 && !erreur && (
          <Card><p className="text-gray-500 text-center py-8">Aucune candidature reçue pour le moment. Elles apparaîtront ici dès qu'un candidat répondra à l'un de vos appels publiés.</p></Card>
        )}
        {total > 0 && (
          <div className="grid md:grid-cols-5 gap-4">
            {COLONNES.map(statut => (
              <div key={statut} className="bg-gray-100 rounded-lg p-3 min-h-[12rem]">
                <h2 className="text-sm font-semibold text-gray-700 mb-3 flex justify-between">
                  <span>{LIBELLES_STATUTS_CANDIDATURE[statut]}</span>
                  <span className="text-gray-500">{colonnes[statut].length}</span>
                </h2>
                <div className="space-y-3">
                  {colonnes[statut].map(c => (
                    <Link key={c.id} to={`/aap/${c.aapId}/candidature/${c.id}/evaluer`} className={`block bg-white rounded-lg p-3 shadow-sm border-l-4 ${BORDURES[statut]} hover:shadow-md`}>
                      <p className="font-medium text-gray-900 text-sm line-clamp-2">{c.projectTitle}</p>
                      <p className="text-xs text-gray-500 mt-1 truncate">{c.porteurName || 'Candidat'}</p>
                      <p className="text-xs text-gray-500 truncate">{c.aapTitle}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {dateDe(c.submittedAt)?.toLocaleDateString('fr-FR') ?? ''}
                        {c.status === 'pending_info' ? ' · complément demandé' : ''}
                        {typeof c.budget?.total === 'number' ? ` · ${c.budget.total.toLocaleString('fr-FR')} €` : ''}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
