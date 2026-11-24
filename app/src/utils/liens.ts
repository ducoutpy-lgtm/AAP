// Liens sûrs (plan niveau A, lot 1.3, 2026-11-24) : seules les adresses web (http, https) deviennent des liens ; un lien
// « javascript: » ou « data: », saisi par un financeur ou lu sur une page collectée, s'exécutait au clic.
export function lienSur(adresse: string | null | undefined): string | undefined {
  const propre = (adresse ?? '').trim();
  return /^https?:\/\//i.test(propre) ? propre : undefined;
}
