# Proposal

## Why

Après le parcours d'intégration, un nouveau compte arrive sur un tableau de bord qui ne lui dit pas quoi faire en
premier. Le relevé helloDarwin (`docs/parcours_hellodarwin_2026-10.md`, section 2 bis) montre une petite fenêtre
« Démarrer (0/4) » affichée tant que quatre actions ne sont pas faites : compléter le profil en trois champs,
explorer, consulter une fiche, commencer une demande. Point 2 des six points validés par Monsieur DUCOUT le
2026-10-20.

## What Changes

- **Liste de démarrage** sur les deux tableaux de bord : une carte « Démarrer (n/4) » avec quatre actions cochées au
  fur et à mesure, qui disparaît à 4/4.
  - Porteur : préciser mon profil (fenêtre de trois champs : objets de projet, année d'ouverture, rayon d'action),
    explorer les appels, consulter une fiche, commencer une candidature.
  - Financeur : préciser mon organisation (fenêtre de deux champs : site web, présentation courte), publier un premier
    appel, explorer les appels existants, consulter une fiche.
- **Marquage automatique** : la recherche, la fiche, le formulaire de candidature et le formulaire de nouvel appel
  marquent l'action faite dès leur ouverture par un compte connecté, dans le document utilisateur. Pourquoi dans
  `users` et non dans le navigateur : le compteur suit la personne sur tous ses postes, et les règles Firestore
  autorisent déjà le propriétaire à écrire ce document.
- **Fonctions pures testées** : liste des actions par rôle et calcul de l'état (`components/demarrage/demarrage.ts`).
- **Hors périmètre** : la zone de rédaction assistée de la demande (payante chez helloDarwin), les tuiles d'entrée du
  tableau de bord, le total des montants (point 3).

## Capabilities

### New Capabilities

- `liste-demarrage` : quatre premières actions guidées, cochées automatiquement.

### Modified Capabilities

- `parcours-integration` : le profil porteur reçoit trois champs de plus (objets de projet, année d'ouverture, rayon
  d'action), lus plus tard par la recherche « initialisée à mon profil » (point 3).

## Impact

- Code : `components/demarrage/{demarrage.ts, demarrage.test.ts, ListeDemarrage.tsx}`,
  `hooks/useMarquerDemarrage.ts`, les deux tableaux de bord, `SearchAapPage`, `AapDetailPage`, `ApplicationFormPage`,
  `CreateAapPage` (une ligne chacun), `types/index.ts` (`demarrage` sur `User`, trois champs optionnels sur
  `PorteurProfile`).
- Données : `users/{uid}.demarrage` (quatre booléens), `porteurProfiles` (trois champs optionnels),
  `financeurProfiles.website` et `description` (déjà existants). Aucune règle Firestore modifiée.
- Coût : zéro euro.
