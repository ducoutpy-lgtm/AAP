// Parcours d'intégration après l'inscription (changement parcours-integration, 2026-10-20, point 1 du relevé
// helloDarwin) : un écran d'accueil puis trois écrans courts (structure, détails, offre). Les réponses deviennent le
// profil ; le formulaire long reste disponible sur /profil pour compléter le reste plus tard.
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { Check, Target } from 'lucide-react';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Stepper } from '../../components/ui/Stepper';
import { STRIPE_PLANS, TRIAL_DAYS } from '../../config/stripe';
import { libelleTerritoire } from '../../utils/territoires';
import type { UserType } from '../../types';
import {
  BUDGETS, etapeComplete, FORMES_JURIDIQUES, PARCOURS_VIDE, profilFinanceurDepuisParcours,
  profilPorteurDepuisParcours, PUBLICS, regionDepuisCodePostal, SECTEURS_FINANCES, TAILLES, TYPES_ETABLISSEMENT,
  TYPES_ORGANISATION, type FormulaireParcours,
} from './parcours';

const ETAPES = [
  { label: 'Votre structure', description: 'Qui portera le projet ?' },
  { label: 'Vos détails', description: 'Pour cibler les appels' },
  { label: 'Votre offre', description: 'Essai gratuit ou abonnement' },
];

