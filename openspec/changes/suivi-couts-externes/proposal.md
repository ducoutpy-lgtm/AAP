# Proposal

## Why

Demande de Monsieur DUCOUT du 2026-10-21 : « il faut que tu me fasses un espace dans admin où je peux contrôler les
flux que tu soumets aux API externes, pour le moment c'est Haiku, afin que je puisse monitorer les coûts de mise à
jour et d'acquisition des AAP qualifiés ». Aujourd'hui les coûts sont dans un journal de la chaîne de collecte
(`scraping/logs/extraction_costs.jsonl`, 6 433 lignes) et, depuis le jour 5, dans la collection `coutsIa` pour les
appels faits par l'application ; rien n'est visible dans l'administration.

## What Changes

- **Une seule collection `coutsIa`** pour tous les appels externes : les appels de l'application y sont déjà
  écrits par la fonction serveur ; `scripts/publier_couts.py` y recopie le journal de la chaîne de collecte (une
  ligne par appel : date, étape, modèle, source, adresse, tokens, coût en euros), sans doublon (identifiant dérivé de
  la ligne), relançable ; appelé à la fin de `veille.cmd`.
- **Page « Appels externes »** (`/admin/couts-ia`) : cumul depuis le début et sur le mois en cours face au plafond de
  5 euros ; coûts par étape (extraction, contrôle, champ, qualification, lecture de dossier) et par modèle ; coût par
  appel qualifié (cumul rapporté au nombre de fiches publiées et validées) ; courbe par semaine ; table des derniers
  appels avec filtre par étape et par modèle. Entrée de menu « Appels externes », bouton sur le tableau de bord.
- **Hors périmètre** : coupure automatique des appels depuis l'application (le plafond est déjà appliqué dans la
  fonction serveur et dans les scripts), coûts Firebase (console Google).

## Capabilities

### New Capabilities

- `suivi-couts-externes` : journal unifié des appels aux services externes et page de suivi.

## Impact

- Code : `scripts/publier_couts.py` et test, `scraping/veille.cmd`, `app/src/utils/couts.ts` et test,
  `app/src/pages/admin/CoutsExternesPage.tsx`, route, menu, tableau de bord.
- Données : collection `coutsIa` (lecture administrateur, règle déjà en place ; écriture par le SDK admin).
- Coût : zéro euro.
