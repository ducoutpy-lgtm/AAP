import { useState, FormEvent, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Target, Mail } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { UserType } from '../../types';

export default function SignupPage() {
  const [searchParams] = useSearchParams();
  const [userType, setUserType] = useState<UserType>('porteur');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signup, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const type = searchParams.get('type');
    if (type === 'porteur' || type === 'financeur') {
      setUserType(type);
    }
  }, [searchParams]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);

    try {
      await signup(email, password, userType);
      // Redirection vers la page de complétion du profil
      navigate('/complete-profile');
    } catch (err: any) {
      setError(err.message || 'Échec de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setError('');
    setLoading(true);

    try {
      await loginWithGoogle();
      // La logique de sélection du type de compte sera gérée après
      navigate('/complete-profile');
    } catch (err: any) {
      setError(err.message || 'Échec de l\'inscription avec Google');
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
            Créer un compte
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-error-50 border border-error-200 rounded-lg text-error-600 text-sm">
              {error}
            </div>
          )}

          {/* User Type Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Je suis un(e)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setUserType('porteur')}
                className={`p-4 border-2 rounded-lg text-center transition-all ${
                  userType === 'porteur'
                    ? 'border-primary-600 bg-primary-50 text-primary-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-semibold">Porteur</div>
                <div className="text-xs text-gray-500 mt-1">de projet</div>
              </button>

              <button
                type="button"
                onClick={() => setUserType('financeur')}
                className={`p-4 border-2 rounded-lg text-center transition-all ${
                  userType === 'financeur'
                    ? 'border-primary-600 bg-primary-50 text-primary-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-semibold">Financeur</div>
                <div className="text-xs text-gray-500 mt-1">/ Organisme</div>
              </button>
            </div>
          </div>

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
              helperText="Minimum 6 caractères"
            />

            <Input
              type="password"
              label="Confirmer le mot de passe"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <div className="text-xs text-gray-500">
              En créant un compte, vous acceptez nos{' '}
              <Link to="/cgu" className="text-primary-600 hover:underline">
                conditions d'utilisation
              </Link>{' '}
              et notre{' '}
              <Link to="/confidentialite" className="text-primary-600 hover:underline">
                politique de confidentialité
              </Link>
              .
            </div>

            <Button type="submit" fullWidth loading={loading}>
              Créer mon compte
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
                onClick={handleGoogleSignup}
                disabled={loading}
              >
                <Mail className="mr-2 h-5 w-5" />
                Google
              </Button>
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-gray-600">
            Déjà un compte ?{' '}
            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-700">
              Se connecter
            </Link>
          </p>

          <div className="mt-6 p-4 bg-primary-50 rounded-lg">
            <p className="text-sm text-primary-900 font-medium">
              🎉 14 jours d'essai gratuit
            </p>
            <p className="text-xs text-primary-700 mt-1">
              Aucune carte bancaire requise. Annulez à tout moment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
