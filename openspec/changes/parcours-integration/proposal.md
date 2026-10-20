# Proposal

## Why

Aujourd'hui, après l'inscription, un nouveau compte tombe sur une seule page longue « Complétez votre profil » (une
quinzaine de champs, listes génériques : agriculture, industrie, culture...), puis sur une page d'offres à deux
colonnes. Le relevé de helloDarwin du 2026-10-20 (`docs/parcours_hellodarwin_2026-10.md`, section 1) montre un
parcours en trois écrans courts, avec une barre de progression, des listes propres au métier, et des réponses qui
deviennent ensuite le profil et les filtres par défaut. Monsieur DUCOUT a validé l'ordre des six points de
transposition ; ce changement est le point 1. Un compte créé avec Google n'a aujourd'hui aucun document utilisateur
et voit « Erreur : Profil utilisateur non trouvé » : le parcours doit aussi couvrir ce cas.

## What Changes

- **Parcours d'intégration** sur `/complete-profile`, remplaçant la page longue pour un premier passage :
  - écran d'accueil : une phrase, acceptation des conditions générales (case obligatoire), choix du rôle si le
    compte vient de Google (aucun document utilisateur), un bouton « Commencer » ;
  - écran 1 « Votre structure » (33 %) : nom, forme juridique du secteur (établissement public, ESPIC, association,
    fondation, privé lucratif, GCS, collectivité, exercice coordonné...), ville et code postal, région déduite du
    code postal ;
  - écran 2 « Vos détails » (67 %) : pour un porteur, type d'établissement d'après la nomenclature FINESS, taille en
    ETP, budget annuel par tranches, publics accueillis ; pour un financeur, type d'organisation, secteurs financés,
    personne de contact ;
  - écran 3 « Votre offre » : gabarit à trois colonnes (Essai gratuit, Mensuel, Annuel) avec les montants déjà
    présents dans `config/stripe.ts`, marqués à valider ; « Continuer avec l'essai gratuit » enregistre et ouvre le
    tableau de bord ; une offre payante enregistre puis ouvre la page d'abonnement existante.
  - « Suivant » reste grisé tant que l'écran n'est pas complet ; « Retour » toujours possible ; champs obligatoires
    marqués d'un astérisque.
- **Profil enrichi** : quatre champs optionnels ajoutés au profil porteur (type d'établissement, tranche de taille,
  tranche de budget, publics), la liste des formes juridiques remplacée par celle du secteur ; la page « Mon profil »
  les montre et permet de les corriger. Pourquoi : c'est ce que le point 3 (recherche « initialisée à mon profil »)
  et le point 4 (éligibilité d'après le profil) liront.
- **Fonctions pures testées** (`pages/onboarding/parcours.ts`) : listes, région d'après le code postal, complétude
  d'un écran, construction du profil à enregistrer. Pourquoi : testable par Vitest sans Firebase, comme les deux
  changements précédents.
- **Hors périmètre** : la liste de démarrage à quatre actions (point 2), les filtres pré-remplis d'après le profil
  (point 3), le paiement Stripe (fonctions serveur non déployées), le carrousel d'illustrations à droite du
  formulaire (textes et images à produire par Monsieur DUCOUT), les prix définitifs des offres.

## Capabilities

### New Capabilities

- `parcours-integration` : parcours en trois écrans après l'inscription, profil du secteur santé.

### Modified Capabilities

- `profil-et-edition-aap` : la page Mon profil montre les nouveaux champs du porteur.

## Impact

- Code : `pages/onboarding/parcours.ts` et son test, `pages/onboarding/ParcoursIntegrationPage.tsx` (nouvelle),
  `pages/profile/CompleteProfile.tsx` (aiguillage vers le parcours), `CompletePorteurProfile.tsx` et
  `profilFormulaire.ts` (nouveaux champs), `contexts/AuthContext.tsx` (création du document utilisateur réutilisable
  pour un compte Google), `types/index.ts` (champs optionnels du profil porteur, date d'acceptation des CGU).
- Données : `porteurProfiles` reçoit quatre champs optionnels ; `users` reçoit `cguAccepteLe`. Aucune règle Firestore
  modifiée (le propriétaire écrit déjà son profil et son document utilisateur). Le type `AAP` n'est pas touché.
- Coût : zéro euro.
