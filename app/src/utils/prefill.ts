// Pré-remplissage de la candidature depuis le dossier PDF (jour 5 du plan MVP, changement candidature-depuis-pdf,
// 2026-10-21) : vérification du fichier et conversion de la réponse du modèle en champs du formulaire. Pourquoi un
// fichier à part : testable par Vitest sans React ni Firebase.

export const TAILLE_MAX_PDF = 20 * 1024 * 1024;

export function verifierFichierPdf(fichier: { name: string; type: string; size: number }): string | null {
  const nom = fichier.name.toLowerCase();
  if (!(fichier.type === 'application/pdf' || nom.endsWith('.pdf'))) {
    return 'Le dossier doit être un PDF (un fichier Word peut être enregistré au format PDF)';
  }
  if (fichier.size > TAILLE_MAX_PDF) return 'Fichier trop lourd : 20 Mo au plus';
  if (fichier.size === 0) return 'Fichier vide';
  return null;
}

export interface ChampsLus {
  titre_projet?: unknown;
  resume?: unknown;
  montant_demande?: unknown;
  structure?: unknown;
  calendrier?: unknown;
  confiance?: unknown;
  remarque?: unknown;
}

export interface PreRemplissage {
  titre: string;
  resume: string;
  montant: string;
  confiance: 'haute' | 'moyenne' | 'basse';
  remarque: string;
  // Champs que la lecture n'a pas remplis, pour le dire au candidat
  manquants: string[];
}

const texte = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');

// Réponse du modèle -> champs du formulaire ; un montant non numérique ou nul reste vide
export function preRemplissageDepuis(champs: ChampsLus | null | undefined): PreRemplissage {
  const c = champs ?? {};
  const montantBrut = c.montant_demande;
  const montant = typeof montantBrut === 'number' && Number.isFinite(montantBrut) && montantBrut > 0 ? String(Math.round(montantBrut)) : '';
  const confiance = c.confiance === 'haute' || c.confiance === 'moyenne' || c.confiance === 'basse' ? c.confiance : 'basse';
  const titre = texte(c.titre_projet);
  const resume = texte(c.resume);
  const manquants = [!titre && 'le titre', !resume && 'le résumé', !montant && 'le montant demandé'].filter((x): x is string => Boolean(x));
  return { titre, resume, montant, confiance, remarque: texte(c.remarque), manquants };
}

// Fusion avec la saisie en cours : un champ déjà saisi par le candidat n'est pas écrasé
export function fusionner(saisie: { titre: string; resume: string; montant: string }, lu: PreRemplissage) {
  return {
    titre: saisie.titre.trim() || lu.titre,
    resume: saisie.resume.trim() || lu.resume,
    montant: saisie.montant.trim() || lu.montant,
  };
}

export const LIBELLES_CONFIANCE: Record<PreRemplissage['confiance'], string> = {
  haute: 'Lecture sûre',
  moyenne: 'Lecture à relire',
  basse: 'Lecture incertaine : vérifiez chaque champ',
};
