# Proposal

## Why

Les 242 pages de rubriques validées à l'écran par Monsieur DUCOUT (changement
`recherche-page-aap-par-source`) donnent 2 703 liens de pages web candidates (hors fichiers PDF, Word,
Excel), jamais extraites : l'application affiche toujours les 95 appels des cinq connecteurs
historiques et de l'échantillon. Le second tour Ollama (`extraction-ollama-second-tour`) a mesuré
`qwen3:8b` à 16 fiches justes sur 21 et 1 fiche fabriquée sur 21 pages hors sujet : seuil non
atteint, mais de peu. Décision de Monsieur DUCOUT du 2026-10-13 (soir) : extraire les 242 pages
validées avec le modèle local, à zéro euro, fiches marquées « à vérifier », en acceptant le risque
d'erreurs mesuré sur l'échantillon.

## What Changes

- Nouvel outil `scraping/extraction_locale.py`, qui réutilise les fonctions de `echantillon.py`
  (collecte du texte, question fermée « est-ce un appel ? », extraction JSON contrainte, contrôle des
  formats, écriture fiche par fiche avec reprise) sur toutes les sources du registre en
  « rubrique confirmée » au lieu des 10 rubriques de l'échantillon. Pourquoi réutiliser : la chaîne a
  été spécifiée, testée et sondée ; seul le périmètre change.
- `--collecter` lit le texte de chaque lien web (une adresse une seule fois, même citée par deux
  sources), `--extraire --modele qwen3:8b` écrit `results/extraction_locale.json`, chaque fiche portant
  `scrape_metadata.moteur = "ollama"` et `a_verifier = true` ; `--bilan` affiche l'avancement.
- `scripts/import_to_firestore.py` ajoute l'étiquette `a-verifier` aux fiches issues du modèle local ;
  l'application affiche la mention « À vérifier » dans la liste et dans la fiche (badge existant).
- Sources traitées dans un ordre utile : ARS, caisses nationales, fondations, agences, ministères,
  puis collectivités (les plus nombreuses et les plus mixtes), pour que les premiers lots importés
  soient les plus proches du champ santé.
- Import par lots au fil de l'extraction (import rejouable, identifiant = signature), pour que
  Monsieur DUCOUT voie l'application se remplir sans attendre la fin.

## Capabilities

### New Capabilities

- `extraction-aap-locale` : extraction de toutes les pages validées par le modèle local, fiches
  marquées « à vérifier », reprise et bilan.

### Modified Capabilities

- `import-aap-scrapes` : étiquette `a-verifier` sur les fiches du modèle local.
- `consultation-aap-scrapes` : mention « À vérifier » dans la liste et la fiche.

## Impact

- Nouveau : `scraping/extraction_locale.py`, `scraping/tests/test_extraction_locale.py`.
- Modifié : `scraping/echantillon.py` (chemin de sortie en paramètre de `extraire`),
  `scripts/import_to_firestore.py`, `app/src/pages/porteur/SearchAapPage.tsx`,
  `app/src/pages/porteur/AapDetailPage.tsx`, README scraping, CHANGELOGs, CLAUDE.md, REPRISE.md,
  feuille de route.
- Coût : zéro euro (aucun appel à l'API Anthropic). Temps machine, estimé d'après l'échantillon
  (22 s par page refusée, 69 s par fiche produite avec `qwen3:8b`) : environ 4 heures de collecte
  par navigateur, puis 25 à 40 heures de calcul sur la carte graphique pour 2 703 pages, en plusieurs
  nuits ; l'outil reprend là où il s'est arrêté.
- Risque accepté : environ 1 fiche sur 4 à 5 avec un champ faux (titre, financeur, clôture ou
  montant), environ 1 page hors sujet sur 20 transformée en fiche. D'où la marque « à vérifier ».

## Hors périmètre

- La vérification humaine des fiches produites (outil `validation.py --fiches` existant, à lancer
  ensuite par Monsieur DUCOUT).
- Les 533 liens vers des fichiers (PDF, Word, Excel) : lecture des PDF, changement à part.
- Les 577 sources sans page et les 10 pages mortes (tâche 3.1 de `recherche-page-aap-par-source`).
- L'extraction par l'API Anthropic.