// roleInitial absent = compte sans document utilisateur (connexion Google) : le rôle est demandé à l'accueil
export default function ParcoursIntegrationPage({ roleInitial }: { roleInitial?: 'porteur' | 'financeur' }) {
  const { currentUser, creerDocumentUtilisateur, refreshUserProfile } = useAuth();
  const navigate = useNavigate();
  const [ecran, setEcran] = useState(0); // 0 = accueil, 1 à 3 = étapes
  const [cguAcceptees, setCguAcceptees] = useState(false);
  const [role, setRole] = useState<'porteur' | 'financeur' | ''>(roleInitial ?? '');
  const [f, setF] = useState<FormulaireParcours>(PARCOURS_VIDE);
  const [enregistrement, setEnregistrement] = useState(false);
  const [erreur, setErreur] = useState('');

  const champ = <K extends keyof FormulaireParcours>(cle: K, valeur: FormulaireParcours[K]) =>
    setF(prev => ({ ...prev, [cle]: valeur }));
  const basculer = (cle: 'publics' | 'secteurs', valeur: string) =>
    setF(prev => ({
      ...prev,
      [cle]: prev[cle].includes(valeur) ? prev[cle].filter(v => v !== valeur) : [...prev[cle], valeur],
    }));

  const region = regionDepuisCodePostal(f.codePostal);
  const roleChoisi = role as UserType;
  const plans = STRIPE_PLANS[role === 'financeur' ? 'financeur' : 'porteur'];

  // Enregistre le profil (et le document utilisateur s'il manque), puis ouvre la destination
  const terminer = async (destination: string) => {
    if (!currentUser || !role) return;
    setErreur('');
    setEnregistrement(true);
    try {
      if (!roleInitial) await creerDocumentUtilisateur(role);
      const email = currentUser.email ?? '';
      if (role === 'porteur') {
        await setDoc(doc(db, 'porteurProfiles', currentUser.uid), {
          ...profilPorteurDepuisParcours(f, currentUser.uid, email), updatedAt: Timestamp.now(),
        });
      } else {
        await setDoc(doc(db, 'financeurProfiles', currentUser.uid), {
          ...profilFinanceurDepuisParcours(f, currentUser.uid, email), updatedAt: Timestamp.now(),
        });
      }
      await setDoc(doc(db, 'users', currentUser.uid), { profileComplete: true, cguAccepteLe: Timestamp.now() }, { merge: true });
      await refreshUserProfile();
      navigate(destination);
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Erreur lors de l'enregistrement");
    } finally {
      setEnregistrement(false);
    }
  };

  const tableauDeBord = role === 'financeur' ? '/dashboard/financeur' : '/dashboard/porteur';

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-8">
          <Target className="h-12 w-12 text-primary-600 mx-auto mb-4" />
          {ecran === 0 ? (
            <>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Bienvenue sur AAP Santé</h1>
              <p className="text-gray-600">
                Trois questions courtes pour trouver les appels à projets faits pour votre structure.
              </p>
            </>
          ) : (
            <p className="text-sm text-gray-500">Étape {ecran} sur 3</p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          {ecran > 0 && <Stepper steps={ETAPES} currentStep={ecran - 1} />}

          {erreur && (
            <div className="mb-6 p-4 bg-error-50 border border-error-200 rounded-lg text-error-600">{erreur}</div>
          )}

          {ecran === 0 && (
            <div className="space-y-6">
              {!roleInitial && (
                <div>
                  <p className="block text-sm font-medium text-gray-700 mb-2">
                    Je suis <span className="text-error-500">*</span>
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {([['porteur', 'Porteur de projet', 'établissement, association, collectivité'],
                      ['financeur', 'Financeur', 'ARS, fondation, collectivité, entreprise']] as const).map(([v, titre, sous]) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setRole(v)}
                        className={`p-4 border-2 rounded-lg text-center transition-all ${
                          role === v ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="font-semibold">{titre}</div>
                        <div className="text-xs text-gray-500 mt-1">{sous}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <label className="flex items-start gap-3 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={cguAcceptees}
                  onChange={(e) => setCguAcceptees(e.target.checked)}
                  className="mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span>
                  J'accepte les{' '}
                  <Link to="/cgu" target="_blank" className="text-primary-600 hover:underline">
                    conditions générales d'utilisation
                  </Link>{' '}
                  et la{' '}
                  <Link to="/confidentialite" target="_blank" className="text-primary-600 hover:underline">
                    politique de confidentialité
                  </Link>
                  . <span className="text-error-500">*</span>
                </span>
              </label>
              <div className="flex justify-end">
                <Button onClick={() => setEcran(1)} disabled={!cguAcceptees || !role}>Commencer</Button>
              </div>
            </div>
          )}

          {ecran === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {role === 'financeur' ? 'Qui finance ?' : 'Qui portera le projet ?'}
              </h2>
              <Input
                label={role === 'financeur' ? "Nom de l'organisation" : 'Nom de la structure'}
                value={f.nom}
                onChange={(e) => champ('nom', e.target.value)}
                required
              />
              <Select
                label={role === 'financeur' ? "Type d'organisation" : 'Forme juridique'}
                value={f.forme}
                onChange={(e) => champ('forme', e.target.value)}
                options={role === 'financeur' ? TYPES_ORGANISATION : FORMES_JURIDIQUES}
                required
              />
              <div className="grid md:grid-cols-2 gap-4">
                <Input label="Ville" value={f.ville} onChange={(e) => champ('ville', e.target.value)} required />
                <Input
                  label="Code postal"
                  value={f.codePostal}
                  onChange={(e) => champ('codePostal', e.target.value)}
                  maxLength={5}
                  inputMode="numeric"
                  required
                  helperText={region ? `Région : ${libelleTerritoire(region)}` : 'La région est déduite du code postal'}
                />
              </div>
            </div>
          )}

          {ecran === 2 && role === 'porteur' && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Votre établissement</h2>
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type d'établissement <span className="text-error-500">*</span>
                </label>
                <select
                  value={f.typeEtablissement}
                  onChange={(e) => champ('typeEtablissement', e.target.value)}
                  className="input-field"
                >
                  <option value="">Sélectionnez une option</option>
                  {TYPES_ETABLISSEMENT.map(g => (
                    <optgroup key={g.groupe} label={g.groupe}>
                      {g.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </optgroup>
                  ))}
                </select>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <Select label="Taille (équivalents temps plein)" value={f.taille} onChange={(e) => champ('taille', e.target.value)} options={TAILLES} />
                <Select label="Budget annuel" value={f.budget} onChange={(e) => champ('budget', e.target.value)} options={BUDGETS} />
              </div>
              <div>
                <p className="block text-sm font-medium text-gray-700 mb-2">
                  Publics accueillis <span className="text-error-500">*</span>
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {PUBLICS.map(p => (
                    <label key={p.value} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={f.publics.includes(p.value)}
                        onChange={() => basculer('publics', p.value)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700">{p.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {ecran === 2 && role === 'financeur' && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Votre organisation</h2>
              <div>
                <p className="block text-sm font-medium text-gray-700 mb-2">
                  Secteurs financés <span className="text-error-500">*</span>
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {SECTEURS_FINANCES.map(s => (
                    <label key={s.value} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={f.secteurs.includes(s.value)}
                        onChange={() => basculer('secteurs', s.value)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700">{s.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <Input label="Prénom du contact" value={f.prenom} onChange={(e) => champ('prenom', e.target.value)} required />
                <Input label="Nom du contact" value={f.nomContact} onChange={(e) => champ('nomContact', e.target.value)} required />
              </div>
              <Input label="Fonction" value={f.fonction} onChange={(e) => champ('fonction', e.target.value)} helperText="Ex : responsable des appels à projets" />
            </div>
          )}

          {ecran === 3 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-1">Choisissez votre offre</h2>
              <p className="text-sm text-gray-500 mb-6">
                {TRIAL_DAYS} jours d'essai gratuit, aucune carte bancaire requise. Montants à valider.
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <Offre
                  titre="Essai gratuit"
                  prix="0 €"
                  periode={`${TRIAL_DAYS} jours`}
                  avantages={['Recherche des appels', 'Fiches détaillées', 'Alertes par e-mail']}
                  bouton="Continuer avec l'essai gratuit"
                  onChoisir={() => terminer(tableauDeBord)}
                  chargement={enregistrement}
                />
                <Offre
                  titre="Mensuel"
                  prix={`${plans.monthly.amount.toLocaleString('fr-FR')} €`}
                  periode="par mois"
                  avantages={['Tout l\'essai gratuit', 'Candidatures en ligne', 'Suivi des dossiers', 'Messagerie']}
                  bouton="Choisir"
                  onChoisir={() => terminer('/abonnement/choisir')}
                  chargement={enregistrement}
                />
                <Offre
                  titre="Annuel"
                  prix={`${plans.annual.amount.toLocaleString('fr-FR')} €`}
                  periode="par an"
                  etiquette="2 mois offerts"
                  avantages={['Tout le mensuel', 'Facturation annuelle', 'Support prioritaire']}
                  bouton="Choisir"
                  onChoisir={() => terminer('/abonnement/choisir')}
                  chargement={enregistrement}
                />
              </div>
            </div>
          )}

          {ecran > 0 && (
            <div className="flex justify-between pt-8">
              <Button variant="secondary" onClick={() => setEcran(ecran - 1)} disabled={enregistrement}>Retour</Button>
              {ecran < 3 && (
                <Button onClick={() => setEcran(ecran + 1)} disabled={!etapeComplete(ecran as 1 | 2, f, roleChoisi)}>
                  Suivant
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Offre({ titre, prix, periode, etiquette, avantages, bouton, onChoisir, chargement }: {
  titre: string; prix: string; periode: string; etiquette?: string; avantages: string[]; bouton: string;
  onChoisir: () => void; chargement: boolean;
}) {
  return (
    <div className={`relative rounded-lg border-2 p-5 flex flex-col ${etiquette ? 'border-primary-600' : 'border-gray-200'}`}>
      {etiquette && (
        <span className="absolute -top-3 right-4 bg-primary-600 text-white px-3 py-0.5 rounded-full text-xs font-semibold">
          {etiquette}
        </span>
      )}
      <h3 className="text-lg font-bold text-gray-900">{titre}</h3>
      <p className="mt-2"><span className="text-3xl font-bold text-gray-900">{prix}</span> <span className="text-gray-500 text-sm">{periode}</span></p>
      <ul className="mt-4 space-y-2 flex-1">
        {avantages.map(a => (
          <li key={a} className="flex items-start text-sm text-gray-700">
            <Check className="h-4 w-4 text-success-500 mr-2 mt-0.5 flex-shrink-0" />{a}
          </li>
        ))}
      </ul>
      <Button className="mt-5" fullWidth variant={etiquette ? 'primary' : 'secondary'} onClick={onChoisir} loading={chargement}>
        {bouton}
      </Button>
    </div>
  );
}
