// Suppression du compte en libre-service (changement suppression-compte, question 25, 2026-11-19 ; RGPD article 17).
// Fonctions pures, testables sans Firebase.

// Identifiant mis à la place du candidat sur une candidature gardée par un financeur inscrit
export const ANONYME = 'compte-supprime';

interface CandidatureResumee { id: string; financeurId: string; status: string }

// Candidatures aux appels importés et brouillons : supprimées ; envoyées à un financeur inscrit : gardées sans identifiant
export function planDeSuppression(candidatures: CandidatureResumee[]): { supprimer: string[]; anonymiser: string[] } {
  const supprimer = candidatures.filter(c => c.financeurId === 'scraped' || c.status === 'draft').map(c => c.id);
  return { supprimer, anonymiser: candidatures.map(c => c.id).filter(id => !supprimer.includes(id)) };
}

// Firebase n'efface un compte qu'après une connexion récente : cinq minutes au plus
export function connexionRecente(derniereConnexion: string | undefined, maintenant: Date): boolean {
  if (!derniereConnexion) return false;
  const ecart = maintenant.getTime() - new Date(derniereConnexion).getTime();
  return ecart >= 0 && ecart <= 5 * 60 * 1000;
}
