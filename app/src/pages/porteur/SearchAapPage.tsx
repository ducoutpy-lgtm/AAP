import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { AAP } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Search, Calendar, Building, MapPin, Euro, Heart, FileText } from 'lucide-react';
import { getDaysUntilDeadline, isClosed, deadlineLabel } from '../../utils/deadline';

export default function SearchAapPage() {
  const navigate = useNavigate();
  const [aaps, setAaps] = useState<(AAP & { id: string })[]>([]);
  const [filteredAaps, setFilteredAaps] = useState<(AAP & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    sector: '',
    territory: '',
    budgetMin: '',
    budgetMax: '',
  });

  // Secteurs disponibles
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

  // Régions françaises
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
    loadAaps();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, filters, aaps]);

  const loadAaps = async () => {
    try {
      const aapsQuery = query(
        collection(db, 'aap'),
        where('status', '==', 'published'),
        orderBy('publishedAt', 'desc')
      );

      const snapshot = await getDocs(aapsQuery);
      const aapsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as (AAP & { id: string })[];

      setAaps(aapsData);
      setFilteredAaps(aapsData);
    } catch (err) {
      console.error('Error loading AAPs:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...aaps];

    // Recherche par texte
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        aap =>
          aap.title.toLowerCase().includes(term) ||
          aap.description.toLowerCase().includes(term) ||
          (aap.financeurName || 'Non spécifié').toLowerCase().includes(term)
      );
    }

    // Filtre par secteur
    if (filters.sector) {
      result = result.filter(aap =>
        aap.sectorsTargeted?.includes(filters.sector)
      );
    }

    // Filtre par territoire
    if (filters.territory) {
      result = result.filter(aap =>
        aap.territoriesEligible?.includes(filters.territory)
      );
    }

    // Filtre par budget min
    if (filters.budgetMin) {
      const min = parseFloat(filters.budgetMin);
      result = result.filter(aap => aap.budgetMax && aap.budgetMax >= min);
    }

    // Filtre par budget max
    if (filters.budgetMax) {
      const max = parseFloat(filters.budgetMax);
      result = result.filter(aap => aap.budgetMin && aap.budgetMin <= max);
    }

    setFilteredAaps(result);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setFilters({
      sector: '',
      territory: '',
      budgetMin: '',
      budgetMax: '',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des AAP...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Rechercher des Appels à Projets
          </h1>
          <p className="text-gray-600">
            {filteredAaps.length} AAP disponible{filteredAaps.length > 1 ? 's' : ''}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filtres */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Filtres</h2>

              {/* Recherche textuelle */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recherche
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Mots-clés..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Secteur */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Secteur
                </label>
                <select
                  value={filters.sector}
                  onChange={(e) => setFilters({ ...filters, sector: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Tous les secteurs</option>
                  {sectors.map(sector => (
                    <option key={sector} value={sector}>
                      {sector.charAt(0).toUpperCase() + sector.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Territoire */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Territoire
                </label>
                <select
                  value={filters.territory}
                  onChange={(e) => setFilters({ ...filters, territory: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Tous les territoires</option>
                  {territories.map(territory => (
                    <option key={territory} value={territory}>
                      {territory}
                    </option>
                  ))}
                </select>
              </div>

              {/* Budget */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Budget (€)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={filters.budgetMin}
                    onChange={(e) => setFilters({ ...filters, budgetMin: e.target.value })}
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={filters.budgetMax}
                    onChange={(e) => setFilters({ ...filters, budgetMax: e.target.value })}
                  />
                </div>
              </div>

              <Button
                variant="secondary"
                className="w-full"
                onClick={resetFilters}
              >
                Réinitialiser
              </Button>
            </Card>
          </div>

          {/* Liste des AAP */}
          <div className="lg:col-span-3">
            {filteredAaps.length === 0 ? (
              <Card className="p-12 text-center">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aucun AAP trouvé
                </h3>
                <p className="text-gray-600 mb-4">
                  Essayez de modifier vos critères de recherche
                </p>
                <Button variant="secondary" onClick={resetFilters}>
                  Réinitialiser les filtres
                </Button>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredAaps.map(aap => {
                  const daysLeft = getDaysUntilDeadline(aap.deadline);
                  const closed = isClosed(daysLeft);
                  const isUrgent = !closed && daysLeft <= 7;

                  return (
                    <Card
                      key={aap.id}
                      className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => navigate(`/aap/${aap.id}`)}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            {aap.title}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                            <Building className="h-4 w-4" />
                            <span>{aap.financeurName || "Non spécifié"}</span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Toggle favorite
                          }}
                        >
                          <Heart className="h-5 w-5" />
                        </Button>
                      </div>

                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {aap.description}
                      </p>

                      {/* Tags secteurs */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {aap.sectorsTargeted?.slice(0, 3).map(sector => (
                          <Badge key={sector} variant="gray">
                            {sector}
                          </Badge>
                        ))}
                        {aap.sectorsTargeted && aap.sectorsTargeted.length > 3 && (
                          <Badge variant="gray">
                            +{aap.sectorsTargeted.length - 3}
                          </Badge>
                        )}
                      </div>

                      {/* Infos clés */}
                      <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className={`h-4 w-4 ${isUrgent ? 'text-warning-500' : 'text-gray-400'}`} />
                          <span className={isUrgent ? 'text-warning-600 font-medium' : 'text-gray-600'}>
                            {deadlineLabel(daysLeft)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Euro className="h-4 w-4" />
                          <span>
                            {aap.budgetMin && aap.budgetMax
                              ? `${aap.budgetMin.toLocaleString()}€ - ${aap.budgetMax.toLocaleString()}€`
                              : aap.budgetMax
                              ? `Jusqu'à ${aap.budgetMax.toLocaleString()}€`
                              : 'Non spécifié'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="h-4 w-4" />
                          <span>
                            {aap.territoriesEligible && aap.territoriesEligible.length > 0
                              ? aap.territoriesEligible[0]
                              : 'Non spécifié'}
                          </span>
                        </div>
                      </div>
                      {/* Pièces jointes collectées par le scraping, seulement s'il y en a */}
                      {aap.scrapeMetadata?.fichiersJoints && aap.scrapeMetadata.fichiersJoints.length > 0 && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 pt-3">
                          <FileText className="h-4 w-4" />
                          <span>
                            {aap.scrapeMetadata.fichiersJoints.length} pièce
                            {aap.scrapeMetadata.fichiersJoints.length > 1 ? 's' : ''} jointe
                            {aap.scrapeMetadata.fichiersJoints.length > 1 ? 's' : ''}
                          </span>
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
