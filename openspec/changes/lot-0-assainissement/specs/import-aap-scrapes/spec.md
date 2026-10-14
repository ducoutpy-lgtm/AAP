# import-aap-scrapes Specification

## MODIFIED Requirements

### Requirement: Fiches sans date de clôture en attente

Le script SHALL importer les fiches sans date de clôture avec `deadline` à `null` (aucune échéance fictive),
`status: draft`, l'étiquette `sans-date-cloture` et `validation.statut = a_corriger` (`validation.par` =
« import (date absente) »), sans option.

#### Scenario: Fiche sans date

- **WHEN** l'essai à blanc lit une fiche sans date de clôture
- **THEN** elle est comptée « à importer » avec la mention `draft`, « clôture non précisée » et `a_corriger`, et le
  document écrit porte `deadline: null`

#### Scenario: Migration des échéances fictives

- **WHEN** Monsieur DUCOUT lance `scripts/migrer_echeances.py` à blanc puis pour de vrai, après accord
- **THEN** le compte des documents portant `sans-date-cloture` est affiché, une sauvegarde JSON datée existe dans
  `scripts/sauvegardes/`, et chacun de ces documents porte ensuite `deadline: null`, sans autre champ modifié

## ADDED Requirements

### Requirement: Le statut de validation est la seule source de la fiabilité

Le script SHALL poser l'étiquette `a-verifier` si et seulement si `validation.statut` vaut `proposee` ou
`a_corriger`, quel que soit le moteur qui a produit la fiche, et SHALL renseigner `validation.par` (« Monsieur
DUCOUT » quand un verdict humain existe). Aucun autre marqueur (`a_relire`, moteur) ne décide de l'étiquette.

#### Scenario: Fiche validée sans étiquette

- **WHEN** une fiche porte un verdict `aap-juste` et est importée
- **THEN** son document ne contient pas l'étiquette `a-verifier` et `validation.par` vaut « Monsieur DUCOUT »

#### Scenario: Fiche d'un connecteur sans verdict

- **WHEN** une fiche produite par un connecteur (API Claude) sans verdict humain est importée
- **THEN** son document porte `validation.statut = proposee` et l'étiquette `a-verifier`

### Requirement: Liste blanche des champs envoyés

Le script SHALL n'envoyer à Firestore que les champs d'une liste blanche explicite (champs humains, champs métier,
champs techniques) et SHALL échouer, à blanc comme en réel, avant toute écriture, en nommant le champ, si un
document à envoyer ou une fiche lue contient un champ hors liste.

#### Scenario: Champ inconnu dans une fiche

- **WHEN** un fichier de résultats contient une fiche avec un champ absent du schéma `AapNormalized`
- **THEN** `--dry-run` s'arrête avec un message qui nomme ce champ et le fichier, et rien n'est compté « à importer »

#### Scenario: Champ ajouté à l'import sans classement

- **WHEN** un développeur ajoute un champ au document construit par l'import sans l'inscrire dans une des trois listes
- **THEN** le test « champ inconnu » échoue en nommant le champ

### Requirement: Les règles d'écriture sont protégées par des tests nommés

Le dépôt SHALL contenir, dans `scripts/tests/`, un test par règle, exécuté sur un faux Firestore en mémoire :
« un document archivé reste archivé après réimport », « un verdict validee protège les champs métier »,
« un verdict rejetee empêche la publication », « url_validee n'est jamais écrite par annuaires.py ni registre.py »,
« deux moteurs, un seul document pour un même url_source ».

#### Scenario: Les cinq tests passent

- **WHEN** Monsieur DUCOUT lance `.venv/Scripts/python -m pytest scripts/tests -q` depuis la racine
- **THEN** les cinq tests nommés apparaissent et passent
