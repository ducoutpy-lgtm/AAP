import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { aapService } from '../../services/aapService';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Stepper } from '../../components/ui/Stepper';
import { ArrowLeft, ArrowRight, Save } from 'lucide-react';

const STEPS = [
  { label: 'Informations', description: 'Titre et description' },
  { label: 'Éligibilité', description: 'Secteurs et territoires' },
  { label: 'Budget', description: 'Montants et calendrier' },
  { label: 'Contact', description: 'Documents et contact' },
  { label: 'Validation', description: 'Vérification' },
];

const SECTEURS = [
  { value: 'agriculture', label: 'Agriculture & Agroalimentaire' },
  { value: 'energie', label: 'Énergie & Environnement' },
  { value: 'sante', label: 'Santé & Biotechnologie' },
  { value: 'numerique', label: 'Numérique & Technologies' },
  { value: 'industrie', label: 'Industrie & Manufacturing' },
  { value: 'services', label: 'Services' },
  { value: 'education', label: 'Éducation & Formation' },
  { value: 'culture', label: 'Culture & Arts' },
  { value: 'social', label: 'Social & Solidarité' },
  { value: 'recherche', label: 'Recherche & Innovation' },
];

const REGIONS = [
  { value: 'france', label: 'Toute la France' },
  { value: 'auvergne-rhone-alpes', label: 'Auvergne-Rhône-Alpes' },
  { value: 'bourgogne-franche-comte', label: 'Bourgogne-Franche-Comté' },
  { value: 'bretagne', label: 'Bretagne' },
  { value: 'centre-val-de-loire', label: 'Centre-Val de Loire' },
  { value: 'corse', label: 'Corse' },
  { value: 'grand-est', label: 'Grand Est' },
  { value: 'hauts-de-france', label: 'Hauts-de-France' },
  { value: 'ile-de-france', label: 'Île-de-France' },
  { value: 'normandie', label: 'Normandie' },
  { value: 'nouvelle-aquitaine', label: 'Nouvelle-Aquitaine' },
  { value: 'occitanie', label: 'Occitanie' },
  { value: 'pays-de-la-loire', label: 'Pays de la Loire' },
  { value: "provence-alpes-cote-d-azur", label: "Provence-Alpes-Côte d'Azur" },
];

