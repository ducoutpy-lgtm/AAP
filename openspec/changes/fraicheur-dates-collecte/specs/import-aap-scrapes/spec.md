# import-aap-scrapes Specification

## ADDED Requirements

### Requirement: Dates de collecte et de dernière vue dans le document

L'import SHALL écrire `scrapeMetadata.collecteLe` (depuis `scrape_metadata.collecte_le`, sinon `scraped_at` d'un
connecteur, sinon chaîne vide) et `scrapeMetadata.derniereVueLe` (date et heure de l'import, au format ISO), et SHALL
réécrire `derniereVueLe` à chaque import où la fiche figure dans un fichier de résultats, y compris sur une fiche
validée (champ technique, jamais un champ humain ni métier).

#### Scenario: Fiche revue par un import

- **WHEN** une fiche validée est importée de nouveau le 2026-10-26
- **THEN** son document porte `derniereVueLe` au 2026-10-26, et ses champs métier et sa validation sont inchangés

#### Scenario: Fiche d'un connecteur

- **WHEN** une fiche porte `scraped_at` et pas `collecte_le`
- **THEN** `collecteLe` vaut `scraped_at`

### Requirement: Un verdict humain atteint le document existant

Sur un document existant, l'import SHALL écrire `validation` et `status` quand la fiche porte un verdict humain
(`validation.par` = relecteur) ; `publishedAt`, les champs métier et les tags SHALL rester protégés.

#### Scenario: Verdict donné après l'import

- **WHEN** Monsieur DUCOUT juge « AAP juste » une fiche déjà en base, puis l'import est relancé
- **THEN** le document passe `validation.statut = validee`, `par` = relecteur, sans changement de titre ni de date
