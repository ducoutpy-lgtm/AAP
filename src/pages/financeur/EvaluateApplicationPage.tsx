import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import {
  ArrowLeft,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  FileText,
} from 'lucide-react';

interface Application {
  id: string;
  aapId: string;
  aapTitle: string;
  porteurId: string;
  projectTitle: string;
  projectDescription: string;
  objectives: string;
  methodology: string;
  timeline: string;
  expectedImpact: string;
  budget: {
    total: number;
    breakdown: string;
  };
  teamMembers: string;
  partnersInvolved: string;
  riskManagement: string;
  sustainabilityPlan: string;
  documents: Array<{
    name: string;
    url: string;
    type: string;
  }>;
  status: 'submitted' | 'under_review' | 'shortlisted' | 'accepted' | 'rejected';
  submittedAt: Timestamp;
  prequalificationScore?: number;
  completenessScore?: number;
  conformityFlags?: string[];
  suggestions?: string[];
  financeurScore?: number;
  financeurFeedback?: string;
}

export default function EvaluateApplicationPage() {
  const { aapId, applicationId } = useParams<{ aapId: string; applicationId: string }>();
  const navigate = useNavigate();
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [financeurScore, setFinanceurScore] = useState<number>(0);
  const [financeurFeedback, setFinanceurFeedback] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (applicationId) {
      loadApplication();
    }
  }, [applicationId]);

  const loadApplication = async () => {
    if (!applicationId) return;

    try {
      const appDoc = await getDoc(doc(db, 'applications', applicationId));
      if (appDoc.exists()) {
        const appData = { id: appDoc.id, ...appDoc.data() } as Application;
        setApplication(appData);
        setFinanceurScore(appData.financeurScore || 0);
        setFinanceurFeedback(appData.financeurFeedback || '');
      }
    } catch (err) {
      console.error('Error loading application:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: Application['status']) => {
    if (!application || !applicationId) return;

    setSaving(true);
    setError('');

    try {
      await updateDoc(doc(db, 'applications', applicationId), {
        status: newStatus,
        financeurScore,
        financeurFeedback,
        evaluatedAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      alert('Statut mis à jour avec succès');
      navigate(`/aap/${aapId}/candidatures`);
    } catch (err: any) {
      console.error('Error updating status:', err);
      setError(err.message || 'Erreur lors de la mise à jour');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!applicationId) return;

    setSaving(true);
    setError('');

    try {
      await updateDoc(doc(db, 'applications', applicationId), {
        financeurScore,
        financeurFeedback,
        updatedAt: Timestamp.now(),
      });

      alert('Évaluation sauvegardée');
    } catch (err: any) {
      console.error('Error saving:', err);
      setError(err.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatDate = (timestamp: Timestamp): string => {
    return timestamp.toDate().toLocaleDateString('fr-FR', {
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
          <p className="text-gray-600">Chargement de la candidature...</p>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Candidature non trouvée
          </h2>
          <Button onClick={() => navigate(`/aap/${aapId}/candidatures`)}>
            Retour aux candidatures
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={() => navigate(`/aap/${aapId}/candidatures`)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour aux candidatures
        </Button>

        {/* Header */}
        <Card className="p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {application.projectTitle}
              </h1>
              <p className="text-gray-600">AAP: {application.aapTitle}</p>
            </div>
            <Badge variant="gray">
              Soumise le {formatDate(application.submittedAt)}
            </Badge>
          </div>

          {/* Scores */}
          {application.prequalificationScore !== undefined && (
            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Score préqualification</p>
                <p
                  className={`text-3xl font-bold ${getScoreColor(
                    application.prequalificationScore
                  )}`}
                >
                  {application.prequalificationScore}
                </p>
              </div>
              {application.completenessScore !== undefined && (
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Complétude</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {application.completenessScore}%
                  </p>
                </div>
              )}
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Budget demandé</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {application.budget.total.toLocaleString('fr-FR')}€
                </p>
              </div>
            </div>
          )}

          {/* Flags and suggestions */}
          {application.conformityFlags && application.conformityFlags.length > 0 && (
            <div className="mt-4 p-4 bg-warning-50 border border-warning-200 rounded-lg">
              <p className="text-sm font-medium text-warning-900 mb-2">
                ⚠️ Points d'attention:
              </p>
              <ul className="list-disc list-inside text-sm text-warning-800 space-y-1">
                {application.conformityFlags.map((flag, index) => (
                  <li key={index}>{flag}</li>
                ))}
              </ul>
            </div>
          )}
        </Card>

        {/* Project details */}
        <div className="space-y-6 mb-6">
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Description du projet</h2>
            <p className="text-gray-700 whitespace-pre-wrap">
              {application.projectDescription}
            </p>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Objectifs</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{application.objectives}</p>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Méthodologie</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{application.methodology}</p>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Calendrier</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{application.timeline}</p>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Budget</h2>
            <div className="mb-4">
              <p className="text-sm text-gray-600">Total:</p>
              <p className="text-2xl font-bold text-gray-900">
                {application.budget.total.toLocaleString('fr-FR')}€
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Répartition:</p>
              <p className="text-gray-700 whitespace-pre-wrap">
                {application.budget.breakdown}
              </p>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Équipe</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{application.teamMembers}</p>
          </Card>

          {application.partnersInvolved && (
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Partenaires</h2>
              <p className="text-gray-700 whitespace-pre-wrap">
                {application.partnersInvolved}
              </p>
            </Card>
          )}

          {application.expectedImpact && (
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Impact attendu</h2>
              <p className="text-gray-700 whitespace-pre-wrap">
                {application.expectedImpact}
              </p>
            </Card>
          )}

          {/* Documents */}
          {application.documents && application.documents.length > 0 && (
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Documents joints</h2>
              <div className="space-y-2">
                {application.documents.map((doc, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-gray-400" />
                      <span className="text-gray-700">{doc.name}</span>
                    </div>
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </a>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Evaluation form */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Votre évaluation
          </h2>

          {error && (
            <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Score d'évaluation (0-100)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={financeurScore}
                onChange={(e) => setFinanceurScore(parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Commentaires et feedback
              </label>
              <textarea
                value={financeurFeedback}
                onChange={(e) => setFinanceurFeedback(e.target.value)}
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Votre évaluation détaillée de la candidature..."
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={handleSaveDraft}
                disabled={saving}
                className="flex-1"
              >
                Sauvegarder le brouillon
              </Button>
            </div>
          </div>
        </Card>

        {/* Status change actions */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Décision
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <Button
              variant="secondary"
              onClick={() => handleStatusChange('under_review')}
              disabled={saving || application.status === 'under_review'}
              className="flex items-center justify-center gap-2"
            >
              <Clock className="h-4 w-4" />
              Mettre en examen
            </Button>
            <Button
              variant="secondary"
              onClick={() => handleStatusChange('shortlisted')}
              disabled={saving || application.status === 'shortlisted'}
              className="flex items-center justify-center gap-2"
            >
              <TrendingUp className="h-4 w-4" />
              Pré-sélectionner
            </Button>
            <Button
              variant="primary"
              onClick={() => handleStatusChange('accepted')}
              disabled={saving || application.status === 'accepted'}
              className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4" />
              Accepter
            </Button>
            <Button
              variant="danger"
              onClick={() => handleStatusChange('rejected')}
              disabled={saving || application.status === 'rejected'}
              className="flex items-center justify-center gap-2"
            >
              <XCircle className="h-4 w-4" />
              Rejeter
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
