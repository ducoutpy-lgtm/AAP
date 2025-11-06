import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, FileText, Users, TrendingUp, Eye } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export default function FinanceurDashboard() {
  const { userProfile } = useAuth();
  const [stats] = useState({
    activeAap: 0,
    applications: 0,
    responseRate: 0,
    totalViews: 0,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              Tableau de bord Financeur
            </h1>
            <div className="flex items-center gap-4">
              <Link to="/aap/nouveau">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Publier un AAP
                </Button>
              </Link>
              <Link to="/profil">
                <div className="h-10 w-10 bg-secondary-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {userProfile?.email?.[0].toUpperCase()}
                </div>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-secondary-600 to-primary-600 rounded-lg p-6 mb-8 text-white">
          <h2 className="text-3xl font-bold mb-2">
            Bienvenue, {userProfile?.email?.split('@')[0]} !
          </h2>
          <p className="text-secondary-100">
            Gérez vos appels à projets et candidatures en un seul endroit
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="!p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">AAP actifs</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeAap}</p>
              </div>
              <FileText className="h-10 w-10 text-secondary-600 opacity-20" />
            </div>
          </Card>

          <Card className="!p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Candidatures</p>
                <p className="text-2xl font-bold text-gray-900">{stats.applications}</p>
              </div>
              <Users className="h-10 w-10 text-primary-600 opacity-20" />
            </div>
          </Card>

          <Card className="!p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Taux de réponse</p>
                <p className="text-2xl font-bold text-gray-900">{stats.responseRate}%</p>
              </div>
              <TrendingUp className="h-10 w-10 text-success-600 opacity-20" />
            </div>
          </Card>

          <Card className="!p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Vues totales</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalViews}</p>
              </div>
              <Eye className="h-10 w-10 text-info-600 opacity-20" />
            </div>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Mes AAP actifs */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Mes AAP actifs
              </h3>
              <Link to="/mes-aap">
                <Button variant="ghost" size="sm">Voir tous</Button>
              </Link>
            </div>

            <div className="space-y-4">
              <p className="text-gray-500 text-center py-8">
                Vous n'avez pas encore d'AAP publié
              </p>
              <Link to="/aap/nouveau">
                <Button fullWidth>
                  <Plus className="mr-2 h-4 w-4" />
                  Publier mon premier AAP
                </Button>
              </Link>
            </div>
          </Card>

          {/* Candidatures récentes */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Candidatures récentes
              </h3>
              <Link to="/candidatures">
                <Button variant="ghost" size="sm">Voir toutes</Button>
              </Link>
            </div>

            <div className="space-y-4">
              <p className="text-gray-500 text-center py-8">
                Aucune candidature pour le moment
              </p>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid md:grid-cols-3 gap-4">
          <Link to="/aap/nouveau">
            <Card hover className="text-center">
              <Plus className="h-12 w-12 text-secondary-600 mx-auto mb-3" />
              <h4 className="font-semibold text-gray-900 mb-1">Publier un AAP</h4>
              <p className="text-sm text-gray-600">
                Créez un nouvel appel à projets
              </p>
            </Card>
          </Link>

          <Link to="/mes-aap">
            <Card hover className="text-center">
              <FileText className="h-12 w-12 text-primary-600 mx-auto mb-3" />
              <h4 className="font-semibold text-gray-900 mb-1">Gérer mes AAP</h4>
              <p className="text-sm text-gray-600">
                Consultez et modifiez vos AAP
              </p>
            </Card>
          </Link>

          <Link to="/statistiques">
            <Card hover className="text-center">
              <TrendingUp className="h-12 w-12 text-success-600 mx-auto mb-3" />
              <h4 className="font-semibold text-gray-900 mb-1">Statistiques</h4>
              <p className="text-sm text-gray-600">
                Analysez les performances de vos AAP
              </p>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
