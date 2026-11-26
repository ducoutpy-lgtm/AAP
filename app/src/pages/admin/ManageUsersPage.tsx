import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, doc, writeBatch, Timestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { User } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ArrowLeft, Search, Filter, Download, UserCheck, UserX, Mail, Calendar } from 'lucide-react';
import { telechargerCsv, versCsv } from '../../utils/csv';
import { MessageErreur } from '../../components/ui/MessageErreur';
import { annoncer } from '../../utils/annonces';

interface UserWithId extends User {
  uid: string;
}

// Date de création d'un compte (Timestamp Firestore ou Date) au format français
const dateCreation = (valeur: Timestamp | Date): string =>
  (valeur instanceof Date ? valeur : valeur.toDate()).toLocaleDateString('fr-FR');

// Fiches du registre des suspensions (question 51, 2026-11-26) : par identifiant et par adresse en minuscules, chemins
// lus par la règle de création de users (firestore.rules, estSuspendu). L'adresse est le champ email du document, que la
// même règle impose égal à l'adresse de connexion du compte
const fichesDeSuspension = (user: UserWithId) =>
  [user.uid, ...(user.email ? [`email:${user.email.toLowerCase()}`] : [])].map((id) => doc(db, 'suspensions', id));

// Contenu d'une fiche de suspension, écrit par handleSuspendUser
interface FicheSuspension {
  uid: string;
  email: string;
  le: Timestamp | Date;
}

// Compte suspendu qui a supprimé lui-même son document users : absent de la liste des utilisateurs, il ne reste que ses
// fiches (identifiants des documents dans « fiches »)
interface CompteSansDocument extends FicheSuspension {
  fiches: string[];
}

