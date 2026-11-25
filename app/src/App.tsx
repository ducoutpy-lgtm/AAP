import { lazy } from 'react';
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

// Pages des comptes connectés chargées à la demande (plan niveau A, lot 3.6, 2026-11-25) : un seul fichier de plus d'un
// mégaoctet partait à la première visite ; le gabarit affiche l'attente pendant le chargement d'une page.
// Profil et abonnement
const CompleteProfile = lazy(() => import('./pages/profile/CompleteProfile'));
const SelectPlanPage = lazy(() => import('./pages/subscription/SelectPlanPage'));
const SubscriptionSuccess = lazy(() => import('./pages/subscription/SubscriptionSuccess'));
const SubscriptionCancelled = lazy(() => import('./pages/subscription/SubscriptionCancelled'));

// Porteur (la recherche et la fiche sont la consultation publique, sans compte)
const PorteurDashboard = lazy(() => import('./pages/porteur/PorteurDashboard'));
const SearchAapPage = lazy(() => import('./pages/porteur/SearchAapPage'));
const AapDetailPage = lazy(() => import('./pages/porteur/AapDetailPage'));
const ApplicationFormPage = lazy(() => import('./pages/porteur/ApplicationFormPage'));
const MyApplicationsPage = lazy(() => import('./pages/porteur/MyApplicationsPage'));
const ApplicationDetailPage = lazy(() => import('./pages/porteur/ApplicationDetailPage'));
const SavedSearchesPage = lazy(() => import('./pages/porteur/SavedSearchesPage'));
const RecommendationsPage = lazy(() => import('./pages/porteur/RecommendationsPage'));

// Financeur
const FinanceurDashboard = lazy(() => import('./pages/financeur/FinanceurDashboard'));
const CandidaturesRecuesPage = lazy(() => import('./pages/financeur/CandidaturesRecuesPage'));
const RetourPage = lazy(() => import('./pages/common/RetourPage'));
const CreateAapPage = lazy(() => import('./pages/financeur/CreateAapPage'));
const EditAapPage = lazy(() => import('./pages/financeur/EditAapPage'));
const ProfilPage = lazy(() => import('./pages/profile/ProfilPage'));
const MyAapPage = lazy(() => import('./pages/financeur/MyAapPage'));
const ViewApplicationsPage = lazy(() => import('./pages/financeur/ViewApplicationsPage'));
const EvaluateApplicationPage = lazy(() => import('./pages/financeur/EvaluateApplicationPage'));
const StatisticsPage = lazy(() => import('./pages/financeur/StatisticsPage'));

// Communs aux comptes connectés
const NotificationsPage = lazy(() => import('./pages/common/NotificationsPage'));
const MessagesPage = lazy(() => import('./pages/common/MessagesPage'));
const CalendarPage = lazy(() => import('./pages/common/CalendarPage'));
import PageIntrouvable from './pages/common/PageIntrouvable';

// Administration
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const ManageUsersPage = lazy(() => import('./pages/admin/ManageUsersPage'));
const ManageAAPsPage = lazy(() => import('./pages/admin/ManageAAPsPage'));
const GlobalStatisticsPage = lazy(() => import('./pages/admin/GlobalStatisticsPage'));
const TesteursPage = lazy(() => import('./pages/admin/TesteursPage'));
const CoutsExternesPage = lazy(() => import('./pages/admin/CoutsExternesPage'));

// Pages légales
import MentionsLegalesPage from './pages/legal/MentionsLegalesPage';
import CguPage from './pages/legal/CguPage';
import ConfidentialitePage from './pages/legal/ConfidentialitePage';

// Gabarit commun et pages publiques (changement navigation-et-pages-publiques, 2026-10-20)
import Gabarit from './components/layout/Gabarit';
import FonctionnalitesPage from './pages/public/FonctionnalitesPage';
import TarifsPage from './pages/public/TarifsPage';
import FinanceursPage from './pages/public/FinanceursPage';
import FaqPage from './pages/public/FaqPage';
import AProposPage from './pages/public/AProposPage';
import ContactPage from './pages/public/ContactPage';

