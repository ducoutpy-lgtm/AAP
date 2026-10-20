import type { ReactNode } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import type { UserType } from './types';
import { ProtectedRoute } from './components/guards/ProtectedRoute';
import { RoleGuard } from './components/guards/RoleGuard';
import { SubscriptionGuard } from './components/guards/SubscriptionGuard';

// Pages publiques
import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

// Profil et abonnement
import CompleteProfile from './pages/profile/CompleteProfile';
import SelectPlanPage from './pages/subscription/SelectPlanPage';
import SubscriptionSuccess from './pages/subscription/SubscriptionSuccess';
import SubscriptionCancelled from './pages/subscription/SubscriptionCancelled';

// Porteur (la recherche et la fiche sont la consultation publique, sans compte)
import PorteurDashboard from './pages/porteur/PorteurDashboard';
import SearchAapPage from './pages/porteur/SearchAapPage';
import AapDetailPage from './pages/porteur/AapDetailPage';
import ApplicationFormPage from './pages/porteur/ApplicationFormPage';
import MyApplicationsPage from './pages/porteur/MyApplicationsPage';
import SavedSearchesPage from './pages/porteur/SavedSearchesPage';
import RecommendationsPage from './pages/porteur/RecommendationsPage';

// Financeur
import FinanceurDashboard from './pages/financeur/FinanceurDashboard';
import CreateAapPage from './pages/financeur/CreateAapPage';
import EditAapPage from './pages/financeur/EditAapPage';
import ProfilPage from './pages/profile/ProfilPage';
import MyAapPage from './pages/financeur/MyAapPage';
import ViewApplicationsPage from './pages/financeur/ViewApplicationsPage';
import EvaluateApplicationPage from './pages/financeur/EvaluateApplicationPage';
import StatisticsPage from './pages/financeur/StatisticsPage';

// Communs aux comptes connectés
import NotificationsPage from './pages/common/NotificationsPage';
import MessagesPage from './pages/common/MessagesPage';
import CalendarPage from './pages/common/CalendarPage';

// Administration
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsersPage from './pages/admin/ManageUsersPage';
import ManageAAPsPage from './pages/admin/ManageAAPsPage';
import GlobalStatisticsPage from './pages/admin/GlobalStatisticsPage';

// Pages légales
import MentionsLegalesPage from './pages/legal/MentionsLegalesPage';
import CguPage from './pages/legal/CguPage';
import ConfidentialitePage from './pages/legal/ConfidentialitePage';

// Gabarit commun et pages publiques (changement navigation-et-pages-publiques, 2026-10-20)
import Gabarit from './components/layout/Gabarit';
import FonctionnalitesPage from './pages/public/FonctionnalitesPage';
import TarifsPage from './pages/public/TarifsPage';
import FaqPage from './pages/public/FaqPage';
import AProposPage from './pages/public/AProposPage';
import ContactPage from './pages/public/ContactPage';

// Dégel du 2026-10-19 (changement OpenSpec degel-application-complete, décision de Monsieur DUCOUT) : les routes
// retirées par le lot 0 du 2026-10-14 reviennent avec leurs gardes d'origine (connexion, abonnement, rôle). Les
// fonctions serveur (paiement, alertes, notifications automatiques) restent non déployées tant que le forfait Blaze
// n'est pas confirmé : les pages correspondantes fonctionnent avec les données déjà en base.

// Gabarit pour les pages non encore écrites et la page 404
function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{title}</h1>
        <p className="text-gray-600">Cette page est en cours de développement</p>
      </div>
    </div>
  );
}

