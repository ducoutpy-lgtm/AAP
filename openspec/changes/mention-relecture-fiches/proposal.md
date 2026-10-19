# Proposal

## Why

Instruction 11 du rapport de critique (lot 1, « consultation fiable ») : un visiteur doit savoir si la fiche qu'il lit a
été relue, par qui, et quand ses informations ont été extraites, avec le lien officiel bien visible pour vérifier à la
source. Aujourd'hui, l'application n'affiche qu'un badge « À vérifier » sur les fiches sans verdict, rien sur les fiches
validées par le modèle (231 au 2026-10-19) ni sur la date, et le lien officiel est en bas de la fiche, absent de la
liste. Accord de Monsieur DUCOUT du 2026-10-19 (« 1 : ok »), pendant le passage V4 ; zéro euro.

## What Changes

- Une fonction unique `app/src/utils/relecture.ts` déduit la mention de `validation` : « Relue par Monsieur DUCOUT »,
  « Contrôlée par le modèle » (validée au nom du modèle), « Non relue : informations extraites automatiquement »
  (proposée ou à corriger) ; rien pour un appel saisi à la main. Pourquoi une fonction : la liste et la fiche affichent
  la même chose, et la règle « `validation.statut` seule source de fiabilité » reste en un seul endroit.
- L'import écrit `scrapeMetadata.extraitLe` (date de production de la fiche par le moteur : `produite_le` du passage
  local ou API, `scraped_at` des connecteurs) ; le type `AAP` le déclare. Pourquoi cette date et pas « collecte_le » :
  c'est la seule date d'extraction présente dans toutes les fiches ; la date de collecte des textes relève du lot 2
  (instruction 10).
- Liste : mention et date sous chaque fiche, lien « Annonce officielle » cliquable sans ouvrir la fiche, filtre
  « Relecture » avec « Fiches relues ou contrôlées seulement ».
- Fiche : mention et date sous le titre, lien officiel en évidence dans l'en-tête, en plus du lien existant.

## Capabilities

### Modified Capabilities

- `consultation-aap-scrapes` : mention de relecture, date d'extraction, lien officiel en évidence, filtre « relues
  seulement ».
- `import-aap-scrapes` : champ `scrapeMetadata.extraitLe`.

## Impact

- Code : `app/src/utils/relecture.ts` (nouveau), `SearchAapPage.tsx`, `AapDetailPage.tsx`, `types/index.ts`,
  `scripts/import_to_firestore.py` et son test.
- Données : ré-import à blanc puis réel pour poser `extraitLe` (champ technique, aucun champ humain touché).
- Coût : zéro. Hors périmètre : date de collecte des textes et rejeu (lot 2).
