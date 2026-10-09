import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { AAP } from '../../types';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { getDaysUntilDeadline, isClosed } from '../../utils/deadline';
import {
  Calendar,
  Building,
  MapPin,
  Euro,
  FileText,
  ExternalLink,
  Heart,
  ArrowLeft,
  Users,
  CheckCircle,
} from 'lucide-react';

export default function AapDetailPage() {
  const { aapId } = useParams<{ aapId: string }>();
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const [aap, setAap] = useState<AAP | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (aapId) {
      loadAap();
    }
  }, [aapId]);

  const loadAap = async () => {
    if (!aapId) return;

    try {
      const aapDoc = await getDoc(doc(db, 'aap', aapId));
      if (aapDoc.exists()) {
        setAap({ ...aapDoc.data() } as AAP);
      }
    } catch (err) {
      console.error('Error loading AAP:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date | Timestamp): string => {
    const dateObj = date instanceof Date ? date : date.toDate();
    return dateObj.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de l'AAP...</p>
        </div>
      </div>
    );
  }

  if (!aap) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">AAP non trouvé</h2>
          <p className="text-gray-600 mb-4">
            Cet appel à projets n'existe pas ou n'est plus disponible.
          </p>
          <Button onClick={() => navigate('/aap/search')}>
            Retour à la recherche
          </Button>
        </Card>
      </div>
    );
  }

  const daysLeft = getDaysUntilDeadline(aap.deadline);
  const closed = isClosed(daysLeft);
  const isUrgent = !closed && daysLeft <= 7;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/aap/search')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour à la recherche
        </Button>

        {/* Header */}
        <Card className="p-8 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-3">{aap.title}</h1>
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <Building className="h-5 w-5" />
                <span className="text-lg">{aap.financeurName}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm">
                <Heart className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Key metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 py-6 border-y">
            <div className="text-center">
              <div className={`flex items-center justify-center gap-2 mb-2 ${isUrgent ? 'text-warning-600' : 'text-gray-900'}`}>
                <Calendar className="h-5 w-5" />
                <span className="text-2xl font-bold">{closed ? 'Clôturé' : daysLeft}</span>
              </div>
              <p className="text-sm text-gray-600">{closed ? 'Candidatures fermées' : 'Jours restants'}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-gray-900 mb-2">
                <Euro className="h-5 w-5" />
                <span className="text-2xl font-bold">
                  {aap.budgetMax ? (aap.budgetMax / 1000).toFixed(0) + 'k' : 'N/A'}
                </span>
              </div>
              <p className="text-sm text-gray-600">Budget max</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-gray-900 mb-2">
                <Users className="h-5 w-5" />
                <span className="text-2xl font-bold">{aap.applicationsCount || 0}</span>
              </div>
              <p className="text-sm text-gray-600">Candidatures</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-gray-900 mb-2">
                <MapPin className="h-5 w-5" />
                <span className="text-2xl font-bold">
                  {aap.territoriesEligible?.length || 0}
                </span>
              </div>
              <p className="text-sm text-gray-600">Territoires</p>
            </div>
          </div>

          {/* CTA */}
          {userProfile?.userType === 'porteur' && (
            <div className="mt-6">
              <Button
                size="lg"
                className="w-full"
                onClick={() => navigate(`/aap/${aapId}/candidater`)}
              >
                Candidater à cet AAP
              </Button>
            </div>
          )}
        </Card>

        {/* Description */}
        <Card className="p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Description</h2>
          <div className="prose max-w-none text-gray-600">
            <p className="whitespace-pre-wrap">{aap.description}</p>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Eligibility */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary-600" />
              Critères d'éligibilité
            </h3>
            {aap.eligibilityCriteria ? (
              <div className="prose prose-sm max-w-none text-gray-600">
                <p className="whitespace-pre-wrap">{aap.eligibilityCriteria}</p>
              </div>
            ) : (
              <p className="text-gray-500 italic">Non spécifié</p>
            )}
          </Card>

          {/* Budget */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Euro className="h-5 w-5 text-primary-600" />
              Budget
            </h3>
            <div className="space-y-3">
              {aap.budgetMin && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Minimum:</span>
                  <span className="font-semibold text-gray-900">
                    {aap.budgetMin.toLocaleString('fr-FR')}€
                  </span>
                </div>
              )}
              {aap.budgetMax && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Maximum:</span>
                  <span className="font-semibold text-gray-900">
                    {aap.budgetMax.toLocaleString('fr-FR')}€
                  </span>
                </div>
              )}
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Sectors */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Secteurs ciblés
            </h3>
            <div className="flex flex-wrap gap-2">
              {aap.sectorsTargeted && aap.sectorsTargeted.length > 0 ? (
                aap.sectorsTargeted.map(sector => (
                  <Badge key={sector} variant="primary">
                    {sector}
                  </Badge>
                ))
              ) : (
                <p className="text-gray-500 italic">Non spécifié</p>
              )}
            </div>
          </Card>

          {/* Territories */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Territoires éligibles
            </h3>
            <div className="flex flex-wrap gap-2">
              {aap.territoriesEligible && aap.territoriesEligible.length > 0 ? (
                aap.territoriesEligible.map(territory => (
                  <Badge key={territory} variant="gray">
                    {territory}
                  </Badge>
                ))
              ) : (
                <p className="text-gray-500 italic">Non spécifié</p>
              )}
            </div>
          </Card>
        </div>

        {/* Required documents */}
        {aap.requiredDocuments && aap.requiredDocuments.length > 0 && (
          <Card className="p-6 mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary-600" />
              Documents requis
            </h3>
            <ul className="space-y-2">
              {aap.requiredDocuments.map((doc, index) => (
                <li key={index} className="flex items-center gap-2 text-gray-700">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  {doc}
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* Contact */}
        <Card className="p-6 mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Contact</h3>
          <div className="space-y-2">
            {aap.contactEmail && (
              <div className="flex items-center gap-2 text-gray-700">
                <span className="font-medium">Email:</span>
                <a
                  href={`mailto:${aap.contactEmail}`}
                  className="text-primary-600 hover:underline"
                >
                  {aap.contactEmail}
                </a>
              </div>
            )}
            {aap.contactPhone && (
              <div className="flex items-center gap-2 text-gray-700">
                <span className="font-medium">Téléphone:</span>
                <a
                  href={`tel:${aap.contactPhone}`}
                  className="text-primary-600 hover:underline"
                >
                  {aap.contactPhone}
                </a>
              </div>
            )}
            {aap.externalUrl && (
              <div className="flex items-center gap-2 text-gray-700">
                <span className="font-medium">Site web:</span>
                <a
                  href={aap.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:underline inline-flex items-center gap-1"
                >
                  Voir l'annonce officielle
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            )}
          </div>
        </Card>

        {/* Important dates */}
        <Card className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Dates importantes</h3>
          <div className="space-y-3">
            {aap.publishedAt && (
              <div className="flex justify-between">
                <span className="text-gray-600">Date de publication:</span>
                <span className="font-semibold text-gray-900">
                  {formatDate(aap.publishedAt)}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Date limite de candidature:</span>
              <span className={`font-semibold ${isUrgent ? 'text-warning-600' : 'text-gray-900'}`}>
                {formatDate(aap.deadline)}
              </span>
            </div>
            {closed && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <p className="text-gray-700 text-sm font-medium">
                  Clôturé : la date limite de candidature est passée.
                </p>
              </div>
            )}
            {isUrgent && (
              <div className="bg-warning-50 border border-warning-200 rounded-lg p-3">
                <p className="text-warning-800 text-sm font-medium">
                  ⚠️ Attention: Il ne reste que {daysLeft} jour{daysLeft > 1 ? 's' : ''} pour candidater !
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
