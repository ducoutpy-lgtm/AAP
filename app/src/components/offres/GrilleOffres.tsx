// Gabarit des offres à trois colonnes (parcours d'intégration et page Tarifs ; changements parcours-integration et
// navigation-et-pages-publiques, 2026-10-20). Montants lus dans config/stripe.ts, à valider par Monsieur DUCOUT.
import { Check } from 'lucide-react';
import { Button } from '../ui/Button';
import { STRIPE_PLANS, TRIAL_DAYS } from '../../config/stripe';

export type RoleOffre = 'porteur' | 'financeur';

const AVANTAGES: Record<RoleOffre, { essai: string[]; mensuel: string[]; annuel: string[] }> = {
  porteur: {
    essai: ['Recherche des appels', 'Fiches détaillées', 'Alertes par e-mail'],
    mensuel: ["Tout l'essai gratuit", 'Candidatures en ligne', 'Suivi des dossiers', 'Messagerie avec les financeurs'],
    annuel: ['Tout le mensuel', 'Facturation annuelle', 'Support prioritaire'],
  },
  financeur: {
    essai: ['Publication d\'un appel', 'Fiche visible par les candidats', 'Réception des candidatures'],
    mensuel: ["Tout l'essai gratuit", 'Appels illimités', 'Évaluation des candidatures', 'Statistiques'],
    annuel: ['Tout le mensuel', 'Facturation annuelle', 'Support prioritaire'],
  },
};

interface Props {
  role: RoleOffre;
  // Libellé et action du bouton de chaque colonne ; sans action, la colonne est informative (page Tarifs)
  surEssai?: () => void;
  surPayant?: () => void;
  boutonEssai?: string;
  chargement?: boolean;
}

export function GrilleOffres({ role, surEssai, surPayant, boutonEssai = "Continuer avec l'essai gratuit", chargement = false }: Props) {
  const plans = STRIPE_PLANS[role];
  const a = AVANTAGES[role];
  return (
    <div className="grid md:grid-cols-3 gap-4">
      <Offre titre="Essai gratuit" prix="0 €" periode={`${TRIAL_DAYS} jours`} avantages={a.essai} bouton={boutonEssai} onChoisir={surEssai} chargement={chargement} />
      <Offre titre="Mensuel" prix={`${plans.monthly.amount.toLocaleString('fr-FR')} €`} periode="par mois" avantages={a.mensuel} bouton="Choisir" onChoisir={surPayant} chargement={chargement} />
      <Offre titre="Annuel" prix={`${plans.annual.amount.toLocaleString('fr-FR')} €`} periode="par an" etiquette="2 mois offerts" avantages={a.annuel} bouton="Choisir" onChoisir={surPayant} chargement={chargement} />
    </div>
  );
}

function Offre({ titre, prix, periode, etiquette, avantages, bouton, onChoisir, chargement }: {
  titre: string; prix: string; periode: string; etiquette?: string; avantages: string[]; bouton: string;
  onChoisir?: () => void; chargement: boolean;
}) {
  return (
    <div className={`relative rounded-lg border-2 p-5 flex flex-col bg-white ${etiquette ? 'border-primary-600' : 'border-gray-200'}`}>
      {etiquette && (
        <span className="absolute -top-3 right-4 bg-primary-600 text-white px-3 py-0.5 rounded-full text-xs font-semibold">
          {etiquette}
        </span>
      )}
      <h3 className="text-lg font-bold text-gray-900">{titre}</h3>
      <p className="mt-2"><span className="text-3xl font-bold text-gray-900">{prix}</span> <span className="text-gray-500 text-sm">{periode}</span></p>
      <ul className="mt-4 space-y-2 flex-1">
        {avantages.map(x => (
          <li key={x} className="flex items-start text-sm text-gray-700">
            <Check className="h-4 w-4 text-success-500 mr-2 mt-0.5 flex-shrink-0" />{x}
          </li>
        ))}
      </ul>
      {onChoisir && (
        <Button className="mt-5" fullWidth variant={etiquette ? 'primary' : 'secondary'} onClick={onChoisir} loading={chargement}>
          {bouton}
        </Button>
      )}
    </div>
  );
}
