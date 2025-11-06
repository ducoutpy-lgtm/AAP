import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { Target } from 'lucide-react';

const REGIONS = [
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

const STRUCTURE_TYPES = [
  { value: 'entreprise', label: 'Entreprise' },
  { value: 'association', label: 'Association' },
  { value: 'collectivite', label: 'Collectivité territoriale' },
  { value: 'laboratoire', label: 'Laboratoire de recherche' },
  { value: 'autre', label: 'Autre' },
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

export default function CompletePorteurProfile() {
  const { currentUser, refreshUserProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    structureName: '',
    siret: '',
    structureType: '',
    secteurActivite: '',
    domainesIntervention: [] as string[],
    city: '',
    postalCode: '',
    region: '',
    firstName: '',
    lastName: '',
    phone: '',
    teamSize: '',
    website: '',
    description: '',
  });

  const handleDomaineChange = (domaine: string) => {
    setFormData(prev => ({
      ...prev,
      domainesIntervention: prev.domainesIntervention.includes(domaine)
        ? prev.domainesIntervention.filter(d => d !== domaine)
        : [...prev.domainesIntervention, domaine],
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!currentUser) throw new Error('Non authentifié');

      // Sauvegarder le profil porteur
      await setDoc(doc(db, 'porteurProfiles', currentUser.uid), {
        userId: currentUser.uid,
        structureName: formData.structureName,
        siret: formData.siret || null,
        structureType: formData.structureType,
        secteurActivite: formData.secteurActivite,
        domainesIntervention: formData.domainesIntervention,
        address: {
          city: formData.city,
          postalCode: formData.postalCode,
          region: formData.region,
          country: 'France',
        },
        contactPerson: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: currentUser.email,
          phone: formData.phone || null,
        },
        teamSize: formData.teamSize ? parseInt(formData.teamSize) : null,
        website: formData.website || null,
        description: formData.description || null,
        updatedAt: Timestamp.now(),
      });

      // Mettre à jour le statut de complétion du profil
      await setDoc(
        doc(db, 'users', currentUser.uid),
        { profileComplete: true },
        { merge: true }
      );

      await refreshUserProfile();

      // Rediriger vers la sélection d'abonnement
      navigate('/abonnement/choisir');
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la sauvegarde du profil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Target className="h-12 w-12 text-primary-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Complétez votre profil porteur
          </h1>
          <p className="text-gray-600">
            Ces informations nous permettront de vous recommander les AAP les plus pertinents
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-md p-8">
          {error && (
            <div className="mb-6 p-4 bg-error-50 border border-error-200 rounded-lg text-error-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informations sur la structure */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Informations sur votre structure
              </h2>
              <div className="space-y-4">
                <Input
                  label="Nom de la structure"
                  value={formData.structureName}
                  onChange={(e) => setFormData({ ...formData, structureName: e.target.value })}
                  required
                />

                <Input
                  label="SIRET"
                  value={formData.siret}
                  onChange={(e) => setFormData({ ...formData, siret: e.target.value })}
                  helperText="Optionnel - 14 chiffres"
                  maxLength={14}
                />

                <Select
                  label="Type de structure"
                  value={formData.structureType}
                  onChange={(e) => setFormData({ ...formData, structureType: e.target.value })}
                  options={STRUCTURE_TYPES}
                  required
                />

                <Select
                  label="Secteur d'activité principal"
                  value={formData.secteurActivite}
                  onChange={(e) => setFormData({ ...formData, secteurActivite: e.target.value })}
                  options={SECTEURS}
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Domaines d'intervention <span className="text-error-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {SECTEURS.map((secteur) => (
                      <label key={secteur.value} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.domainesIntervention.includes(secteur.value)}
                          onChange={() => handleDomaineChange(secteur.value)}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700">{secteur.label}</span>
                      </label>
                    ))}
                  </div>
                  {formData.domainesIntervention.length === 0 && (
                    <p className="mt-1 text-sm text-error-500">
                      Sélectionnez au moins un domaine
                    </p>
                  )}
                </div>

                <Input
                  label="Taille de l'équipe"
                  type="number"
                  value={formData.teamSize}
                  onChange={(e) => setFormData({ ...formData, teamSize: e.target.value })}
                  helperText="Nombre de personnes dans votre équipe"
                  min="1"
                />
              </div>
            </div>

            {/* Adresse */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Adresse</h2>
              <div className="space-y-4">
                <Input
                  label="Ville"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  required
                />

                <Input
                  label="Code postal"
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  required
                  maxLength={5}
                />

                <Select
                  label="Région"
                  value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  options={REGIONS}
                  required
                />
              </div>
            </div>

            {/* Contact */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Personne de contact</h2>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <Input
                    label="Prénom"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                  />

                  <Input
                    label="Nom"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                  />
                </div>

                <Input
                  label="Téléphone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  helperText="Format: 0612345678"
                />
              </div>
            </div>

            {/* Informations complémentaires */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Informations complémentaires
              </h2>
              <div className="space-y-4">
                <Input
                  label="Site web"
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  helperText="https://exemple.com"
                />

                <Textarea
                  label="Description de votre structure"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  helperText="Présentez brièvement votre structure et ses activités"
                  rows={4}
                />
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-4 pt-4">
              <Button type="submit" loading={loading} disabled={formData.domainesIntervention.length === 0}>
                Continuer
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
