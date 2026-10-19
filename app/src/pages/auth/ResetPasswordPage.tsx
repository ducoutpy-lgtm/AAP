import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Target } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

// Page « Mot de passe oublié » (changement acces-administration, 2026-10-15). Pourquoi : le lien existait sur la page de
// connexion mais menait à la page 404, et c'est le seul moyen pour un compte créé sans mot de passe (compte
// administrateur créé par scripts/creer_admin.py) de choisir le sien. L'e-mail et la page de saisie du nouveau mot de
// passe sont ceux de Firebase ; l'application ne voit jamais le mot de passe.
export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [envoye, setEnvoye] = useState(false);
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await resetPassword(email);
      setEnvoye(true);
    } catch {
      // Message unique : ne pas révéler si l'adresse a un compte ou non
      setError("L'envoi a échoué. Vérifiez l'adresse saisie et réessayez.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <Target className="h-10 w-10 text-primary-600" />
            <span className="text-3xl font-bold text-gray-900">AAP Santé</span>
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Mot de passe oublié</h2>
          <p className="text-gray-600 text-sm mb-6 text-center">
            Indiquez l'adresse e-mail de votre compte. Vous recevrez un lien pour choisir un nouveau mot de passe.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-error-50 border border-error-200 rounded-lg text-error-600 text-sm">
              {error}
            </div>
          )}

          {envoye ? (
            <div className="space-y-4">
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                Si un compte existe pour cette adresse, un e-mail vient d'être envoyé. Ouvrez-le, choisissez votre
                nouveau mot de passe, puis revenez vous connecter.
              </div>
              <Link to="/login" className="block text-center text-primary-600 hover:text-primary-700 text-sm">
                Retour à la connexion
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="email"
                label="Email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Button type="submit" fullWidth loading={loading}>
                Envoyer le lien
              </Button>
              <Link to="/login" className="block text-center text-primary-600 hover:text-primary-700 text-sm">
                Retour à la connexion
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
