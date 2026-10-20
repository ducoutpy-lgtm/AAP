// Gabarit commun à toutes les pages (changement navigation-et-pages-publiques, 2026-10-20). Deux habillages d'après le
// compte : public (en-tête, contenu, pied de page) ou connecté avec profil complet (barre latérale repliable façon
// helloDarwin, barre haute, contenu, pied de page). Pourquoi d'après le profil complet : pendant le parcours
// d'intégration, le menu complet n'a pas encore de sens.
import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, ChevronLeft, ChevronRight, LogOut, Target, UserCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { entreeActive, entreesMenu, tableauDeBord } from './menus';

const CLE_REPLI = 'aap-menu-replie';

function lireRepli(): boolean {
  try {
    return localStorage.getItem(CLE_REPLI) === '1';
  } catch {
    return false;
  }
}

// Chaque changement de page s'affiche depuis le haut (retour de Monsieur DUCOUT : les pages légales s'ouvraient en bas)
function RemonterEnHaut() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

// Retour : page précédente s'il y en a une, sinon l'accueil ou le tableau de bord
function BoutonRetour({ versDefaut }: { versDefaut: string }) {
  const navigate = useNavigate();
  const retour = () => (window.history.length > 1 ? navigate(-1) : navigate(versDefaut));
  return (
    <button type="button" onClick={retour} className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900">
      <ArrowLeft className="h-4 w-4" />
      Retour
    </button>
  );
}

const LIENS_PUBLICS = [
  { libelle: 'Voir les appels', adresse: '/aap/search' },
  { libelle: 'Fonctionnalités', adresse: '/fonctionnalites' },
  { libelle: 'Tarifs', adresse: '/tarifs' },
  { libelle: 'FAQ', adresse: '/faq' },
  { libelle: 'Contact', adresse: '/contact' },
];

