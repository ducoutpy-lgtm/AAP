import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { Target, Upload } from 'lucide-react';

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

const ORGANISATION_TYPES = [
  { value: 'ministere', label: 'Ministère' },
  { value: 'agence', label: 'Agence d\'État' },
  { value: 'fondation', label: 'Fondation' },
  { value: 'entreprise', label: 'Entreprise' },
  { value: 'collectivite', label: 'Collectivité territoriale' },
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

export default function CompleteFinanceurProfile() {
  const { currentUser, refreshUserProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');

  const [formData, setFormData] = useState({
    organisationName: '',
    organisationType: '',
    sectorsSupported: [] as string[],
    city: '',
    postalCode: '',
    region: '',
    firstName: '',
    lastName: '',
    phone: '',
    position: '',
    website: '',
    description: '',
  });

  const handleSectorChange = (sector: string) => {
    setFormData(prev => ({
      ...prev,
      sectorsSupported: prev.sectorsSupported.includes(sector)
        ? prev.sectorsSupported.filter(s => s !== sector)
        : [...prev.sectorsSupported, sector],
    }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('Le fichier doit faire moins de 2 Mo');
        return;
      }
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!currentUser) throw new Error('Non authentifié');

      let logoUrl = null;

      // Upload du logo si présent
      if (logoFile) {
        const logoRef = ref(storage, `uploads/logos/financeurs/${currentUser.uid}/${logoFile.name}`);
        await uploadBytes(logoRef, logoFile);
        logoUrl = await getDownloadURL(logoRef);
      }

      // Sauvegarder le profil financeur
      await setDoc(doc(db, 'financeurProfiles', currentUser.uid), {
        userId: currentUser.uid,
        organisationName: formData.organisationName,
        organisationType: formData.organisationType,
        sectorsSupported: formData.sectorsSupported,
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
          position: formData.position || null,
        },
        website: formData.website || null,
        logo: logoUrl,
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
          <Target className="h-12 w-12 text-secondary-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Complétez votre profil financeur
          </h1>
          <p className="text-gray-600">
            Ces informations seront visibles par les porteurs de projets
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
            {/* Informations sur l'organisation */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Informations sur votre organisation
              </h2>
              <div className="space-y-4">
                <Input
                  label="Nom de l'organisation"
                  value={formData.organisationName}
                  onChange={(e) => setFormData({ ...formData, organisationName: e.target.value })}
                  required
                />

                <Select
                  label="Type d'organisation"
                  value={formData.organisationType}
                  onChange={(e) => setFormData({ ...formData, organisationType: e.target.value })}
                  options={ORGANISATION_TYPES}
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Secteurs financés <span className="text-error-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {SECTEURS.map((secteur) => (
                      <label key={secteur.value} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.sectorsSupported.includes(secteur.value)}
                          onChange={() => handleSectorChange(secteur.value)}
                          className="rounded border-gray-300 text-secondary-600 focus:ring-secondary-500"
                        />
                        <span className="text-sm text-gray-700">{secteur.label}</span>
                      </label>
                    ))}
                  </div>
                  {formData.sectorsSupported.length === 0 && (
                    <p className="mt-1 text-sm text-error-500">
                      Sélectionnez au moins un secteur
                    </p>
                  )}
                </div>

                {/* Logo upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Logo de l'organisation
                  </label>
                  <div className="flex items-center gap-4">
                    {logoPreview && (
                      <img
                        src={logoPreview}
                        alt="Logo preview"
                        className="h-20 w-20 object-contain border rounded"
                      />
                    )}
                    <label className="cursor-pointer">
                      <div className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg border border-gray-300 inline-flex items-center gap-2">
                        <Upload className="h-4 w-4" />
                        <span className="text-sm">Choisir un fichier</span>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    Format: PNG, JPG - Max: 2 Mo
                  </p>
                </div>
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
                  label="Fonction"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  helperText="Ex: Responsable des projets"
                />

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
                  label="Description de votre organisation"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  helperText="Présentez brièvement votre organisation et sa mission"
                  rows={4}
                />
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-4 pt-4">
              <Button type="submit" loading={loading} disabled={formData.sectorsSupported.length === 0}>
                Continuer
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
