// Page publique « Financeurs » (changement financeur-vendable, jour 6 du plan MVP, 2026-10-21) : à qui l'application
// sert côté financeur, ce qu'elle fait vraiment, les chiffres réels publiés par scripts/publier_chiffres.py dans
// statistiquesPubliques/accueil (jamais de valeur inventée : sans document, pas de chiffres), le tarif lu dans
// config/stripe.ts (seule source des montants) avec la mention que le paiement n'est pas ouvert.
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { Building2, ClipboardList, Columns, Landmark, Users } from 'lucide-react';
import { db } from '../../config/firebase';
import { STRIPE_PLANS, TRIAL_DAYS } from '../../config/stripe';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { GrilleOffres } from '../../components/offres/GrilleOffres';

interface ChiffresPublics {
  etablissementsInscrits: number;
  appelsSuivis: number;
  financeursDistincts: number;
  sourcesSuivies?: number;
  misAJourLe?: string;
}

export default function FinanceursPage() {
  const [chiffres, setChiffres] = useState<ChiffresPublics | null>(null);

  useEffect(() => {
    getDoc(doc(db, 'statistiquesPubliques', 'accueil'))
      .then(s => setChiffres(s.exists() ? (s.data() as ChiffresPublics) : null))
      .catch(err => console.error('Chiffres publics non lus :', err));
  }, []);

  const mensuel = STRIPE_PLANS.financeur.monthly.amount.toLocaleString('fr-FR');

  return (
    <div className="bg-gray-50">
      <section className="bg-gradient-to-r from-secondary-600 to-primary-600 text-white py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <p className="uppercase tracking-wide text-secondary-100 text-sm mb-2">ARS, caisses, fondations, collectivités, entreprises</p>
          <h1 className="text-4xl font-bold mb-4">Publiez vos appels à projets là où les établissements de santé les cherchent</h1>
          <p className="text-lg text-secondary-100 mb-6">
            AAP Santé rassemble les appels à projets du secteur sanitaire et médico-social et les établissements qui y répondent.
            Un financeur y publie son appel en cinq étapes et reçoit les candidatures au même endroit.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/signup?type=financeur"><Button variant="secondary">Créer mon compte financeur</Button></Link>
            <Link to="/contact"><Button variant="ghost" className="text-white border border-white/60">Demander une démonstration</Button></Link>
          </div>
        </div>
      </section>

      <section className="py-14">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-10">Ce que l'application fait pour vous</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <ClipboardList className="h-10 w-10 text-secondary-600 mb-3" />
              <h3 className="text-xl font-semibold mb-2">Publier en cinq étapes</h3>
              <p className="text-gray-600">Présentation, critères et territoires, budget et date limite, contact, récapitulatif : votre appel est en ligne en quelques minutes, modifiable à tout moment.</p>
            </Card>
            <Card>
              <Columns className="h-10 w-10 text-secondary-600 mb-3" />
              <h3 className="text-xl font-semibold mb-2">Suivre les candidatures</h3>
              <p className="text-gray-600">Chaque dossier reçu avance de colonne en colonne : reçue, en examen, présélectionnée, acceptée ou refusée. Vous notez, commentez, exportez.</p>
            </Card>
            <Card>
              <Users className="h-10 w-10 text-secondary-600 mb-3" />
              <h3 className="text-xl font-semibold mb-2">Toucher les bons établissements</h3>
              <p className="text-gray-600">Les établissements inscrits décrivent leur structure, leur territoire et leurs publics ; ils reçoivent chaque semaine les appels qui leur correspondent, dont le vôtre.</p>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-14 bg-white">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-2">Les chiffres</h2>
          {chiffres ? (
            <>
              <p className="text-center text-gray-500 mb-8">Comptés dans l'application{chiffres.misAJourLe ? ` le ${new Date(chiffres.misAJourLe).toLocaleDateString('fr-FR')}` : ''}.</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                <Chiffre icone={<Building2 className="h-8 w-8 text-primary-600 mx-auto mb-2" />} valeur={chiffres.etablissementsInscrits} libelle="établissements inscrits" />
                <Chiffre icone={<ClipboardList className="h-8 w-8 text-primary-600 mx-auto mb-2" />} valeur={chiffres.appelsSuivis} libelle="appels suivis" />
                <Chiffre icone={<Landmark className="h-8 w-8 text-primary-600 mx-auto mb-2" />} valeur={chiffres.financeursDistincts} libelle="financeurs recensés" />
                {typeof chiffres.sourcesSuivies === 'number' && <Chiffre icone={<Users className="h-8 w-8 text-primary-600 mx-auto mb-2" />} valeur={chiffres.sourcesSuivies} libelle="sites de publication suivis" />}
              </div>
            </>
          ) : (
            <p className="text-center text-gray-500">Les chiffres de l'application seront publiés ici après la prochaine veille hebdomadaire.</p>
          )}
        </div>
      </section>

      <section className="py-14">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-2">Tarif financeur</h2>
          <p className="text-center text-gray-600 mb-8">
            {TRIAL_DAYS} jours d'essai gratuit, puis {mensuel} € par mois. Tarif provisoire : le paiement en ligne n'est pas encore ouvert, les comptes financeurs sont créés sur demande pendant la période de test.
          </p>
          <GrilleOffres role="financeur" />
          <p className="text-center mt-8">
            <Link to="/signup?type=financeur"><Button>Créer mon compte financeur</Button></Link>
          </p>
        </div>
      </section>
    </div>
  );
}

function Chiffre({ icone, valeur, libelle }: { icone: React.ReactNode; valeur: number; libelle: string }) {
  return (
    <div>
      {icone}
      <p className="text-3xl font-bold text-gray-900">{valeur.toLocaleString('fr-FR')}</p>
      <p className="text-sm text-gray-600">{libelle}</p>
    </div>
  );
}
