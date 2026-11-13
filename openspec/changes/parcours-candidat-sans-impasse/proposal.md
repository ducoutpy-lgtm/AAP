# Proposal

## Why

Semaine 3 du plan de quatre semaines, reprise le 2026-11-13 au soir (séance de pilotage : « reprends le plan au premier
lot non fait »). Critère : le parcours candidat se joue en vingt minutes sans page vide ni erreur. Un audit du code en
lecture seule (2026-11-13) a relevé trois impasses bloquantes : l'envoi d'une candidature échoue si le stockage de
fichiers refuse la pièce (facturation Firebase fermée) ; Messagerie et Alertes sont des pages vides que rien n'alimente ;
« Sauvegarder » une recherche échoue sans message dès qu'un filtre reste vide.

## What Changes

- Candidature : si le dépôt d'une pièce échoue, la candidature part quand même, la pièce est notée « non déposée » et
  le candidat est invité à l'adresser au financeur. Pourquoi : la facturation reste fermée ; mieux vaut une candidature
  sans pièce qu'aucune candidature.
- Menus : Messagerie et Alertes retirés tant que rien ne crée de conversation ni de notification ; les pages restent à
  leur adresse. La confirmation d'envoi ne promet plus « une alerte ».
- Recherches sauvegardées : champs vides retirés avant l'écriture, erreur affichée si l'enregistrement échoue.
- Hors périmètre, relevé par l'audit et à trancher par Monsieur DUCOUT : candidature à une fiche importée transmise à
  personne (`financeurId = "scraped"`) ; pré-remplissage depuis un PDF (fonction non déployée) ; retour du financeur non
  lu côté candidat ; calendrier sans index ; abonnement ; faille des règles Firestore (un compte peut réécrire son propre
  rôle).

## Capabilities

### New Capabilities

- `parcours-candidat` : parcours sans impasse.

## Impact

- Code : `ApplicationFormPage.tsx`, `MyApplicationsPage.tsx`, `SavedSearchesPage.tsx`, `menus.ts`,
  `utils/recherche.ts`, tests. Coût : zéro euro. Mise en ligne sur accord.
