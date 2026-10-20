// Tableau de bord du candidat (réécrit le 2026-10-20, changement parcours-candidat-jour-1) : des chiffres réels et les
// appels qui concernent la structure, au lieu de compteurs à zéro et d'un rappel « Complétez votre profil ».
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, doc, getDoc, getDocs, orderBy, query, where } from 'firebase/firestore';
import { Search, FileText, Bookmark, Calendar, Building } from 'lucide-react';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ListeDemarrage } from '../../components/demarrage/ListeDemarrage';
import type { AAP, PorteurProfile } from '../../types';
import { visiblePubliquement } from '../../utils/relecture';
import { appelsPourProfil, echeancesProches, libelleMontant, LIBELLES_STATUT_CANDIDATURE } from '../../utils/candidat';
import { deadlineLabel, getDaysUntilDeadline } from '../../utils/deadline';
import { libelleTerritoire } from '../../utils/territoires';
import { LIBELLES_STATUT, statutAppel } from '../../utils/recherche';
import type { ApplicationStatus } from '../../types';

type AapAvecId = AAP & { id: string };
interface CandidatureCourte { id: string; projectTitle: string; aapTitle?: string; status: ApplicationStatus; submittedAt?: { toMillis: () => number } }

export default function PorteurDashboard() {
  const { currentUser } = useAuth();
  const [profil, setProfil] = useState<PorteurProfile | null>(null);
  const [aaps, setAaps] = useState<AapAvecId[]>([]);
  const [candidatures, setCandidatures] = useState<CandidatureCourte[]>([]);
  const [recherches, setRecherches] = useState(0);

  useEffect(() => {
    if (!currentUser) return;
    const uid = currentUser.uid;
    getDoc(doc(db, 'porteurProfiles', uid)).then(s => setProfil(s.exists() ? (s.data() as PorteurProfile) : null)).catch(() => undefined);
    getDocs(query(collection(db, 'aap'), where('status', '==', 'published'), orderBy('publishedAt', 'desc')))
      .then(s => setAaps((s.docs.map(d => ({ id: d.id, ...d.data() })) as AapAvecId[]).filter(visiblePubliquement)))
      .catch(err => console.error('Appels non chargés :', err));
    getDocs(query(collection(db, 'applications'), where('porteurId', '==', uid)))
      .then(s => setCandidatures((s.docs.map(d => ({ id: d.id, ...d.data() })) as CandidatureCourte[])
        .sort((a, b) => (b.submittedAt?.toMillis() ?? 0) - (a.submittedAt?.toMillis() ?? 0))))
      .catch(err => console.error('Candidatures non chargées :', err));
    getDocs(query(collection(db, 'savedSearches'), where('userId', '==', uid)))
      .then(s => setRecherches(s.size))
      .catch(() => undefined);
  }, [currentUser]);

  const region = profil?.address?.region ?? '';
  const pourMoi = appelsPourProfil(aaps, region);
  const proches = echeancesProches(pourMoi);
  const lienRecherche = region ? `/aap/search?territory=${encodeURIComponent(region)}` : '/aap/search';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg p-6 mb-8 text-white">
          <h2 className="text-3xl font-bold mb-2">Bienvenue, {profil?.structureName || 'bienvenue'}</h2>
          <p className="text-primary-100">
            {region ? `Les appels de votre région (${libelleTerritoire(region)}) et les appels nationaux, à jour de la veille hebdomadaire` : 'Les appels à projets de la santé et du médico-social, à jour de la veille hebdomadaire'}
          </p>
        </div>

        <ListeDemarrage />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Chiffre libelle="Appels pour votre structure" valeur={pourMoi.length} icone={<Search className="h-10 w-10 text-primary-600 opacity-20" />} lien={lienRecherche} />
          <Chiffre libelle="Échéances sous 30 jours" valeur={proches.length} icone={<Calendar className="h-10 w-10 text-warning-600 opacity-20" />} lien={region ? `${lienRecherche}&statut=bientot-clos` : '/aap/search?statut=bientot-clos'} />
          <Chiffre libelle="Mes candidatures" valeur={candidatures.length} icone={<FileText className="h-10 w-10 text-success-600 opacity-20" />} lien="/mes-candidatures" />
          <Chiffre libelle="Recherches sauvegardées" valeur={recherches} icone={<Bookmark className="h-10 w-10 text-secondary-600 opacity-20" />} lien="/recherches-sauvegardees" />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Appels pour votre structure</h3>
              <Link to={lienRecherche}><Button variant="ghost" size="sm">Voir tous ({pourMoi.length})</Button></Link>
            </div>
            {pourMoi.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Aucun appel ouvert pour votre région pour le moment ; la veille tourne chaque lundi.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {pourMoi.slice(0, 5).map(aap => {
                  const jours = getDaysUntilDeadline(aap.deadline);
                  const s = statutAppel(aap);
                  return (
                    <li key={aap.id} className="py-3">
                      <Link to={`/aap/${aap.id}`} className="block hover:bg-gray-50 rounded-lg -mx-2 px-2 py-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 truncate">{aap.title}</p>
                            <p className="text-sm text-gray-600 flex items-center gap-1"><Building className="h-4 w-4" />{aap.financeurName || 'Financeur non précisé'}</p>
                          </div>
                          <Badge variant={s === 'bientot-clos' ? 'warning' : s === 'ouvert' ? 'success' : 'primary'}>{LIBELLES_STATUT[s]}</Badge>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{jours !== null && `${deadlineLabel(jours)} · `}{libelleMontant(aap)} · {(aap.territoriesEligible ?? []).map(libelleTerritoire).join(', ') || 'Territoire non précisé'}</p>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Mes candidatures</h3>
              <Link to="/mes-candidatures"><Button variant="ghost" size="sm">Voir toutes</Button></Link>
            </div>
            {candidatures.length === 0 ? (
              <div className="space-y-4">
                <p className="text-gray-500 text-center py-6">Aucune candidature pour l'instant</p>
                <Link to={lienRecherche}><Button fullWidth><Search className="mr-2 h-4 w-4" />Trouver un appel</Button></Link>
              </div>
            ) : (
              <ul className="space-y-3">
                {candidatures.slice(0, 3).map(c => (
                  <li key={c.id}>
                    <Link to={`/candidature/${c.id}`} className="block border border-gray-200 rounded-lg p-3 hover:bg-gray-50">
                      <p className="font-medium text-gray-900 truncate">{c.projectTitle}</p>
                      <p className="text-xs text-gray-500 truncate">{c.aapTitle}</p>
                      <Badge variant={c.status === 'accepted' ? 'success' : c.status === 'rejected' ? 'error' : 'primary'} className="mt-2">
                        {LIBELLES_STATUT_CANDIDATURE[c.status] ?? c.status}
                      </Badge>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <div className="mt-8 grid md:grid-cols-3 gap-4">
          <Link to={lienRecherche}>
            <Card hover className="text-center">
              <Search className="h-12 w-12 text-primary-600 mx-auto mb-3" />
              <h4 className="font-semibold text-gray-900 mb-1">Rechercher des appels</h4>
              <p className="text-sm text-gray-600">Filtres de votre profil déjà appliqués</p>
            </Card>
          </Link>
          <Link to="/calendrier">
            <Card hover className="text-center">
              <Calendar className="h-12 w-12 text-secondary-600 mx-auto mb-3" />
              <h4 className="font-semibold text-gray-900 mb-1">Calendrier</h4>
              <p className="text-sm text-gray-600">Les clôtures à venir</p>
            </Card>
          </Link>
          <Link to="/mes-candidatures">
            <Card hover className="text-center">
              <FileText className="h-12 w-12 text-success-600 mx-auto mb-3" />
              <h4 className="font-semibold text-gray-900 mb-1">Mes candidatures</h4>
              <p className="text-sm text-gray-600">Suivi par étape</p>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}

function Chiffre({ libelle, valeur, icone, lien }: { libelle: string; valeur: number; icone: React.ReactNode; lien: string }) {
  return (
    <Link to={lien}>
      <Card className="!p-4 hover:shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">{libelle}</p>
            <p className="text-2xl font-bold text-gray-900">{valeur}</p>
          </div>
          {icone}
        </div>
      </Card>
    </Link>
  );
}
