import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { AAP } from '../../types';
import { mentionRelecture, estRelue, dateExtraction } from '../../utils/relecture';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import {
  ExternalLink, Search, Calendar, Building, MapPin, Euro, Heart, FileText } from 'lucide-react';
import { getDaysUntilDeadline, isClosed, deadlineLabel, datesDAbord } from '../../utils/deadline';
import { libelleTerritoire, LIBELLES_THEMATIQUES, thematique, valeursPresentes } from '../../utils/territoires';

export default function SearchAapPage() {
  const navigate = useNavigate();
  const [aaps, setAaps] = useState<(AAP & { id: string })[]>([]);
  const [filteredAaps, setFilteredAaps] = useState<(AAP & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    thematique: '',
    territory: '',
    financeur: '',
    source: '',
    relecture: '',
    budgetMin: '',
    budgetMax: '',
  });

  // Options des filtres construites à partir des fiches chargées (changement filtres-recherche, 2026-10-14) : les
  // identifiants de territoire écrits par l'import, affichés avec leur libellé ; les financeurs présents (nom canonique
  // écrit par l'import, changement nettoyage-financeurs-territoires) ; les sources (site d'origine de la fiche).
  const territoiresPresents = valeursPresentes(aaps.flatMap(aap => aap.territoriesEligible ?? []), libelleTerritoire);
  const financeursPresents = valeursPresentes(aaps.map(aap => aap.financeurName || 'Non spécifié'));
  const sourcesPresentes = valeursPresentes(aaps.map(aap => aap.scrapeMetadata?.sourceNom || 'Non précisée'));

  useEffect(() => {
    loadAaps();
  }, []);

  useEffect(() => {
    applyFilters();
    // Fonction redéfinie à chaque rendu : la lister relancerait l'effet en boucle (chargement ou filtrage voulu
    // seulement quand les valeurs listées changent).
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

    // Filtre par thématique (champ classé par le modèle : santé, médico-social, sinon non classée)
    if (filters.thematique) {
      result = result.filter(aap => thematique(aap) === filters.thematique);
    }

    // Filtre par territoire : comparaison sur l'identifiant enregistré (ile-de-france, france...)
    if (filters.territory) {
      result = result.filter(aap =>
        aap.territoriesEligible?.includes(filters.territory)
      );
    }

    // Filtre par financeur (nom canonique)
    if (filters.financeur) {
      result = result.filter(aap => (aap.financeurName || 'Non spécifié') === filters.financeur);
    }

    // Filtre « fiches relues ou contrôlées seulement » (mention-relecture-fiches) : validation.statut = validee
    if (filters.relecture === 'relues') {
      result = result.filter(aap => estRelue(aap));
    }

    // Filtre par source : site d'origine de la fiche (nom de l'émetteur du registre écrit par l'import)
    if (filters.source) {
      result = result.filter(aap => (aap.scrapeMetadata?.sourceNom || 'Non précisée') === filters.source);
    }

    // Filtres par budget : une fiche sans montant connu n'est pas écartée, elle est classée après les fiches chiffrées
    if (filters.budgetMin) {
      const min = parseFloat(filters.budgetMin);
      result = result.filter(aap => aap.budgetMax == null || aap.budgetMax >= min);
    }
    if (filters.budgetMax) {
      const max = parseFloat(filters.budgetMax);
      result = result.filter(aap => aap.budgetMin == null || aap.budgetMin <= max);
    }
    if (filters.budgetMin || filters.budgetMax) {
      const chiffree = (aap: AAP) => aap.budgetMin != null || aap.budgetMax != null;
      result = [...result.filter(chiffree), ...result.filter(aap => !chiffree(aap))];
    }

    // Appels sans date de clôture classés après les datés, ordre des datés conservé (réponse Q4, 2026-10-14)
    setFilteredAaps(datesDAbord(result));
  };

  const resetFilters = () => {
    setSearchTerm('');
    setFilters({
      thematique: '',
      territory: '',
      financeur: '',
      source: '',
      relecture: '',
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

              {/* Thématique */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thématique
                </label>
                <select
                  value={filters.thematique}
                  onChange={(e) => setFilters({ ...filters, thematique: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Toutes les thématiques</option>
                  {Object.entries(LIBELLES_THEMATIQUES).map(([id, libelle]) => (
                    <option key={id} value={id}>
                      {libelle}
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
                  {territoiresPresents.map(territory => (
                    <option key={territory} value={territory}>
                      {libelleTerritoire(territory)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Financeur */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Financeur
                </label>
                <select
                  value={filters.financeur}
                  onChange={(e) => setFilters({ ...filters, financeur: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Tous les financeurs</option>
                  {financeursPresents.map(financeur => (
                    <option key={financeur} value={financeur}>
                      {financeur}
                    </option>
                  ))}
                </select>
              </div>

              {/* Source : site d'origine de la fiche */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Source (site d'origine)
                </label>
                <select
                  value={filters.source}
                  onChange={(e) => setFilters({ ...filters, source: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Toutes les sources</option>
                  {sourcesPresentes.map(source => (
                    <option key={source} value={source}>
                      {source}
                    </option>
                  ))}
                </select>
              </div>

              {/* Relecture (mention-relecture-fiches) : fiches validées par Monsieur DUCOUT ou par le modèle */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Relecture
                </label>
                <select
                  value={filters.relecture}
                  onChange={(e) => setFilters({ ...filters, relecture: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Toutes les fiches</option>
                  <option value="relues">Fiches relues ou contrôlées seulement</option>
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
                  const isUrgent = daysLeft !== null && !closed && daysLeft <= 7;

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

                      {/* Mention de relecture, date d'extraction et lien officiel (mention-relecture-fiches, instruction 11) */}
                      {(mentionRelecture(aap) || aap.externalUrl) && (
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-3 text-sm text-gray-600">
                          {mentionRelecture(aap) && (
                            <Badge variant={mentionRelecture(aap)!.variant}>{mentionRelecture(aap)!.libelle}</Badge>
                          )}
                          {dateExtraction(aap) && <span>Informations extraites le {dateExtraction(aap)}</span>}
                          {aap.externalUrl && (
                            <a
                              href={aap.externalUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-primary-600 hover:underline inline-flex items-center gap-1 font-medium"
                            >
                              Annonce officielle
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          )}
                        </div>
                      )}

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
                              ? libelleTerritoire(aap.territoriesEligible[0])
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
