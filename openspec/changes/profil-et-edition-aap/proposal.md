# Proposal

## Why

Depuis le dégel du 2026-10-19, quatre adresses de l'application affichent encore une page vide « en construction » :
`/profil` (Mon profil), `/aap/:id/edit` (Modifier l'AAP), `/admin/paiements` et `/admin/parametres`. Les deux
premières sont sur le chemin des parcours que Monsieur DUCOUT doit jouer avec des comptes de test : les tableaux de bord
porteur et financeur pointent vers `/profil`, la liste « Mes appels » du financeur pointe vers `/aap/:id/edit`. Un
financeur qui a publié un appel avec une faute ne peut pas la corriger ; un porteur ne peut pas revoir ni corriger son
profil après l'inscription. Décision de Monsieur DUCOUT du 2026-10-20 : « on peut continuer sur l'appli ».

## What Changes

- **Mon profil** (`/profil`) : affiche le compte (adresse, rôle, état de l'abonnement, fin de l'essai) et le formulaire
  de profil déjà rempli avec les valeurs enregistrées, pour les corriger. Pourquoi réutiliser les formulaires
  « Compléter mon profil » existants plutôt qu'en écrire de nouveaux : mêmes champs, mêmes contrôles, une seule source
  d'erreurs. Un mode « édition » est ajouté à ces deux formulaires : pré-remplissage, bouton « Enregistrer », retour sur
  `/profil` avec un message, sans repasser par le choix d'abonnement.
- **Modifier l'appel** (`/aap/:id/edit`) : le formulaire de création en cinq étapes, pré-rempli avec l'appel existant ;
  « Sauvegarder » met l'appel à jour sans changer son statut, « Publier » met à jour puis publie un brouillon. Réservé
  au financeur auteur de l'appel ; un autre compte voit « Cet appel n'est pas le vôtre ». Pourquoi : les règles
  Firestore déployées le 2026-10-19 n'autorisent déjà que l'auteur ou l'administrateur à modifier un appel ; la page
  reflète cette règle au lieu de laisser une erreur technique apparaître.
- **Fonctions pures testées** : la conversion appel -> formulaire -> données enregistrées, et profil -> formulaire,
  dans des fichiers sans Firebase, testées par Vitest. Pourquoi : la carte de recherche n'a pas pu être testée le
  2026-10-19 parce qu'elle charge Firebase au montage ; ici la logique est séparée dès le départ.
- **Hors périmètre** : `/admin/paiements` (dépend de Stripe, non branché) et `/admin/parametres` (aucun besoin exprimé)
  restent des pages vides ; téléversement du logo du financeur (Storage inactif sans Blaze) inchangé ; aucun
  déploiement, aucune règle Firestore modifiée.

## Capabilities

### New Capabilities

- `profil-et-edition-aap` : consultation et correction du profil, modification d'un appel par son auteur.

### Modified Capabilities

- `application-complete` : les pages vides `/profil` et `/aap/:id/edit` deviennent fonctionnelles ; les autres
  exigences sont inchangées.

## Impact

- Code : `app/src/App.tsx` (deux routes), `pages/profile/ProfilPage.tsx` (nouvelle), `CompletePorteurProfile.tsx` et
  `CompleteFinanceurProfile.tsx` (mode édition), `pages/financeur/CreateAapPage.tsx` (appel existant),
  `pages/financeur/EditAapPage.tsx` (nouvelle), deux fichiers de fonctions pures et leurs tests.
- Données : documents existants de `porteurProfiles`, `financeurProfiles` et `aap` mis à jour par leur propriétaire,
  conformément aux règles déjà déployées. Aucun champ nouveau.
- Coût : zéro euro.
