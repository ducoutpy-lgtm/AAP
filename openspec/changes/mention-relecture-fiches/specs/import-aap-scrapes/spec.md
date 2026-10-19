# import-aap-scrapes Specification

## ADDED Requirements

### Requirement: Date d'extraction dans le document

L'import SHALL écrire `scrapeMetadata.extraitLe`, date de production de la fiche par le moteur (`produite_le` du passage
local ou API, sinon `scraped_at` d'un connecteur), au format ISO, et une chaîne vide si aucune des deux n'existe.

#### Scenario: Fiche du passage API

- **WHEN** une fiche porte `scrape_metadata.produite_le = 2026-10-19T10:12:00`
- **THEN** le document porte `scrapeMetadata.extraitLe = 2026-10-19T10:12:00`
