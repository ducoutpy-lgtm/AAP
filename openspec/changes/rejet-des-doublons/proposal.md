# Proposal

## Why

`docs/DOUBLONS.md` (régénéré le 2026-11-13 après le changement `doublons-numero-axe`) propose 63 fiches à rejeter : 30
dans la file « à valider » de Monsieur DUCOUT, 33 déjà publiées. Le 2026-11-13, il a choisi que la séance fasse ce rejet,
avec une sauvegarde préalable, et lui remette la liste (question 3 bis, « La séance, avec sauvegarde »). Rejeter les
doublons de la file allège sa relecture d'un quart.

## What Changes

- `scripts/rejeter_doublons.py` : mêmes groupes et même fiche gardée que `docs/DOUBLONS.md` ; essai à blanc par défaut ;
  `--reel` écrit une sauvegarde JSON dans `scripts/sauvegardes/`, puis passe chaque fiche rejetée en « archivée » avec
  une validation « rejetée » au nom de la séance, l'identifiant de la fiche gardée en commentaire ; relit la base et
  compte. Pourquoi un script à part : `doublons.py` ne fait que lire et proposer ; écrire en base est une autre
  responsabilité, avec sauvegarde et accord.
- Une fiche relue par Monsieur DUCOUT n'est jamais rejetée par l'outil : elle est listée à part pour sa décision.
- Le passage réel (`--reel`) attend son « oui » dans la conversation, après lecture de l'essai à blanc.
- Hors périmètre : fusion du contenu des fiches rejetées dans la fiche gardée ; doublons futurs (le rapport se
  relance après chaque import).

## Capabilities

### Modified Capabilities

- `import-aap-scrapes` : rejet des doublons avec sauvegarde.

## Impact

- Code : `scripts/rejeter_doublons.py`, `scripts/tests/test_import_to_firestore.py`.
- Données : 63 fiches au plus passent en « archivée » (30 brouillons de la file, 33 publiées : le site en ligne passe de
  378 à 345 appels), après sauvegarde. Réversible depuis la sauvegarde.
- Coût : zéro euro.