function EnTetePublic() {
  const { pathname } = useLocation();
  const { currentUser, userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const espace = userProfile ? tableauDeBord(userProfile.userType) : '/complete-profile';
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="container mx-auto px-4 py-3 flex flex-wrap items-center gap-x-6 gap-y-2">
        {pathname !== '/' && <BoutonRetour versDefaut="/" />}
        <Link to="/" className="flex items-center gap-2">
          <Target className="h-7 w-7 text-primary-600" />
          <span className="text-xl font-bold text-gray-900">AAP Santé</span>
        </Link>
        <nav className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm">
          {LIENS_PUBLICS.map(l => (
            <NavLink
              key={l.adresse}
              to={l.adresse}
              className={({ isActive }) => (isActive ? 'text-primary-700 font-medium' : 'text-gray-700 hover:text-primary-600')}
            >
              {l.libelle}
            </NavLink>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-4 text-sm">
          {currentUser ? (
            <>
              <Link to={espace} className="text-primary-700 font-medium hover:underline">Mon espace</Link>
              <button type="button" onClick={() => logout().then(() => navigate('/'))} className="text-gray-600 hover:text-gray-900">
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-gray-700 hover:text-primary-600">Connexion</Link>
              <Link to="/signup" className="bg-primary-600 hover:bg-primary-700 text-white px-3 py-1.5 rounded-lg font-medium">
                Créer un compte
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export function PiedDePage() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-10 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Target className="h-6 w-6 text-primary-400" />
              <span className="text-lg font-bold text-white">AAP Santé</span>
            </div>
            <p className="text-sm">Les appels à projets de la santé et du médico-social, en un seul endroit.</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Produit</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/aap/search" className="hover:text-white">Voir les appels</Link></li>
              <li><Link to="/fonctionnalites" className="hover:text-white">Fonctionnalités</Link></li>
              <li><Link to="/tarifs" className="hover:text-white">Tarifs</Link></li>
              <li><Link to="/faq" className="hover:text-white">FAQ</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Entreprise</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/a-propos" className="hover:text-white">À propos</Link></li>
              <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Légal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/cgu" className="hover:text-white">Conditions générales d'utilisation</Link></li>
              <li><Link to="/confidentialite" className="hover:text-white">Politique de confidentialité</Link></li>
              <li><Link to="/mentions-legales" className="hover:text-white">Mentions légales</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-sm">
          <p>&copy; 2026 AAP Santé, ARCADIA SASU. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}

function HabillageConnecte({ role }: { role: 'porteur' | 'financeur' | 'admin' }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { userProfile, logout } = useAuth();
  const [replie, setReplie] = useState(lireRepli);
  const sections = entreesMenu(role);
  const active = entreeActive(sections, pathname);
  const accueil = tableauDeBord(role);

  const basculer = () => {
    const v = !replie;
    setReplie(v);
    try {
      localStorage.setItem(CLE_REPLI, v ? '1' : '0');
    } catch {
      // mémoire du navigateur indisponible : le repli ne survit pas au rechargement
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      <aside className={`${replie ? 'w-16' : 'w-64'} flex-shrink-0 bg-white border-r border-gray-200 flex flex-col transition-all`}>
        <div className="h-14 flex items-center justify-between px-3 border-b border-gray-200">
          <Link to={accueil} className="flex items-center gap-2 overflow-hidden">
            <Target className="h-7 w-7 text-primary-600 flex-shrink-0" />
            {!replie && <span className="text-lg font-bold text-gray-900 whitespace-nowrap">AAP Santé</span>}
          </Link>
          <button type="button" onClick={basculer} aria-label={replie ? 'Déplier le menu' : 'Replier le menu'} className="text-gray-500 hover:text-gray-900">
            {replie ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto py-3">
          {sections.map((s, i) => (
            <div key={s.titre ?? i} className="mb-3">
              {s.titre && !replie && (
                <p className="px-4 pb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">{s.titre}</p>
              )}
              {s.entrees.map(e => {
                const Icone = e.icone;
                const estActive = active === e.adresse;
                return (
                  <Link
                    key={e.adresse}
                    to={e.adresse}
                    title={e.libelle}
                    className={`flex items-center gap-3 px-4 py-2 text-sm ${
                      estActive ? 'bg-primary-50 text-primary-700 font-medium border-r-2 border-primary-600' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icone className="h-5 w-5 flex-shrink-0" />
                    {!replie && <span className="whitespace-nowrap">{e.libelle}</span>}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
        <button
          type="button"
          onClick={() => logout().then(() => navigate('/'))}
          title="Déconnexion"
          className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 border-t border-gray-200"
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!replie && 'Déconnexion'}
        </button>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 bg-white border-b border-gray-200 flex items-center gap-4 px-4 sticky top-0 z-40">
          {pathname !== accueil && <BoutonRetour versDefaut={accueil} />}
          <div className="ml-auto flex items-center gap-4 text-sm">
            {userProfile?.subscriptionStatus === 'trial' && role !== 'admin' && (
              <Link to="/abonnement/choisir" className="text-primary-700 font-medium hover:underline">Voir nos offres</Link>
            )}
            {role !== 'admin' && (
              <Link to="/notifications" title="Alertes" className="text-gray-600 hover:text-gray-900">
                <Bell className="h-5 w-5" />
              </Link>
            )}
            <Link to="/profil" className="flex items-center gap-2 text-gray-700 hover:text-gray-900">
              <UserCircle className="h-6 w-6" />
              <span className="hidden sm:inline max-w-[180px] truncate">{userProfile?.email}</span>
            </Link>
          </div>
        </header>
        <main className="flex-1">
          <Outlet />
        </main>
        <PiedDePage />
      </div>
    </div>
  );
}

export default function Gabarit() {
  const { currentUser, userProfile } = useAuth();
  const connecteComplet = Boolean(currentUser && userProfile && (userProfile.profileComplete || userProfile.userType === 'admin'));

  return (
    <>
      <RemonterEnHaut />
      {connecteComplet && userProfile ? (
        <HabillageConnecte role={userProfile.userType} />
      ) : (
        <div className="min-h-screen flex flex-col">
          <EnTetePublic />
          <main className="flex-1">
            <Outlet />
          </main>
          <PiedDePage />
        </div>
      )}
    </>
  );
}
