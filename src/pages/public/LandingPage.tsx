import { Link } from 'react-router-dom';
import { Search, FileText, BarChart3, Bell } from 'lucide-react';
import Button from '../../components/ui/Button';

const features = [
  {
    icon: Search,
    title: 'Recherche centralisée',
    description:
      'Trouvez tous les appels à projets en France depuis une seule plateforme.',
  },
  {
    icon: FileText,
    title: 'Candidature guidée',
    description:
      'Un formulaire étape par étape avec préqualification en temps réel.',
  },
  {
    icon: BarChart3,
    title: 'Statistiques & Analytics',
    description:
      'Suivez vos performances et optimisez vos candidatures.',
  },
  {
    icon: Bell,
    title: 'Alertes personnalisées',
    description:
      'Soyez notifié dès qu\'un AAP correspond à votre profil.',
  },
];

export default function LandingPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-600 to-secondary-600 py-20 text-white">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Le meta-moteur des appels à projets en France
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/80">
            Centralisez, recherchez et candidatez à tous les appels à projets
            depuis une seule plateforme. Pour les porteurs et les financeurs.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Link to="/signup">
              <Button className="bg-white text-primary-600 hover:bg-gray-100">
                Je suis porteur de projet
              </Button>
            </Link>
            <Link to="/signup">
              <Button variant="secondary" className="border-white text-white hover:bg-white/10">
                Je suis financeur
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold text-gray-900">
            Fonctionnalités clés
          </h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <feature.icon className="h-10 w-10 text-primary-600" />
                <h3 className="mt-4 text-lg font-semibold text-gray-900">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
