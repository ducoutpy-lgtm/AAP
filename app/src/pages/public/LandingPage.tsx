import { Link } from 'react-router-dom';
import { Search, Target, TrendingUp, Shield, Zap, Users, Building2, Landmark, Eye } from 'lucide-react';

// Accueil (navigation-et-pages-publiques, 2026-10-20) : l'en-tête et le pied de page viennent du gabarit commun ; le
// choix du profil se fait dès le premier écran (retour de Monsieur DUCOUT).
const PROFILS = [
  { icone: Building2, titre: 'Je cherche des financements', texte: 'Établissement sanitaire ou médico-social, association, collectivité : trouvez les appels qui vous concernent et candidatez.', lien: '/signup?type=porteur', bouton: 'Créer mon compte candidat' },
  { icone: Landmark, titre: 'Je finance des projets', texte: 'ARS, caisse, fondation, collectivité, entreprise : publiez vos appels et recevez les candidatures.', lien: '/signup?type=financeur', bouton: 'Créer mon compte financeur' },
  { icone: Eye, titre: 'Je consulte sans compte', texte: 'La recherche et les fiches sont libres. Un compte sert à sauvegarder, être alerté et candidater.', lien: '/aap/search', bouton: 'Voir les appels à projets' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary-50 to-secondary-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Trouvez les meilleurs appels à projets en France
            </h1>
            <p className="text-xl text-gray-600 mb-10">
              Les appels à projets de la santé et du médico-social, relus et qualifiés, en un seul endroit
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {PROFILS.map(p => {
              const Icone = p.icone;
              return (
                <div key={p.titre} className="bg-white rounded-lg shadow-md p-6 flex flex-col text-left">
                  <Icone className="h-10 w-10 text-primary-600 mb-3" />
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">{p.titre}</h2>
                  <p className="text-gray-600 text-sm flex-1">{p.texte}</p>
                  <Link to={p.lien} className="mt-5 inline-block text-center bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium">
                    {p.bouton}
                  </Link>
                </div>
              );
            })}
          </div>
          <p className="text-center text-sm text-gray-500 mt-6">
            Administrateur de la plateforme : <Link to="/login" className="text-primary-600 hover:underline">connexion</Link>
          </p>
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
            Quatorze jours d'essai gratuit, sans carte bancaire
          </p>
          <Link to="/signup" className="inline-block bg-white text-primary-700 hover:bg-primary-50 px-6 py-3 rounded-lg font-medium">
            Créer mon compte
          </Link>
        </div>
      </section>

    </div>
  );
}
