# Proposal (brouillon, en attente de son choix)

## Why

Question 33 tranchée le 2026-11-19 : lire les PDF des sources de la veille avec le modèle local de l'ordinateur de
Monsieur DUCOUT (Ollama), à zéro euro ; rien ne presse (mise à jour hebdomadaire) ; « il faut minimiser les coûts de
traitement de la préqualification », « c'est la même chose pour tout ». 400 liens PDF jamais lus sur 278 sources
(compte du 2026-11-18).

## Constat dans le code (2026-11-19)

- Extraction locale : existe (`extraction_locale.py`, moteur par défaut `qwen3:8b`, sortie `results/extraction_locale.json`).
- Champ (santé, médico-social, hors champ) : existe en local (`champ.py --moteur ollama`).
- Contrôle (`verification.py`) et qualification (`qualifier_fiches.py`) : Haiku seulement.
- Le tri automatique (`scripts/trier_file.py`) ne publie que des fiches contrôlées : une fiche sans contrôle reste
  dans sa file (« jamais contrôlée »).
- Mesures d'octobre : le passage local global a pris 28,6 heures pour 2 178 textes (environ 47 secondes par texte) ;
  sur l'échantillon, `qwen3:8b` a donné 16 fiches justes sur 21 avec 1 inventée, Haiku 19 sur 20 avec 1 inventée ;
  sur 50 pages de collectivités, qualité proche, Haiku sans fiche inventée et 13 fois plus rapide.

## Deux voies

- **A, tout en local (0 euro)** : ajouter un moteur local au contrôle et à la qualification, mesurer leur justesse sur
  un échantillon avant de laisser le tri publier sur leur avis. Environ 5 heures de calcul pour les 400 PDF (estimation),
  puis peu chaque semaine ; la carte graphique est occupée pendant ce temps (tâche de nuit à prévoir).
- **B, extraction et champ en local, contrôle et qualification par Haiku** : quelques centimes par semaine (environ
  0,001 euro par fiche contrôlée et qualifiée, mesuré le 16 novembre), tri aussi fiable qu'aujourd'hui.

Dans les deux voies : collecte des PDF ajoutée à la veille (`rejeu.py --pdf`, sans coût), extraction locale lancée
par une tâche de nuit, import en « à valider » puis tri automatique.

## À trancher

1. Voie A ou B.
2. Règle « modèle local par défaut pour tout traitement en lot non urgent, API seulement s'il la demande » : elle
   renverse la décision du 2026-10-19 écrite dans `CLAUDE.md` (« V4 avec modèle API payant ») ; à confirmer par lui,
   et à écrire par lui dans `CLAUDE.md` (le garde-fou du poste empêche la session d'y écrire).
3. Heure de la tâche de nuit (carte graphique libre : Unity pour Dyslexix).
