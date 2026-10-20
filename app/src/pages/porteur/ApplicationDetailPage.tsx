// Détail d'une candidature pour le candidat (changement parcours-candidat-jour-1, 2026-10-20) : la liste renvoyait
// vers une page inexistante. Page mince : lecture du document, vérification du propriétaire, affichage.
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { ExternalLink, FileText } from 'lucide-react';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import type { Application, ApplicationStatus } from '../../types';
import { enDate } from '../../utils/dates';
import { LIBELLES_STATUT_CANDIDATURE } from '../../utils/candidat';
import { euros } from '../../utils/recherche';

const VARIANT: Record<ApplicationStatus, 'primary' | 'success' | 'warning' | 'error' | 'gray'> = {
  draft: 'gray', submitted: 'primary', under_review: 'warning', pending_info: 'warning', accepted: 'success', rejected: 'error',
};

// Le formulaire enregistre certains champs sous une forme plus simple que le type (texte au lieu de liste) : on lit
// les deux formes sans rien supposer.
type Dossier = Omit<Application, 'budget' | 'team' | 'documents'> & {
  budget?: { total?: number; breakdown?: string | unknown[] };
  teamMembers?: string;
  partnersInvolved?: string;
  riskManagement?: string;
  sustainabilityPlan?: string;
  documents?: { name: string; url: string }[];
};

const dateFr = (v: Timestamp | Date | null | undefined) => enDate(v)?.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) ?? '';

export default function ApplicationDetailPage() {
  const { applicationId } = useParams<{ applicationId: string }>();
  const { currentUser } = useAuth();
  const [dossier, setDossier] = useState<Dossier | null>(null);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    if (!applicationId) return;
    getDoc(doc(db, 'applications', applicationId))
      .then(snap => setDossier(snap.exists() ? (snap.data() as Dossier) : null))
      .catch(() => setDossier(null))
      .finally(() => setChargement(false));
  }, [applicationId]);

  if (chargement) return <LoadingSpinner fullScreen />;

  if (!dossier || !currentUser || dossier.porteurId !== currentUser.uid) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Candidature introuvable</h1>
          <Link to="/mes-candidatures" className="text-primary-600 hover:underline">Retour à mes candidatures</Link>
        </div>
      </div>
    );
  }

  const statut = dossier.status;
  const sections: [string, string | undefined][] = [
    ['Description du projet', dossier.projectDescription],
    ['Objectifs', dossier.objectives],
    ['Méthodologie', dossier.methodology],
    ['Calendrier', dossier.timeline],
    ['Impact attendu', dossier.expectedImpact],
    ['Équipe', dossier.teamMembers],
    ['Partenaires', dossier.partnersInvolved],
    ['Risques', dossier.riskManagement],
    ['Pérennité', dossier.sustainabilityPlan],
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <Card className="p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <Badge variant={VARIANT[statut] ?? 'gray'}>{LIBELLES_STATUT_CANDIDATURE[statut] ?? statut}</Badge>
              <h1 className="text-3xl font-bold text-gray-900 mt-3">{dossier.projectTitle}</h1>
              <p className="text-gray-600 mt-1">
                Pour l'appel{' '}
                <Link to={`/aap/${dossier.aapId}`} className="text-primary-600 hover:underline">{dossier.aapTitle ?? 'voir la fiche'}</Link>
              </p>
            </div>
            <div className="text-sm text-gray-600 text-right">
              {dossier.submittedAt && <p>Envoyée le {dateFr(dossier.submittedAt)}</p>}
              {dossier.budget?.total != null && <p className="mt-1">Budget demandé : <span className="font-semibold text-gray-900">{euros(dossier.budget.total)}</span></p>}
            </div>
          </div>

          {statut === 'submitted' && (
            <p className="mt-6 text-sm text-gray-600 bg-primary-50 border border-primary-200 rounded-lg p-3">
              Le financeur a reçu votre dossier. Le statut passera à « En cours d'examen » quand il l'ouvrira, puis à
              « Acceptée », « Refusée » ou « Complément demandé » ; vous serez prévenu par une alerte.
            </p>
          )}
          {(dossier.financeurComments || dossier.financeurNotes) && (
            <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="font-medium text-gray-900 mb-1">Retour du financeur</p>
              <p className="text-gray-700 whitespace-pre-wrap">{dossier.financeurComments || dossier.financeurNotes}</p>
            </div>
          )}
        </Card>

        {dossier.statusHistory && dossier.statusHistory.length > 0 && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Historique</h2>
            <ul className="space-y-2 text-sm text-gray-700">
              {dossier.statusHistory.map((h, i) => (
                <li key={i}>
                  {dateFr(h.changedAt)} : {LIBELLES_STATUT_CANDIDATURE[h.status] ?? h.status}{h.comment ? ` (${h.comment})` : ''}
                </li>
              ))}
            </ul>
          </Card>
        )}

        {sections.filter(([, v]) => v).map(([titre, valeur]) => (
          <Card key={titre} className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">{titre}</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{valeur}</p>
          </Card>
        ))}

        {dossier.budget?.breakdown && typeof dossier.budget.breakdown === 'string' && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Répartition du budget</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{dossier.budget.breakdown}</p>
          </Card>
        )}

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary-600" />
            Pièces jointes
          </h2>
          {dossier.documents && dossier.documents.length > 0 ? (
            <ul className="space-y-2">
              {dossier.documents.map((d, i) => (
                <li key={i}>
                  <a href={d.url} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline inline-flex items-center gap-1">
                    <ExternalLink className="h-4 w-4" />{d.name}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 italic">Aucune pièce jointe</p>
          )}
        </Card>
      </div>
    </div>
  );
}
