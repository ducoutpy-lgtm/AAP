import { Link } from 'react-router-dom';
import { Search, Target, TrendingUp, Shield, Zap, Users } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header / Navigation */}
      <header className="border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-8 w-8 text-primary-600" />
              <span className="text-2xl font-bold text-gray-900">AAP Platform</span>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-gray-700 hover:text-primary-600">
                Connexion
              </Link>
              <Link to="/signup">
                <Button>Commencer</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary-50 to-secondary-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Trouvez les meilleurs appels à projets en France
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Centralisez votre recherche d'appels à projets et simplifiez vos candidatures avec notre plateforme intelligente
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link to="/signup?type=porteur">
                <Button size="lg">
                  <Users className="mr-2 h-5 w-5" />
                  Je suis porteur de projet
                </Button>
              </Link>
              <Link to="/signup?type=financeur">
                <Button size="lg" variant="secondary">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  Je suis financeur
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Le problème
            </h2>
            <p className="text-lg text-gray-600">
              Les appels à projets sont dispersés sur des dizaines de sites web différents (ministères, agences, fondations, entreprises).
              Cette fragmentation rend la recherche complexe et chronophage pour les porteurs de projets, et complique la gestion pour les financeurs.
            </p>
          </div>
        </div>
      </section>

      {/* Features for Porteurs */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Pour les porteurs de projets
            </h2>
            <p className="text-lg text-gray-600">
              Gagnez du temps et maximisez vos chances de financement
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <Search className="h-12 w-12 text-primary-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Recherche centralisée</h3>
              <p className="text-gray-600">
                Trouvez tous les AAP pertinents en un seul endroit avec des filtres avancés
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <Zap className="h-12 w-12 text-primary-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Alertes personnalisées</h3>
              <p className="text-gray-600">
                Recevez des notifications dès qu'un AAP correspond à vos critères
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <Target className="h-12 w-12 text-primary-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Préqualification</h3>
              <p className="text-gray-600">
                Évaluez vos chances avec notre outil de scoring automatique
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features for Financeurs */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Pour les financeurs
            </h2>
            <p className="text-lg text-gray-600">
              Simplifiez la gestion de vos appels à projets et candidatures
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-gray-50 p-6 rounded-lg">
              <Shield className="h-12 w-12 text-secondary-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Publication simplifiée</h3>
              <p className="text-gray-600">
                Publiez et gérez vos AAP facilement avec notre interface intuitive
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <TrendingUp className="h-12 w-12 text-secondary-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Préqualification automatique</h3>
              <p className="text-gray-600">
                Filtrez automatiquement les candidatures avec notre système de scoring
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <Users className="h-12 w-12 text-secondary-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Statistiques détaillées</h3>
              <p className="text-gray-600">
                Suivez les performances de vos AAP avec des analytics complets
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Tarifs simples et transparents
            </h2>
            <p className="text-lg text-gray-600">
              14 jours d'essai gratuit, sans engagement
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Porteur Pricing */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <h3 className="text-2xl font-bold mb-2">Porteur de projet</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">29,99€</span>
                <span className="text-gray-600">/mois</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <span className="text-success-500 mr-2">✓</span>
                  <span>Recherche illimitée d'AAP</span>
                </li>
                <li className="flex items-start">
                  <span className="text-success-500 mr-2">✓</span>
                  <span>Alertes personnalisées</span>
                </li>
                <li className="flex items-start">
                  <span className="text-success-500 mr-2">✓</span>
                  <span>Candidatures en ligne</span>
                </li>
                <li className="flex items-start">
                  <span className="text-success-500 mr-2">✓</span>
                  <span>Outil de préqualification</span>
                </li>
                <li className="flex items-start">
                  <span className="text-success-500 mr-2">✓</span>
                  <span>Suivi des candidatures</span>
                </li>
              </ul>
              <Link to="/signup?type=porteur">
                <Button fullWidth>Essayer gratuitement</Button>
              </Link>
              <p className="text-sm text-gray-500 text-center mt-4">
                ou 299,99€/an (2 mois offerts)
              </p>
            </div>

            {/* Financeur Pricing */}
            <div className="bg-white rounded-lg shadow-md p-8 border-2 border-primary-600">
              <div className="inline-block bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-medium mb-2">
                Populaire
              </div>
              <h3 className="text-2xl font-bold mb-2">Financeur</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">99,99€</span>
                <span className="text-gray-600">/mois</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <span className="text-success-500 mr-2">✓</span>
                  <span>Publication d'AAP illimitée</span>
                </li>
                <li className="flex items-start">
                  <span className="text-success-500 mr-2">✓</span>
                  <span>Gestion des candidatures</span>
                </li>
                <li className="flex items-start">
                  <span className="text-success-500 mr-2">✓</span>
                  <span>Préqualification automatique</span>
                </li>
                <li className="flex items-start">
                  <span className="text-success-500 mr-2">✓</span>
                  <span>Statistiques avancées</span>
                </li>
                <li className="flex items-start">
                  <span className="text-success-500 mr-2">✓</span>
                  <span>Support prioritaire</span>
                </li>
              </ul>
              <Link to="/signup?type=financeur">
                <Button fullWidth>Essayer gratuitement</Button>
              </Link>
              <p className="text-sm text-gray-500 text-center mt-4">
                ou 999,99€/an (2 mois offerts)
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 bg-primary-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Prêt à commencer ?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Rejoignez des centaines d'organisations qui utilisent déjà AAP Platform
          </p>
          <Link to="/signup">
            <Button size="lg" variant="secondary">
              Commencer gratuitement
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Target className="h-6 w-6 text-primary-400" />
                <span className="text-lg font-bold text-white">AAP Platform</span>
              </div>
              <p className="text-sm">
                La plateforme de référence pour les appels à projets en France
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Produit</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Fonctionnalités</a></li>
                <li><a href="#" className="hover:text-white">Tarifs</a></li>
                <li><a href="#" className="hover:text-white">FAQ</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Entreprise</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">À propos</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Légal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/cgu" className="hover:text-white">CGU</Link></li>
                <li><Link to="/confidentialite" className="hover:text-white">Confidentialité</Link></li>
                <li><Link to="/mentions-legales" className="hover:text-white">Mentions légales</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>&copy; 2025 AAP Platform. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
