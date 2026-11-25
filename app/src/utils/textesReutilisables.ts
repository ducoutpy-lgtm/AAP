// Textes réutilisables d'une candidature à l'autre (changement textes-reutilisables, question 23 (b), 2026-11-19) :
// enregistrés dans le profil du candidat, ajoutés au résumé d'une candidature d'un clic. Sans stockage de fichiers.

export type CleTexte = 'presentation' | 'references' | 'moyens';
export type TextesReutilisables = Partial<Record<CleTexte, string>>;

export const LIBELLES_TEXTES: Record<CleTexte, string> = {
  presentation: 'Présentation de la structure',
  references: 'Références et projets menés',
  moyens: 'Moyens humains et matériels',
};

// Texte ajouté au résumé avec son intitulé, après ce qui est déjà écrit
export function ajouterTexte(resume: string, cle: CleTexte, texte: string): string {
  const ajout = `${LIBELLES_TEXTES[cle]} : ${texte.trim()}`;
  return resume.trim() ? `${resume.trim()}\n\n${ajout}` : ajout;
}

// Textes remplis, dans l'ordre des intitulés
export function textesRemplis(textes: TextesReutilisables | undefined): [CleTexte, string][] {
  return (Object.keys(LIBELLES_TEXTES) as CleTexte[])
    .filter((cle) => (textes?.[cle] ?? '').trim())
    .map((cle) => [cle, (textes?.[cle] ?? '').trim()]);
}
