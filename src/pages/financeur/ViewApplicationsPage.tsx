import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, doc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { AAP } from '../../types';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { ArrowLeft, FileText, TrendingUp, Filter, Download } from 'lucide-react';

interface Application {
  id: string;
  porteurId: string;
  projectTitle: string;
  projectDescription: string;
  status: 'submitted' | 'under_review' | 'shortlisted' | 'accepted' | 'rejected';
  submittedAt: Timestamp;
  prequalificationScore?: number;
  completenessScore?: number;
  budget: {
    total: number;
  };
}

export default function ViewApplicationsPage() {
  const { aapId } = useParams<{ aapId: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [aap, setAap] = useState<AAP | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'score'>('date');

  useEffect(() => {
    if (aapId && currentUser) {
      loadData();
    }
  }, [aapId, currentUser]);

  useEffect(() => {
    applyFiltersAndSort();
  }, [statusFilter, sortBy, applications]);

  const loadData = async () => {
    if (!aapId) return;

    try {
      // Load AAP
      const aapDoc = await getDoc(doc(db, 'aap', aapId));
      if (aapDoc.exists()) {
        setAap({ ...aapDoc.data() } as AAP);
      }

      // Load applications
      const applicationsQuery = query(
        collection(db, 'applications'),
        where('aapId', '==', aapId)
      );

      const snapshot = await getDocs(applicationsQuery);
      const applicationsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Application[];

      setApplications(applicationsData);
      setFilteredApplications(applicationsData);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let result = [...applications];

    // Filter by status
    if (statusFilter !== 'all') {
      result = result.filter(app => app.status === statusFilter);
    }

    // Sort
    if (sortBy === 'date') {
      result.sort((a, b) => b.submittedAt.toDate().getTime() - a.submittedAt.toDate().getTime());
    } else if (sortBy === 'score') {
      result.sort((a, b) => (b.prequalificationScore || 0) - (a.prequalificationScore || 0));
    }

    setFilteredApplications(result);
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
      month: 'short',
      day: 'numeric',
    });
  };

  const exportApplications = () => {
    // Simple CSV export
    const csvData = filteredApplications.map(app => ({
      'Titre': app.projectTitle,
      'Statut': getStatusLabel(app.status),
      'Score': app.prequalificationScore || '-',
      'Budget': app.budget.total,
      'Date': formatDate(app.submittedAt),
    }));

    const csv = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `candidatures-${aap?.title || 'aap'}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des candidatures...</p>
        </div>
      </div>
    );
  }

  if (!aap) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">AAP non trouvé</h2>
          <Button onClick={() => navigate('/mes-aap')}>Retour à mes AAP</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/mes-aap')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour à mes AAP
        </Button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Candidatures: {aap.title}
          </h1>
          <p className="text-gray-600">
            {applications.length} candidature{applications.length > 1 ? 's' : ''} reçue
            {applications.length > 1 ? 's' : ''}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card className="p-4">
            <p className="text-sm text-gray-600 mb-1">Total</p>
            <p className="text-2xl font-bold text-gray-900">{applications.length}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600 mb-1">Nouvelles</p>
            <p className="text-2xl font-bold text-blue-600">
              {applications.filter(app => app.status === 'submitted').length}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600 mb-1">En examen</p>
            <p className="text-2xl font-bold text-yellow-600">
              {applications.filter(app => app.status === 'under_review').length}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600 mb-1">Acceptées</p>
            <p className="text-2xl font-bold text-green-600">
              {applications.filter(app => app.status === 'accepted').length}
            </p>
          </Card>
          <Card className="p-4">
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
          </Card>
        </div>

        {/* Filters & Sort */}
        <Card className="p-4 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <Filter className="h-5 w-5 text-gray-400" />
              <Button
                variant={statusFilter === "all" ? "primary" : "secondary"}
                size="sm"
                onClick={() => setStatusFilter('all')}
              >
                Tous
              </Button>
              <Button
                variant={statusFilter === 'submitted' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setStatusFilter('submitted')}
              >
                Nouvelles
              </Button>
              <Button
                variant={statusFilter === 'under_review' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setStatusFilter('under_review')}
              >
                En examen
              </Button>
              <Button
                variant={statusFilter === 'accepted' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setStatusFilter('accepted')}
              >
                Acceptées
              </Button>
              <Button
                variant={statusFilter === 'rejected' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setStatusFilter('rejected')}
              >
                Rejetées
              </Button>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">Trier par:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'score')}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="date">Date</option>
                <option value="score">Score</option>
              </select>

              <Button
                variant="secondary"
                size="sm"
                onClick={exportApplications}
                disabled={filteredApplications.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Exporter
              </Button>
            </div>
          </div>
        </Card>

        {/* Applications list */}
        {filteredApplications.length === 0 ? (
          <Card className="p-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucune candidature
            </h3>
            <p className="text-gray-600">
              {statusFilter === 'all'
                ? 'Aucune candidature n\'a encore été soumise pour cet AAP.'
                : `Aucune candidature avec le statut "${getStatusLabel(statusFilter as any)}".`}
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map(application => (
              <Card
                key={application.id}
                className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() =>
                  navigate(`/aap/${aapId}/candidature/${application.id}/evaluer`)
                }
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
                    <p className="text-gray-600 line-clamp-2">
                      {application.projectDescription}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-sm text-gray-600">Date de soumission</p>
                    <p className="font-medium text-gray-900">
                      {formatDate(application.submittedAt)}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Budget demandé</p>
                    <p className="font-medium text-gray-900">
                      {application.budget.total.toLocaleString('fr-FR')}€
                    </p>
                  </div>

                  {application.prequalificationScore !== undefined && (
                    <div>
                      <p className="text-sm text-gray-600">Score de préqualification</p>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        <p
                          className={`font-bold text-lg ${getScoreColor(
                            application.prequalificationScore
                          )}`}
                        >
                          {application.prequalificationScore}/100
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-end">
                    <Button size="sm">Évaluer</Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
