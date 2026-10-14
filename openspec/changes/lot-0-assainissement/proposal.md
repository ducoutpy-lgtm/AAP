# Proposal

## Why

Le rapport de critique validé par Monsieur DUCOUT le 2026-10-14 (`docs/RAPPORT_CRITIQUE_AAP_SANTE_2026-10-14.md`,
section 7) fixe le MVP à la consultation publique fiable des appels, sans compte. Le lot 0 pose les fondations
sans rien ajouter de visible : volet transactionnel gelé, une seule source de vérité pour la fiabilité d'une
fiche, import strict et testé, décisions humaines versionnées, règles Firestore corrigées et testées, plus aucune
date de clôture inventée. S'y ajoute la mesure d'un modèle API plus petit sur l'échantillon, plafonnée à 5 euros
(réponse Q3). L'état de départ vérifié le 2026-10-14 est consigné en tête de `tasks.md`.

## What Changes

- Routage réduit à `/`, `/login`, `/aap/search`, `/aap/:aapId`, `/admin`, `/admin/aaps`, `/admin/utilisateurs`,
  pages légales gabarit et 404 ; `/signup` retirée, liens « Créer un compte » retirés. Le code des pages reste.
- Import : `validation.statut` seule source de fiabilité, étiquette `a-verifier` dérivée ; `validation.par` ;
  liste blanche des champs, champ inconnu = échec nommé ; `deadline` nulle pour une fiche sans date (brouillon,
  `a_corriger`) ; cinq tests de l'audit sur un faux Firestore en mémoire.
- Type `AAP` : bloc `validation`, `deadline` nullable (exigence explicite : réponse Q4, instructions 4 et 9).
- Application : « Date de clôture non précisée », appels non datés classés après, jamais « Clôturé » pour une date
  nulle, bouton « Publier » soumis au verdict humain.
- Verdicts humains des pages et des liens déplacés de `results/` vers `sources/` (`verdicts_pages.json`,
  `verdicts_liens.json`), versionnés, migration rejouable avec sauvegarde.
- Règles Firestore : actions admin sur `aap` et `users`, collections gelées en écriture interdite, tests sur
  l'émulateur ; déploiement après accord.
- Deux migrations de données (verdicts, échéances fictives) : sauvegarde JSON dans `scripts/sauvegardes/`, essai
  à blanc, accord de Monsieur DUCOUT, écriture.
- Mesure API : `claude-haiku-5-5` sur les 45 textes de l'échantillon, deux appels par texte, arrêt au-delà de
  5 euros, coût réel consigné dans `ECHANTILLON.md`.
- Configuration ESLint du gabarit Vite créée, pour que `npm run lint` puisse être vert.

## Capabilities

### New Capabilities

- `perimetre-application-mvp` : routes du MVP, inscription fermée, règles d'accès, publication après verdict.
- `verdicts-humains` : emplacement, nommage et migration des fichiers de décisions humaines.

### Modified Capabilities

- `import-aap-scrapes` : statut unique, liste blanche, échéance nulle, règles protégées par des tests nommés.
- `consultation-aap-scrapes` : affichage d'une date de clôture absente.
- `extraction-echantillon-aap` : moteur API mesuré sous plafond.

## Impact

Fichiers touchés : routage, accueil, connexion, types, trois pages de consultation et d'administration, règles
Firestore, `package.json` (deux dépendances de test), configuration ESLint, import et ses tests, un script de
migration, `validation.py`, `extractor.py`, `echantillon.py`, raccourcis, documentation (détail dans `design.md`).
Aucun fichier des modules gelés.

Coût : mesure API estimée à 0,05 euro (calcul dans `design.md`), plafond 5 euros ; migration des échéances :
environ 149 mises à jour Firestore dans la part gratuite ; temps : deux à trois sessions.

## Hors périmètre

- Instructions 10 à 16 et 18 à 25 (lots 1 à 3). Le tableau du lot 0 cite aussi le journal d'import (14) et la
  scission `results/connecteurs/` / `results/essais/` (21) ; la mission se limite aux instructions 1 à 9 et 17 :
  exclues sauf demande de Monsieur DUCOUT.
- Tout appel API au-delà des 45 textes de l'échantillon.
- Toute correction dans un fichier des modules gelés, même pour une erreur de compilation (design, décision 3).
