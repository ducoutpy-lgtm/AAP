# Proposal

## Why

La relecture du journal des décisions (2026-10-23) a relevé que la mise en ligne du 2026-10-22 publie 121 pièces
jointes de financeurs (dossier `app/public/documents`, copié par la construction) sans que le droit de les rediffuser
ait été vérifié. Décision de Monsieur DUCOUT : « retire-les » ; le traitement complet des pièces jointes fera l'objet
d'un chantier dédié, inscrit à la feuille de route.

## What Changes

- `app/firebase.json` : `documents/**` ajouté à `hosting.ignore` ; le site en ligne ne sert plus ces copies.
- Aucun changement d'écran : en ligne, la fiche renvoie déjà vers le document d'origine chez le financeur
  (`lienPieceJointe` dans `AapDetailPage.tsx`) ; la copie locale reste servie sur le PC en développement.
- Hors périmètre : stockage des pièces jointes dans Firebase Storage, droit de rediffusion, lecture des PDF
  (chantier « Pièces jointes » de la feuille de route).

## Capabilities

### New Capabilities

- `pieces-jointes-hors-ligne` : le site en ligne ne rediffuse aucune pièce jointe de tiers.

## Impact

- Configuration : `app/firebase.json`. Effet en ligne au prochain déploiement de l'hébergement par Monsieur DUCOUT.
- Coût : zéro euro.
