# import-aap-scrapes Specification

## ADDED Requirements

### Requirement: Identifiant stable dérivé de l'adresse de l'appel

Le script d'import SHALL écrire chaque AAP sous l'identifiant `scraped-` suivi des 16 premiers caractères
du sha1 de son adresse `url_source` normalisée, et SHALL conserver la signature (titre, financeur, clôture)
comme attribut `scrapeMetadata.signature`.

#### Scenario: Deux moteurs, un seul document

- **WHEN** un connecteur et le modèle local produisent chacun une fiche pour la même adresse, avec deux
  titres différents
- **THEN** l'essai à blanc annonce un seul document à importer pour cette adresse

### Requirement: Les décisions humaines ne sont jamais réécrites par l'import

Pour un document déjà présent dans la collection, le script SHALL ne pas envoyer les champs `status`,
`publishedAt` et `validation`.

#### Scenario: AAP archivé puis réimporté

- **WHEN** Monsieur DUCOUT archive un AAP dans l'écran d'administration, puis relance l'import
- **THEN** l'AAP reste `archived` et n'apparaît pas dans « Rechercher des AAP »

### Requirement: Les verdicts sur les fiches pilotent l'import

Le script SHALL lire `scraping/sources/verdicts_fiches.json` (clé = adresse de l'appel) et SHALL écrire un
bloc `validation` {`statut`, `commentaire`, `date`} dans chaque document : sans verdict `proposee` ;
`aap-a-corriger` -> `a_corriger`, étiquette `a-verifier` gardée ; `aap-juste` -> `validee`, étiquette retirée
et champs métier non réécrits sur un document existant ; `pas-un-aap` -> `rejetee` et `status: archived`
à la création.

#### Scenario: Fiche jugée « pas un appel »

- **WHEN** Monsieur DUCOUT juge une fiche « pas un AAP » dans le raccourci de validation, puis relance l'import
- **THEN** la fiche disparaît de « Rechercher des AAP » et son document porte `validation.statut = rejetee`

#### Scenario: Fiche jugée juste

- **WHEN** il juge une fiche « AAP juste » puis relance l'import
- **THEN** le badge « À vérifier » disparaît de cette fiche dans l'application

### Requirement: Fiches sans date de clôture en attente

Le script SHALL importer les fiches sans date de clôture avec `status: draft`, une échéance fictive à un
an, l'étiquette `sans-date-cloture` et `validation.statut = a_corriger`, sans option.

#### Scenario: Fiche sans date

- **WHEN** l'essai à blanc lit une fiche sans date de clôture
- **THEN** elle est comptée « à importer » avec la mention `draft` et n'apparaît pas aux visiteurs sans compte
