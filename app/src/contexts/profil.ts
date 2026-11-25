// Fusion du profil relu avec le profil en mémoire (changement premier-clic-candidater, 2026-11-16) : juste après une
// écriture partielle (liste « Démarrer »), la relecture du compte peut ne contenir que le champ écrit ; un champ absent
// garde sa valeur connue, pour que le rôle ne disparaisse pas (sinon la garde de rôle renvoie vers /admin).
export function fusionnerProfil<T extends { uid: string }>(
  connu: T | null,
  uid: string,
  relu: Record<string, unknown>,
) {
  return { ...(connu && connu.uid === uid ? connu : {}), uid, ...relu };
}