export default function CreateAapPage() {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    sectorsTargeted: [] as string[],
    territoriesEligible: [] as string[],
    budgetMin: '',
    budgetMax: '',
    budgetTotal: '',
    deadline: '',
    eligibilityCriteria: '',
    evaluationCriteria: '',
    contactEmail: '',
    contactPhone: '',
    externalUrl: '',
    tags: '',
  });

  const handleSectorChange = (sector: string) => {
    setFormData(prev => ({
      ...prev,
      sectorsTargeted: prev.sectorsTargeted.includes(sector)
        ? prev.sectorsTargeted.filter(s => s !== sector)
        : [...prev.sectorsTargeted, sector],
    }));
  };

  const handleTerritoryChange = (territory: string) => {
    setFormData(prev => ({
      ...prev,
      territoriesEligible: prev.territoriesEligible.includes(territory)
        ? prev.territoriesEligible.filter(t => t !== territory)
        : [...prev.territoriesEligible, territory],
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 0:
        return formData.title.length >= 10 && formData.description.length >= 100;
      case 1:
        return formData.sectorsTargeted.length > 0 && formData.territoriesEligible.length > 0;
      case 2:
        return formData.deadline !== '';
      case 3:
        return formData.contactEmail !== '';
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo(0, 0);
    } else {
      setError('Veuillez remplir tous les champs obligatoires');
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
    window.scrollTo(0, 0);
  };

  const handleSaveDraft = async () => {
    setError('');
    setLoading(true);

    try {
      if (!currentUser || !userProfile) throw new Error('Non authentifié');

      // Récupérer le nom du financeur
      const financeurProfileDoc = await getDoc(doc(db, 'financeurProfiles', currentUser.uid));
      const financeurProfile = financeurProfileDoc.data();
      const financeurName = financeurProfile?.organisationName || userProfile.email || 'Financeur';

      const aapData = {
        title: formData.title,
        description: formData.description,
        sectorsTargeted: formData.sectorsTargeted,
        territoriesEligible: formData.territoriesEligible,
        budgetMin: formData.budgetMin ? parseFloat(formData.budgetMin) : undefined,
        budgetMax: formData.budgetMax ? parseFloat(formData.budgetMax) : undefined,
        budgetTotal: formData.budgetTotal ? parseFloat(formData.budgetTotal) : undefined,
        deadline: new Date(formData.deadline),
        eligibilityCriteria: formData.eligibilityCriteria || undefined,
        evaluationCriteria: formData.evaluationCriteria || undefined,
        contactEmail: formData.contactEmail || undefined,
        contactPhone: formData.contactPhone || undefined,
        externalUrl: formData.externalUrl || undefined,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : undefined,
      };

      const aapId = await aapService.createAap(currentUser.uid, financeurName, aapData);

      alert('AAP sauvegardé en brouillon');
      navigate(`/aap/${aapId}`);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    setError('');
    setLoading(true);

    try {
      if (!currentUser || !userProfile) throw new Error('Non authentifié');

      // Récupérer le nom du financeur
      const financeurProfileDoc = await getDoc(doc(db, 'financeurProfiles', currentUser.uid));
      const financeurProfile = financeurProfileDoc.data();
      const financeurName = financeurProfile?.organisationName || userProfile.email || 'Financeur';

      const aapData = {
        title: formData.title,
        description: formData.description,
        sectorsTargeted: formData.sectorsTargeted,
        territoriesEligible: formData.territoriesEligible,
        budgetMin: formData.budgetMin ? parseFloat(formData.budgetMin) : undefined,
        budgetMax: formData.budgetMax ? parseFloat(formData.budgetMax) : undefined,
        budgetTotal: formData.budgetTotal ? parseFloat(formData.budgetTotal) : undefined,
        deadline: new Date(formData.deadline),
        eligibilityCriteria: formData.eligibilityCriteria || undefined,
        evaluationCriteria: formData.evaluationCriteria || undefined,
        contactEmail: formData.contactEmail || undefined,
        contactPhone: formData.contactPhone || undefined,
        externalUrl: formData.externalUrl || undefined,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : undefined,
      };

      const aapId = await aapService.createAap(currentUser.uid, financeurName, aapData);
      await aapService.publishAap(aapId);

      alert('AAP publié avec succès !');
      navigate(`/mes-aap`);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la publication');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Informations principales</h2>

            <Input
              label="Titre de l'appel à projets"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              helperText="Minimum 10 caractères"
            />

            <Textarea
              label="Description complète"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              helperText="Décrivez les objectifs et le contexte de l'appel à projets (minimum 100 caractères)"
              rows={8}
            />

            <Input
              label="Lien externe (optionnel)"
              type="url"
              value={formData.externalUrl}
              onChange={(e) => setFormData({ ...formData, externalUrl: e.target.value })}
              helperText="URL vers la page officielle de l'AAP"
            />
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Critères d'éligibilité</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Secteurs ciblés <span className="text-error-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto border rounded-lg p-4">
                {SECTEURS.map((secteur) => (
                  <label key={secteur.value} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.sectorsTargeted.includes(secteur.value)}
                      onChange={() => handleSectorChange(secteur.value)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">{secteur.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Territoires éligibles <span className="text-error-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto border rounded-lg p-4">
                {REGIONS.map((region) => (
                  <label key={region.value} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.territoriesEligible.includes(region.value)}
                      onChange={() => handleTerritoryChange(region.value)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">{region.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <Textarea
              label="Critères d'éligibilité détaillés"
              value={formData.eligibilityCriteria}
              onChange={(e) => setFormData({ ...formData, eligibilityCriteria: e.target.value })}
              helperText="Détaillez les conditions d'éligibilité des porteurs de projets"
              rows={4}
            />

            <Textarea
              label="Critères d'évaluation"
              value={formData.evaluationCriteria}
              onChange={(e) => setFormData({ ...formData, evaluationCriteria: e.target.value })}
              helperText="Sur quels critères les projets seront-ils évalués ?"
              rows={4}
            />
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Budget et calendrier</h2>

            <div className="grid md:grid-cols-3 gap-4">
              <Input
                label="Budget minimum (€)"
                type="number"
                value={formData.budgetMin}
                onChange={(e) => setFormData({ ...formData, budgetMin: e.target.value })}
                helperText="Montant minimum par projet"
                min="0"
              />

              <Input
                label="Budget maximum (€)"
                type="number"
                value={formData.budgetMax}
                onChange={(e) => setFormData({ ...formData, budgetMax: e.target.value })}
                helperText="Montant maximum par projet"
                min="0"
              />

              <Input
                label="Budget total (€)"
                type="number"
                value={formData.budgetTotal}
                onChange={(e) => setFormData({ ...formData, budgetTotal: e.target.value })}
                helperText="Budget total de l'AAP"
                min="0"
              />
            </div>

            <Input
              label="Date limite de candidature"
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              required
              helperText="Date limite de dépôt des candidatures"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Contact et informations complémentaires</h2>

            <Input
              label="Email de contact"
              type="email"
              value={formData.contactEmail}
              onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
              required
              helperText="Email pour les questions des porteurs de projets"
            />

            <Input
              label="Téléphone de contact"
              type="tel"
              value={formData.contactPhone}
              onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
              helperText="Téléphone (optionnel)"
            />

            <Input
              label="Tags"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              helperText="Mots-clés séparés par des virgules (ex: innovation, startup, IA)"
            />
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Vérification</h2>

            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900">Titre</h3>
                <p className="text-gray-700">{formData.title}</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900">Description</h3>
                <p className="text-gray-700">{formData.description}</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900">Secteurs ciblés</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.sectorsTargeted.map(sector => (
                    <span key={sector} className="badge-primary">
                      {SECTEURS.find(s => s.value === sector)?.label}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900">Territoires</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.territoriesEligible.map(territory => (
                    <span key={territory} className="badge-gray">
                      {REGIONS.find(r => r.value === territory)?.label}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {formData.budgetMin && (
                  <div>
                    <h3 className="font-semibold text-gray-900">Budget min</h3>
                    <p className="text-gray-700">{parseFloat(formData.budgetMin).toLocaleString()}€</p>
                  </div>
                )}

                {formData.budgetMax && (
                  <div>
                    <h3 className="font-semibold text-gray-900">Budget max</h3>
                    <p className="text-gray-700">{parseFloat(formData.budgetMax).toLocaleString()}€</p>
                  </div>
                )}
              </div>

              <div>
                <h3 className="font-semibold text-gray-900">Date limite</h3>
                <p className="text-gray-700">{new Date(formData.deadline).toLocaleDateString('fr-FR')}</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900">Contact</h3>
                <p className="text-gray-700">{formData.contactEmail}</p>
                {formData.contactPhone && <p className="text-gray-700">{formData.contactPhone}</p>}
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/mes-aap')}
            className="text-gray-600 hover:text-gray-900 flex items-center gap-2 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à mes AAP
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Créer un nouvel appel à projets</h1>
        </div>

        {/* Stepper */}
        <Stepper steps={STEPS} currentStep={currentStep} />

        {/* Form */}
        <div className="bg-white rounded-lg shadow-md p-8">
          {error && (
            <div className="mb-6 p-4 bg-error-50 border border-error-200 rounded-lg text-error-600">
              {error}
            </div>
          )}

          {renderStep()}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <div>
              {currentStep > 0 && (
                <Button variant="secondary" onClick={handleBack}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Précédent
                </Button>
              )}
            </div>

            <div className="flex gap-3">
              <Button variant="secondary" onClick={handleSaveDraft} loading={loading}>
                <Save className="mr-2 h-4 w-4" />
                Sauvegarder en brouillon
              </Button>

              {currentStep < STEPS.length - 1 ? (
                <Button onClick={handleNext}>
                  Suivant
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={handlePublish} loading={loading}>
                  Publier l'AAP
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