export default function ManageUsersPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [users, setUsers] = useState<UserWithId[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserWithId[]>([]);
  const [sansDocument, setSansDocument] = useState<CompteSansDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [erreurChargement, setErreurChargement] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [userTypeFilter, setUserTypeFilter] = useState<'all' | 'porteur' | 'financeur'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'trial' | 'expired' | 'cancelled'>('all');

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    applyFilters();
    // Fonction redéfinie à chaque rendu : la lister relancerait l'effet en boucle (chargement ou filtrage voulu
    // seulement quand les valeurs listées changent).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, userTypeFilter, statusFilter, users]);

  const loadUsers = async () => {
    setErreurChargement(false);
    try {
      // Registre des suspensions lu avec les comptes : les fiches d'un compte sans document users sont listées à part
      const [usersSnapshot, suspensionsSnapshot] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'suspensions')),
      ]);
      const usersData = usersSnapshot.docs.map((doc) => ({
        uid: doc.id,
        ...doc.data(),
      })) as UserWithId[];

      // Fiches regroupées par compte (identifiant et adresse), seulement pour les comptes absents de users
      const connus = new Set(usersData.map((u) => u.uid));
      const orphelins = new Map<string, CompteSansDocument>();
      suspensionsSnapshot.docs.forEach((fiche) => {
        const { uid, email, le } = fiche.data() as FicheSuspension;
        if (connus.has(uid)) return;
        const compte = orphelins.get(uid) ?? { uid, email, le, fiches: [] };
        compte.fiches.push(fiche.id);
        orphelins.set(uid, compte);
      });

      setUsers(usersData);
      setFilteredUsers(usersData);
      setSansDocument([...orphelins.values()]);
    } catch (err) {
      console.error('Error loading users:', err);
      setErreurChargement(true);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...users];

    // Search filter
    if (searchTerm) {
      result = result.filter((user) => user.email.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    // User type filter
    if (userTypeFilter !== 'all') {
      result = result.filter((user) => user.userType === userTypeFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter((user) => user.subscriptionStatus === statusFilter);
    }

    setFilteredUsers(result);
  };

  // Écriture groupée (writeBatch) : statut et fiches de suspension passent ensemble ou pas du tout ; une suspension sans
  // fiche laisserait le compte supprimer son document puis le recréer en essai
  const handleSuspendUser = async (user: UserWithId) => {
    if (!confirm('Êtes-vous sûr de vouloir suspendre cet utilisateur ?')) return;

    try {
      const lot = writeBatch(db);
      lot.update(doc(db, 'users', user.uid), {
        subscriptionStatus: 'cancelled',
      });
      const fiche = {
        uid: user.uid,
        email: (user.email ?? '').toLowerCase(),
        le: Timestamp.now(),
        par: currentUser?.email ?? '',
      };
      fichesDeSuspension(user).forEach((ref) => lot.set(ref, fiche));
      await lot.commit();
      annoncer('Utilisateur suspendu avec succès');
      loadUsers();
    } catch (err) {
      console.error('Error suspending user:', err);
      annoncer('Erreur lors de la suspension', 'erreur');
    }
  };

  // Rétablissement : statut et effacement des fiches dans une même écriture groupée
  const handleActivateUser = async (user: UserWithId) => {
    try {
      const lot = writeBatch(db);
      lot.update(doc(db, 'users', user.uid), {
        subscriptionStatus: 'active',
      });
      fichesDeSuspension(user).forEach((ref) => lot.delete(ref));
      await lot.commit();
      annoncer('Utilisateur activé avec succès');
      loadUsers();
    } catch (err) {
      console.error('Error activating user:', err);
      annoncer("Erreur lors de l'activation", 'erreur');
    }
  };

  // Rétablissement d'un compte sans document users : seules ses fiches sont effacées (une mise à jour du document absent
  // ferait échouer toute l'écriture groupée) ; le compte pourra de nouveau créer son document, en essai
  const handleLeverSuspension = async (compte: CompteSansDocument) => {
    try {
      const lot = writeBatch(db);
      compte.fiches.forEach((id) => lot.delete(doc(db, 'suspensions', id)));
      await lot.commit();
      annoncer('Suspension levée avec succès');
      loadUsers();
    } catch (err) {
      console.error('Error lifting suspension:', err);
      annoncer('Erreur lors du rétablissement', 'erreur');
    }
  };

  // Export CSV échappé (utils/csv.ts, plan niveau A, lot 3.4)
  const exportUsers = () => {
    const csv = versCsv(
      ['Email', 'Type', 'Statut', 'Plan', 'Date création'],
      filteredUsers.map((user) => [
        user.email,
        user.userType,
        user.subscriptionStatus,
        user.subscriptionPlan || 'Aucun',
        dateCreation(user.createdAt),
      ]),
    );
    telechargerCsv(csv, 'utilisateurs.csv');
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
      porteur: 'Candidat (établissement)',
      financeur: 'Financeur',
      admin: 'Administrateur',
    };
    return labels[type];
  };

  // Lecture en échec : message et « Réessayer » au lieu d'une page vide (plan niveau A, lot 3.1)
  if (erreurChargement) return <MessageErreur onReessayer={loadUsers} />;
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
        <Button variant="ghost" onClick={() => navigate('/admin')} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour au tableau de bord
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestion des utilisateurs</h1>
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
            <p className="text-2xl font-bold text-blue-600">{users.filter((u) => u.userType === 'porteur').length}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600 mb-1">Financeurs</p>
            <p className="text-2xl font-bold text-green-600">
              {users.filter((u) => u.userType === 'financeur').length}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600 mb-1">Actifs</p>
            <p className="text-2xl font-bold text-primary-600">
              {users.filter((u) => u.subscriptionStatus === 'active').length}
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
                onChange={(e) => setUserTypeFilter(e.target.value as typeof userTypeFilter)}
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
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actifs</option>
              <option value="trial">Essai</option>
              <option value="expired">Expirés</option>
              <option value="cancelled">Annulés</option>
            </select>

            {/* Export */}
            <Button variant="secondary" size="sm" onClick={exportUsers} disabled={filteredUsers.length === 0}>
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
                  {filteredUsers.map((user) => (
                    <tr key={user.uid} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">{user.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600">{getUserTypeLabel(user.userType)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(user.subscriptionStatus)}</td>
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
                          {dateCreation(user.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          {user.subscriptionStatus !== 'cancelled' ? (
                            <Button variant="ghost" size="sm" onClick={() => handleSuspendUser(user)}>
                              <UserX className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button variant="ghost" size="sm" onClick={() => handleActivateUser(user)}>
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

        {/* Comptes suspendus sans document users (registre des suspensions, question 51) */}
        {sansDocument.length > 0 && (
          <section className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Comptes suspendus sans document</h2>
            <p className="text-sm text-gray-600 mb-4">
              Ces comptes ont été supprimés par leur titulaire après leur suspension. Leur adresse reste refusée à
              l'inscription tant que la suspension n'est pas levée.
            </p>
            <Card className="overflow-hidden">
              <ul className="divide-y divide-gray-200">
                {sansDocument.map((compte) => (
                  <li key={compte.uid} className="px-6 py-4 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center text-sm text-gray-900">
                      <Mail className="h-4 w-4 text-gray-400 mr-2" />
                      {compte.email || compte.uid}
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-1" />
                        Suspendu le {dateCreation(compte.le)}
                      </span>
                      <Button variant="secondary" size="sm" onClick={() => handleLeverSuspension(compte)}>
                        Rétablir
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          </section>
        )}
      </div>
    </div>
  );
}
