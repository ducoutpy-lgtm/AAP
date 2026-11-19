# Proposal

## Why

Question 25 tranchée le 2026-11-19 (« Proposition telle quelle ») : suppression du compte en libre-service (droit à
l'effacement, RGPD article 17). Mise en ligne des règles sur son accord.

## What Changes

- `/profil`, carte « Mes données personnelles » : bouton « Supprimer mon compte », avec confirmation. Firebase exige une
  connexion récente pour effacer un compte : au-delà de cinq minutes, l'écran demande de se reconnecter d'abord.
- Supprimés : profil de structure, recherches sauvegardées, favoris, notifications, candidatures aux appels importés
  (`financeurId` « scraped ») et brouillons, document `users`, compte de connexion.
- Gardées sans identifiant : les candidatures envoyées à un financeur inscrit (`porteurId` remplacé par
  « compte-supprime »).
- Règles Firestore : le candidat supprime une candidature à un appel importé, et peut seulement remplacer son
  identifiant par « compte-supprime » sur une candidature envoyée. Tests sur l'émulateur ; déploiement sur son accord.
- Journal des actions (lecture réservée à l'administrateur) : script `scripts/anonymiser_journal.py`, qui retire
  l'identifiant des lignes d'un compte disparu (essai à blanc par défaut).
- Pages Confidentialité et Mon profil : l'effacement n'est plus « sur demande au délégué ».

## Capabilities

### Modified Capabilities

- `droits-rgpd` : effacement en libre-service.
