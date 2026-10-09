import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, getDocs, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  Users,
  FileText,
  Send,
  CreditCard,
  TrendingUp,
  AlertTriangle,
  Settings,
  BarChart3,
} from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  totalPorteurs: number;
  totalFinanceurs: number;
  totalAap: number;
  totalApplications: number;
  activeSubscriptions: number;
  trialUsers: number;
  revenue: number;
}

interface RecentActivity {
  id: string;
  type: 'user' | 'aap' | 'application' | 'payment';
  description: string;
  timestamp: Date;
  status?: string;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalPorteurs: 0,
    totalFinanceurs: 0,
    totalAap: 0,
    totalApplications: 0,
    activeSubscriptions: 0,
    trialUsers: 0,
    revenue: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load users
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const users = usersSnapshot.docs.map(doc => doc.data());

      const totalPorteurs = users.filter(u => u.userType === 'porteur').length;
      const totalFinanceurs = users.filter(u => u.userType === 'financeur').length;
      const activeSubscriptions = users.filter(u => u.subscriptionStatus === 'active').length;
      const trialUsers = users.filter(u => u.subscriptionStatus === 'trial').length;

      // Load AAPs
      const aapSnapshot = await getDocs(collection(db, 'aap'));

      // Load applications
      const applicationsSnapshot = await getDocs(collection(db, 'applications'));

      // Load payments for revenue calculation
      const paymentsSnapshot = await getDocs(
        query(
          collection(db, 'payments'),
          where('status', '==', 'succeeded')
        )
      );
      const revenue = paymentsSnapshot.docs.reduce((sum, doc) => {
        return sum + (doc.data().amount || 0);
      }, 0) / 100; // Convert from cents to euros

      setStats({
        totalUsers: usersSnapshot.size,
        totalPorteurs,
        totalFinanceurs,
        totalAap: aapSnapshot.size,
        totalApplications: applicationsSnapshot.size,
        activeSubscriptions,
        trialUsers,
        revenue,
      });

      // Load recent activity (last 10 activities)
      const activities: RecentActivity[] = [];

      // Recent users
      const recentUsersQuery = query(
        collection(db, 'users'),
        orderBy('createdAt', 'desc'),
        limit(3)
      );
      const recentUsersSnapshot = await getDocs(recentUsersQuery);
      recentUsersSnapshot.docs.forEach(doc => {
        const data = doc.data();
        activities.push({
          id: doc.id,
          type: 'user',
          description: `Nouvel utilisateur: ${data.email} (${data.userType})`,
          timestamp: data.createdAt?.toDate() || new Date(),
          status: data.subscriptionStatus,
        });
      });

      // Recent AAPs
      const recentAapQuery = query(
        collection(db, 'aap'),
        orderBy('createdAt', 'desc'),
        limit(3)
      );
      const recentAapSnapshot = await getDocs(recentAapQuery);
      recentAapSnapshot.docs.forEach(doc => {
        const data = doc.data();
        activities.push({
          id: doc.id,
          type: 'aap',
          description: `Nouvel AAP: ${data.title}`,
          timestamp: data.createdAt?.toDate() || new Date(),
          status: data.status,
        });
      });

      // Recent applications
      const recentAppsQuery = query(
        collection(db, 'applications'),
        orderBy('submittedAt', 'desc'),
        limit(3)
      );
      const recentAppsSnapshot = await getDocs(recentAppsQuery);
      recentAppsSnapshot.docs.forEach(doc => {
        const data = doc.data();
        activities.push({
          id: doc.id,
          type: 'application',
          description: `Nouvelle candidature: ${data.projectTitle}`,
          timestamp: data.submittedAt?.toDate() || new Date(),
          status: data.status,
        });
      });

      // Sort by timestamp
      activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      setRecentActivity(activities.slice(0, 10));
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'user':
        return <Users className="h-4 w-4" />;
      case 'aap':
        return <FileText className="h-4 w-4" />;
      case 'application':
        return <Send className="h-4 w-4" />;
      case 'payment':
        return <CreditCard className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status?: string) => {
    if (!status) return null;

    const variants: Record<string, 'success' | 'warning' | 'error' | 'gray'> = {
      active: 'success',
      trial: 'warning',
      published: 'success',
      draft: 'gray',
      submitted: 'warning',
      accepted: 'success',
      rejected: 'error',
    };

    return <Badge variant={variants[status] || 'gray'}>{status}</Badge>;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Tableau de bord Administrateur
              </h1>
              <p className="text-gray-600 mt-1">
                Gestion globale de la plateforme AAP
              </p>
            </div>
            <Button
              variant="secondary"
              onClick={() => navigate('/admin/statistiques')}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Statistiques détaillées
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Utilisateurs totaux</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.totalPorteurs} porteurs • {stats.totalFinanceurs} financeurs
                </p>
              </div>
              <div className="p-3 bg-primary-100 rounded-lg">
                <Users className="h-6 w-6 text-primary-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">AAP publiés</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalAap}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.totalApplications} candidatures reçues
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Abonnements actifs</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.activeSubscriptions}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.trialUsers} en période d'essai
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Revenus</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.revenue.toLocaleString('fr-FR')}€
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Revenus totaux
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <CreditCard className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Actions rapides
            </h2>
            <div className="space-y-3">
              <Button
                className="w-full justify-start"
                variant="secondary"
                onClick={() => navigate('/admin/utilisateurs')}
              >
                <Users className="h-4 w-4 mr-3" />
                Gérer les utilisateurs
              </Button>
              <Button
                className="w-full justify-start"
                variant="secondary"
                onClick={() => navigate('/admin/aaps')}
              >
                <FileText className="h-4 w-4 mr-3" />
                Modérer les AAP
              </Button>
              <Button
                className="w-full justify-start"
                variant="secondary"
                onClick={() => navigate('/admin/paiements')}
              >
                <CreditCard className="h-4 w-4 mr-3" />
                Gérer les paiements
              </Button>
              <Button
                className="w-full justify-start"
                variant="secondary"
                onClick={() => navigate('/admin/parametres')}
              >
                <Settings className="h-4 w-4 mr-3" />
                Paramètres plateforme
              </Button>
            </div>
          </Card>

          {/* Recent Activity */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Activité récente
            </h2>
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {recentActivity.length === 0 ? (
                <p className="text-gray-500 text-sm">Aucune activité récente</p>
              ) : (
                recentActivity.map(activity => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="p-2 bg-white rounded">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 truncate">
                        {activity.description}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-gray-500">
                          {activity.timestamp.toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                        {getStatusBadge(activity.status)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Alerts Section */}
        {stats.trialUsers > 0 && (
          <Card className="p-4 mt-6 bg-warning-50 border-warning-200">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-warning-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-warning-900">
                  {stats.trialUsers} utilisateur(s) en période d'essai
                </p>
                <p className="text-sm text-warning-800 mt-1">
                  Pensez à les contacter pour les convertir en abonnés payants.
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
