// Élément cliquable utilisable au clavier (plan niveau A, lot 3.3, 2026-11-25) : rôle de bouton, place dans l'ordre de
// tabulation, Entrée ou Espace déclenchent l'action. Une touche frappée dans un élément intérieur (le cœur d'une carte de
// la recherche) ne déclenche pas l'action de la carte.
import type { KeyboardEvent } from 'react';

export function activableAuClavier(action: () => void) {
  return {
    role: 'button' as const,
    tabIndex: 0,
    onKeyDown: (e: KeyboardEvent) => {
      if (e.target !== e.currentTarget) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        action();
      }
    },
  };
}
