// Tableau de bord financeur (réécrit le 2026-10-21, changement financeur-vendable, jour 6) : chiffres réels du compte
// connecté (ses appels, les candidatures reçues, les vues), dernières candidatures, prochaine échéance.
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { Plus, FileText, Users, Eye, CalendarClock, Columns, BarChart3 } from 'lucide-react';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ListeDemarrage } from '../../components/demarrage/ListeDemarrage';
import type { AAP, Application, ApplicationStatus } from '../../types';
import { COLONNES, dateDe, LIBELLES_STATUTS_CANDIDATURE, resumeFinanceur } from '../../utils/financeur';

const COULEURS: Record<ApplicationStatus, 'primary' | 'success' | 'warning' | 'error' | 'gray'> = {
  draft: 'gray', submitted: 'primary', under_review: 'warning', pending_info: 'warning', shortlisted: 'warning', accepted: 'success', rejected: 'error',
};

export default function FinanceurDashboard() {
  const { currentUser, userProfile } = useAuth();
  const [aaps, setAaps] = useState<AAP[]>([]);
  const [candidatures, setCandidatures] = useState<Application[]>([]);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    (async () => {
      try {
        const [a, c] = await Promise.all([
          getDocs(query(collection(db, 'aap'), where('financeurId', '==', currentUser.uid))),
          getDocs(query(collection(db, 'applications'), where('financeurId', '==', currentUser.uid))),
        ]);
        setAaps(a.docs.map(d => ({ id: d.id, ...d.data() }) as AAP));
        setCandidatures(c.docs.map(d => ({ id: d.id, ...d.data() }) as Application));
      } catch (err) {
        console.error('Tableau de bord financeur non chargé :', err);
      } finally {
        setChargement(false);
      }
    })();
  }, [currentUser]);

  if (chargement) return <LoadingSpinner fullScreen />;
  const r = resumeFinanceur(aaps, candidatures);
  const titres = Object.fromEntries(aaps.map(a => [a.id, a.title]));
  const echeance = r.prochaineEcheance ? dateDe(r.prochaineEcheance.deadline) : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-gradient-to-r from-secondary-600 to-primary-600 rounded-lg p-6 mb-8 text-white">
          <h2 className="text-3xl font-bold mb-2">Bienvenue, {userProfile?.email?.split('@')[0]} !</h2>
          <p className="text-secondary-100">Vos appels à projets et les candidatures reçues, en un seul endroit.</p>
          <Link to="/aap/nouveau" className="inline-block mt-4">
            <Button variant="secondary"><Plus className="mr-2 h-4 w-4" />Publier un appel</Button>
          </Link>
        </div>

        <ListeDemarrage />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <Card className="!p-4">
            <p className="text-sm text-gray-600">Appels publiés</p>
            <p className="text-2xl font-bold text-gray-900">{r.publies}</p>
            <p className="text-xs text-gray-500">{r.brouillons} brouillon{r.brouillons > 1 ? 's' : ''}, {r.clos} clos</p>
          </Card>
          <Card className="!p-4">
            <p className="text-sm text-gray-600">Candidatures reçues</p>
            <p className="text-2xl font-bold text-gray-900">{r.candidatures}</p>
            <p className="text-xs text-gray-500">{r.parStatut.submitted} à traiter</p>
          </Card>
          <Card className="!p-4">
            <p className="text-sm text-gray-600">Acceptées</p>
            <p className="text-2xl font-bold text-gray-900">{r.parStatut.accepted}</p>
            <p className="text-xs text-gray-500">{r.parStatut.rejected} refusée{r.parStatut.rejected > 1 ? 's' : ''}</p>
          </Card>
          <Card className="!p-4">
            <p className="text-sm text-gray-600">Vues de vos appels</p>
            <p className="text-2xl font-bold text-gray-900">{r.vues}</p>
            <p className="text-xs text-gray-500">cumul</p>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Mes appels</h3>
              <Link to="/mes-aap"><Button variant="ghost" size="sm">Voir tous</Button></Link>
            </div>
            {aaps.length === 0 ? (
              <div className="space-y-4">
                <p className="text-gray-500 text-center py-6">Vous n'avez pas encore d'appel.</p>
                <Link to="/aap/nouveau"><Button fullWidth><Plus className="mr-2 h-4 w-4" />Publier mon premier appel</Button></Link>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {aaps.slice(0, 5).map(a => (
                  <li key={a.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <Link to={`/aap/${a.id}`} className="font-medium text-gray-900 hover:text-primary-600 truncate block">{a.title}</Link>
                      <p className="text-xs text-gray-500">{a.views || 0} vues{dateDe(a.deadline) ? ` · clôture le ${dateDe(a.deadline)!.toLocaleDateString('fr-FR')}` : ''}</p>
                    </div>
                    <Badge variant={a.status === 'published' ? 'success' : a.status === 'draft' ? 'gray' : 'warning'}>
                      {a.status === 'published' ? 'Publié' : a.status === 'draft' ? 'Brouillon' : 'Clos'}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
            {echeance && r.prochaineEcheance && (
              <p className="mt-4 text-sm text-gray-600 flex items-center gap-2">
                <CalendarClock className="h-4 w-4 text-primary-600" />
                Prochaine échéance : {echeance.toLocaleDateString('fr-FR')} ({r.prochaineEcheance.title})
              </p>
            )}
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Dernières candidatures</h3>
              <Link to="/candidatures-recues"><Button variant="ghost" size="sm">Voir toutes</Button></Link>
            </div>
            {r.dernieres.length === 0 ? (
              <p className="text-gray-500 text-center py-6">Aucune candidature reçue pour le moment.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {r.dernieres.map(c => (
                  <li key={c.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <Link to={`/aap/${c.aapId}/candidature/${c.id}/evaluer`} className="font-medium text-gray-900 hover:text-primary-600 truncate block">{c.projectTitle}</Link>
                      <p className="text-xs text-gray-500 truncate">{c.porteurName || 'Candidat'} · {titres[c.aapId] || c.aapTitle}{dateDe(c.submittedAt) ? ` · ${dateDe(c.submittedAt)!.toLocaleDateString('fr-FR')}` : ''}</p>
                    </div>
                    <Badge variant={COULEURS[c.status]}>{LIBELLES_STATUTS_CANDIDATURE[c.status]}</Badge>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-gray-600">
              {COLONNES.map(s => <span key={s} className="px-2 py-1 bg-gray-100 rounded">{LIBELLES_STATUTS_CANDIDATURE[s]} : {r.parStatut[s]}</span>)}
            </div>
          </Card>
        </div>

        <div className="mt-8 grid md:grid-cols-4 gap-4">
          <Link to="/aap/nouveau"><Card hover className="text-center"><Plus className="h-10 w-10 text-secondary-600 mx-auto mb-2" /><h4 className="font-semibold text-gray-900">Publier un appel</h4><p className="text-sm text-gray-600">En cinq étapes</p></Card></Link>
          <Link to="/mes-aap"><Card hover className="text-center"><FileText className="h-10 w-10 text-primary-600 mx-auto mb-2" /><h4 className="font-semibold text-gray-900">Mes appels</h4><p className="text-sm text-gray-600">Modifier, clôturer</p></Card></Link>
          <Link to="/candidatures-recues"><Card hover className="text-center"><Columns className="h-10 w-10 text-warning-600 mx-auto mb-2" /><h4 className="font-semibold text-gray-900">Candidatures reçues</h4><p className="text-sm text-gray-600">En colonnes par étape</p></Card></Link>
          <Link to="/statistiques"><Card hover className="text-center"><BarChart3 className="h-10 w-10 text-success-600 mx-auto mb-2" /><h4 className="font-semibold text-gray-900">Statistiques</h4><p className="text-sm text-gray-600">Vues, taux d'acceptation</p></Card></Link>
        </div>
        <p className="sr-only"><Users className="inline h-3 w-3" /><Eye className="inline h-3 w-3" /></p>
      </div>
    </div>
  );
}
