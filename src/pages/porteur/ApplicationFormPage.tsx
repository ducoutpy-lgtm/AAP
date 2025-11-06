import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, addDoc, collection, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { AAP } from '../../types';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Stepper } from '../../components/ui/Stepper';
import { ArrowLeft, Upload, X } from 'lucide-react';

interface FormData {
  projectTitle: string;
  projectDescription: string;
  objectives: string;
  methodology: string;
  timeline: string;
  expectedImpact: string;
  budgetTotal: string;
  budgetBreakdown: string;
  teamMembers: string;
  partnersInvolved: string;
  riskManagement: string;
  sustainabilityPlan: string;
}

export default function ApplicationFormPage() {
  const { aapId } = useParams<{ aapId: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [aap, setAap] = useState<AAP | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [documents, setDocuments] = useState<File[]>([]);
  const [formData, setFormData] = useState<FormData>({
    projectTitle: '',
    projectDescription: '',
    objectives: '',
    methodology: '',
    timeline: '',
    expectedImpact: '',
    budgetTotal: '',
    budgetBreakdown: '',
    teamMembers: '',
    partnersInvolved: '',
    riskManagement: '',
    sustainabilityPlan: '',
  });

  const steps = [
    { label: 'Présentation', description: 'Titre et description' },
    { label: 'Objectifs', description: 'Buts du projet' },
    { label: 'Méthodologie', description: 'Approche et planning' },
    { label: 'Budget', description: 'Aspects financiers' },
    { label: 'Équipe', description: 'Partenaires et risques' },
    { label: 'Documents', description: 'Pièces jointes' },
    { label: 'Validation', description: 'Vérification' },
  ];

  useEffect(() => {
    if (aapId) {
      loadAap();
    }
  }, [aapId]);

  const loadAap = async () => {
    if (!aapId) return;

    try {
      const aapDoc = await getDoc(doc(db, 'aap', aapId));
      if (aapDoc.exists()) {
        setAap({ ...aapDoc.data() } as AAP);
      }
    } catch (err) {
      console.error('Error loading AAP:', err);
      setError('Erreur lors du chargement de l\'AAP');
    } finally {
      setLoading(false);
    }
  };

  const validateStep = (): boolean => {
    setError('');

    switch (currentStep) {
      case 0:
        if (!formData.projectTitle || formData.projectTitle.length < 10) {
          setError('Le titre doit contenir au moins 10 caractères');
          return false;
        }
        if (!formData.projectDescription || formData.projectDescription.length < 200) {
          setError('La description doit contenir au moins 200 caractères');
          return false;
        }
        break;
      case 1:
        if (!formData.objectives || formData.objectives.length < 100) {
          setError('Les objectifs doivent contenir au moins 100 caractères');
          return false;
        }
        break;
      case 2:
        if (!formData.methodology || formData.methodology.length < 150) {
          setError('La méthodologie doit contenir au moins 150 caractères');
          return false;
        }
        if (!formData.timeline || formData.timeline.length < 50) {
          setError('Le calendrier doit contenir au moins 50 caractères');
          return false;
        }
        break;
      case 3:
        if (!formData.budgetTotal || parseFloat(formData.budgetTotal) <= 0) {
          setError('Le budget total doit être supérieur à 0');
          return false;
        }
        if (!formData.budgetBreakdown || formData.budgetBreakdown.length < 50) {
          setError('La répartition du budget doit être détaillée');
          return false;
        }
        break;
      case 4:
        if (!formData.teamMembers || formData.teamMembers.length < 50) {
          setError('Veuillez décrire l\'équipe du projet');
          return false;
        }
        break;
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
    window.scrollTo(0, 0);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setDocuments([...documents, ...newFiles]);
    }
  };

  const removeDocument = (index: number) => {
    setDocuments(documents.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!currentUser || !aap || !aapId) return;

    setSubmitting(true);
    setError('');

    try {
      // Upload documents
      const uploadedDocuments: any[] = [];
      for (const file of documents) {
        const docRef = ref(
          storage,
          `uploads/applications/${currentUser.uid}/${Date.now()}_${file.name}`
        );
        await uploadBytes(docRef, file);
        const url = await getDownloadURL(docRef);
        uploadedDocuments.push({
          name: file.name,
          url,
          type: file.type,
          uploadedAt: new Date(),
        });
      }

      // Create application
      await addDoc(collection(db, 'applications'), {
        aapId,
        aapTitle: aap.title,
        porteurId: currentUser.uid,
        financeurId: aap.financeurId,
        projectTitle: formData.projectTitle,
        projectDescription: formData.projectDescription,
        objectives: formData.objectives,
        methodology: formData.methodology,
        timeline: formData.timeline,
        expectedImpact: formData.expectedImpact,
        budget: {
          total: parseFloat(formData.budgetTotal),
          breakdown: formData.budgetBreakdown,
        },
        teamMembers: formData.teamMembers,
        partnersInvolved: formData.partnersInvolved || '',
        riskManagement: formData.riskManagement || '',
        sustainabilityPlan: formData.sustainabilityPlan || '',
        documents: uploadedDocuments,
        status: 'submitted',
        submittedAt: Timestamp.now(),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      alert('Candidature soumise avec succès !');
      navigate('/mes-candidatures');
    } catch (err: any) {
      console.error('Error submitting application:', err);
      setError(err.message || 'Erreur lors de la soumission');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!aap) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">AAP non trouvé</h2>
          <Button onClick={() => navigate('/aap/search')}>
            Retour à la recherche
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <Button
          variant="ghost"
          onClick={() => navigate(`/aap/${aapId}`)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Candidater à: {aap.title}
          </h1>
          <p className="text-gray-600">
            Complétez tous les champs pour soumettre votre candidature
          </p>
        </div>

        {/* Stepper */}
        <Stepper steps={steps} currentStep={currentStep} />

        {/* Form */}
        <Card className="p-8">
          {error && (
            <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Step 0: Presentation */}
          {currentStep === 0 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titre du projet *
                </label>
                <Input
                  value={formData.projectTitle}
                  onChange={(e) =>
                    setFormData({ ...formData, projectTitle: e.target.value })
                  }
                  placeholder="Donnez un titre clair à votre projet"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Minimum 10 caractères
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description du projet *
                </label>
                <textarea
                  value={formData.projectDescription}
                  onChange={(e) =>
                    setFormData({ ...formData, projectDescription: e.target.value })
                  }
                  rows={8}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Décrivez votre projet de manière détaillée..."
                />
                <p className="text-sm text-gray-500 mt-1">
                  {formData.projectDescription.length} / 200 caractères minimum
                </p>
              </div>
            </div>
          )}

          {/* Step 1: Objectives */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Objectifs du projet *
                </label>
                <textarea
                  value={formData.objectives}
                  onChange={(e) =>
                    setFormData({ ...formData, objectives: e.target.value })
                  }
                  rows={8}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Quels sont les objectifs de votre projet ?"
                />
                <p className="text-sm text-gray-500 mt-1">
                  {formData.objectives.length} / 100 caractères minimum
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Impact attendu *
                </label>
                <textarea
                  value={formData.expectedImpact}
                  onChange={(e) =>
                    setFormData({ ...formData, expectedImpact: e.target.value })
                  }
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Quel sera l'impact de votre projet ?"
                />
              </div>
            </div>
          )}

          {/* Step 2: Methodology */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Méthodologie *
                </label>
                <textarea
                  value={formData.methodology}
                  onChange={(e) =>
                    setFormData({ ...formData, methodology: e.target.value })
                  }
                  rows={8}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Comment allez-vous réaliser ce projet ?"
                />
                <p className="text-sm text-gray-500 mt-1">
                  {formData.methodology.length} / 150 caractères minimum
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Calendrier de réalisation *
                </label>
                <textarea
                  value={formData.timeline}
                  onChange={(e) =>
                    setFormData({ ...formData, timeline: e.target.value })
                  }
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Décrivez le calendrier prévisionnel..."
                />
                <p className="text-sm text-gray-500 mt-1">
                  {formData.timeline.length} / 50 caractères minimum
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Budget */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Budget total demandé (€) *
                </label>
                <Input
                  type="number"
                  value={formData.budgetTotal}
                  onChange={(e) =>
                    setFormData({ ...formData, budgetTotal: e.target.value })
                  }
                  placeholder="50000"
                />
                {aap.budgetMin && aap.budgetMax && (
                  <p className="text-sm text-gray-500 mt-1">
                    Budget de cet AAP: {aap.budgetMin.toLocaleString()}€ -{' '}
                    {aap.budgetMax.toLocaleString()}€
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Répartition du budget *
                </label>
                <textarea
                  value={formData.budgetBreakdown}
                  onChange={(e) =>
                    setFormData({ ...formData, budgetBreakdown: e.target.value })
                  }
                  rows={8}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Détaillez la répartition du budget par poste de dépense..."
                />
              </div>
            </div>
          )}

          {/* Step 4: Team */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Équipe du projet *
                </label>
                <textarea
                  value={formData.teamMembers}
                  onChange={(e) =>
                    setFormData({ ...formData, teamMembers: e.target.value })
                  }
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Présentez les membres de l'équipe et leurs rôles..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Partenaires impliqués
                </label>
                <textarea
                  value={formData.partnersInvolved}
                  onChange={(e) =>
                    setFormData({ ...formData, partnersInvolved: e.target.value })
                  }
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Listez vos partenaires éventuels..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gestion des risques
                </label>
                <textarea
                  value={formData.riskManagement}
                  onChange={(e) =>
                    setFormData({ ...formData, riskManagement: e.target.value })
                  }
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Comment gérerez-vous les risques ?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Plan de pérennisation
                </label>
                <textarea
                  value={formData.sustainabilityPlan}
                  onChange={(e) =>
                    setFormData({ ...formData, sustainabilityPlan: e.target.value })
                  }
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Comment pérenniser le projet ?"
                />
              </div>
            </div>
          )}

          {/* Step 5: Documents */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Documents à joindre
                </label>
                {aap.requiredDocuments && aap.requiredDocuments.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <p className="text-sm font-medium text-blue-900 mb-2">
                      Documents requis:
                    </p>
                    <ul className="list-disc list-inside text-sm text-blue-800 space-y-1">
                      {aap.requiredDocuments.map((doc, index) => (
                        <li key={index}>{doc}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <label className="cursor-pointer">
                    <span className="text-primary-600 hover:text-primary-700 font-medium">
                      Cliquez pour uploader
                    </span>
                    <input
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                      accept=".pdf,.doc,.docx,.xls,.xlsx"
                    />
                  </label>
                  <p className="text-sm text-gray-500 mt-2">
                    PDF, DOC, DOCX, XLS, XLSX (max 10MB par fichier)
                  </p>
                </div>

                {documents.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {documents.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                      >
                        <span className="text-sm text-gray-700">{file.name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeDocument(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 6: Validation */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-4">
                  Récapitulatif de votre candidature
                </h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-blue-900">
                      Titre du projet:
                    </dt>
                    <dd className="text-sm text-blue-800 mt-1">
                      {formData.projectTitle}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-blue-900">
                      Budget demandé:
                    </dt>
                    <dd className="text-sm text-blue-800 mt-1">
                      {parseFloat(formData.budgetTotal).toLocaleString('fr-FR')}€
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-blue-900">
                      Documents joints:
                    </dt>
                    <dd className="text-sm text-blue-800 mt-1">
                      {documents.length} fichier{documents.length > 1 ? 's' : ''}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
                <p className="text-sm text-warning-800">
                  ⚠️ Une fois soumise, votre candidature ne pourra plus être modifiée.
                  Assurez-vous que toutes les informations sont correctes.
                </p>
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <Button
              variant="secondary"
              onClick={handleBack}
              disabled={currentStep === 0 || submitting}
            >
              Précédent
            </Button>

            {currentStep < steps.length - 1 ? (
              <Button onClick={handleNext}>Suivant</Button>
            ) : (
              <Button onClick={handleSubmit} disabled={submitting}>
                {submitting ? 'Envoi en cours...' : 'Soumettre la candidature'}
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
