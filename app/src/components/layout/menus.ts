// Entrées de la barre latérale par rôle (changement navigation-et-pages-publiques, 2026-10-20), transposées des
// menus relevés sur helloDarwin. Pourquoi un fichier à part : une seule table à modifier pour ajouter une page, et
// testable par Vitest sans React.
import type { LucideIcon } from 'lucide-react';
import {
  Bell, BarChart3, Bookmark, Calendar, CreditCard, FileText, HelpCircle, LayoutDashboard, Mail, MessageSquare,
  PlusCircle, Search, Sparkles, UserCircle, Users,
} from 'lucide-react';
import type { UserType } from '../../types';

export interface EntreeMenu {
  libelle: string;
  adresse: string;
  icone: LucideIcon;
}

export interface SectionMenu {
  titre?: string;
  entrees: EntreeMenu[];
}

const SUPPORT: SectionMenu = {
  titre: 'Support',
  entrees: [
    { libelle: 'FAQ', adresse: '/faq', icone: HelpCircle },
    { libelle: 'Nous contacter', adresse: '/contact', icone: Mail },
  ],
};

const PARAMETRES: SectionMenu = {
  titre: 'Paramètres',
  entrees: [
    { libelle: 'Mon profil', adresse: '/profil', icone: UserCircle },
    { libelle: 'Abonnement', adresse: '/abonnement/choisir', icone: CreditCard },
  ],
};

const COMMUNES: EntreeMenu[] = [
  { libelle: 'Calendrier', adresse: '/calendrier', icone: Calendar },
  { libelle: 'Alertes', adresse: '/notifications', icone: Bell },
  { libelle: 'Messagerie', adresse: '/messages', icone: MessageSquare },
];

export function entreesMenu(role: UserType): SectionMenu[] {
  if (role === 'admin') {
    return [
      {
        entrees: [
          { libelle: 'Tableau de bord', adresse: '/admin', icone: LayoutDashboard },
          { libelle: 'Appels à projets', adresse: '/admin/aaps', icone: FileText },
          { libelle: 'Utilisateurs', adresse: '/admin/utilisateurs', icone: Users },
          { libelle: 'Statistiques', adresse: '/admin/statistiques', icone: BarChart3 },
          { libelle: 'Trouver des appels', adresse: '/aap/search', icone: Search },
        ],
      },
      SUPPORT,
      { titre: 'Paramètres', entrees: [{ libelle: 'Mon profil', adresse: '/profil', icone: UserCircle }] },
    ];
  }
  if (role === 'financeur') {
    return [
      {
        entrees: [
          { libelle: 'Tableau de bord', adresse: '/dashboard/financeur', icone: LayoutDashboard },
          { libelle: 'Mes appels', adresse: '/mes-aap', icone: FileText },
          { libelle: 'Nouvel appel', adresse: '/aap/nouveau', icone: PlusCircle },
          { libelle: 'Statistiques', adresse: '/statistiques', icone: BarChart3 },
          { libelle: 'Trouver des appels', adresse: '/aap/search', icone: Search },
          ...COMMUNES,
        ],
      },
      SUPPORT,
      PARAMETRES,
    ];
  }
  return [
    {
      entrees: [
        { libelle: 'Tableau de bord', adresse: '/dashboard/porteur', icone: LayoutDashboard },
        { libelle: 'Trouver des appels', adresse: '/aap/search', icone: Search },
        { libelle: 'Mes candidatures', adresse: '/mes-candidatures', icone: FileText },
        { libelle: 'Recherches sauvegardées', adresse: '/recherches-sauvegardees', icone: Bookmark },
        { libelle: 'Recommandations', adresse: '/recommandations', icone: Sparkles },
        ...COMMUNES,
      ],
    },
    SUPPORT,
    PARAMETRES,
  ];
}

// Tableau de bord du rôle (première entrée du menu)
export function tableauDeBord(role: UserType): string {
  return entreesMenu(role)[0].entrees[0].adresse;
}

// L'entrée courante : l'adresse exacte, ou le préfixe le plus long (ex. /admin/aaps sous /admin)
export function entreeActive(sections: SectionMenu[], pathname: string): string | null {
  const adresses = sections.flatMap(s => s.entrees.map(e => e.adresse));
  if (adresses.includes(pathname)) return pathname;
  const prefixes = adresses.filter(a => a !== '/' && pathname.startsWith(a + '/'));
  return prefixes.sort((a, b) => b.length - a.length)[0] ?? null;
}
