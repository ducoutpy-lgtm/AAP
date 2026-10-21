// Page Testeurs de l'administration (jour 4 du plan MVP, changement suivi-testeurs, 2026-10-21) : qui utilise
// l'application et ce que chacun y fait, d'après la collection journal.
import { useEffect, useState } from 'react';
import { collection, getDocs, limit, orderBy, query } from 'firebase/firestore';
import { Users } from 'lucide-react';
import { db } from '../../config/firebase';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import type { User, UserType } from '../../types';
import { enDate } from '../../utils/dates';
import { chiffresDepuis, dateLigne, LIBELLES_ACTIONS, resumerParCompte, type CompteSuivi, type LigneJournal, type ResumeCompte } from '../../utils/journal';

const ROLES: Record<UserType, string> = { porteur: 'Candidat', financeur: 'Financeur', admin: 'Administrateur' };
const dateFr = (d: Date | null) => (d ? d.toLocaleDateString('fr-FR') : '-');
const dateHeureFr = (d: Date) => d.toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

export default function TesteursPage() {
  const [resumes, setResumes] = useState<ResumeCompte[]>([]);
  const [journal, setJournal] = useState<LigneJournal[]>([]);
  const [ouvert, setOuvert] = useState<string | null>(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [utilisateurs, porteurs, financeurs, lignes] = await Promise.all([
          getDocs(collection(db, 'users')),
          getDocs(collection(db, 'porteurProfiles')),
          getDocs(collection(db, 'financeurProfiles')),
          getDocs(query(collection(db, 'journal'), orderBy('le', 'desc'), limit(5000))),
        ]);
        const structures = new Map<string, string>();
        porteurs.docs.forEach(d => structures.set(d.id, d.data().structureName ?? ''));
        financeurs.docs.forEach(d => structures.set(d.id, d.data().organisationName ?? ''));
        const comptes: CompteSuivi[] = utilisateurs.docs
          .map(d => ({ ...(d.data() as User), uid: d.id }))
          .filter(u => u.userType !== 'admin')
          .map(u => ({ uid: u.uid, email: u.email, role: u.userType, structure: structures.get(u.uid) ?? '', inscritLe: enDate(u.createdAt) }));
        const j = lignes.docs.map(d => ({ id: d.id, ...(d.data() as Omit<LigneJournal, 'id'>) }));
        setJournal(j);
        setResumes(resumerParCompte(comptes, j));
      } catch (err) {
        console.error('Suivi des testeurs non chargé :', err);
        setErreur(err instanceof Error ? err.message : 'Chargement impossible');
      } finally {
        setChargement(false);
      }
    })();
  }, []);

  if (chargement) return <LoadingSpinner fullScreen />;

  const semaine = chiffresDepuis(journal, new Date(Date.now() - 7 * 24 * 3600 * 1000));

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-1 flex items-center gap-2"><Users className="h-7 w-7 text-primary-600" />Testeurs</h1>
          <p className="text-gray-600">{resumes.length} compte{resumes.length > 1 ? 's' : ''} candidat ou financeur, {journal.length} action{journal.length > 1 ? 's' : ''} journalisée{journal.length > 1 ? 's' : ''}</p>
        </div>
        {erreur && <div className="mb-6 p-4 bg-error-50 border border-error-200 rounded-lg text-error-600 text-sm">{erreur}</div>}

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {([['Comptes actifs (7 jours)', semaine.comptesActifs], ['Connexions', semaine.connexions], ['Recherches', semaine.recherches],
            ['Fiches ouvertes', semaine.fiches], ['Candidatures', semaine.candidatures]] as const).map(([libelle, valeur]) => (
            <Card key={libelle} className="!p-4">
              <p className="text-sm text-gray-600">{libelle}</p>
              <p className="text-2xl font-bold text-gray-900">{valeur}</p>
            </Card>
          ))}
        </div>

        <Card className="!p-0 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-600">
              <tr>
                <th className="px-4 py-3">Compte</th>
                <th className="px-4 py-3">Rôle</th>
                <th className="px-4 py-3">Structure</th>
                <th className="px-4 py-3">Inscrit le</th>
                <th className="px-4 py-3">Dernière connexion</th>
                <th className="px-4 py-3 text-right">Connexions</th>
                <th className="px-4 py-3 text-right">Recherches</th>
                <th className="px-4 py-3 text-right">Fiches</th>
                <th className="px-4 py-3 text-right">Candidatures</th>
                <th className="px-4 py-3 text-right">Appels</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {resumes.map(r => (
                <>
                  <tr key={r.uid} onClick={() => setOuvert(ouvert === r.uid ? null : r.uid)} className={`cursor-pointer hover:bg-gray-50 ${ouvert === r.uid ? 'bg-primary-50' : ''}`}>
                    <td className="px-4 py-3 text-gray-900">{r.email || <span className="text-gray-400">(sans adresse)</span>}</td>
                    <td className="px-4 py-3"><Badge variant={r.role === 'financeur' ? 'primary' : 'gray'}>{ROLES[r.role]}</Badge></td>
                    <td className="px-4 py-3 text-gray-700">{r.structure || '-'}</td>
                    <td className="px-4 py-3 text-gray-700">{dateFr(r.inscritLe)}</td>
                    <td className="px-4 py-3 text-gray-700">{r.derniereConnexion ? dateHeureFr(r.derniereConnexion) : 'jamais'}</td>
                    <td className="px-4 py-3 text-right">{r.connexions}</td>
                    <td className="px-4 py-3 text-right">{r.recherches}</td>
                    <td className="px-4 py-3 text-right">{r.fiches}</td>
                    <td className="px-4 py-3 text-right">{r.candidatures}</td>
                    <td className="px-4 py-3 text-right">{r.appels}</td>
                  </tr>
                  {ouvert === r.uid && (
                    <tr key={`${r.uid}-detail`}>
                      <td colSpan={10} className="px-6 py-4 bg-gray-50">
                        {r.dernieres.length === 0 ? (
                          <p className="text-gray-500">Aucune action journalisée pour ce compte.</p>
                        ) : (
                          <ul className="space-y-1 text-gray-700">
                            {r.dernieres.map((l, i) => (
                              <li key={l.id ?? i} className="flex gap-3">
                                <span className="text-gray-500 w-28 flex-shrink-0">{dateHeureFr(dateLigne(l))}</span>
                                <span className="font-medium w-44 flex-shrink-0">{LIBELLES_ACTIONS[l.action] ?? l.action}</span>
                                <span className="truncate">{l.libelle || l.cible || ''}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
          {resumes.length === 0 && <p className="p-6 text-gray-500">Aucun compte candidat ou financeur.</p>}
        </Card>
      </div>
    </div>
  );
}
