import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, FileText, Bell, Calendar, TrendingUp } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export default function PorteurDashboard() {
  const { userProfile } = useAuth();
  const [stats] = useState({
    savedAap: 0,
    applications: 0,
    deadlinesSoon: 0,
    alerts: 0,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              Tableau de bord Porteur
            </h1>
            <div className="flex items-center gap-4">
              <button className="relative p-2 hover:bg-gray-100 rounded-full">
                <Bell className="h-6 w-6 text-gray-600" />
                <span className="absolute top-0 right-0 h-4 w-4 bg-error-500 rounded-full text-xs text-white flex items-center justify-center">
                  3
                </span>
              </button>
              <Link to="/profil">
                <div className="h-10 w-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {userProfile?.email?.[0].toUpperCase()}
                </div>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg p-6 mb-8 text-white">
          <h2 className="text-3xl font-bold mb-2">
            Bienvenue, {userProfile?.email?.split('@')[0]} !
          </h2>
          <p className="text-primary-100">
            Découvrez les derniers appels à projets qui correspondent à votre profil
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="!p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">AAP sauvegardés</p>
                <p className="text-2xl font-bold text-gray-900">{stats.savedAap}</p>
              </div>
              <FileText className="h-10 w-10 text-primary-600 opacity-20" />
            </div>
          </Card>

          <Card className="!p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Candidatures</p>
                <p className="text-2xl font-bold text-gray-900">{stats.applications}</p>
              </div>
              <TrendingUp className="h-10 w-10 text-success-600 opacity-20" />
            </div>
          </Card>

          <Card className="!p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Deadlines proches</p>
                <p className="text-2xl font-bold text-gray-900">{stats.deadlinesSoon}</p>
              </div>
              <Calendar className="h-10 w-10 text-warning-600 opacity-20" />
            </div>
          </Card>

          <Card className="!p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Alertes actives</p>
                <p className="text-2xl font-bold text-gray-900">{stats.alerts}</p>
              </div>
              <Bell className="h-10 w-10 text-secondary-600 opacity-20" />
            </div>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* AAP Recommandés */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                AAP Recommandés pour vous
              </h3>
              <Link to="/aap/search">
                <Button variant="ghost" size="sm">Voir tous</Button>
              </Link>
            </div>

            <div className="space-y-4">
              <p className="text-gray-500 text-center py-8">
                Complétez votre profil pour recevoir des recommandations personnalisées
              </p>
              <Link to="/profil">
                <Button fullWidth variant="secondary">
                  Compléter mon profil
                </Button>
              </Link>
            </div>
          </Card>

          {/* Mes candidatures récentes */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Mes candidatures récentes
              </h3>
              <Link to="/mes-candidatures">
                <Button variant="ghost" size="sm">Voir toutes</Button>
              </Link>
            </div>

            <div className="space-y-4">
              <p className="text-gray-500 text-center py-8">
                Vous n'avez pas encore de candidatures
              </p>
              <Link to="/aap/search">
                <Button fullWidth>
                  <Search className="mr-2 h-4 w-4" />
                  Rechercher des AAP
                </Button>
              </Link>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid md:grid-cols-3 gap-4">
          <Link to="/aap/search">
            <Card hover className="text-center">
              <Search className="h-12 w-12 text-primary-600 mx-auto mb-3" />
              <h4 className="font-semibold text-gray-900 mb-1">Rechercher des AAP</h4>
              <p className="text-sm text-gray-600">
                Trouvez les appels à projets qui vous correspondent
              </p>
            </Card>
          </Link>

          <Link to="/calendrier">
            <Card hover className="text-center">
              <Calendar className="h-12 w-12 text-secondary-600 mx-auto mb-3" />
              <h4 className="font-semibold text-gray-900 mb-1">Calendrier</h4>
              <p className="text-sm text-gray-600">
                Consultez les deadlines à venir
              </p>
            </Card>
          </Link>

          <Link to="/mes-candidatures">
            <Card hover className="text-center">
              <FileText className="h-12 w-12 text-success-600 mx-auto mb-3" />
              <h4 className="font-semibold text-gray-900 mb-1">Mes candidatures</h4>
              <p className="text-sm text-gray-600">
                Suivez l'état de vos candidatures
              </p>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
