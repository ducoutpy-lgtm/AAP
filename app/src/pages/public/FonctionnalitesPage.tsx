// Page Fonctionnalités (changement navigation-et-pages-publiques, 2026-10-20) : ce que fait l'application
// aujourd'hui, pour chaque profil, sans promesse sur ce qui n'existe pas encore.
import { Link } from 'react-router-dom';
import { Bell, Calendar, CheckCircle2, FileText, Filter, Search, ShieldCheck, Users } from 'lucide-react';

const CANDIDATS = [
  { icone: Search, titre: 'Recherche centralisée', texte: 'Les appels des ARS, de la CNSA, des fondations, des collectivités et des caisses, relus chaque semaine, dans une seule liste.' },
  { icone: Filter, titre: 'Filtres du secteur', texte: 'Thématique santé ou médico-social, région, financeur, statut (ouvert, bientôt clôturé), budget ; une recherche se partage par son lien.' },
  { icone: FileText, titre: 'Fiches qualifiées', texte: 'Dates, financeur, montants, conditions, pièces jointes et lien vers l\'annonce officielle, avec la mention de relecture.' },
  { icone: Bell, titre: 'Alertes et calendrier', texte: 'Recherches sauvegardées, alertes et calendrier des clôtures pour ne manquer aucune échéance.' },
  { icone: CheckCircle2, titre: 'Candidatures suivies', texte: 'Dossier de candidature en ligne et suivi de son avancement, de la rédaction à la décision.' },
];

const FINANCEURS = [
  { icone: FileText, titre: 'Publication guidée', texte: 'Un formulaire en cinq étapes pour publier un appel complet : critères, budget, calendrier, pièces.' },
  { icone: Users, titre: 'Candidatures reçues', texte: 'Réception, lecture et évaluation des dossiers depuis un seul espace.' },
  { icone: Calendar, titre: 'Statistiques', texte: 'Vues, candidatures et taux de réponse par appel.' },
  { icone: ShieldCheck, titre: 'Relecture des fiches', texte: 'Chaque fiche collectée automatiquement est contrôlée avant d\'être visible par les candidats.' },
];

export default function FonctionnalitesPage() {
  return (
    <div className="bg-white py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Fonctionnalités</h1>
        <p className="text-gray-600 mb-10">
          AAP Santé recense les appels à projets du secteur de la santé et du médico-social en France et aide les
          établissements à y répondre.
        </p>

        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Pour les établissements et associations candidats</h2>
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {CANDIDATS.map(f => <Bloc key={f.titre} {...f} />)}
        </div>

        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Pour les financeurs</h2>
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {FINANCEURS.map(f => <Bloc key={f.titre} {...f} />)}
        </div>

        <div className="bg-primary-50 rounded-lg p-6 flex flex-wrap items-center justify-between gap-4">
          <p className="text-primary-900">Voyez les appels disponibles sans créer de compte.</p>
          <Link to="/aap/search" className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2 rounded-lg font-medium">
            Voir les appels à projets
          </Link>
        </div>
      </div>
    </div>
  );
}

function Bloc({ icone: Icone, titre, texte }: { icone: typeof Search; titre: string; texte: string }) {
  return (
    <div className="border border-gray-200 rounded-lg p-5">
      <Icone className="h-8 w-8 text-primary-600 mb-3" />
      <h3 className="font-semibold text-gray-900 mb-1">{titre}</h3>
      <p className="text-sm text-gray-600">{texte}</p>
    </div>
  );
}
