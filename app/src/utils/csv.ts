// Export CSV commun aux candidatures (financeur) et aux utilisateurs (administration), plan niveau A, lot 3.4
// (2026-11-25). Chaque champ entre guillemets, guillemets doublés : une virgule ou un retour à la ligne reste dans sa
// cellule. Apostrophe devant un texte qui commence par = + - @ : le tableur le lit comme du texte, pas comme une formule.
// Point-virgule et indicateur UTF-8 en tête : Excel en français ouvre le fichier en colonnes, accents compris (choix de
// la session, [À VALIDER — Monsieur DUCOUT]). Lignes séparées par CRLF, comme le prévoit la norme du format (RFC 4180).

const DEBUT_DE_FORMULE = /^[=+\-@\t\r]/;

export function champCsv(valeur: unknown): string {
  let texte = valeur === null || valeur === undefined ? '' : String(valeur);
  if (typeof valeur === 'string' && texte.length > 1 && DEBUT_DE_FORMULE.test(texte)) texte = `'${texte}`;
  return `"${texte.replace(/"/g, '""')}"`;
}

export function versCsv(entetes: string[], lignes: unknown[][]): string {
  return '﻿' + [entetes, ...lignes].map((ligne) => ligne.map(champCsv).join(';')).join('\r\n');
}

// Télécharge le texte sous le nom donné, puis libère l'adresse temporaire du fichier
export function telechargerCsv(contenu: string, nom: string): void {
  const lien = document.createElement('a');
  lien.href = URL.createObjectURL(new Blob([contenu], { type: 'text/csv;charset=utf-8' }));
  lien.download = nom;
  lien.click();
  URL.revokeObjectURL(lien.href);
}
