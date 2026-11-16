// Recherches sauvegardées (réécrit le 2026-11-16, changement alertes-recherches-sauvegardees). Une recherche garde
// l'adresse de /aap/search : « Lancer » rouvre les mêmes résultats et le courriel du lundi (scraping/alertes.py)
// applique les mêmes filtres. On crée une recherche depuis la page de recherche ; l'ancienne fenêtre de création
// (secteurs et régions du gabarit d'avril, que la recherche ne lisait pas) est retirée.
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { Bell, BellOff, Search, Trash2 } from 'lucide-react';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { depuisAncienneRecherche, etiquettesActives, filtresDepuisParams, type AncienneRecherche } from '../../utils/recherche';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

interface RechercheSauvegardee extends AncienneRecherche {
  id: string;
  name: string;
  alertEnabled: boolean;
}

export default function SavedSearchesPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [recherches, setRecherches] = useState<RechercheSauvegardee[]>([]);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState('');

  useEffect(() => {
    if (!currentUser) return;
    getDocs(query(collection(db, 'savedSearches'), where('userId', '==', currentUser.uid)))
      .then(snap => setRecherches(snap.docs.map(d => ({ id: d.id, ...d.data() })) as RechercheSauvegardee[]))
      .catch(err => {
        console.error('Error loading saved searches:', err);
        setErreur("Les recherches n'ont pas pu être chargées.");
      })
      .finally(() => setLoading(false));
  }, [currentUser]);

  const basculerAlerte = async (r: RechercheSauvegardee) => {
    setErreur('');
    // Valeur calculée une fois et reprise telle quelle : un double clic n'inverse plus l'écran par rapport à la base
    const active = !r.alertEnabled;
    try {
      await updateDoc(doc(db, 'savedSearches', r.id), { alertEnabled: active, frequency: 'weekly' });
      setRecherches(rs => rs.map(x => (x.id === r.id ? { ...x, alertEnabled: active } : x)));
    } catch (err) {
      console.error('Error toggling alert:', err);
      setErreur("L'alerte n'a pas pu être modifiée.");
    }
  };

  const supprimer = async (r: RechercheSauvegardee) => {
    if (!confirm(`Supprimer la recherche « ${r.name} » ?`)) return;
    setErreur('');
    try {
      await deleteDoc(doc(db, 'savedSearches', r.id));
      setRecherches(rs => rs.filter(x => x.id !== r.id));
    } catch (err) {
      console.error('Error deleting search:', err);
      setErreur("La recherche n'a pas pu être supprimée.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des recherches sauvegardées...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Recherches sauvegardées</h1>
            <p className="text-gray-600">
              Alerte chaque lundi : un courriel vous signale les appels nouveaux de chaque recherche dont l'alerte est active.
            </p>
          </div>
          <Link to="/aap/search"><Button variant="secondary"><Search className="h-4 w-4 mr-2" />Nouvelle recherche</Button></Link>
        </div>

        {erreur && <div className="mb-6 p-4 bg-error-50 border border-error-200 rounded-lg text-error-600 text-sm">{erreur}</div>}

        {recherches.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-700 mb-2">Aucune recherche enregistrée.</p>
            <p className="text-sm text-gray-500 mb-4">
              Choisissez des filtres sur la page de recherche, puis cliquez « Enregistrer cette recherche ».
            </p>
            <Link to="/aap/search"><Button>Rechercher des appels</Button></Link>
          </Card>
        ) : (
          <ul className="space-y-4">
            {recherches.map(r => {
              const { params, nonRepris } = depuisAncienneRecherche(r);
              const etiquettes = etiquettesActives(filtresDepuisParams(new URLSearchParams(params)));
              return (
                <li key={r.id}>
                  <Card className="p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="font-semibold text-gray-900">{r.name}</h2>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {etiquettes.length === 0 && (
                            <span className="text-sm text-gray-500">
                              {nonRepris.length > 0
                                ? "Aucun critère repris : cette recherche n'envoie pas d'alerte, enregistrez-en une nouvelle depuis la page de recherche"
                                : 'Tous les appels ouverts'}
                            </span>
                          )}
                          {etiquettes.map(e => (
                            <span key={e.cle} className="bg-primary-50 text-primary-700 border border-primary-200 rounded-full px-3 py-0.5 text-xs">{e.libelle}</span>
                          ))}
                        </div>
                        {nonRepris.length > 0 && (
                          <p className="text-xs text-amber-700 mt-2">
                            Critères non repris : {nonRepris.join(', ')} (ancienne version de la page, sans équivalent dans la recherche).
                          </p>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button onClick={() => navigate(params ? `/aap/search?${params}` : '/aap/search')}>Lancer</Button>
                        <Button variant="secondary" onClick={() => basculerAlerte(r)}>
                          {r.alertEnabled
                            ? <><Bell className="h-4 w-4 mr-2" />Alerte chaque lundi : active</>
                            : <><BellOff className="h-4 w-4 mr-2" />Alerte arrêtée</>}
                        </Button>
                        <Button variant="ghost" onClick={() => supprimer(r)} aria-label={`Supprimer ${r.name}`}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
