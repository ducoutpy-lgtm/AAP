// Page « Appels externes » de l'administration (changement suivi-couts-externes, 2026-10-21) : chaque appel à un
// service payant (Haiku aujourd'hui), ce qu'il a coûté, et le coût par appel qualifié.
import { useEffect, useState } from 'react';
import { collection, getDocs, limit, orderBy, query, where } from 'firebase/firestore';
import { Coins } from 'lucide-react';
import { db } from '../../config/firebase';
import { Card } from '../../components/ui/Card';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { coutParFicheQualifiee, cumuls, dateCout, euros3, libelleEtape, parCle, parSemaine, PLAFOND_EUROS, type LigneCout } from '../../utils/couts';
import { visiblePubliquement } from '../../utils/relecture';

export default function CoutsExternesPage() {
  const [lignes, setLignes] = useState<LigneCout[]>([]);
  const [fichesQualifiees, setFichesQualifiees] = useState(0);
  const [etape, setEtape] = useState('');
  const [modele, setModele] = useState('');
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [couts, aaps] = await Promise.all([
          getDocs(query(collection(db, 'coutsIa'), orderBy('le', 'desc'), limit(10000))),
          getDocs(query(collection(db, 'aap'), where('status', '==', 'published'))),
        ]);
        // Les lignes écrites par la fonction serveur avant le 2026-10-21 n'ont que « fonction » : on la lit comme étape
        setLignes(couts.docs.map(d => {
          const x = d.data() as Omit<LigneCout, 'id'> & { fonction?: string };
          return { id: d.id, ...x, source: x.source ?? 'application', etape: x.etape ?? x.fonction ?? 'inconnue' };
        }));
        setFichesQualifiees(aaps.docs.filter(d => visiblePubliquement(d.data())).length);
      } catch (err) {
        console.error('Coûts non chargés :', err);
        setErreur(err instanceof Error ? err.message : 'Chargement impossible');
      } finally {
        setChargement(false);
      }
    })();
  }, []);

  if (chargement) return <LoadingSpinner fullScreen />;

  const c = cumuls(lignes);
  const etapes = parCle(lignes, l => l.etape);
  const modeles = parCle(lignes, l => l.modele);
  const semaines = parSemaine(lignes).slice(-12);
  const maxSemaine = Math.max(...semaines.map(s => s.cout), 0.000001);
  const parFiche = coutParFicheQualifiee(c.total, fichesQualifiees);
  const filtrees = lignes.filter(l => (!etape || l.etape === etape) && (!modele || l.modele === modele)).slice(0, 200);
  const partMois = Math.min(100, (c.mois / PLAFOND_EUROS) * 100);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-1 flex items-center gap-2"><Coins className="h-7 w-7 text-primary-600" />Appels externes</h1>
          <p className="text-gray-600">Chaque appel à un service payant (modèle Anthropic), depuis la chaîne de collecte et depuis l'application.</p>
        </div>
        {erreur && <div className="mb-6 p-4 bg-error-50 border border-error-200 rounded-lg text-error-600 text-sm">{erreur}</div>}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="!p-4"><p className="text-sm text-gray-600">Cumul depuis le début</p><p className="text-2xl font-bold text-gray-900">{euros3(c.total)}</p><p className="text-xs text-gray-500">{c.appels.toLocaleString('fr-FR')} appels</p></Card>
          <Card className="!p-4">
            <p className="text-sm text-gray-600">Mois en cours, plafond {PLAFOND_EUROS} €</p>
            <p className="text-2xl font-bold text-gray-900">{euros3(c.mois)}</p>
            <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden"><div className={`h-full ${partMois > 80 ? 'bg-error-500' : 'bg-primary-600'}`} style={{ width: `${partMois}%` }} /></div>
            <p className="text-xs text-gray-500 mt-1">{c.appelsMois.toLocaleString('fr-FR')} appels ce mois</p>
          </Card>
          <Card className="!p-4"><p className="text-sm text-gray-600">Appels qualifiés visibles</p><p className="text-2xl font-bold text-gray-900">{fichesQualifiees}</p><p className="text-xs text-gray-500">fiches publiées et validées</p></Card>
          <Card className="!p-4"><p className="text-sm text-gray-600">Coût par appel qualifié</p><p className="text-2xl font-bold text-gray-900">{parFiche === null ? '-' : euros3(parFiche)}</p><p className="text-xs text-gray-500">cumul rapporté aux fiches visibles</p></Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Par étape</h2>
            <ul className="divide-y divide-gray-100 text-sm">
              {etapes.map(e => (
                <li key={e.cle} className="py-2 flex justify-between gap-3"><span className="text-gray-700">{libelleEtape(e.cle)} <span className="text-gray-400">({e.appels})</span></span><span className="font-medium text-gray-900">{euros3(e.cout)}</span></li>
              ))}
            </ul>
          </Card>
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Par modèle</h2>
            <ul className="divide-y divide-gray-100 text-sm">
              {modeles.map(m => (
                <li key={m.cle} className="py-2 flex justify-between gap-3"><span className="text-gray-700">{m.cle} <span className="text-gray-400">({m.appels})</span></span><span className="font-medium text-gray-900">{euros3(m.cout)}</span></li>
              ))}
            </ul>
          </Card>
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Par semaine (douze dernières)</h2>
            <ul className="space-y-1 text-xs">
              {semaines.map(s => (
                <li key={s.semaine} className="flex items-center gap-2">
                  <span className="w-20 text-gray-500">{s.semaine.slice(5)}</span>
                  <div className="flex-1 h-3 bg-gray-100 rounded"><div className="h-full bg-primary-500 rounded" style={{ width: `${(s.cout / maxSemaine) * 100}%` }} /></div>
                  <span className="w-20 text-right text-gray-700">{euros3(s.cout)}</span>
                </li>
              ))}
              {semaines.length === 0 && <li className="text-gray-500">Aucun appel enregistré</li>}
            </ul>
          </Card>
        </div>

        <Card className="!p-0">
          <div className="p-4 flex flex-wrap items-center gap-3 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Derniers appels</h2>
            <select value={etape} onChange={e => setEtape(e.target.value)} className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm">
              <option value="">Toutes les étapes</option>
              {etapes.map(e => <option key={e.cle} value={e.cle}>{libelleEtape(e.cle)}</option>)}
            </select>
            <select value={modele} onChange={e => setModele(e.target.value)} className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm">
              <option value="">Tous les modèles</option>
              {modeles.map(m => <option key={m.cle} value={m.cle}>{m.cle}</option>)}
            </select>
            <span className="text-sm text-gray-500">{filtrees.length} affichés sur {lignes.length}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-left text-gray-600">
                <tr><th className="px-4 py-2">Date</th><th className="px-4 py-2">Étape</th><th className="px-4 py-2">Modèle</th><th className="px-4 py-2">Origine</th><th className="px-4 py-2">Cible</th><th className="px-4 py-2 text-right">Tokens</th><th className="px-4 py-2 text-right">Coût</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtrees.map((l, i) => (
                  <tr key={l.id ?? i}>
                    <td className="px-4 py-2 text-gray-700 whitespace-nowrap">{dateCout(l).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })}</td>
                    <td className="px-4 py-2 text-gray-700">{libelleEtape(l.etape)}</td>
                    <td className="px-4 py-2 text-gray-700">{l.modele}</td>
                    <td className="px-4 py-2 text-gray-700">{l.origine || (l.source === 'application' ? 'application' : '')}</td>
                    <td className="px-4 py-2 text-gray-500 max-w-xs truncate" title={l.cible}>{l.cible}</td>
                    <td className="px-4 py-2 text-right text-gray-700">{((l.tokensEntree ?? 0) + (l.tokensSortie ?? 0)).toLocaleString('fr-FR')}</td>
                    <td className="px-4 py-2 text-right font-medium text-gray-900">{euros3(l.coutEuros)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
