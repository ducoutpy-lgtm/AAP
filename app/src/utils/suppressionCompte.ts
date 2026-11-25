// Suppression du compte en libre-service (changement suppression-compte, question 25, 2026-11-19 ; RGPD article 17).
// Fonctions pures, testables sans Firebase.

// Identifiant mis à la place du candidat sur une candidature gardée par un financeur inscrit
export const ANONYME = 'compte-supprime';

interface CandidatureResumee {
  id: string;
  financeurId: string;
  status: string;
}

// Candidatures aux appels importés et brouillons : supprimées ; envoyées à un financeur inscrit : gardées sans identifiant
export function planDeSuppression(candidatures: CandidatureResumee[]): { supprimer: string[]; anonymiser: string[] } {
  const supprimer = candidatures.filter((c) => c.financeurId === 'scraped' || c.status === 'draft').map((c) => c.id);
  return { supprimer, anonymiser: candidatures.map((c) => c.id).filter((id) => !supprimer.includes(id)) };
}

// Firebase n'efface un compte qu'après une connexion récente : cinq minutes au plus
export function connexionRecente(derniereConnexion: string | undefined, maintenant: Date): boolean {
  if (!derniereConnexion) return false;
  const ecart = maintenant.getTime() - new Date(derniereConnexion).getTime();
  return ecart >= 0 && ecart <= 5 * 60 * 1000;
}

// Connexion récente jugée sur deux heures du serveur Firebase (corrections-relecture 3.5, 2026-11-20) : l'heure de la
// connexion (authTime) et l'heure d'émission d'un jeton tout juste renouvelé (issuedAtTime). L'horloge du poste, qui
// pouvait avancer ou retarder de quelques minutes, n'intervient plus. Le contrôle reste préalable : le compte de
// connexion est effacé en dernier, et un refus de Firebase à cette étape laisserait un compte sans données.
export function connexionRecenteSelonServeur(jeton: { authTime: string; issuedAtTime: string }): boolean {
  return connexionRecente(jeton.authTime, new Date(jeton.issuedAtTime));
}
