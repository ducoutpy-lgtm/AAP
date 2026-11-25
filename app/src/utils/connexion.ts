// Page d'arrivée après la connexion (plan niveau A, lot 3.5, 2026-11-25) : la page demandée avant la connexion (lien
// partagé, filtres compris), sinon le tableau de bord du rôle, sinon le profil à compléter (compte Google sans document).
import type { User } from '../types';

export function destinationApresConnexion(demandee: string | undefined, profil: Pick<User, 'userType'> | null): string {
  if (demandee && demandee !== '/') return demandee;
  if (profil?.userType === 'admin') return '/admin';
  if (profil?.userType === 'porteur') return '/dashboard/porteur';
  if (profil?.userType === 'financeur') return '/dashboard/financeur';
  return '/complete-profile';
}
