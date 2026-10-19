# Proposal

## Why

Le passage global par le modèle local (V3, étiquette Git `v3-local`) a demandé 28,6 heures de calcul pour 1 086
fiches, et la question du champ posée en local le 2026-10-19 a dépassé 10 minutes sur une seule page. Monsieur
DUCOUT veut voir rapidement la quantité d'appels qualifiés et publiés dans l'application, sans tout relire à la main,
pour construire ensuite l'application complète. Décision du 2026-10-19 : « garde la V3, crée la V4 avec modèle API
payant ; tu dois toujours me donner le coût supposé avant de lancer des appels à l'API ». La mesure du 2026-10-14 sur
50 pages a donné pour `claude-haiku-5-5` 47 pages justes sur 50, 0 valeur inventée, 13 fois plus vite que le local.

## What Changes

- `scraping/extraction_locale.py` accepte `--moteur api --modele claude-haiku-5-5 --plafond <euros>` : les mêmes
  textes des rubriques confirmées (1 808 textes, 207 sources au 2026-10-19), la même chaîne (question fermée,
  extraction, question du champ, consigne 4), écrits dans `results/extraction_api.json` avec `moteur = "api"` et
  `a_verifier = true`. Le modèle local reste disponible (`--moteur ollama`, défaut inchangé).
- `echantillon.extraire_api` accepte une liste explicite de textes et des métadonnées, comme `extraire` : une seule
  chaîne API pour l'échantillon, la comparaison et la V4.
- `--dry-run` écrit le devis avant tout appel : textes restants, caractères, modèle, tarif, coût estimé, cumul déjà
  dépensé, plafond. Devis du 2026-10-19 : 1 808 textes, 6,09 millions de caractères, 2,26 euros au plus (trois appels
  par texte), 1,30 euro si la moitié des pages sont acceptées ; cumul Haiku 0,52 euro ; plafond cumulé 5 euros.
- Import : pour une même adresse, la fiche API l'emporte sur la fiche locale (règle `fusionner` existante). Les fiches
  API passent ensuite par le contrôle `verification.py` (0,15 euro environ) et la décision du modèle
  (`appliquer_controle.py`), donc sont publiées sans relecture manuelle sauf doute sur titre, financeur ou territoire.
- Décision inscrite dans `CLAUDE.md` : extraction par l'API pour le MVP, devis écrit avant tout appel.

## Capabilities

### New Capabilities

- `extraction-aap-api` : passage global par le moteur API avec devis, plafond, reprise et bilan.

### Modified Capabilities

- `import-aap-scrapes` : aucune règle nouvelle ; `fusionner` et l'ignorance des fichiers `comparaison_*` suffisent.

## Impact

- Code : `scraping/extraction_locale.py`, `scraping/echantillon.py` (signature de `extraire_api`), tests.
- Coût : 2,26 euros au plus pour le passage, puis 0,15 euro de contrôle, à écrire et à faire accepter avant chaque
  lancement ; plafond cumulé 5 euros déjà en place (0,52 euro dépensé).
- Données : nouveau fichier `results/extraction_api.json` ; `extraction_locale.json` conservé (V3).
- Hors périmètre : rejeu hebdomadaire (lot 2), nouvelles sources (lot 3).
