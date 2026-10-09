# import-aap-scrapes Specification

## Purpose
Charge les AAP produits par le scraping dans la base de données de l'application, de façon
rejouable et sans doublon, pour que l'application puisse les afficher.

## Requirements

### Requirement: Essai à blanc avant écriture

Le script d'import SHALL proposer un mode « essai à blanc » qui lit les JSON scrapés, affiche le
nombre d'AAP lus, à importer et ignorés (avec la raison), et n'écrit rien dans la base.

#### Scenario: Essai à blanc

- **WHEN** Monsieur DUCOUT lance `python scripts/import_to_firestore.py --dry-run --include-expired --include-without-deadline`
- **THEN** le terminal affiche « AAP lus : 105 » et un nombre « à importer » supérieur à 0
- **AND** aucune clé Firebase n'est nécessaire et la base n'est pas modifiée

### Requirement: Import rejouable sans doublon

Le script SHALL écrire chaque AAP dans la collection `aap` sous un identifiant dérivé de sa
signature (titre, financeur, date de clôture), si bien qu'un second import ne crée aucun doublon
et conserve les compteurs existants (vues, candidatures).

#### Scenario: Premier import

- **WHEN** Monsieur DUCOUT lance l'import réel avec les options `--include-expired --include-without-deadline`
- **THEN** le terminal affiche « Terminé : N créés, 0 mis à jour » avec N proche de 89
- **AND** la console Firebase montre N documents dans la collection `aap`, chacun avec `source = "scraped"`

#### Scenario: Second import identique

- **WHEN** Monsieur DUCOUT relance exactement la même commande
- **THEN** le terminal affiche « 0 créés, N mis à jour »
- **AND** le nombre de documents de la collection `aap` est inchangé

### Requirement: AAP clos et AAP sans date importés sur option

Le script SHALL ignorer par défaut les AAP dont la clôture est passée et ceux sans date de
clôture, et SHALL les importer quand les options `--include-expired` et
`--include-without-deadline` sont données ; un AAP sans date reçoit une échéance fictive à un an
et l'étiquette `sans-date-cloture`.

#### Scenario: Sans option

- **WHEN** Monsieur DUCOUT lance l'essai à blanc sans aucune option
- **THEN** le terminal indique les AAP ignorés avec les compteurs « expire » et « sans_date_cloture »

#### Scenario: Avec options

- **WHEN** Monsieur DUCOUT lance l'essai à blanc avec les deux options
- **THEN** les compteurs « expire » et « sans_date_cloture » valent 0

### Requirement: Secrets jamais versionnés

Le script SHALL lire la clé de compte de service dans `scripts/serviceAccountKey.json`, fichier
exclu de Git, et SHALL s'arrêter avec un message clair si le fichier est absent.

#### Scenario: Clé absente

- **WHEN** l'import réel est lancé sans fichier `scripts/serviceAccountKey.json`
- **THEN** le script affiche « Clé de compte de service introuvable » et n'écrit rien

#### Scenario: Protection Git

- **WHEN** Monsieur DUCOUT lance `git status` après avoir déposé la clé et `app/.env`
- **THEN** ni `serviceAccountKey.json` ni `app/.env` n'apparaissent dans les fichiers à commiter
