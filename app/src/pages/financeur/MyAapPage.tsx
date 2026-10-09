import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { aapService } from '../../services/aapService';
import { AAP } from '../../types';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Plus, Eye, Users, Calendar, Edit, Trash2 } from 'lucide-react';

export default function MyAapPage() {
  const { currentUser } = useAuth();
  const [aaps, setAaps] = useState<AAP[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'draft' | 'published' | 'closed'>('all');

  useEffect(() => {
    loadAaps();
  }, [currentUser]);

  const loadAaps = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      const data = await aapService.getFinanceurAaps(currentUser.uid);
      setAaps(data);
    } catch (error) {
      console.error('Error loading AAPs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (aapId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet AAP ?')) return;

    try {
      await aapService.deleteAap(aapId);
      setAaps(prev => prev.filter(aap => aap.id !== aapId));
    } catch (error) {
      console.error('Error deleting AAP:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const filteredAaps = aaps.filter(aap => {
    if (filter === 'all') return true;
    return aap.status === filter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="gray">Brouillon</Badge>;
      case 'published':
        return <Badge variant="success">Publié</Badge>;
      case 'closed':
        return <Badge variant="error">Fermé</Badge>;
      default:
        return <Badge variant="gray">{status}</Badge>;
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Mes appels à projets</h1>
            <Link to="/aap/nouveau">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Créer un AAP
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Tous ({aaps.length})
          </button>
          <button
            onClick={() => setFilter('draft')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'draft'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Brouillons ({aaps.filter(a => a.status === 'draft').length})
          </button>
          <button
            onClick={() => setFilter('published')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'published'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Publiés ({aaps.filter(a => a.status === 'published').length})
          </button>
          <button
            onClick={() => setFilter('closed')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'closed'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Fermés ({aaps.filter(a => a.status === 'closed').length})
          </button>
        </div>

        {/* AAP List */}
        {filteredAaps.length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-gray-500 mb-4">Aucun appel à projets</p>
            <Link to="/aap/nouveau">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Créer mon premier AAP
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid gap-6">
            {filteredAaps.map(aap => (
              <Card key={aap.id} className="!p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{aap.title}</h3>
                      {getStatusBadge(aap.status)}
                    </div>
                    <p className="text-gray-600 line-clamp-2">{aap.description}</p>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {aap.sectorsTargeted.slice(0, 3).map((sector, index) => (
                    <span key={index} className="badge-primary text-xs">
                      {sector}
                    </span>
                  ))}
                  {aap.sectorsTargeted.length > 3 && (
                    <span className="badge-gray text-xs">
                      +{aap.sectorsTargeted.length - 3}
                    </span>
                  )}
                </div>

                {/* Stats */}
                <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    <span>{aap.views || 0} vues</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>{aap.applicationsCount || 0} candidatures</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Deadline: {new Date(aap.deadline instanceof Date ? aap.deadline : aap.deadline.toDate()).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-4 border-t">
                  <Link to={`/aap/${aap.id}`}>
                    <Button variant="secondary" size="sm">
                      <Eye className="mr-2 h-4 w-4" />
                      Voir
                    </Button>
                  </Link>

                  {aap.status === 'draft' && (
                    <Link to={`/aap/${aap.id}/edit`}>
                      <Button variant="secondary" size="sm">
                        <Edit className="mr-2 h-4 w-4" />
                        Modifier
                      </Button>
                    </Link>
                  )}

                  {aap.status === 'published' && (
                    <Link to={`/mes-aap/${aap.id}/candidatures`}>
                      <Button size="sm">
                        <Users className="mr-2 h-4 w-4" />
                        Candidatures
                      </Button>
                    </Link>
                  )}

                  {aap.status === 'draft' && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(aap.id!)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Supprimer
                    </Button>
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
