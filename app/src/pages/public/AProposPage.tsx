// Page À propos (changement navigation-et-pages-publiques, 2026-10-20). Les données d'entreprise inconnues du dépôt
// viennent de pages/legal/editeur.ts et restent marquées à valider.
import { Link } from 'react-router-dom';
import { EDITEUR } from '../legal/editeur';

export default function AProposPage() {
  return (
    <div className="bg-white py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">À propos</h1>
        <div className="space-y-4 text-gray-700 leading-relaxed">
          <p>
            {EDITEUR.nomService} est édité par {EDITEUR.raisonSociale}, société fondée par {EDITEUR.directeurPublication},
            à {EDITEUR.siege}.
          </p>
          <p>
            Le constat de départ : en France, près de 18 000 établissements et services de santé et médico-sociaux
            (hôpitaux, cliniques, EHPAD, services à domicile, instituts et foyers du handicap, centres de santé,
            associations de prévention) dépendent d'appels à projets publiés par des dizaines de financeurs, chacun sur
            son site, dans ses propres rubriques, avec ses propres dates. Les repérer à temps demande une veille que
            peu de structures peuvent tenir.
          </p>
          <p>
            AAP Santé rassemble ces appels, les relit, les qualifie (thématique, territoire, montants, dates, à qui ils
            s'adressent) et prévient chaque structure de ceux qui la concernent. Les financeurs y publient leurs appels
            et reçoivent les candidatures au même endroit.
          </p>
          <p>
            Le service est en construction : les fiches sont contrôlées avant publication et chacune renvoie vers
            l'annonce officielle, qui fait foi.
          </p>
        </div>
        <div className="mt-8 flex flex-wrap gap-4 text-sm">
          <Link to="/contact" className="text-primary-600 hover:underline">Nous contacter</Link>
          <Link to="/mentions-legales" className="text-primary-600 hover:underline">Mentions légales</Link>
        </div>
      </div>
    </div>
  );
}
