// Page FAQ en accordéon (changement navigation-et-pages-publiques, 2026-10-20), transposée des sept questions de
// helloDarwin au contexte santé. Éléments details/summary natifs : pas de script, lisible par les lecteurs d'écran.
import { Link } from 'react-router-dom';

const QUESTIONS: { q: string; r: string }[] = [
  { q: 'Qui peut s\'inscrire ?', r: 'Les professionnels agissant pour une structure du secteur : établissement sanitaire ou médico-social (public, privé non lucratif ou privé lucratif), association, fondation, collectivité, groupement, exercice coordonné. Les financeurs (ARS, caisses, fondations, collectivités, entreprises) ont un compte dédié pour publier leurs appels.' },
  { q: 'Faut-il un compte pour consulter les appels ?', r: 'Oui. La recherche et les fiches sont réservées aux comptes, avec quatorze jours d\'essai gratuit à l\'inscription ; le compte sert aussi à sauvegarder une recherche, recevoir des alertes, candidater et échanger avec un financeur.' },
  { q: 'D\'où viennent les appels à projets ?', r: 'Des sites officiels des financeurs : agences régionales de santé, CNSA, caisses de retraite et d\'assurance maladie, fondations, conseils régionaux et départementaux, fédérations. Une veille automatique relit ces pages chaque semaine.' },
  { q: 'Comment les fiches sont-elles relues ?', r: 'Chaque fiche collectée automatiquement est contrôlée avant publication : par Monsieur DUCOUT ou par un contrôle automatique vérifié. La fiche indique sa mention de relecture et la date à laquelle les informations ont été lues ; le lien vers l\'annonce officielle reste toujours affiché.' },
  { q: 'Pourquoi pas une simple recherche Google ?', r: 'Les appels sont dispersés sur des dizaines de sites, souvent dans des rubriques peu visibles, avec des dates qui changent. AAP Santé les rassemble, les qualifie (thématique, territoire, montants, dates, à qui ils s\'adressent) et vous alerte quand un nouvel appel correspond à votre profil.' },
  { q: 'Les petites associations sont-elles concernées ?', r: 'Oui. Beaucoup d\'appels de prévention, de lutte contre les addictions ou de soutien aux aidants s\'adressent aux associations locales. Le filtre par territoire et le rayon d\'action de votre profil servent à les repérer.' },
  { q: 'Que contient l\'essai gratuit ?', r: 'Quatorze jours avec la recherche, les fiches et les alertes, sans carte bancaire. Les offres payantes ajoutent les candidatures en ligne, le suivi des dossiers et la messagerie ; les montants sont indiqués sur la page Tarifs et seront confirmés avant l\'ouverture des paiements.' },
  { q: 'Comment recevoir les alertes ?', r: 'Sauvegardez une recherche depuis la page de recherche et choisissez la fréquence (immédiate, quotidienne, hebdomadaire). Les alertes arrivent dans l\'application et par e-mail.' },
  { q: 'Mes données sont-elles protégées ?', r: 'Les données de compte et de profil servent uniquement au fonctionnement du service ; elles ne sont ni vendues ni cédées. La politique de confidentialité détaille vos droits et le contact du délégué à la protection des données.' },
];

export default function FaqPage() {
  return (
    <div className="bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Questions fréquentes</h1>
        <p className="text-gray-600 mb-8">Cliquez une question pour lire la réponse.</p>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 divide-y divide-gray-200">
          {QUESTIONS.map(({ q, r }) => (
            <details key={q} className="group p-5">
              <summary className="cursor-pointer list-none flex items-center justify-between font-medium text-gray-900">
                {q}
                <span className="ml-4 text-gray-400 group-open:rotate-45 transition-transform text-xl leading-none">+</span>
              </summary>
              <p className="mt-3 text-gray-700 leading-relaxed">{r}</p>
            </details>
          ))}
        </div>
        <p className="text-sm text-gray-600 mt-6">
          Une autre question ? <Link to="/contact" className="text-primary-600 hover:underline">Contactez-nous</Link>.
        </p>
      </div>
    </div>
  );
}
