import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { AAP } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  ArrowLeft,
  Search,
  Filter,
  Eye,
  Archive,
  Trash2,
  CheckCircle,
  XCircle,
  Calendar,
  Euro,
} from 'lucide-react';

interface AAPWithId extends AAP {
  id: string;
}

export default function ManageAAPsPage() {
  const navigate = useNavigate();
  const [aaps, setAaps] = useState<AAPWithId[]>([]);
  const [filteredAaps, setFilteredAaps] = useState<AAPWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published' | 'closed' | 'archived'>('all');

  useEffect(() => {
    loadAaps();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, statusFilter, aaps]);

  const loadAaps = async () => {
    try {
      const aapsSnapshot = await getDocs(collection(db, 'aap'));
      const aapsData = aapsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as AAPWithId[];

      setAaps(aapsData);
      setFilteredAaps(aapsData);
    } catch (err) {
      console.error('Error loading AAPs:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...aaps];

    // Search filter
    if (searchTerm) {
      result = result.filter(aap =>
        aap.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        aap.financeurName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(aap => aap.status === statusFilter);
    }

    setFilteredAaps(result);
  };

  const handleArchiveAap = async (aapId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir archiver cet AAP ?')) return;

    try {
      await updateDoc(doc(db, 'aap', aapId), {
        status: 'archived',
      });
      alert('AAP archivé avec succès');
      loadAaps();
    } catch (err) {
      console.error('Error archiving AAP:', err);
      alert('Erreur lors de l\'archivage');
    }
  };

  const handleDeleteAap = async (aapId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer définitivement cet AAP ? Cette action est irréversible.')) return;

    try {
      await deleteDoc(doc(db, 'aap', aapId));
      alert('AAP supprimé avec succès');
      loadAaps();
    } catch (err) {
      console.error('Error deleting AAP:', err);
      alert('Erreur lors de la suppression');
    }
  };

  const handlePublishAap = async (aapId: string) => {
    try {
      await updateDoc(doc(db, 'aap', aapId), {
        status: 'published',
        publishedAt: new Date(),
      });
      alert('AAP publié avec succès');
      loadAaps();
    } catch (err) {
      console.error('Error publishing AAP:', err);
      alert('Erreur lors de la publication');
    }
  };

  const handleCloseAap = async (aapId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir clôturer cet AAP ?')) return;

    try {
      await updateDoc(doc(db, 'aap', aapId), {
        status: 'closed',
      });
      alert('AAP clôturé avec succès');
      loadAaps();
    } catch (err) {
      console.error('Error closing AAP:', err);
      alert('Erreur lors de la clôture');
    }
  };

  const getStatusBadge = (status: AAP['status']) => {
    const variants: Record<AAP['status'], 'success' | 'warning' | 'error' | 'gray'> = {
      draft: 'gray',
      published: 'success',
      closed: 'warning',
      archived: 'gray',
    };

    const labels: Record<AAP['status'], string> = {
      draft: 'Brouillon',
      published: 'Publié',
      closed: 'Clôturé',
      archived: 'Archivé',
    };

    return <Badge variant={variants[status]}>{labels[status]}</Badge>;
  };

  const formatDate = (date: any): string => {
    if (!date) return '-';
    const dateObj = date.toDate ? date.toDate() : new Date(date);
    return dateObj.toLocaleDateString('fr-FR');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des AAP...</p>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Modération des AAP
          </h1>
          <p className="text-gray-600">
            {filteredAaps.length} AAP(s) • {aaps.length} au total
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <p className="text-sm text-gray-600 mb-1">Total</p>
            <p className="text-2xl font-bold text-gray-900">{aaps.length}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600 mb-1">Brouillons</p>
            <p className="text-2xl font-bold text-gray-600">
              {aaps.filter(a => a.status === 'draft').length}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600 mb-1">Publiés</p>
            <p className="text-2xl font-bold text-green-600">
              {aaps.filter(a => a.status === 'published').length}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600 mb-1">Clôturés</p>
            <p className="text-2xl font-bold text-yellow-600">
              {aaps.filter(a => a.status === 'closed').length}
            </p>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher par titre ou financeur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">Tous les statuts</option>
                <option value="draft">Brouillons</option>
                <option value="published">Publiés</option>
                <option value="closed">Clôturés</option>
                <option value="archived">Archivés</option>
              </select>
            </div>
          </div>
        </Card>

        {/* AAPs List */}
        {filteredAaps.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-gray-500">Aucun AAP trouvé</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredAaps.map(aap => (
              <Card key={aap.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {aap.title}
                      </h3>
                      {getStatusBadge(aap.status)}
                    </div>
                    {aap.financeurName && (
                      <p className="text-sm text-gray-600 mb-2">
                        Financeur: {aap.financeurName}
                      </p>
                    )}
                    <p className="text-gray-600 line-clamp-2">
                      {aap.description}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Date limite</p>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <p className="font-medium text-gray-900">
                        {formatDate(aap.deadline)}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Budget</p>
                    <div className="flex items-center gap-1">
                      <Euro className="h-4 w-4 text-gray-400" />
                      <p className="font-medium text-gray-900">
                        {aap.budgetMax
                          ? `Jusqu'à ${aap.budgetMax.toLocaleString('fr-FR')}€`
                          : '-'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Vues</p>
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4 text-gray-400" />
                      <p className="font-medium text-gray-900">{aap.views || 0}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Candidatures</p>
                    <p className="font-medium text-gray-900">
                      {aap.applicationsCount || 0}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate(`/aap/${aap.id}`)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Voir
                  </Button>

                  {aap.status === 'draft' && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handlePublishAap(aap.id)}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Publier
                    </Button>
                  )}

                  {aap.status === 'published' && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleCloseAap(aap.id)}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Clôturer
                    </Button>
                  )}

                  {aap.status !== 'archived' && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleArchiveAap(aap.id)}
                    >
                      <Archive className="h-4 w-4 mr-2" />
                      Archiver
                    </Button>
                  )}

                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeleteAap(aap.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Supprimer
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
