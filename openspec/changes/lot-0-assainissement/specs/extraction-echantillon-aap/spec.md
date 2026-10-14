# extraction-echantillon-aap Specification

## ADDED Requirements

### Requirement: Moteur API sur les 45 textes de l'échantillon

L'outil d'échantillon SHALL offrir un moteur `api` qui n'extrait que les 45 textes de l'échantillon (adresses des
fiches de référence et des pages hors sujet), avec le modèle donné, en deux appels par texte (question fermée puis
extraction), et SHALL journaliser chaque appel dans `logs/extraction_costs.jsonl` avec le nom du modèle et son coût
calculé aux tarifs de ce modèle.

#### Scenario: Essai sur un texte

- **WHEN** Monsieur DUCOUT a donné son accord et `echantillon.py --extraire --moteur api --modele claude-haiku-5-5
  --limite 1` est lancé
- **THEN** une ligne au plus par appel apparaît dans le journal des coûts avec `model: claude-haiku-5-5`, et le coût
  affiché est inférieur à un centime

#### Scenario: Résultat contre le seuil

- **WHEN** `--controler --moteur api --modele claude-haiku-5-5` puis `--rapport` sont lancés
- **THEN** `ECHANTILLON.md` montre pour ce modèle les fiches justes sur 24, les fiches fabriquées sur 21 pages hors
  sujet, le coût réel lu dans le journal et le verdict « seuil atteint » ou « seuil non atteint »

### Requirement: Lecture des textes de l'échantillon par adresse

Le moteur `api` SHALL trouver les textes de l'échantillon par leur adresse dans toutes les rubriques découvertes, un
texte par adresse, sans dépendre de la rubrique retenue par famille.

#### Scenario: Rubrique écartée par la sélection par famille

- **WHEN** la rubrique d'un texte de l'échantillon n'est plus celle que la sélection par famille retient (cas FIRAH
  après la redécouverte du 13 octobre 2026)
- **THEN** le moteur `api` lit quand même ce texte, et chacune des 45 adresses de l'échantillon dont le fichier existe
  est traitée une seule fois

### Requirement: Plafond de dépense et accord préalable

Le moteur `api` SHALL s'arrêter avant l'appel qui ferait dépasser le plafond (5 euros par défaut, cumulé sur toutes
les exécutions du modèle dans le journal), et aucun appel SHALL avoir lieu avant l'accord écrit de Monsieur DUCOUT
sur le modèle, son prix unitaire vérifié et le coût estimé, inscrits dans le changement OpenSpec.

#### Scenario: Plafond atteint

- **WHEN** le coût cumulé du modèle dans le journal atteint le plafond
- **THEN** l'outil s'arrête avant l'appel suivant en affichant le coût cumulé, et les fiches déjà produites sont
  conservées

#### Scenario: Aucun appel sans accord

- **WHEN** le code du moteur `api` est en place mais l'accord n'a pas été donné
- **THEN** le journal des coûts ne contient aucune ligne du modèle candidat
