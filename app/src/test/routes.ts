// Routes déclarées dans App.tsx, lues dans son texte pour les tests de liens (2026-11-20) : « /aap/:aapId » accepte tout
// identifiant ; la route « * » (page non trouvée) est exclue, sinon tout lien passerait.
import sourceApp from '../App.tsx?raw';

export const ROUTES = [...sourceApp.matchAll(/<Route\s+path="([^"]+)"/g)].map((m) => m[1]).filter((p) => p !== '*');

export function routeExiste(href: string): boolean {
  const chemin = href.split(/[?#]/)[0] || '/';
  return ROUTES.some((r) => new RegExp(`^${r.replace(/:[^/]+/g, '[^/]+')}$`).test(chemin));
}
