import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { BarChart3, TrendingUp, Users, FileText, Eye, Target, Award } from 'lucide-react';

interface Stats {
  totalAAP: number;
  publishedAAP: number;
  draftAAP: number;
  closedAAP: number;
  totalApplications: number;
  acceptedApplications: number;
  rejectedApplications: number;
  averageApplicationsPerAAP: number;
  totalViews: number;
  conversionRate: number;
  topSectors: { sector: string; count: number }[];
  applicationsOverTime: { month: string; count: number }[];
}

export default function StatisticsPage() {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      loadStatistics();
    }
  }, [currentUser]);

  const loadStatistics = async () => {
    if (!currentUser) return;

    try {
      // Load AAPs
      const aapsQuery = query(
        collection(db, 'aap'),
        where('financeurId', '==', currentUser.uid)
      );
      const aapsSnapshot = await getDocs(aapsQuery);
      const aaps = aapsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Load applications
      const applicationsQuery = query(
        collection(db, 'applications'),
        where('financeurId', '==', currentUser.uid)
      );
      const applicationsSnapshot = await getDocs(applicationsQuery);
      const applications = applicationsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Calculate stats
      const totalAAP = aaps.length;
      const publishedAAP = aaps.filter((a: any) => a.status === 'published').length;
      const draftAAP = aaps.filter((a: any) => a.status === 'draft').length;
      const closedAAP = aaps.filter((a: any) => a.status === 'closed').length;

      const totalApplications = applications.length;
      const acceptedApplications = applications.filter((a: any) => a.status === 'accepted').length;
      const rejectedApplications = applications.filter((a: any) => a.status === 'rejected').length;

      const totalViews = aaps.reduce((sum: number, aap: any) => sum + (aap.views || 0), 0);
      const conversionRate = totalViews > 0 ? (totalApplications / totalViews) * 100 : 0;

      // Top sectors
      const sectorCounts: { [key: string]: number } = {};
      aaps.forEach((aap: any) => {
        aap.sectorsTargeted?.forEach((sector: string) => {
          sectorCounts[sector] = (sectorCounts[sector] || 0) + 1;
        });
      });

      const topSectors = Object.entries(sectorCounts)
        .map(([sector, count]) => ({ sector, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Applications over time (last 6 months)
      const applicationsOverTime: { month: string; count: number }[] = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthName = date.toLocaleDateString('fr-FR', { month: 'short' });
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

        const count = applications.filter((app: any) => {
          const submittedAt = app.submittedAt?.toDate();
          return submittedAt >= monthStart && submittedAt <= monthEnd;
        }).length;

        applicationsOverTime.push({ month: monthName, count });
      }

      setStats({
        totalAAP,
        publishedAAP,
        draftAAP,
        closedAAP,
        totalApplications,
        acceptedApplications,
        rejectedApplications,
        averageApplicationsPerAAP: totalAAP > 0 ? totalApplications / totalAAP : 0,
        totalViews,
        conversionRate,
        topSectors,
        applicationsOverTime,
      });
    } catch (err) {
      console.error('Error loading statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des statistiques...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Aucune donnée disponible
          </h2>
          <p className="text-gray-600">
            Créez des AAP pour voir vos statistiques
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="h-8 w-8 text-primary-600" />
            <h1 className="text-3xl font-bold text-gray-900">Statistiques</h1>
          </div>
          <p className="text-gray-600">
            Vue d'ensemble de vos performances
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-primary-100 rounded-lg">
                <FileText className="h-6 w-6 text-primary-600" />
              </div>
              <Badge variant="primary">{stats.publishedAAP} publiés</Badge>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.totalAAP}</h3>
            <p className="text-sm text-gray-600">Total AAP</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <Badge variant="gray">{stats.acceptedApplications} acceptées</Badge>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.totalApplications}</h3>
            <p className="text-sm text-gray-600">Total candidatures</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Eye className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.totalViews}</h3>
            <p className="text-sm text-gray-600">Vues totales</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {stats.conversionRate.toFixed(1)}%
            </h3>
            <p className="text-sm text-gray-600">Taux de conversion</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Applications over time */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary-600" />
              Candidatures par mois
            </h3>
            <div className="space-y-3">
              {stats.applicationsOverTime.map(({ month, count }) => (
                <div key={month}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600">{month}</span>
                    <span className="font-semibold text-gray-900">{count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full"
                      style={{
                        width: `${Math.max((count / Math.max(...stats.applicationsOverTime.map(a => a.count))) * 100, 5)}%`,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Top sectors */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Award className="h-5 w-5 text-primary-600" />
              Top 5 secteurs
            </h3>
            <div className="space-y-3">
              {stats.topSectors.map(({ sector, count }) => (
                <div key={sector} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                    <span className="text-sm text-gray-700 capitalize">{sector}</span>
                  </div>
                  <Badge variant="gray">{count} AAP</Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Additional stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">
              Moyenne candidatures/AAP
            </h3>
            <p className="text-3xl font-bold text-gray-900">
              {stats.averageApplicationsPerAAP.toFixed(1)}
            </p>
          </Card>

          <Card className="p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">
              Taux d'acceptation
            </h3>
            <p className="text-3xl font-bold text-green-600">
              {stats.totalApplications > 0
                ? ((stats.acceptedApplications / stats.totalApplications) * 100).toFixed(1)
                : 0}
              %
            </p>
          </Card>

          <Card className="p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">
              Taux de rejet
            </h3>
            <p className="text-3xl font-bold text-red-600">
              {stats.totalApplications > 0
                ? ((stats.rejectedApplications / stats.totalApplications) * 100).toFixed(1)
                : 0}
              %
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
