// Formulaire de candidature (réécrit le 2026-10-20, retours de Monsieur DUCOUT : les six étapes et leurs champs
// « répartition du budget, gestion des risques, plan de pérennisation » n'avaient pas de sens pour un établissement ;
// le vrai dossier est le formulaire du financeur, joint à l'appel). Trois étapes : le projet en quelques lignes, le
// montant demandé, les pièces (le dossier de candidature rempli). Le pré-remplissage à partir du dossier PDF est le
// jour 5 du plan MVP.
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc, getDoc, addDoc, collection, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { ArrowLeft, Upload, X, FileText, ExternalLink } from 'lucide-react';
import { db, storage } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { AAP } from '../../types';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Stepper } from '../../components/ui/Stepper';
import { useMarquerDemarrage } from '../../hooks/useMarquerDemarrage';
import { libelleMontant } from '../../utils/candidat';
import { journaliser } from '../../services/journalService';

const ETAPES = [
  { label: 'Votre projet', description: 'Titre et résumé' },
  { label: 'Montant', description: 'Ce que vous demandez' },
  { label: 'Pièces', description: 'Le dossier rempli' },
];

export default function ApplicationFormPage() {
  const { aapId } = useParams<{ aapId: string }>();
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();
  useMarquerDemarrage('candidature');
  const [aap, setAap] = useState<AAP | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [etape, setEtape] = useState(0);
  const [titre, setTitre] = useState('');
  const [resume, setResume] = useState('');
  const [montant, setMontant] = useState('');
  const [documents, setDocuments] = useState<File[]>([]);

  useEffect(() => {
    if (!aapId) return;
    getDoc(doc(db, 'aap', aapId))
      .then(snap => setAap(snap.exists() ? (snap.data() as AAP) : null))
      .catch(err => console.error('Appel non chargé :', err))
      .finally(() => setLoading(false));
  }, [aapId]);

  const piecesExigees = (aap?.requiredDocuments?.length ?? 0) > 0 || (aap?.scrapeMetadata?.fichiersJoints?.length ?? 0) > 0;

  const etapeValide = (): boolean => {
    setError('');
    if (etape === 0) {
      if (titre.trim().length < 5) { setError('Donnez un titre à votre projet (cinq caractères au moins)'); return false; }
      if (resume.trim().length < 20) { setError('Résumez votre projet en quelques lignes (vingt caractères au moins)'); return false; }
    }
    if (etape === 1 && (!montant || parseFloat(montant) <= 0)) { setError('Indiquez le montant demandé, en euros'); return false; }
    if (etape === 2 && piecesExigees && documents.length === 0) {
      setError('Cet appel attend un dossier : joignez le dossier de candidature rempli (et les autres pièces demandées)');
      return false;
    }
    return true;
  };

  const ajouterFichiers = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setDocuments(prev => [...prev, ...Array.from(e.target.files!)]);
  };

  const envoyer = async () => {
    if (!currentUser || !aap || !aapId || !etapeValide()) return;
    setSubmitting(true);
    setError('');
    try {
      const pieces: { name: string; url: string; type: string; uploadedAt: Date }[] = [];
      for (const file of documents) {
        // Dossier autorisé par storage.rules : uploads/applications/<compte>/<fichier>
        const fichierRef = ref(storage, `uploads/applications/${currentUser.uid}/${Date.now()}_${file.name}`);
        await uploadBytes(fichierRef, file);
        pieces.push({ name: file.name, url: await getDownloadURL(fichierRef), type: file.type, uploadedAt: new Date() });
      }
      await addDoc(collection(db, 'applications'), {
        aapId,
        aapTitle: aap.title,
        porteurId: currentUser.uid,
        financeurId: aap.financeurId,
        projectTitle: titre.trim(),
        projectDescription: resume.trim(),
        objectives: '',
        methodology: '',
        timeline: '',
        expectedImpact: '',
        budget: { total: parseFloat(montant), breakdown: '' },
        documents: pieces,
        status: 'submitted',
        submittedAt: Timestamp.now(),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      if (userProfile) await journaliser(currentUser.uid, userProfile.userType, 'candidature', aapId, aap.title);
      navigate('/mes-candidatures', { state: { envoyee: { aapTitle: aap.title, financeurName: aap.financeurName || 'le financeur' } } });
    } catch (err) {
      console.error('Error submitting application:', err);
      const message = err instanceof Error ? err.message : '';
      setError(message.includes('storage/unauthorized')
        ? "Le dépôt du fichier a été refusé par le stockage (règles Storage non déployées) : prévenez l'administrateur, votre saisie est conservée"
        : message || "Erreur lors de l'envoi");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" /></div>;
  }
  if (!aap) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Appel introuvable</h2>
          <Button onClick={() => navigate('/aap/search')}>Retour à la recherche</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Button variant="ghost" onClick={() => navigate(`/aap/${aapId}`)} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour à l'appel
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Candidater : {aap.title}</h1>
          <p className="text-gray-600">{aap.financeurName} · {libelleMontant(aap)}</p>
        </div>

        <Stepper steps={ETAPES} currentStep={etape} />

        <Card className="p-8">
          {error && <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded-lg mb-6">{error}</div>}

          {etape === 0 && (
            <div className="space-y-6">
              <Input label="Titre du projet" value={titre} onChange={(e) => setTitre(e.target.value)} placeholder="Ex : Création d'une unité de soins palliatifs de 8 lits" required />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Résumé du projet <span className="text-error-500">*</span></label>
                <textarea
                  value={resume}
                  onChange={(e) => setResume(e.target.value)}
                  rows={6}
                  className="input-field"
                  placeholder="En quelques lignes : quoi, pour qui, où, quand. Le détail est dans le dossier de candidature joint à l'étape 3."
                />
              </div>
            </div>
          )}

          {etape === 1 && (
            <div className="space-y-4">
              <Input label="Montant demandé (euros)" type="number" min="0" value={montant} onChange={(e) => setMontant(e.target.value)} required helperText={`L'appel annonce : ${libelleMontant(aap)}`} />
            </div>
          )}

          {etape === 2 && (
            <div className="space-y-6">
              {(aap.scrapeMetadata?.fichiersJoints?.length ?? 0) > 0 && (
                <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-primary-900 mb-2">Le dossier de candidature de l'appel, à remplir puis à joindre ici :</p>
                  <ul className="space-y-1">
                    {aap.scrapeMetadata!.fichiersJoints!.map((f, i) => (
                      <li key={i}>
                        <a href={f.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary-700 hover:underline inline-flex items-center gap-1">
                          <ExternalLink className="h-4 w-4" />{decodeURIComponent(f.filename)}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {(aap.requiredDocuments?.length ?? 0) > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-blue-900 mb-2">Pièces demandées par le financeur :</p>
                  <ul className="list-disc list-inside text-sm text-blue-800 space-y-1">
                    {aap.requiredDocuments!.map((d, i) => <li key={i}>{d}</li>)}
                  </ul>
                </div>
              )}
              <label className="block border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-primary-400">
                <Upload className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                <span className="text-sm text-gray-700">Cliquez pour joindre vos fichiers (PDF, Word, Excel)</span>
                <input type="file" multiple className="hidden" onChange={ajouterFichiers} accept=".pdf,.doc,.docx,.xls,.xlsx,.odt,.ods" />
              </label>
              {documents.length > 0 && (
                <ul className="space-y-2">
                  {documents.map((f, i) => (
                    <li key={i} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 text-sm">
                      <span className="flex items-center gap-2 text-gray-800"><FileText className="h-4 w-4" />{f.name} <span className="text-gray-400">({(f.size / 1024).toFixed(0)} Ko)</span></span>
                      <button type="button" onClick={() => setDocuments(documents.filter((_, j) => j !== i))} aria-label={`Retirer ${f.name}`} className="text-gray-400 hover:text-error-600"><X className="h-4 w-4" /></button>
                    </li>
                  ))}
                </ul>
              )}
              <div className="border-t pt-4 text-sm text-gray-700">
                <p className="font-medium text-gray-900 mb-1">Récapitulatif</p>
                <p>{titre} · {montant ? `${Number(montant).toLocaleString('fr-FR')} €` : ''} · {documents.length} pièce{documents.length > 1 ? 's' : ''}</p>
                <p className="text-gray-500 mt-1">Une fois envoyée, la candidature n'est plus modifiable ; vous la suivez dans <Link to="/mes-candidatures" className="text-primary-600 hover:underline">Mes candidatures</Link>.</p>
              </div>
            </div>
          )}

          <div className="flex justify-between mt-8 pt-6 border-t">
            <Button variant="secondary" onClick={() => { setError(''); setEtape(etape - 1); }} disabled={etape === 0 || submitting}>Précédent</Button>
            {etape < ETAPES.length - 1 ? (
              <Button onClick={() => { if (etapeValide()) { setEtape(etape + 1); window.scrollTo(0, 0); } }}>Suivant</Button>
            ) : (
              <Button onClick={envoyer} loading={submitting}>Envoyer la candidature</Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
