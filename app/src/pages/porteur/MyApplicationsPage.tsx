import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, orderBy, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { FileText, Calendar, TrendingUp, Eye } from 'lucide-react';

interface Application {
  id: string;
  aapId: string;
  aapTitle: string;
  projectTitle: string;
  status: 'submitted' | 'under_review' | 'shortlisted' | 'accepted' | 'rejected';
  submittedAt: Timestamp;
  prequalificationScore?: number;
  financeurFeedback?: string;
}

export default function MyApplicationsPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    if (currentUser) {
      loadApplications();
    }
  }, [currentUser]);

  useEffect(() => {
    applyFilters();
  }, [statusFilter, applications]);

  const loadApplications = async () => {
    if (!currentUser) return;

    try {
      const applicationsQuery = query(
        collection(db, 'applications'),
        where('porteurId', '==', currentUser.uid),
        orderBy('submittedAt', 'desc')
      );

      const snapshot = await getDocs(applicationsQuery);
      const applicationsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Application[];

      setApplications(applicationsData);
      setFilteredApplications(applicationsData);
    } catch (err) {
      console.error('Error loading applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    if (statusFilter === 'all') {
      setFilteredApplications(applications);
    } else {
      setFilteredApplications(
        applications.filter(app => app.status === statusFilter)
      );
    }
  };

  const getStatusLabel = (status: Application['status']): string => {
    const labels = {
      submitted: 'Soumise',
      under_review: 'En cours d\'examen',
      shortlisted: 'Pré-sélectionnée',
      accepted: 'Acceptée',
      rejected: 'Rejetée',
    };
    return labels[status];
  };

  const getStatusVariant = (
    status: Application['status']
  ): 'success' | 'warning' | 'error' | 'gray' => {
    const variants = {
      submitted: 'gray' as const,
      under_review: 'warning' as const,
      shortlisted: 'warning' as const,
      accepted: 'success' as const,
      rejected: 'error' as const,
    };
    return variants[status];
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
          <p className="text-gray-600">Chargement de vos candidatures...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Mes Candidatures
          </h1>
          <p className="text-gray-600">
            Suivez l'état de vos candidatures aux appels à projets
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  {applications.length}
                </p>
              </div>
              <FileText className="h-8 w-8 text-primary-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">En cours</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {
                    applications.filter(
                      app =>
                        app.status === 'submitted' || app.status === 'under_review'
                    ).length
                  }
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-yellow-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Acceptées</p>
                <p className="text-2xl font-bold text-green-600">
                  {applications.filter(app => app.status === 'accepted').length}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Score moyen</p>
                <p className="text-2xl font-bold text-primary-600">
                  {applications.length > 0
                    ? Math.round(
                        applications
                          .filter(app => app.prequalificationScore)
                          .reduce((sum, app) => sum + (app.prequalificationScore || 0), 0) /
                          applications.filter(app => app.prequalificationScore).length
                      ) || '-'
                    : '-'}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary-600" />
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-gray-700">Statut:</span>
            <Button
              variant={statusFilter === "all" ? "primary" : "secondary"}
              size="sm"
              onClick={() => setStatusFilter('all')}
            >
              Tous ({applications.length})
            </Button>
            <Button
              variant={statusFilter === 'submitted' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setStatusFilter('submitted')}
            >
              Soumises (
              {applications.filter(app => app.status === 'submitted').length})
            </Button>
            <Button
              variant={statusFilter === 'under_review' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setStatusFilter('under_review')}
            >
              En examen (
              {applications.filter(app => app.status === 'under_review').length})
            </Button>
            <Button
              variant={statusFilter === 'accepted' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setStatusFilter('accepted')}
            >
              Acceptées (
              {applications.filter(app => app.status === 'accepted').length})
            </Button>
            <Button
              variant={statusFilter === 'rejected' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setStatusFilter('rejected')}
            >
              Rejetées (
              {applications.filter(app => app.status === 'rejected').length})
            </Button>
          </div>
        </Card>

        {/* Applications list */}
        {filteredApplications.length === 0 ? (
          <Card className="p-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucune candidature
            </h3>
            <p className="text-gray-600 mb-4">
              {statusFilter === 'all'
                ? 'Vous n\'avez pas encore soumis de candidature.'
                : `Vous n'avez pas de candidature avec le statut "${getStatusLabel(statusFilter as any)}".`}
            </p>
            <Button onClick={() => navigate('/aap/search')}>
              Rechercher des AAP
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map(application => (
              <Card
                key={application.id}
                className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/candidature/${application.id}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {application.projectTitle}
                      </h3>
                      <Badge variant={getStatusVariant(application.status)}>
                        {getStatusLabel(application.status)}
                      </Badge>
                    </div>
                    <p className="text-gray-600">AAP: {application.aapTitle}</p>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Eye className="h-5 w-5" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>Soumise le {formatDate(application.submittedAt)}</span>
                  </div>

                  {application.prequalificationScore !== undefined && (
                    <div className="flex items-center gap-2 text-sm">
                      <TrendingUp className="h-4 w-4" />
                      <span className="text-gray-600">Score:</span>
                      <span
                        className={`font-semibold ${getScoreColor(
                          application.prequalificationScore
                        )}`}
                      >
                        {application.prequalificationScore}/100
                      </span>
                    </div>
                  )}

                  {application.status === 'rejected' &&
                    application.financeurFeedback && (
                      <div className="col-span-3 bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="text-sm text-red-800">
                          <strong>Feedback:</strong> {application.financeurFeedback}
                        </p>
                      </div>
                    )}

                  {application.status === 'accepted' && (
                    <div className="col-span-3 bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-sm text-green-800 font-medium">
                        🎉 Félicitations! Votre candidature a été acceptée.
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
