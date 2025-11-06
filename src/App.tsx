import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/guards/ProtectedRoute';
import { RoleGuard } from './components/guards/RoleGuard';
import { SubscriptionGuard } from './components/guards/SubscriptionGuard';

// Public pages
import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';

// Porteur pages
import PorteurDashboard from './pages/porteur/PorteurDashboard';

// Financeur pages
import FinanceurDashboard from './pages/financeur/FinanceurDashboard';

// Placeholder component for pages not yet created
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
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Porteur Routes */}
          <Route
            path="/dashboard/porteur"
            element={
              <ProtectedRoute>
                <SubscriptionGuard>
                  <RoleGuard allowedRoles={['porteur']}>
                    <PorteurDashboard />
                  </RoleGuard>
                </SubscriptionGuard>
              </ProtectedRoute>
            }
          />

          <Route
            path="/aap/search"
            element={
              <ProtectedRoute>
                <SubscriptionGuard>
                  <RoleGuard allowedRoles={['porteur']}>
                    <PlaceholderPage title="Recherche d'AAP" />
                  </RoleGuard>
                </SubscriptionGuard>
              </ProtectedRoute>
            }
          />

          <Route
            path="/aap/:aapId"
            element={
              <ProtectedRoute>
                <SubscriptionGuard>
                  <PlaceholderPage title="Détail AAP" />
                </SubscriptionGuard>
              </ProtectedRoute>
            }
          />

          <Route
            path="/aap/:aapId/apply"
            element={
              <ProtectedRoute>
                <SubscriptionGuard>
                  <RoleGuard allowedRoles={['porteur']}>
                    <PlaceholderPage title="Candidature" />
                  </RoleGuard>
                </SubscriptionGuard>
              </ProtectedRoute>
            }
          />

          <Route
            path="/mes-candidatures"
            element={
              <ProtectedRoute>
                <SubscriptionGuard>
                  <RoleGuard allowedRoles={['porteur']}>
                    <PlaceholderPage title="Mes Candidatures" />
                  </RoleGuard>
                </SubscriptionGuard>
              </ProtectedRoute>
            }
          />

          {/* Financeur Routes */}
          <Route
            path="/dashboard/financeur"
            element={
              <ProtectedRoute>
                <SubscriptionGuard>
                  <RoleGuard allowedRoles={['financeur']}>
                    <FinanceurDashboard />
                  </RoleGuard>
                </SubscriptionGuard>
              </ProtectedRoute>
            }
          />

          <Route
            path="/mes-aap"
            element={
              <ProtectedRoute>
                <SubscriptionGuard>
                  <RoleGuard allowedRoles={['financeur']}>
                    <PlaceholderPage title="Mes AAP" />
                  </RoleGuard>
                </SubscriptionGuard>
              </ProtectedRoute>
            }
          />

          <Route
            path="/aap/nouveau"
            element={
              <ProtectedRoute>
                <SubscriptionGuard>
                  <RoleGuard allowedRoles={['financeur']}>
                    <PlaceholderPage title="Nouveau AAP" />
                  </RoleGuard>
                </SubscriptionGuard>
              </ProtectedRoute>
            }
          />

          {/* Common Authenticated Routes */}
          <Route
            path="/profil"
            element={
              <ProtectedRoute>
                <PlaceholderPage title="Profil" />
              </ProtectedRoute>
            }
          />

          <Route
            path="/complete-profile"
            element={
              <ProtectedRoute>
                <PlaceholderPage title="Compléter le profil" />
              </ProtectedRoute>
            }
          />

          <Route
            path="/calendrier"
            element={
              <ProtectedRoute>
                <SubscriptionGuard>
                  <PlaceholderPage title="Calendrier" />
                </SubscriptionGuard>
              </ProtectedRoute>
            }
          />

          <Route
            path="/messages"
            element={
              <ProtectedRoute>
                <SubscriptionGuard>
                  <PlaceholderPage title="Messages" />
                </SubscriptionGuard>
              </ProtectedRoute>
            }
          />

          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <PlaceholderPage title="Notifications" />
              </ProtectedRoute>
            }
          />

          {/* Subscription */}
          <Route
            path="/abonnement/choisir"
            element={
              <ProtectedRoute>
                <PlaceholderPage title="Choisir un abonnement" />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={['admin']}>
                  <PlaceholderPage title="Admin Dashboard" />
                </RoleGuard>
              </ProtectedRoute>
            }
          />

          {/* Legal Pages */}
          <Route path="/cgu" element={<PlaceholderPage title="Conditions Générales d'Utilisation" />} />
          <Route path="/confidentialite" element={<PlaceholderPage title="Politique de Confidentialité" />} />
          <Route path="/mentions-legales" element={<PlaceholderPage title="Mentions Légales" />} />

          {/* 404 */}
          <Route path="*" element={<PlaceholderPage title="Page non trouvée" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