// Dégel du 2026-10-19 (changement OpenSpec degel-application-complete, décision de Monsieur DUCOUT) : les routes
// retirées par le lot 0 du 2026-10-14 reviennent avec leurs gardes d'origine (connexion, abonnement, rôle). Les
// fonctions serveur (paiement, alertes, notifications automatiques) restent non déployées tant que le forfait Blaze
// n'est pas confirmé : les pages correspondantes fonctionnent avec les données déjà en base.

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
          <Route path="/financeurs" element={<FinanceursPage />} />
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
          {/* Depuis le 2026-10-20 (décision de Monsieur DUCOUT) la recherche et les fiches demandent un compte connecté */}
          <Route path="/aap/search" element={<ProtectedRoute><SearchAapPage /></ProtectedRoute>} />
          <Route path="/aap/:aapId" element={<ProtectedRoute><AapDetailPage /></ProtectedRoute>} />

          {/* Porteur */}
          <Route path="/dashboard/porteur" element={<RoutePourRole roles={['porteur']}><PorteurDashboard /></RoutePourRole>} />
          <Route path="/aap/:aapId/candidater" element={<RoutePourRole roles={['porteur']}><ApplicationFormPage /></RoutePourRole>} />
          <Route path="/mes-candidatures" element={<RoutePourRole roles={['porteur']}><MyApplicationsPage /></RoutePourRole>} />
          <Route path="/candidature/:applicationId" element={<RoutePourRole roles={['porteur']}><ApplicationDetailPage /></RoutePourRole>} />
          <Route path="/recherches-sauvegardees" element={<RoutePourRole roles={['porteur']}><SavedSearchesPage /></RoutePourRole>} />
          <Route path="/recommandations" element={<RoutePourRole roles={['porteur']}><RecommendationsPage /></RoutePourRole>} />

          {/* Financeur */}
          <Route path="/dashboard/financeur" element={<RoutePourRole roles={['financeur']}><FinanceurDashboard /></RoutePourRole>} />
          <Route path="/candidatures-recues" element={<RoutePourRole roles={['financeur']}><CandidaturesRecuesPage /></RoutePourRole>} />
          <Route path="/mes-aap" element={<RoutePourRole roles={['financeur']}><MyAapPage /></RoutePourRole>} />
          <Route path="/aap/nouveau" element={<RoutePourRole roles={['financeur']}><CreateAapPage /></RoutePourRole>} />
          {/* Édition : le financeur auteur, et l'administrateur pour corriger toute fiche depuis /admin/aaps (la route ne
              l'admettait pas : renvoi vers /admin, corrections-relecture 1.4, 2026-11-20) */}
          <Route path="/aap/:aapId/edit" element={<RoutePourRole roles={['financeur', 'admin']}><EditAapPage /></RoutePourRole>} />
          <Route path="/aap/:aapId/candidatures" element={<RoutePourRole roles={['financeur']}><ViewApplicationsPage /></RoutePourRole>} />
          <Route path="/aap/:aapId/candidature/:applicationId/evaluer" element={<RoutePourRole roles={['financeur']}><EvaluateApplicationPage /></RoutePourRole>} />
          <Route path="/statistiques" element={<RoutePourRole roles={['financeur']}><StatisticsPage /></RoutePourRole>} />

          {/* Communs aux comptes connectés */}
          <Route path="/profil" element={<ProtectedRoute><ProfilPage /></ProtectedRoute>} />
          <Route path="/calendrier" element={<ProtectedRoute><SubscriptionGuard><CalendarPage /></SubscriptionGuard></ProtectedRoute>} />
          <Route path="/messages" element={<ProtectedRoute><SubscriptionGuard><MessagesPage /></SubscriptionGuard></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
          <Route path="/retour" element={<ProtectedRoute><RetourPage /></ProtectedRoute>} />

          {/* Administration (sans garde d'abonnement) */}
          <Route path="/admin" element={<ProtectedRoute><RoleGuard allowedRoles={['admin']}><AdminDashboard /></RoleGuard></ProtectedRoute>} />
          <Route path="/admin/utilisateurs" element={<ProtectedRoute><RoleGuard allowedRoles={['admin']}><ManageUsersPage /></RoleGuard></ProtectedRoute>} />
          <Route path="/admin/aaps" element={<ProtectedRoute><RoleGuard allowedRoles={['admin']}><ManageAAPsPage /></RoleGuard></ProtectedRoute>} />
          <Route path="/admin/statistiques" element={<ProtectedRoute><RoleGuard allowedRoles={['admin']}><GlobalStatisticsPage /></RoleGuard></ProtectedRoute>} />
          <Route path="/admin/testeurs" element={<ProtectedRoute><RoleGuard allowedRoles={['admin']}><TesteursPage /></RoleGuard></ProtectedRoute>} />
          <Route path="/admin/couts-ia" element={<ProtectedRoute><RoleGuard allowedRoles={['admin']}><CoutsExternesPage /></RoleGuard></ProtectedRoute>} />

          {/* Pages légales (rédigées le 2026-10-19, changement degel-application-complete) */}
          <Route path="/cgu" element={<CguPage />} />
          <Route path="/confidentialite" element={<ConfidentialitePage />} />
          <Route path="/mentions-legales" element={<MentionsLegalesPage />} />

          {/* 404 */}
          {/* Page 404 (plan niveau A, lot 3.7) ; les écrans vides des paiements et des paramètres sont retirés */}
          <Route path="*" element={<PageIntrouvable />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
