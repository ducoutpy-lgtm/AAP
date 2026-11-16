# Proposal

## Why

Parcours candidat joué en entier sur les émulateurs le 2026-11-16 (critère de la semaine 3 : « sans page vide ni
erreur ») avec un compte neuf : au premier clic sur « Candidater à cet AAP », l'application ouvre le formulaire puis
renvoie au tableau de bord, sans message. Reproduit après remise à zéro de l'étape « Commencer une candidature » de la
liste « Démarrer », avec une trace des changements d'adresse : `push /aap/test-fin-1/candidater`, puis 134 ms plus
tard `replace /admin`, puis `replace /dashboard/porteur`. Au second clic, rien de tel.

Cause : `useMarquerDemarrage` écrit `demarrage.candidature` dans `users/{uid}` puis appelle `refreshUserProfile`, qui
remplace le profil en mémoire par le document relu. Le document relu juste après l'écriture peut ne contenir que le
champ écrit (supposé : vue locale de l'écriture en attente) ; le profil perd alors `userType`, et `RoleGuard` envoie vers
`/admin`, qui renvoie le candidat vers son tableau de bord.

## What Changes

- `refreshUserProfile` complète le profil en mémoire avec le document relu au lieu de le remplacer : un champ absent de
  la relecture garde sa valeur connue. Fonction pure `fusionnerProfil` (`app/src/contexts/profil.ts`), testée.
- Constat annexe du même parcours : la page de détail d'une candidature promettait « vous serez prévenu par une
  alerte », alors que les alertes automatiques dépendent des fonctions serveur, non déployées ; remplacé par « suivez-le
  sur cette page ou dans Mes candidatures » (même règle que pour « Mes candidatures », changement
  `parcours-candidat-sans-impasse`).
- Aucun changement de règle ni de données.

## Capabilities

### New Capabilities

- `parcours-candidat` : premier passage d'un compte neuf sans renvoi inattendu.
