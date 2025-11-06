import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
  ArrowLeft,
  Users,
  FileText,
  Send,
  TrendingUp,
  DollarSign,
  BarChart3,
} from 'lucide-react';

interface GlobalStats {
  totalUsers: number;
  totalPorteurs: number;
  totalFinanceurs: number;
  newUsersThisMonth: number;
  totalAaps: number;
  publishedAaps: number;
  totalApplications: number;
  acceptedApplications: number;
  activeSubscriptions: number;
  trialSubscriptions: number;
  monthlyRevenue: number;
  annualRevenue: number;
  conversionRate: number;
}

interface MonthlyData {
  month: string;
  users: number;
  aaps: number;
  applications: number;
  revenue: number;
}

export default function GlobalStatisticsPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<GlobalStats | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      // Load users
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];

      const totalPorteurs = users.filter(u => u.userType === 'porteur').length;
      const totalFinanceurs = users.filter(u => u.userType === 'financeur').length;
      const activeSubscriptions = users.filter(u => u.subscriptionStatus === 'active').length;
      const trialSubscriptions = users.filter(u => u.subscriptionStatus === 'trial').length;

      // New users this month
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const newUsersThisMonth = users.filter(u => {
        const createdAt = u.createdAt?.toDate ? u.createdAt.toDate() : new Date(u.createdAt);
        return createdAt >= firstDayOfMonth;
      }).length;

      // Load AAPs
      const aapsSnapshot = await getDocs(collection(db, 'aap'));
      const aaps = aapsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
      const publishedAaps = aaps.filter(a => a.status === 'published').length;

      // Load applications
      const applicationsSnapshot = await getDocs(collection(db, 'applications'));
      const applications = applicationsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
      const acceptedApplications = applications.filter(a => a.status === 'accepted').length;

      // Load payments
      const paymentsSnapshot = await getDocs(
        query(collection(db, 'payments'), where('status', '==', 'succeeded'))
      );
      const payments = paymentsSnapshot.docs.map(doc => doc.data());

      const monthlyRevenue = payments
        .filter(p => {
          const date = p.paidAt?.toDate ? p.paidAt.toDate() : new Date(p.paidAt);
          return date >= firstDayOfMonth;
        })
        .reduce((sum, p) => sum + (p.amount || 0), 0) / 100;

      const annualRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0) / 100;

      // Calculate conversion rate (trial to active)
      const trialToActiveConversions = users.filter(
        u => u.subscriptionStatus === 'active' && u.subscriptionPlan
      ).length;
      const totalTrialsEver = users.filter(u => u.subscriptionStatus !== 'cancelled').length;
      const conversionRate = totalTrialsEver > 0 ? (trialToActiveConversions / totalTrialsEver) * 100 : 0;

      setStats({
        totalUsers: users.length,
        totalPorteurs,
        totalFinanceurs,
        newUsersThisMonth,
        totalAaps: aaps.length,
        publishedAaps,
        totalApplications: applications.length,
        acceptedApplications,
        activeSubscriptions,
        trialSubscriptions,
        monthlyRevenue,
        annualRevenue,
        conversionRate,
      });

      // Generate monthly data for last 6 months
      const monthlyStats: MonthlyData[] = [];
      for (let i = 5; i >= 0; i--) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const nextMonthDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

        const monthUsers = users.filter(u => {
          const date = u.createdAt?.toDate ? u.createdAt.toDate() : new Date(u.createdAt);
          return date >= monthDate && date < nextMonthDate;
        }).length;

        const monthAaps = aaps.filter(a => {
          const date = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
          return date >= monthDate && date < nextMonthDate;
        }).length;

        const monthApplications = applications.filter(a => {
          const date = a.submittedAt?.toDate ? a.submittedAt.toDate() : new Date(a.submittedAt);
          return date >= monthDate && date < nextMonthDate;
        }).length;

        const monthRevenue = payments
          .filter(p => {
            const date = p.paidAt?.toDate ? p.paidAt.toDate() : new Date(p.paidAt);
            return date >= monthDate && date < nextMonthDate;
          })
          .reduce((sum, p) => sum + (p.amount || 0), 0) / 100;

        monthlyStats.push({
          month: monthDate.toLocaleDateString('fr-FR', { month: 'short' }),
          users: monthUsers,
          aaps: monthAaps,
          applications: monthApplications,
          revenue: monthRevenue,
        });
      }

      setMonthlyData(monthlyStats);
    } catch (err) {
      console.error('Error loading statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des statistiques...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <Button
          variant="ghost"
          onClick={() => navigate('/admin')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour au tableau de bord
        </Button>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="h-8 w-8 text-primary-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              Statistiques Globales
            </h1>
          </div>
          <p className="text-gray-600">
            Vue d'ensemble de la plateforme
          </p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Utilisateurs totaux</p>
              <Users className="h-5 w-5 text-primary-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
            <p className="text-sm text-green-600 mt-1">
              +{stats.newUsersThisMonth} ce mois
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">AAP publiés</p>
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.publishedAaps}</p>
            <p className="text-sm text-gray-500 mt-1">
              sur {stats.totalAaps} total
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Candidatures</p>
              <Send className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.totalApplications}</p>
            <p className="text-sm text-gray-500 mt-1">
              {stats.acceptedApplications} acceptées
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Revenus (total)</p>
              <DollarSign className="h-5 w-5 text-yellow-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {stats.annualRevenue.toLocaleString('fr-FR')}€
            </p>
            <p className="text-sm text-green-600 mt-1">
              {stats.monthlyRevenue.toLocaleString('fr-FR')}€ ce mois
            </p>
          </Card>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <p className="text-sm text-gray-600 mb-2">Répartition utilisateurs</p>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-700">Porteurs de projet</span>
                <span className="font-semibold">{stats.totalPorteurs}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Financeurs</span>
                <span className="font-semibold">{stats.totalFinanceurs}</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <p className="text-sm text-gray-600 mb-2">Abonnements</p>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-700">Actifs</span>
                <span className="font-semibold text-green-600">{stats.activeSubscriptions}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">En essai</span>
                <span className="font-semibold text-yellow-600">{stats.trialSubscriptions}</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <p className="text-sm text-gray-600 mb-2">Taux de conversion</p>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-8 w-8 text-primary-600" />
              <p className="text-3xl font-bold text-gray-900">
                {stats.conversionRate.toFixed(1)}%
              </p>
            </div>
            <p className="text-xs text-gray-500 mt-1">Essai → Payant</p>
          </Card>
        </div>

        {/* Monthly Trends */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Évolution sur 6 mois
          </h2>

          {/* Users Chart */}
          <div className="mb-8">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Nouveaux utilisateurs</h3>
            <div className="flex items-end gap-2 h-32">
              {monthlyData.map((data, index) => {
                const maxUsers = Math.max(...monthlyData.map(d => d.users), 1);
                const height = (data.users / maxUsers) * 100;
                return (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-primary-500 rounded-t transition-all hover:bg-primary-600"
                      style={{ height: `${height}%` }}
                      title={`${data.users} utilisateurs`}
                    ></div>
                    <p className="text-xs text-gray-600 mt-2">{data.month}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AAPs Chart */}
          <div className="mb-8">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Nouveaux AAP</h3>
            <div className="flex items-end gap-2 h-32">
              {monthlyData.map((data, index) => {
                const maxAaps = Math.max(...monthlyData.map(d => d.aaps), 1);
                const height = (data.aaps / maxAaps) * 100;
                return (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-blue-500 rounded-t transition-all hover:bg-blue-600"
                      style={{ height: `${height}%` }}
                      title={`${data.aaps} AAP`}
                    ></div>
                    <p className="text-xs text-gray-600 mt-2">{data.month}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Applications Chart */}
          <div className="mb-8">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Candidatures</h3>
            <div className="flex items-end gap-2 h-32">
              {monthlyData.map((data, index) => {
                const maxApps = Math.max(...monthlyData.map(d => d.applications), 1);
                const height = (data.applications / maxApps) * 100;
                return (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-green-500 rounded-t transition-all hover:bg-green-600"
                      style={{ height: `${height}%` }}
                      title={`${data.applications} candidatures`}
                    ></div>
                    <p className="text-xs text-gray-600 mt-2">{data.month}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Revenue Chart */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Revenus (€)</h3>
            <div className="flex items-end gap-2 h-32">
              {monthlyData.map((data, index) => {
                const maxRevenue = Math.max(...monthlyData.map(d => d.revenue), 1);
                const height = (data.revenue / maxRevenue) * 100;
                return (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-yellow-500 rounded-t transition-all hover:bg-yellow-600"
                      style={{ height: `${height}%` }}
                      title={`${data.revenue.toLocaleString('fr-FR')}€`}
                    ></div>
                    <p className="text-xs text-gray-600 mt-2">{data.month}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
