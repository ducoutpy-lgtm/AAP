import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/guards/ProtectedRoute';
import { RoleGuard } from './components/guards/RoleGuard';

// Pages publiques
import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/auth/LoginPage';

// Consultation publique des AAP
import SearchAapPage from './pages/porteur/SearchAapPage';
import AapDetailPage from './pages/porteur/AapDetailPage';

// Administration
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsersPage from './pages/admin/ManageUsersPage';
import ManageAAPsPage from './pages/admin/ManageAAPsPage';

// Périmètre du MVP (rapport de critique validé le 2026-10-14, lot 0, instruction 2) : la consultation publique
// fiable des appels, sans compte. Les routes des modules gelés (porteur, financeur, candidatures, messagerie,
// notifications, calendrier, statistiques, recommandations, abonnement et paiement) et l'inscription (/signup)
// sont retirées du routage jusqu'au lot 4 ; le code de ces pages reste dans le dépôt, sans modification.

// Gabarit pour les pages non encore écrites (pages légales) et la page 404
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

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Routes publiques */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Consultation publique : les AAP publiés sont lisibles sans compte
              (changement OpenSpec consultation-aap-sans-compte). */}
          <Route path="/aap/search" element={<SearchAapPage />} />
          <Route path="/aap/:aapId" element={<AapDetailPage />} />

          {/* Administration */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={['admin']}>
                  <AdminDashboard />
                </RoleGuard>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/utilisateurs"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={['admin']}>
                  <ManageUsersPage />
                </RoleGuard>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/aaps"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={['admin']}>
                  <ManageAAPsPage />
                </RoleGuard>
              </ProtectedRoute>
            }
          />

          {/* Pages légales : gabarits, contenu à fournir avant toute réouverture de l'inscription */}
          <Route path="/cgu" element={<PlaceholderPage title="Conditions Générales d'Utilisation" />} />
          <Route path="/confidentialite" element={<PlaceholderPage title="Politique de Confidentialité" />} />
          <Route path="/mentions-legales" element={<PlaceholderPage title="Mentions Légales" />} />

          {/* 404 : toute adresse hors du périmètre, dont /signup et les routes des modules gelés */}
          <Route path="*" element={<PlaceholderPage title="Page non trouvée" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
