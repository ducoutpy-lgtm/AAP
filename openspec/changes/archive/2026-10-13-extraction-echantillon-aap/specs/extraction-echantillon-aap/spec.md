# extraction-echantillon-aap Specification

## Purpose

Prouver sur un échantillon réduit que les liens d'AAP découverts peuvent devenir des fiches
conformes au format de l'application, et comparer trois moteurs d'extraction (Claude Code,
modèle local Ollama, estimation API Anthropic) avant tout passage global payant.

## ADDED Requirements

### Requirement: Constitution de l'échantillon

Le script `scraping/echantillon.py` SHALL sélectionner des rubriques découvertes de familles
différentes (au moins une ARS, une collectivité, une agence nationale, une fondation, une
société savante) et SHALL garder en local le texte lisible d'au plus cinq fiches d'AAP par
rubrique, avec l'adresse d'origine de chaque fiche. Aucun service d'IA ne doit être appelé à
cette étape.

#### Scenario: Échantillon constitué

- **WHEN** Monsieur DUCOUT lance `python echantillon.py --collecter`
- **THEN** le terminal affiche, rubrique par rubrique, le nombre de fiches gardées, et le dossier
  `decouverte/<id>/fiches/` contient un fichier texte par fiche avec son adresse en première ligne.

### Requirement: Extraction par Ollama en local

Le script SHALL envoyer chaque texte de fiche au modèle local Ollama et SHALL produire une fiche
au format `AapNormalized` ; une réponse qui n'est pas un JSON valide ou qui ne respecte pas le
schéma SHALL être comptée comme échec sans arrêter le traitement.

#### Scenario: Fiches produites par le modèle local

- **WHEN** Monsieur DUCOUT lance `python echantillon.py --extraire --moteur ollama`
- **THEN** le fichier `results/echantillon_ollama.json` contient une fiche par texte réussi, et le
  terminal affiche le nombre de réussites, d'échecs et le temps total.

### Requirement: Extraction par Claude Code

Les fiches écrites par la session Claude Code SHALL être enregistrées dans
`results/echantillon_claude_code.json` au même format, pour être comparées avec les autres moteurs.

#### Scenario: Fiches de la session

- **WHEN** la session a lu les textes de l'échantillon et écrit les fiches
- **THEN** `python echantillon.py --verifier results/echantillon_claude_code.json` affiche
  "N fiches valides, 0 invalide".

### Requirement: Estimation du coût API

Le script SHALL calculer, sans appel réel, le coût estimé en euros d'une extraction des mêmes
textes par l'API Anthropic, à partir du nombre de caractères et des tarifs de `extractor.py`,
puis SHALL l'extrapoler aux 3 744 liens découverts.

#### Scenario: Estimation affichée

- **WHEN** Monsieur DUCOUT lance `python echantillon.py --estimer`
- **THEN** le terminal affiche le coût estimé pour l'échantillon et pour l'ensemble des liens,
  avec la mention "estimation, aucun appel effectué".

### Requirement: Grille de contrôle et rapport

Le rapport `scraping/ECHANTILLON.md` SHALL présenter, pour chaque fiche et chaque moteur, si le
titre, le financeur, la date de clôture et le montant correspondent à la page d'origine, puis un
tableau récapitulatif par moteur : fiches justes, temps, coût.

#### Scenario: Rapport lisible

- **WHEN** Monsieur DUCOUT ouvre `scraping/ECHANTILLON.md`
- **THEN** il voit le tableau récapitulatif et peut, pour une fiche au choix, cliquer sur
  l'adresse d'origine et vérifier lui-même les quatre champs.

### Requirement: Fiches visibles dans l'application

Les fiches jugées justes SHALL être importées dans Firestore avec `scripts/import_to_firestore.py`
sans modification de cet outil.

#### Scenario: Fiches importées

- **WHEN** l'import est lancé sur le fichier du moteur retenu
- **THEN** la page "Rechercher des AAP" de l'application locale affiche ces fiches avec leur
  financeur et leur date de clôture.
