import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { collection, query, where, orderBy, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { AAP, PorteurProfile } from '../../types';
import { mentionRelecture, dateExtraction, visiblePubliquement } from '../../utils/relecture';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import {
  ExternalLink, Search, Calendar, Building, MapPin, Euro, Heart, FileText, X, Link2, UserCheck } from 'lucide-react';
import { getDaysUntilDeadline, isClosed, deadlineLabel, datesDAbord } from '../../utils/deadline';
import { libelleTerritoire, LIBELLES_THEMATIQUES, thematique, valeursPresentes } from '../../utils/territoires';
import { useMarquerDemarrage } from '../../hooks/useMarquerDemarrage';
import { journaliser } from '../../services/journalService';
import { libelleFiltres } from '../../utils/journal';
import { correspondDestinataire, correspondTypeAppel, LIBELLES_DESTINATAIRES, LIBELLES_TYPES_APPEL } from '../../utils/qualification';
import {
  correspondTerritoire, etiquettesActives, euros, fichesConsultees, FILTRES_VIDES, filtresDepuisParams,
  filtresDepuisProfil, LIBELLES_STATUT, paramsDepuisFiltres, statutAppel, totalMontants, type FiltresRecherche,
  type StatutAppel,
} from '../../utils/recherche';

// Pastille de statut d'une carte (recherche-guidee) : couleur selon l'urgence
const VARIANT_STATUT: Record<StatutAppel, 'success' | 'warning' | 'gray' | 'primary'> = {
  ouvert: 'success', 'bientot-clos': 'warning', clos: 'gray', 'sans-date': 'primary',
};

export default function SearchAapPage() {
  const navigate = useNavigate();
  useMarquerDemarrage('recherche');
  const { currentUser, userProfile } = useAuth();
  const [aaps, setAaps] = useState<(AAP & { id: string })[]>([]);
  const [filteredAaps, setFilteredAaps] = useState<(AAP & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  // Filtres dans l'adresse de la page (recherche-guidee, 2026-10-20) : une recherche se partage par son lien et
  // survit au rechargement ; l'état React est dérivé des paramètres, chaque changement réécrit l'adresse sans empiler
  // d'historique.
  const [searchParams, setSearchParams] = useSearchParams();
  const filters: FiltresRecherche = filtresDepuisParams(searchParams);
  const searchTerm = filters.q;
  const setFilters = (f: FiltresRecherche) => setSearchParams(paramsDepuisFiltres(f), { replace: true });
  const setSearchTerm = (q: string) => setFilters({ ...filters, q });
  const retirerFiltre = (cle: keyof FiltresRecherche) => setFilters({ ...filters, [cle]: '' });
  // Onglet « Consultées » : dernières fiches ouvertes sur ce navigateur
  const [onglet, setOnglet] = useState<'trouver' | 'consultees'>('trouver');
  const [consultees] = useState<string[]>(() => fichesConsultees());
  // Région du profil pour « Initialiser à mon profil » (porteur connecté seulement)
  const [regionProfil, setRegionProfil] = useState('');
  const [lienCopie, setLienCopie] = useState('');
  const etiquettes = etiquettesActives(filters);

  // Journal des actions (suivi-testeurs) : une ligne « recherche » par ouverture de la page, avec les filtres d'arrivée
  useEffect(() => {
    if (currentUser && userProfile) journaliser(currentUser.uid, userProfile.userType, 'recherche', '', libelleFiltres(etiquettesActives(filtresDepuisParams(searchParams))));
    // à l'ouverture et au changement de compte seulement
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.uid, userProfile?.uid]);
  const montants = totalMontants(filteredAaps);

  useEffect(() => {
    if (!currentUser || userProfile?.userType !== 'porteur') return;
    getDoc(doc(db, 'porteurProfiles', currentUser.uid))
      .then(snap => {
        const region = filtresDepuisProfil(snap.data() as PorteurProfile | undefined).territory ?? '';
        setRegionProfil(region);
        // Arrivée sans filtre : la recherche part du profil (retour de Monsieur DUCOUT du 2026-10-20 : « je devrais
        // n'avoir que ceux qui me concernent ») ; les étiquettes restent retirables d'une croix
        if (region && searchParams.toString() === '') setSearchParams(paramsDepuisFiltres({ ...FILTRES_VIDES, territory: region }), { replace: true });
      })
      .catch(err => console.error('Profil porteur non lu :', err));
    // Au montage et au changement de compte seulement : rejouer à chaque frappe écraserait les filtres choisis
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, userProfile]);

  const initialiserAuProfil = () => setFilters({ ...filters, territory: regionProfil });

  const copierLeLien = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setLienCopie('Lien copié');
    } catch {
      setLienCopie('Copie impossible : copiez l\'adresse de la page');
    }
    setTimeout(() => setLienCopie(''), 3000);
  };

  // Options des filtres construites à partir des fiches chargées (changement filtres-recherche, 2026-10-14) : les
  // identifiants de territoire écrits par l'import, affichés avec leur libellé ; les financeurs présents (nom canonique
  // écrit par l'import, changement nettoyage-financeurs-territoires) ; les sources (site d'origine de la fiche).
  const territoiresPresents = valeursPresentes(aaps.flatMap(aap => aap.territoriesEligible ?? []), libelleTerritoire);
  const financeursPresents = valeursPresentes(aaps.map(aap => aap.financeurName || 'Non spécifié'));

  useEffect(() => {
    loadAaps();
  }, []);

  useEffect(() => {
    applyFilters();
    // Fonction redéfinie à chaque rendu : la lister relancerait l'effet en boucle (chargement ou filtrage voulu
    // seulement quand les valeurs listées changent).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, aaps]);

  const loadAaps = async () => {
    try {
      const aapsQuery = query(
        collection(db, 'aap'),
        where('status', '==', 'published'),
        orderBy('publishedAt', 'desc')
      );

      const snapshot = await getDocs(aapsQuery);
      // Seules les fiches contrôlées (ou saisies à la main) sont visibles des candidats (administration-controle)
      const aapsData = (snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as (AAP & { id: string })[]).filter(visiblePubliquement);

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

    // Filtre par territoire : identifiant enregistré (ile-de-france, france...) ; un appel national reste visible dans
    // chaque région (recherche-guidee, 2026-10-20)
    if (filters.territory) {
      result = result.filter(aap => correspondTerritoire(aap, filters.territory));
    }

    // Filtre par statut calculé d'après la date de clôture (recherche-guidee) : ouvert, bientôt clôturé, clôturé, sans date
    if (filters.statut) {
      result = result.filter(aap => statutAppel(aap) === filters.statut);
    }

    // Qualification (jour 2 du plan MVP) : à qui s'adresse l'appel (« tous » répond à tout), type d'appel
    if (filters.destinataire) {
      result = result.filter(aap => correspondDestinataire(aap, filters.destinataire));
    }
    if (filters.typeAppel) {
      result = result.filter(aap => correspondTypeAppel(aap, filters.typeAppel));
    }

    // Filtre par financeur (nom canonique)
    if (filters.financeur) {
      result = result.filter(aap => (aap.financeurName || 'Non spécifié') === filters.financeur);
    }

    // Les filtres Source et Relecture ont été retirés de la recherche publique le 2026-10-20 (administration-controle) :
    // toutes les fiches affichées ici sont contrôlées, et le site d'origine n'intéresse que l'administration.

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

  const resetFilters = () => setFilters(FILTRES_VIDES);

  const aapsAffiches = onglet === 'consultees'
    ? consultees.map(id => aaps.find(a => a.id === id)).filter((a): a is AAP & { id: string } => Boolean(a))
    : filteredAaps;

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
        {/* Header : compteur avec montants annoncés (recherche-guidee, 2026-10-20) */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Rechercher des Appels à Projets
          </h1>
          <p className="text-gray-600">
            <span className="font-semibold text-gray-900">{filteredAaps.length} appel{filteredAaps.length > 1 ? 's' : ''} à projets</span>
            {montants.chiffrees > 0 && (
              <>
                {' '}totalisant <span className="font-semibold text-gray-900">{euros(montants.total)}</span> annoncés
                {' '}({montants.chiffrees} fiche{montants.chiffrees > 1 ? 's' : ''} chiffrée{montants.chiffrees > 1 ? 's' : ''})
              </>
            )}
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <div className="inline-flex rounded-lg border border-gray-300 overflow-hidden text-sm">
              <button
                type="button"
                onClick={() => setOnglet('trouver')}
                className={`px-3 py-1.5 ${onglet === 'trouver' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
              >
                Trouver
              </button>
              <button
                type="button"
                onClick={() => setOnglet('consultees')}
                className={`px-3 py-1.5 border-l border-gray-300 ${onglet === 'consultees' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
              >
                Consultées ({consultees.length})
              </button>
            </div>
            {regionProfil && (
              <Button variant="secondary" size="sm" onClick={initialiserAuProfil}>
                <UserCheck className="h-4 w-4 mr-1" />
                Initialiser à mon profil
              </Button>
            )}
            <Button variant="secondary" size="sm" onClick={copierLeLien}>
              <Link2 className="h-4 w-4 mr-1" />
              Copier le lien
            </Button>
            {lienCopie && <span className="text-sm text-gray-600">{lienCopie}</span>}
          </div>
        </div>

        {/* Étiquettes des filtres actifs, retirables d'une croix (recherche-guidee) */}
        {etiquettes.length > 0 && onglet === 'trouver' && (
          <div className="flex flex-wrap items-center gap-2 mb-6">
            {etiquettes.map(e => (
              <span key={e.cle} className="inline-flex items-center gap-1 bg-primary-50 text-primary-700 border border-primary-200 rounded-full px-3 py-1 text-sm">
                {e.libelle}
                <button type="button" onClick={() => retirerFiltre(e.cle)} aria-label={`Retirer ${e.libelle}`} className="hover:text-primary-900">
                  <X className="h-4 w-4" />
                </button>
              </span>
            ))}
            <button type="button" onClick={resetFilters} className="text-sm text-gray-600 hover:text-gray-900 underline">
              Effacer tout
            </button>
          </div>
        )}

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

              {/* À qui s'adresse l'appel et type d'appel (qualification-appels, jour 2) */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  À qui s'adresse l'appel
                </label>
                <select
                  value={filters.destinataire}
                  onChange={(e) => setFilters({ ...filters, destinataire: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Toutes les structures</option>
                  {Object.entries(LIBELLES_DESTINATAIRES).filter(([id]) => id !== 'tous').map(([id, libelle]) => (
                    <option key={id} value={id}>{libelle}</option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type d'appel
                </label>
                <select
                  value={filters.typeAppel}
                  onChange={(e) => setFilters({ ...filters, typeAppel: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Tous les types</option>
                  {Object.entries(LIBELLES_TYPES_APPEL).map(([id, libelle]) => (
                    <option key={id} value={id}>{libelle}</option>
                  ))}
                </select>
              </div>

              {/* Statut à quatre valeurs (recherche-guidee) */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Statut
                </label>
                <select
                  value={filters.statut}
                  onChange={(e) => setFilters({ ...filters, statut: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Tous les statuts</option>
                  {(Object.keys(LIBELLES_STATUT) as StatutAppel[]).map(s => (
                    <option key={s} value={s}>
                      {s === 'bientot-clos' ? 'Bientôt clôturé (30 jours ou moins)' : LIBELLES_STATUT[s]}
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
            {aapsAffiches.length === 0 ? (
              <Card className="p-12 text-center">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {onglet === 'consultees' ? 'Aucune fiche consultée sur ce navigateur' : 'Aucun AAP trouvé'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {onglet === 'consultees'
                    ? 'Les fiches que vous ouvrez apparaîtront ici, la plus récente en premier'
                    : 'Essayez de modifier vos critères de recherche'}
                </p>
                {onglet === 'trouver' && (
                  <Button variant="secondary" onClick={resetFilters}>
                    Réinitialiser les filtres
                  </Button>
                )}
              </Card>
            ) : (
              <div className="space-y-4">
                {aapsAffiches.map(aap => {
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
                          <div className="mb-2">
                            <Badge variant={VARIANT_STATUT[statutAppel(aap)]}>{LIBELLES_STATUT[statutAppel(aap)]}</Badge>
                          </div>
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
                      {(dateExtraction(aap) || aap.externalUrl) && (
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-3 text-sm text-gray-600">
                          {userProfile?.userType === 'admin' && mentionRelecture(aap) && (
                            <Badge variant={mentionRelecture(aap)!.variant}>{mentionRelecture(aap)!.libelle}</Badge>
                          )}
                          {dateExtraction(aap) && <span>Mise à jour le {dateExtraction(aap)}</span>}
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
