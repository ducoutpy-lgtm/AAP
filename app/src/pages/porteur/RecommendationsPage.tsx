import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, doc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { AAP } from '../../types';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import {
  Sparkles,
  TrendingUp,
  Target,
  Calendar,
  Euro,
  MapPin,
  Building,
  Heart,
} from 'lucide-react';

interface RecommendedAAP extends AAP {
  id: string;
  matchScore: number;
  matchReasons: string[];
}

export default function RecommendationsPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [recommendations, setRecommendations] = useState<RecommendedAAP[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      loadRecommendations();
    }
  }, [currentUser]);

  const loadRecommendations = async () => {
    if (!currentUser) return;

    try {
      // Load user profile
      const profileDoc = await getDoc(doc(db, 'porteurProfiles', currentUser.uid));
      if (!profileDoc.exists()) {
        setLoading(false);
        return;
      }

      const profile = profileDoc.data();

      // Load all published AAPs
      const aapsQuery = query(
        collection(db, 'aap'),
        where('status', '==', 'published')
      );

      const snapshot = await getDocs(aapsQuery);
      const aaps = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as (AAP & { id: string })[];

      // Calculate match scores
      const scoredAAPs = aaps
        .map(aap => {
          const { score, reasons } = calculateMatchScore(aap, profile);
          return {
            ...aap,
            matchScore: score,
            matchReasons: reasons,
          };
        })
        .filter(aap => aap.matchScore > 50) // Only show relevant recommendations
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 10); // Top 10 recommendations

      setRecommendations(scoredAAPs);
    } catch (err) {
      console.error('Error loading recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateMatchScore = (
    aap: AAP & { id: string },
    profile: any
  ): { score: number; reasons: string[] } => {
    let score = 0;
    const reasons: string[] = [];

    // Sector match (40%)
    const profileSectors = profile.domainesIntervention || [];
    const aapSectors = aap.sectorsTargeted || [];
    const sectorMatches = profileSectors.filter((s: string) => aapSectors.includes(s));

    if (sectorMatches.length > 0) {
      const sectorScore = Math.min(40, sectorMatches.length * 20);
      score += sectorScore;
      reasons.push(`Secteur correspondant (${sectorMatches.join(', ')})`);
    }

    // Territory match (30%)
    const profileRegion = profile.address?.region;
    if (profileRegion && aap.territoriesEligible?.includes(profileRegion)) {
      score += 30;
      reasons.push(`Territoire éligible (${profileRegion})`);
    } else if (aap.territoriesEligible?.includes('National')) {
      score += 20;
      reasons.push('Territoire national');
    }

    // Budget compatibility (20%)
    if (aap.budgetMin && aap.budgetMax) {
      // Assume average project budget based on team size
      const estimatedBudget = (profile.effectif || 5) * 10000;
      if (estimatedBudget >= aap.budgetMin && estimatedBudget <= aap.budgetMax) {
        score += 20;
        reasons.push('Budget compatible');
      }
    }

    // Deadline urgency (10%)
    const deadline = aap.deadline instanceof Date ? aap.deadline : aap.deadline.toDate();
    const daysUntilDeadline = Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

    if (daysUntilDeadline > 30 && daysUntilDeadline <= 90) {
      score += 10;
      reasons.push('Délai optimal pour candidater');
    } else if (daysUntilDeadline <= 30 && daysUntilDeadline > 7) {
      score += 5;
      reasons.push('Deadline approchante');
    }

    return { score: Math.round(score), reasons };
  };

  const getDaysUntilDeadline = (deadline: Date | Timestamp): number => {
    const deadlineDate = deadline instanceof Date ? deadline : deadline.toDate();
    const diff = deadlineDate.getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const getScoreBadgeVariant = (score: number): 'success' | 'primary' | 'gray' => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'primary';
    return 'gray';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Calcul des recommandations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="h-8 w-8 text-primary-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              AAP Recommandés
            </h1>
          </div>
          <p className="text-gray-600">
            {recommendations.length} appel{recommendations.length > 1 ? 's' : ''} à projets
            correspondant à votre profil
          </p>
        </div>

        {/* Info banner */}
        <Card className="p-4 mb-6 bg-blue-50 border-blue-200">
          <div className="flex items-start gap-3">
            <TrendingUp className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-blue-900">
                <strong>Comment fonctionnent les recommandations ?</strong>
              </p>
              <p className="text-sm text-blue-800 mt-1">
                Nous analysons votre profil (secteurs d'activité, localisation, taille de structure)
                pour vous proposer les AAP les plus pertinents. Le score de compatibilité est calculé
                sur 100 points.
              </p>
            </div>
          </div>
        </Card>

        {/* Recommendations list */}
        {recommendations.length === 0 ? (
          <Card className="p-12 text-center">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucune recommandation disponible
            </h3>
            <p className="text-gray-600 mb-4">
              Complétez votre profil pour recevoir des recommandations personnalisées
            </p>
            <Button onClick={() => navigate('/profil')}>
              Compléter mon profil
            </Button>
          </Card>
        ) : (
          <div className="space-y-6">
            {recommendations.map(aap => {
              const daysLeft = getDaysUntilDeadline(aap.deadline);
              const isUrgent = daysLeft <= 7;

              return (
                <Card
                  key={aap.id}
                  className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(`/aap/${aap.id}`)}
                >
                  {/* Header with match score */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {aap.title}
                        </h3>
                        <Badge variant={getScoreBadgeVariant(aap.matchScore)}>
                          <TrendingUp className="h-3 w-3 mr-1" />
                          {aap.matchScore}% compatible
                        </Badge>
                      </div>

                      {aap.financeurName && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                          <Building className="h-4 w-4" />
                          <span>{aap.financeurName}</span>
                        </div>
                      )}
                    </div>

                    <Button variant="ghost" size="sm">
                      <Heart className="h-5 w-5" />
                    </Button>
                  </div>

                  {/* Match reasons */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                    <div className="flex items-start gap-2">
                      <Target className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-green-900 mb-1">
                          Pourquoi cette recommandation ?
                        </p>
                        <ul className="text-sm text-green-800 space-y-1">
                          {aap.matchReasons.map((reason, index) => (
                            <li key={index}>• {reason}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {aap.description}
                  </p>

                  {/* Tags */}
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

                  {/* Key info */}
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className={`h-4 w-4 ${isUrgent ? 'text-warning-500' : 'text-gray-400'}`} />
                      <span className={isUrgent ? 'text-warning-600 font-medium' : 'text-gray-600'}>
                        {daysLeft} jour{daysLeft > 1 ? 's' : ''}
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

                  {/* CTA */}
                  <div className="mt-4">
                    <Button
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/aap/${aap.id}/candidater`);
                      }}
                    >
                      Candidater maintenant
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
