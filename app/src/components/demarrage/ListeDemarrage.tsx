// Carte « Démarrer (n/4) » des tableaux de bord (changement liste-demarrage, 2026-10-20, point 2 du relevé
// helloDarwin) : quatre actions cochées au fil des pages ouvertes ; la première ouvre une fenêtre courte qui précise le
// profil. La carte disparaît quand tout est fait.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { CheckCircle2, Circle } from 'lucide-react';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { anneeOuvertureValide, etatDemarrage, OBJETS_PROJET, RAYONS_ACTION } from './demarrage';

export function ListeDemarrage() {
  const { currentUser, userProfile, refreshUserProfile } = useAuth();
  const [fenetre, setFenetre] = useState(false);
  const [enregistrement, setEnregistrement] = useState(false);
  const [erreur, setErreur] = useState('');
  // Champs du porteur
  const [objets, setObjets] = useState<string[]>([]);
  const [annee, setAnnee] = useState('');
  const [rayon, setRayon] = useState('');
  // Champs du financeur
  const [site, setSite] = useState('');
  const [presentation, setPresentation] = useState('');

  if (!currentUser || !userProfile || userProfile.userType === 'admin') return null;
  const role = userProfile.userType;
  const etat = etatDemarrage(role, userProfile);
  if (etat.termine) return null;

  const enregistrerProfil = async () => {
    setErreur('');
    setEnregistrement(true);
    try {
      if (role === 'porteur') {
        await setDoc(doc(db, 'porteurProfiles', currentUser.uid), {
          objetsProjet: objets,
          anneeOuverture: anneeOuvertureValide(annee),
          rayonAction: rayon || null,
          updatedAt: Timestamp.now(),
        }, { merge: true });
      } else {
        await setDoc(doc(db, 'financeurProfiles', currentUser.uid), {
          website: site.trim() || null,
          description: presentation.trim() || null,
          updatedAt: Timestamp.now(),
        }, { merge: true });
      }
      await setDoc(doc(db, 'users', currentUser.uid), { demarrage: { profil: true } }, { merge: true });
      await refreshUserProfile();
      setFenetre(false);
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Erreur lors de l'enregistrement");
    } finally {
      setEnregistrement(false);
    }
  };

  return (
    <>
      <Card className="mb-8 border-2 border-primary-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Démarrer ({etat.faites}/{etat.total})</h3>
          <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-primary-600" style={{ width: `${(etat.faites / etat.total) * 100}%` }} />
          </div>
        </div>
        <ul className="space-y-2">
          {etat.actions.map(a => (
            <li key={a.cle} className="flex items-center gap-3 text-sm">
              {a.faite
                ? <CheckCircle2 className="h-5 w-5 text-success-500 flex-shrink-0" />
                : <Circle className="h-5 w-5 text-gray-300 flex-shrink-0" />}
              {a.faite ? (
                <span className="text-gray-500 line-through">{a.libelle}</span>
              ) : a.lien ? (
                <Link to={a.lien} className="text-primary-600 hover:underline">{a.libelle}</Link>
              ) : (
                <button type="button" onClick={() => setFenetre(true)} className="text-primary-600 hover:underline">
                  {a.libelle}
                </button>
              )}
            </li>
          ))}
        </ul>
      </Card>

      <Modal
        isOpen={fenetre}
        onClose={() => setFenetre(false)}
        title={role === 'porteur' ? 'Adaptez la recherche à votre structure' : 'Présentez votre organisation'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setFenetre(false)} disabled={enregistrement}>Plus tard</Button>
            <Button onClick={enregistrerProfil} loading={enregistrement}>Enregistrer</Button>
          </>
        }
      >
        {erreur && <div className="mb-4 p-3 bg-error-50 border border-error-200 rounded-lg text-error-600 text-sm">{erreur}</div>}
        {role === 'porteur' ? (
          <div className="space-y-4">
            <div>
              <p className="block text-sm font-medium text-gray-700 mb-2">Objets de vos projets</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {OBJETS_PROJET.map(o => (
                  <label key={o.value} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={objets.includes(o.value)}
                      onChange={() => setObjets(prev => prev.includes(o.value) ? prev.filter(v => v !== o.value) : [...prev, o.value])}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">{o.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Input label="Année d'ouverture" value={annee} onChange={(e) => setAnnee(e.target.value)} maxLength={4} inputMode="numeric" helperText="Ex : 1998" />
              <Select label="Rayon d'action" value={rayon} onChange={(e) => setRayon(e.target.value)} options={RAYONS_ACTION} />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Input label="Site web" type="url" value={site} onChange={(e) => setSite(e.target.value)} helperText="https://exemple.fr" />
            <Textarea label="Présentation courte" value={presentation} onChange={(e) => setPresentation(e.target.value)} rows={3} helperText="Visible par les porteurs de projets" />
          </div>
        )}
      </Modal>
    </>
  );
}
