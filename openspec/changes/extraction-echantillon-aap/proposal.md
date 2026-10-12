# Proposal

## Why

Le robot de découverte a repéré 268 rubriques et 3 744 liens d'appels à projets, gardés en local.
Rien n'est encore transformé en fiche d'AAP lisible dans l'application. Avant de dépenser les
10 à 15 euros d'API acceptés par Monsieur DUCOUT pour un passage global, il faut prouver sur un
petit échantillon que la transformation "page web -> fiche AAP" fonctionne, mesurer sa qualité et
comparer trois façons de la faire, dont deux gratuites.

## What Changes

- Un script `scraping/echantillon.py` qui prend une dizaine de rubriques découvertes (familles
  variées), ouvre au plus cinq fiches d'AAP par rubrique avec le navigateur piloté, et garde le
  texte de chaque fiche en local (`scraping/decouverte/<id>/fiches/`). Aucune IA à cette étape.
- Trois moteurs d'extraction comparés sur ces mêmes textes, chacun produisant des fiches au
  format `AapNormalized` existant :
  1. Claude Code : la session elle-même lit les textes et écrit les fiches (coût : zéro, déjà
     couvert par l'abonnement).
  2. Ollama local : modèle déjà installé sur le PC (mistral 7b d'abord, qwen3.6 si la qualité
     ne suffit pas), via l'API locale d'Ollama (coût : zéro, temps machine).
  3. API Anthropic : uniquement une estimation de coût à partir du nombre de caractères envoyés,
     avec les tarifs déjà écrits dans `extractor.py`. Aucun appel réel.
- Une grille de contrôle manuelle : pour chaque fiche, on compare titre, financeur, date de
  clôture et montant avec la page d'origine. Résultat dans `scraping/ECHANTILLON.md` : taux de
  fiches justes par moteur, temps, coût estimé.
- Import des fiches retenues dans Firestore avec l'outil existant `import_to_firestore.py`, pour
  les voir dans l'application.

## Capabilities

### New Capabilities

- `extraction-echantillon-aap` : constitution d'un échantillon de fiches, extraction par trois
  moteurs, grille de contrôle et rapport comparatif.

### Modified Capabilities

Aucune. Le schéma `AapNormalized` et le type AAP de l'application ne changent pas.

## Impact

- Nouveaux fichiers : `scraping/echantillon.py`, `scraping/tests/test_echantillon.py`,
  `scraping/ECHANTILLON.md`, dossiers `fiches/` sous `scraping/decouverte/` (ignoré par Git).
- Coût : zéro euro. Temps estimé : 2 à 3 heures de travail, plus le temps machine d'Ollama
  (quelques secondes à une minute par fiche selon le modèle).
- Dépendance : Ollama déjà installé (version 0.40 constatée) ; appels HTTP locaux avec `httpx`,
  déjà présent dans les dépendances du scraping.

## Hors périmètre

- Pagination des rubriques, pièces jointes des fiches, mise à jour sur un clic.
- Tout appel réel à l'API Anthropic.
- Les sources bloquées (préfectures, ameli) et les 347 sources sans rubrique.
- Le choix définitif du moteur pour le passage global : c'est l'objet de la validation finale.
