// Garde-fou d'affichage (2026-10-20, constat sur les émulateurs : une erreur dans une page laissait un écran blanc,
// sans menu ni message). Composant de classe : React ne propose pas encore de version à base de hook.
import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface Etat { erreur: Error | null }

export class LimiteErreur extends Component<{ children: ReactNode }, Etat> {
  state: Etat = { erreur: null };

  static getDerivedStateFromError(erreur: Error): Etat {
    return { erreur };
  }

  componentDidCatch(erreur: Error, info: ErrorInfo) {
    console.error('Erreur d\'affichage :', erreur, info.componentStack);
  }

  render() {
    if (!this.state.erreur) return this.props.children;
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-8">
        <div className="max-w-lg text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Cette page a rencontré une erreur</h1>
          <p className="text-gray-600 mb-2">Le reste de l'application fonctionne. Le détail technique a été noté pour correction.</p>
          <p className="text-xs text-gray-400 mb-6 break-words">{this.state.erreur.message}</p>
          <Link to="/" className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2 rounded-lg font-medium" onClick={() => this.setState({ erreur: null })}>
            Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }
}
