import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Search, Bell, BellOff, Trash2, Edit2, Plus } from 'lucide-react';

interface SavedSearch {
  id: string;
  userId: string;
  name: string;
  filters: {
    sectors?: string[];
    territories?: string[];
    budgetMin?: number;
    budgetMax?: number;
    keywords?: string;
  };
  alertEnabled: boolean;
  frequency: 'realtime' | 'daily' | 'weekly';
  lastExecutedAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export default function SavedSearchesPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSearch, setEditingSearch] = useState<SavedSearch | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    keywords: '',
    sectors: [] as string[],
    territories: [] as string[],
    budgetMin: '',
    budgetMax: '',
    alertEnabled: true,
    frequency: 'daily' as 'realtime' | 'daily' | 'weekly',
  });

  const sectors = [
    'environnement',
    'energie',
    'sante',
    'numerique',
    'agriculture',
    'industrie',
    'economie-sociale',
    'education',
    'culture',
    'recherche',
  ];

  const territories = [
    'Auvergne-Rhône-Alpes',
    'Bourgogne-Franche-Comté',
    'Bretagne',
    'Centre-Val de Loire',
    'Corse',
    'Grand Est',
    'Hauts-de-France',
    'Île-de-France',
    'Normandie',
    'Nouvelle-Aquitaine',
    'Occitanie',
    'Pays de la Loire',
    'Provence-Alpes-Côte d\'Azur',
    'National',
  ];

  useEffect(() => {
    if (currentUser) {
      loadSavedSearches();
    }
  }, [currentUser]);

  const loadSavedSearches = async () => {
    if (!currentUser) return;

    try {
      const searchesQuery = query(
        collection(db, 'savedSearches'),
        where('userId', '==', currentUser.uid)
      );

      const snapshot = await getDocs(searchesQuery);
      const searchesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as SavedSearch[];

      setSavedSearches(searchesData);
    } catch (err) {
      console.error('Error loading saved searches:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!currentUser || !formData.name.trim()) return;

    try {
      const searchData = {
        userId: currentUser.uid,
        name: formData.name,
        filters: {
          keywords: formData.keywords || undefined,
          sectors: formData.sectors.length > 0 ? formData.sectors : undefined,
          territories: formData.territories.length > 0 ? formData.territories : undefined,
          budgetMin: formData.budgetMin ? parseFloat(formData.budgetMin) : undefined,
          budgetMax: formData.budgetMax ? parseFloat(formData.budgetMax) : undefined,
        },
        alertEnabled: formData.alertEnabled,
        frequency: formData.frequency,
        updatedAt: Timestamp.now(),
      };

      if (editingSearch) {
        await updateDoc(doc(db, 'savedSearches', editingSearch.id), searchData);
      } else {
        await addDoc(collection(db, 'savedSearches'), {
          ...searchData,
          createdAt: Timestamp.now(),
        });
      }

      setShowModal(false);
      setEditingSearch(null);
      resetForm();
      loadSavedSearches();
    } catch (err) {
      console.error('Error saving search:', err);
    }
  };

  const handleEdit = (search: SavedSearch) => {
    setEditingSearch(search);
    setFormData({
      name: search.name,
      keywords: search.filters.keywords || '',
      sectors: search.filters.sectors || [],
      territories: search.filters.territories || [],
      budgetMin: search.filters.budgetMin?.toString() || '',
      budgetMax: search.filters.budgetMax?.toString() || '',
      alertEnabled: search.alertEnabled,
      frequency: search.frequency,
    });
    setShowModal(true);
  };

  const handleDelete = async (searchId: string) => {
    if (!confirm('Voulez-vous vraiment supprimer cette recherche sauvegardée ?')) return;

    try {
      await deleteDoc(doc(db, 'savedSearches', searchId));
      setSavedSearches(savedSearches.filter(s => s.id !== searchId));
    } catch (err) {
      console.error('Error deleting search:', err);
    }
  };

  const toggleAlert = async (search: SavedSearch) => {
    try {
      await updateDoc(doc(db, 'savedSearches', search.id), {
        alertEnabled: !search.alertEnabled,
        updatedAt: Timestamp.now(),
      });

      setSavedSearches(savedSearches.map(s =>
        s.id === search.id ? { ...s, alertEnabled: !s.alertEnabled } : s
      ));
    } catch (err) {
      console.error('Error toggling alert:', err);
    }
  };

  const executeSearch = (search: SavedSearch) => {
    // Navigate to search page with filters
    const params = new URLSearchParams();
    if (search.filters.keywords) params.set('q', search.filters.keywords);
    if (search.filters.sectors) params.set('sectors', search.filters.sectors.join(','));
    if (search.filters.territories) params.set('territories', search.filters.territories.join(','));
    if (search.filters.budgetMin) params.set('budgetMin', search.filters.budgetMin.toString());
    if (search.filters.budgetMax) params.set('budgetMax', search.filters.budgetMax.toString());

    navigate(`/aap/search?${params.toString()}`);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      keywords: '',
      sectors: [],
      territories: [],
      budgetMin: '',
      budgetMax: '',
      alertEnabled: true,
      frequency: 'daily',
    });
  };

  const toggleSector = (sector: string) => {
    setFormData({
      ...formData,
      sectors: formData.sectors.includes(sector)
        ? formData.sectors.filter(s => s !== sector)
        : [...formData.sectors, sector],
    });
  };

  const toggleTerritory = (territory: string) => {
    setFormData({
      ...formData,
      territories: formData.territories.includes(territory)
        ? formData.territories.filter(t => t !== territory)
        : [...formData.territories, territory],
    });
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Recherches sauvegardées
            </h1>
            <p className="text-gray-600">
              Gérez vos alertes et vos recherches favorites
            </p>
          </div>
          <Button
            onClick={() => {
              setEditingSearch(null);
              resetForm();
              setShowModal(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle recherche
          </Button>
        </div>

        {/* Saved searches list */}
        {savedSearches.length === 0 ? (
          <Card className="p-12 text-center">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucune recherche sauvegardée
            </h3>
            <p className="text-gray-600 mb-4">
              Créez des recherches sauvegardées pour recevoir des alertes
            </p>
            <Button
              onClick={() => {
                setEditingSearch(null);
                resetForm();
                setShowModal(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Créer ma première recherche
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {savedSearches.map(search => (
              <Card key={search.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {search.name}
                    </h3>
                    {search.filters.keywords && (
                      <p className="text-sm text-gray-600 mb-2">
                        Mots-clés: {search.filters.keywords}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleAlert(search)}
                    >
                      {search.alertEnabled ? (
                        <Bell className="h-4 w-4 text-primary-600" />
                      ) : (
                        <BellOff className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(search)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(search.id)}
                    >
                      <Trash2 className="h-4 w-4 text-error-500" />
                    </Button>
                  </div>
                </div>

                {/* Filters summary */}
                <div className="space-y-2 mb-4">
                  {search.filters.sectors && search.filters.sectors.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Secteurs:</p>
                      <div className="flex flex-wrap gap-1">
                        {search.filters.sectors.slice(0, 3).map(sector => (
                          <Badge key={sector} variant="gray">
                            {sector}
                          </Badge>
                        ))}
                        {search.filters.sectors.length > 3 && (
                          <Badge variant="gray">
                            +{search.filters.sectors.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {search.filters.territories && search.filters.territories.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Territoires:</p>
                      <div className="flex flex-wrap gap-1">
                        {search.filters.territories.slice(0, 3).map(territory => (
                          <Badge key={territory} variant="gray">
                            {territory}
                          </Badge>
                        ))}
                        {search.filters.territories.length > 3 && (
                          <Badge variant="gray">
                            +{search.filters.territories.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {(search.filters.budgetMin || search.filters.budgetMax) && (
                    <p className="text-sm text-gray-600">
                      Budget: {search.filters.budgetMin || 0}€ - {search.filters.budgetMax || '∞'}€
                    </p>
                  )}
                </div>

                {/* Alert status */}
                {search.alertEnabled && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-blue-800">
                      <Bell className="h-4 w-4" />
                      <span>
                        Alertes actives -{' '}
                        {search.frequency === 'realtime' ? 'Temps réel' :
                         search.frequency === 'daily' ? 'Quotidien' : 'Hebdomadaire'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => executeSearch(search)}
                >
                  <Search className="h-4 w-4 mr-2" />
                  Exécuter la recherche
                </Button>
              </Card>
            ))}
          </div>
        )}

        {/* Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setEditingSearch(null);
            resetForm();
          }}
          title={editingSearch ? 'Modifier la recherche' : 'Nouvelle recherche sauvegardée'}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom de la recherche *
              </label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: AAP Environnement Île-de-France"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mots-clés
              </label>
              <Input
                type="text"
                value={formData.keywords}
                onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                placeholder="Recherche par mots-clés..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Secteurs
              </label>
              <div className="flex flex-wrap gap-2">
                {sectors.map(sector => (
                  <button
                    key={sector}
                    type="button"
                    onClick={() => toggleSector(sector)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      formData.sectors.includes(sector)
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {sector}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Territoires
              </label>
              <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                {territories.map(territory => (
                  <button
                    key={territory}
                    type="button"
                    onClick={() => toggleTerritory(territory)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      formData.territories.includes(territory)
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {territory}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Budget min (€)
                </label>
                <Input
                  type="number"
                  value={formData.budgetMin}
                  onChange={(e) => setFormData({ ...formData, budgetMin: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Budget max (€)
                </label>
                <Input
                  type="number"
                  value={formData.budgetMax}
                  onChange={(e) => setFormData({ ...formData, budgetMax: e.target.value })}
                  placeholder="∞"
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center gap-3 mb-3">
                <input
                  type="checkbox"
                  id="alertEnabled"
                  checked={formData.alertEnabled}
                  onChange={(e) => setFormData({ ...formData, alertEnabled: e.target.checked })}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <label htmlFor="alertEnabled" className="text-sm font-medium text-gray-700">
                  Activer les alertes
                </label>
              </div>

              {formData.alertEnabled && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fréquence des alertes
                  </label>
                  <select
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="realtime">Temps réel</option>
                    <option value="daily">Quotidien</option>
                    <option value="weekly">Hebdomadaire</option>
                  </select>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => {
                  setShowModal(false);
                  setEditingSearch(null);
                  resetForm();
                }}
              >
                Annuler
              </Button>
              <Button
                className="flex-1"
                onClick={handleSave}
                disabled={!formData.name.trim()}
              >
                {editingSearch ? 'Mettre à jour' : 'Sauvegarder'}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