// Route réservée à un rôle, avec abonnement actif ou période d'essai
function RoutePourRole({ roles, children }: { roles: UserType[]; children: ReactNode }) {
  return (
    <ProtectedRoute>
      <SubscriptionGuard>
        <RoleGuard allowedRoles={roles}>{children}</RoleGuard>
      </SubscriptionGuard>
    </ProtectedRoute>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Toutes les pages sous le gabarit commun : en-tête ou barre latérale, retour, pied de page, remontée en haut */}
          <Route element={<Gabarit />}>
          {/* Routes publiques */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/fonctionnalites" element={<FonctionnalitesPage />} />
          <Route path="/tarifs" element={<TarifsPage />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/a-propos" element={<AProposPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          {/* Mot de passe oublié (changement acces-administration) : e-mail et saisie du nouveau mot de passe gérés par Firebase */}
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Profil à compléter après l'inscription */}
          <Route path="/complete-profile" element={<ProtectedRoute><CompleteProfile /></ProtectedRoute>} />

          {/* Abonnement : écrans présents, paiement Stripe non branché (fonctions serveur non déployées) */}
          <Route path="/abonnement/choisir" element={<ProtectedRoute><SelectPlanPage /></ProtectedRoute>} />
          <Route path="/abonnement/succes" element={<ProtectedRoute><SubscriptionSuccess /></ProtectedRoute>} />
          <Route path="/abonnement/annule" element={<ProtectedRoute><SubscriptionCancelled /></ProtectedRoute>} />

          {/* Consultation publique : les AAP publiés sont lisibles sans compte (changement consultation-aap-sans-compte) */}
          <Route path="/aap/search" element={<SearchAapPage />} />
          <Route path="/aap/:aapId" element={<AapDetailPage />} />

          {/* Porteur */}
          <Route path="/dashboard/porteur" element={<RoutePourRole roles={['porteur']}><PorteurDashboard /></RoutePourRole>} />
          <Route path="/aap/:aapId/candidater" element={<RoutePourRole roles={['porteur']}><ApplicationFormPage /></RoutePourRole>} />
          <Route path="/mes-candidatures" element={<RoutePourRole roles={['porteur']}><MyApplicationsPage /></RoutePourRole>} />
          <Route path="/recherches-sauvegardees" element={<RoutePourRole roles={['porteur']}><SavedSearchesPage /></RoutePourRole>} />
          <Route path="/recommandations" element={<RoutePourRole roles={['porteur']}><RecommendationsPage /></RoutePourRole>} />

          {/* Financeur */}
          <Route path="/dashboard/financeur" element={<RoutePourRole roles={['financeur']}><FinanceurDashboard /></RoutePourRole>} />
          <Route path="/mes-aap" element={<RoutePourRole roles={['financeur']}><MyAapPage /></RoutePourRole>} />
          <Route path="/aap/nouveau" element={<RoutePourRole roles={['financeur']}><CreateAapPage /></RoutePourRole>} />
          <Route path="/aap/:aapId/edit" element={<RoutePourRole roles={['financeur']}><EditAapPage /></RoutePourRole>} />
          <Route path="/aap/:aapId/candidatures" element={<RoutePourRole roles={['financeur']}><ViewApplicationsPage /></RoutePourRole>} />
          <Route path="/aap/:aapId/candidature/:applicationId/evaluer" element={<RoutePourRole roles={['financeur']}><EvaluateApplicationPage /></RoutePourRole>} />
          <Route path="/statistiques" element={<RoutePourRole roles={['financeur']}><StatisticsPage /></RoutePourRole>} />

          {/* Communs aux comptes connectés */}
          <Route path="/profil" element={<ProtectedRoute><ProfilPage /></ProtectedRoute>} />
          <Route path="/calendrier" element={<ProtectedRoute><SubscriptionGuard><CalendarPage /></SubscriptionGuard></ProtectedRoute>} />
          <Route path="/messages" element={<ProtectedRoute><SubscriptionGuard><MessagesPage /></SubscriptionGuard></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />

          {/* Administration (sans garde d'abonnement) */}
          <Route path="/admin" element={<ProtectedRoute><RoleGuard allowedRoles={['admin']}><AdminDashboard /></RoleGuard></ProtectedRoute>} />
          <Route path="/admin/utilisateurs" element={<ProtectedRoute><RoleGuard allowedRoles={['admin']}><ManageUsersPage /></RoleGuard></ProtectedRoute>} />
          <Route path="/admin/aaps" element={<ProtectedRoute><RoleGuard allowedRoles={['admin']}><ManageAAPsPage /></RoleGuard></ProtectedRoute>} />
          <Route path="/admin/statistiques" element={<ProtectedRoute><RoleGuard allowedRoles={['admin']}><GlobalStatisticsPage /></RoleGuard></ProtectedRoute>} />
          <Route path="/admin/paiements" element={<ProtectedRoute><RoleGuard allowedRoles={['admin']}><PlaceholderPage title="Gestion des Paiements" /></RoleGuard></ProtectedRoute>} />
          <Route path="/admin/parametres" element={<ProtectedRoute><RoleGuard allowedRoles={['admin']}><PlaceholderPage title="Paramètres Plateforme" /></RoleGuard></ProtectedRoute>} />

          {/* Pages légales (rédigées le 2026-10-19, changement degel-application-complete) */}
          <Route path="/cgu" element={<CguPage />} />
          <Route path="/confidentialite" element={<ConfidentialitePage />} />
          <Route path="/mentions-legales" element={<MentionsLegalesPage />} />

          {/* 404 */}
          <Route path="*" element={<PlaceholderPage title="Page non trouvée" />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
