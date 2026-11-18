# Proposal

## Why

Le 2026-11-18, Monsieur DUCOUT arrête de relire la file « à valider » : 167 fiches sans tri, dont deux éditions
2026-2027 de la Fondation Béatrice Denys. Ses mots : « si j'ai 200 fiches à contrôler c'est trop ! tu en as forcément
analysé et validé avant, tu dois me proposer uniquement les fiches où il y a un doute » ; « oui ok change la phrase de
délégation ».

Constat du jour :
- la délégation du 2026-11-13 (« importer les fiches en à valider, jamais en validée ») fait rétrograder en
  « Proposée » toute fiche que le contrôle Haiku a jugée bonne (`import_to_firestore.en_attente_de_validation`) ;
- `scripts/doublons.py` ne rapproche pas deux fiches d'un même appel quand l'une n'a pas de date de clôture (cas
  Béatrice Denys : fiche du relais Biotech Santé Bretagne sans date, fiche officielle au 22 novembre) ;
- simulation : 75 fiches sur 167 sans aucun doute, 92 avec au moins un motif.

## What Changes

- Nouvelle phrase de délégation : « une fiche que le contrôle du modèle juge bonne, sans doute, est publiée ; seules les
  fiches douteuses vont dans la file de Monsieur DUCOUT ; les doublons sûrs sont rejetés après sauvegarde ».
- `scripts/doublons.py` : deux fiches sont aussi le même appel quand elles ont le même financeur (parenthèse retirée),
  les mêmes années d'édition dans le titre, une date de clôture manquante, et que tous les mots distinctifs du titre le
  plus court (deux au moins) figurent dans l'autre.
- `scripts/trier_file.py` (essai à blanc par défaut, `--reel` avec sauvegarde) :
  - doublons de la file : la fiche à garder est choisie par `doublons.a_garder` ; les autres sont rejetées ;
  - fiche sans motif de doute : publiée, validation « validee » par « contrôle du modèle (tri automatique) » ;
  - fiche avec motif : reste « Proposée », motifs écrits dans `validation.commentaire` et affichés dans
    `/admin/aaps`.
  Motifs : pas de contrôle, pas un appel selon le contrôle, doute du contrôle (hors description), champ incertain ou
  hors champ, appel clos. Une fiche relue par Monsieur DUCOUT n'est jamais touchée.
- Veille du lundi : `veille_payante.py` lance `trier_file.py --reel` après l'import.
- Hors périmètre : contrôle des 38 fiches jamais contrôlées (payant, devis à part).

## Capabilities

### New Capabilities

- `tri-file` : tri automatique de la file « à valider ».
