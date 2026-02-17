import { Link } from 'react-router-dom';
import Button from '../../components/ui/Button';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900">404</h1>
        <p className="mt-4 text-lg text-gray-600">Page introuvable</p>
        <Link to="/" className="mt-6 inline-block">
          <Button>Retour à l'accueil</Button>
        </Link>
      </div>
    </div>
  );
}
