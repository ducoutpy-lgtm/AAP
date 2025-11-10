import { useState, FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Target, Mail } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, loginWithGoogle, currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname;

  const getRedirectPath = async () => {
    if (from && from !== '/') {
      return from;
    }

    // Récupérer le profil utilisateur pour déterminer la redirection
    if (currentUser) {
      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const userType = userData.userType;

          // Rediriger vers le dashboard approprié
          if (userType === 'admin') {
            return '/admin';
          } else if (userType === 'porteur') {
            return '/dashboard/porteur';
          } else if (userType === 'financeur') {
            return '/dashboard/financeur';
          }
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
      }
    }

    // Par défaut, rediriger vers la page de complétion du profil
    return '/complete-profile';
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);

      // Attendre un peu pour que le profil soit chargé
      await new Promise(resolve => setTimeout(resolve, 1000));

      const redirectPath = await getRedirectPath();
      navigate(redirectPath, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Échec de la connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);

    try {
      await loginWithGoogle();

      // Attendre un peu pour que le profil soit chargé
      await new Promise(resolve => setTimeout(resolve, 1000));

      const redirectPath = await getRedirectPath();
      navigate(redirectPath, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Échec de la connexion avec Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <Target className="h-10 w-10 text-primary-600" />
            <span className="text-3xl font-bold text-gray-900">AAP Platform</span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Connexion
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-error-50 border border-error-200 rounded-lg text-error-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              label="Email"
              placeholder="votre@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              type="password"
              label="Mot de passe"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-gray-600">Se souvenir de moi</span>
              </label>

              <Link to="/reset-password" className="text-primary-600 hover:text-primary-700">
                Mot de passe oublié ?
              </Link>
            </div>

            <Button type="submit" fullWidth loading={loading}>
              Se connecter
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Ou continuer avec</span>
              </div>
            </div>

            <div className="mt-6">
              <Button
                type="button"
                variant="secondary"
                fullWidth
                onClick={handleGoogleLogin}
                disabled={loading}
              >
                <Mail className="mr-2 h-5 w-5" />
                Google
              </Button>
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-gray-600">
            Pas encore de compte ?{' '}
            <Link to="/signup" className="font-medium text-primary-600 hover:text-primary-700">
              S'inscrire
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
