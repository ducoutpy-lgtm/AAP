import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';

export default function Header() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <Search className="h-6 w-6 text-primary-600" />
          <span className="text-xl font-bold text-gray-900">AAP</span>
        </Link>

        <nav className="flex items-center gap-4">
          <Link
            to="/login"
            className="text-sm font-medium text-gray-700 hover:text-primary-600"
          >
            Connexion
          </Link>
          <Link
            to="/signup"
            className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
          >
            S'inscrire
          </Link>
        </nav>
      </div>
    </header>
  );
}
