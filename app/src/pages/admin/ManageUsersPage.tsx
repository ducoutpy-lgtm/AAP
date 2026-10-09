import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { User } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  ArrowLeft,
  Search,
  Filter,
  Download,
  UserCheck,
  UserX,
  Mail,
  Calendar,
} from 'lucide-react';

interface UserWithId extends User {
  uid: string;
}

export default function ManageUsersPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserWithId[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [userTypeFilter, setUserTypeFilter] = useState<'all' | 'porteur' | 'financeur'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'trial' | 'expired' | 'cancelled'>('all');

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, userTypeFilter, statusFilter, users]);

  const loadUsers = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersData = usersSnapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data(),
      })) as UserWithId[];

      setUsers(usersData);
      setFilteredUsers(usersData);
    } catch (err) {
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...users];

    // Search filter
    if (searchTerm) {
      result = result.filter(user =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // User type filter
    if (userTypeFilter !== 'all') {
      result = result.filter(user => user.userType === userTypeFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(user => user.subscriptionStatus === statusFilter);
    }

    setFilteredUsers(result);
  };

  const handleSuspendUser = async (userId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir suspendre cet utilisateur ?')) return;

    try {
      await updateDoc(doc(db, 'users', userId), {
        subscriptionStatus: 'cancelled',
      });
      alert('Utilisateur suspendu avec succès');
      loadUsers();
    } catch (err) {
      console.error('Error suspending user:', err);
      alert('Erreur lors de la suspension');
    }
  };

  const handleActivateUser = async (userId: string) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        subscriptionStatus: 'active',
      });
      alert('Utilisateur activé avec succès');
      loadUsers();
    } catch (err) {
      console.error('Error activating user:', err);
      alert('Erreur lors de l\'activation');
    }
  };

  const exportUsers = () => {
    const csvData = filteredUsers.map(user => ({
      'Email': user.email,
      'Type': user.userType,
      'Statut': user.subscriptionStatus,
      'Plan': user.subscriptionPlan || 'Aucun',
      'Date création': (user.createdAt as any)?.toDate ? (user.createdAt as any).toDate().toLocaleDateString('fr-FR') : new Date(user.createdAt as any).toLocaleDateString('fr-FR'),
    }));

    const csv = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'utilisateurs.csv';
    a.click();
  };

  const getStatusBadge = (status: User['subscriptionStatus']) => {
    const variants: Record<User['subscriptionStatus'], 'success' | 'warning' | 'error' | 'gray'> = {
      active: 'success',
      trial: 'warning',
      expired: 'error',
      cancelled: 'gray',
    };

    const labels: Record<User['subscriptionStatus'], string> = {
      active: 'Actif',
      trial: 'Essai',
      expired: 'Expiré',
      cancelled: 'Annulé',
    };

    return <Badge variant={variants[status]}>{labels[status]}</Badge>;
  };

  const getUserTypeLabel = (type: User['userType']) => {
    const labels: Record<User['userType'], string> = {
      porteur: 'Porteur de projet',
      financeur: 'Financeur',
      admin: 'Administrateur',
    };
    return labels[type];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des utilisateurs...</p>
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
            Gestion des utilisateurs
          </h1>
          <p className="text-gray-600">
            {filteredUsers.length} utilisateur(s) • {users.length} au total
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <p className="text-sm text-gray-600 mb-1">Total</p>
            <p className="text-2xl font-bold text-gray-900">{users.length}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600 mb-1">Porteurs</p>
            <p className="text-2xl font-bold text-blue-600">
              {users.filter(u => u.userType === 'porteur').length}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600 mb-1">Financeurs</p>
            <p className="text-2xl font-bold text-green-600">
              {users.filter(u => u.userType === 'financeur').length}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600 mb-1">Actifs</p>
            <p className="text-2xl font-bold text-primary-600">
              {users.filter(u => u.subscriptionStatus === 'active').length}
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
                  placeholder="Rechercher par email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* User Type Filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={userTypeFilter}
                onChange={(e) => setUserTypeFilter(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">Tous les types</option>
                <option value="porteur">Porteurs</option>
                <option value="financeur">Financeurs</option>
              </select>
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actifs</option>
              <option value="trial">Essai</option>
              <option value="expired">Expirés</option>
              <option value="cancelled">Annulés</option>
            </select>

            {/* Export */}
            <Button
              variant="secondary"
              size="sm"
              onClick={exportUsers}
              disabled={filteredUsers.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
          </div>
        </Card>

        {/* Users Table */}
        {filteredUsers.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-gray-500">Aucun utilisateur trouvé</p>
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Utilisateur
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Plan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Inscription
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map(user => (
                    <tr key={user.uid} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">{user.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600">
                          {getUserTypeLabel(user.userType)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(user.subscriptionStatus)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600">
                          {user.subscriptionPlan === 'monthly' && 'Mensuel'}
                          {user.subscriptionPlan === 'annual' && 'Annuel'}
                          {!user.subscriptionPlan && '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-4 w-4 mr-1" />
                          {(user.createdAt as any)?.toDate ? (user.createdAt as any).toDate().toLocaleDateString('fr-FR') : new Date(user.createdAt as any).toLocaleDateString('fr-FR')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          {user.subscriptionStatus !== 'cancelled' ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSuspendUser(user.uid)}
                            >
                              <UserX className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleActivateUser(user.uid)}
                            >
                              <UserCheck className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
