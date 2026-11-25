// Annonces de l'application (plan niveau A, lot 3.1, 2026-11-25) : remplacent les fenêtres d'alerte du navigateur, qui bloquaient la
// page. Un message s'affiche dans un bandeau (components/layout/Annonces.tsx, posé une fois dans App.tsx), garde sa place
// d'une page à l'autre (une publication mène ensuite à « Mes appels ») et disparaît au clic ou après huit secondes.
export type TypeAnnonce = 'succes' | 'erreur' | 'info';
export interface Annonce { id: number; texte: string; type: TypeAnnonce }

let annonces: Annonce[] = [];
let suivant = 1;
const ecouteurs = new Set<() => void>();
const prevenir = () => ecouteurs.forEach(f => f());

export function retirerAnnonce(id: number): void {
  annonces = annonces.filter(a => a.id !== id);
  prevenir();
}

export function annoncer(texte: string, type: TypeAnnonce = 'succes'): void {
  const annonce = { id: suivant++, texte, type };
  annonces = [...annonces, annonce];
  prevenir();
  setTimeout(() => retirerAnnonce(annonce.id), 8000);
}

export const lireAnnonces = (): Annonce[] => annonces;

export function ecouterAnnonces(ecouteur: () => void): () => void {
  ecouteurs.add(ecouteur);
  return () => { ecouteurs.delete(ecouteur); };
}
