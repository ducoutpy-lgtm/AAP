# Proposal

## Why

Le 2026-10-28, la file « Proposée, non relue » de Monsieur DUCOUT compte 116 fiches, dont des appels repris par
plusieurs relais (« Première Usine » chez Medicen, Bpifrance et Lyonbiopôle ; « Challenge prévention » chez Bpifrance et
Lyonbiopôle ; appels Horizon Europe repris par Lyonbiopôle et lus aussi par le connecteur européen). `scripts/doublons.py`
ne les voit pas : il ne lit que les fiches publiées et n'apparie que deux fiches de même titre et de même financeur,
alors qu'un relais apparaît comme financeur. Lot A2 du pilote (`docs/PILOTE_MVP.md`, critère « effort de relecture »).

## What Changes

- `scripts/doublons.py --file` : lit aussi les brouillons « proposee » et ajoute deux règles d'appariement, en plus de la
  règle actuelle (même titre, même financeur) :
  1. même code de programme européen (`HORIZON-…`, `EU4H-…`, `I3-…`) lu dans le titre ou l'adresse ;
  2. même date de clôture et mots distinctifs du titre largement communs (au moins la moitié), une fois retirés les mots
     génériques (« appel », « projets », « France 2030 », années…).
  Pourquoi ces deux règles : un relais garde le titre du financeur mais pas son nom ; la date de clôture évite
  d'apparier deux appels différents au titre proche (« Émergence 2027 » de deux cancéropôles).
- Pour chaque groupe, la fiche à garder est proposée : d'abord une fiche relue par Monsieur DUCOUT, puis une fiche d'une
  source officielle (connecteur, site du financeur) plutôt que d'un relais, puis une fiche datée. Rapport écrit dans
  `docs/DOUBLONS.md` (titre, financeur, identifiant, adresse) pour qu'il rejette les autres dans `/admin/aaps`.
- Rien n'est écrit en base : rejeter une fiche reste sa décision.
- Hors périmètre : fusion automatique, archivage, traduction des titres.

## Capabilities

### Modified Capabilities

- `import-aap-scrapes` : rapport des doublons étendu à la file « à valider ».

## Impact

- Code : `scripts/doublons.py`, tests dans `scripts/tests/test_import_to_firestore.py`.
- Coût : zéro euro (aucun appel au modèle). Lecture seule de Firestore.
