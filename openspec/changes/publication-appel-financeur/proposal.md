# Proposal

## Why

Étape 7 de la démonstration financeur (`docs/DEMO_FINANCEUR.md`), jouée pour la première fois sur les émulateurs le
2026-11-16 : « Publier l'AAP » échoue avec « Function addDoc() called with invalid data. Unsupported field value:
undefined (found in field budgetMin) ». `aapService.createAap` (`app/src/services/aapService.ts`) écrit tous les champs
facultatifs, même vides ; Firestore refuse une valeur `undefined`. `publicationDate` n'étant jamais rempli par le
formulaire, la création d'un appel par un financeur échoue dans tous les cas. `updateAap` (modification d'un appel) a le
même défaut.

## What Changes

- `app/src/utils/firestore.ts` : `sansIndefinis` (retire les champs `undefined` avant une création) et `pourMiseAJour`
  (un champ vidé devient `deleteField()`, pour qu'une valeur effacée dans le formulaire disparaisse aussi de la base).
- `createAap` et `updateAap` les utilisent. Aucune règle Firestore modifiée, aucun coût.

## Capabilities

### New Capabilities

- `espace-financeur` : création et modification d'un appel par un financeur.
