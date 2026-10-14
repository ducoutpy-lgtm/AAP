# import-aap-scrapes Specification

## ADDED Requirements

### Requirement: Source réelle de chaque fiche

L'import SHALL écrire dans `scrapeMetadata.source` l'identifiant d'émetteur du registre porté par la fiche quand il
existe, et son nom dans `scrapeMetadata.sourceNom` ; le nom du fichier d'origine SHALL rester disponible dans
`scrapeMetadata.fichier`.

#### Scenario: Fiche du passage local

- **WHEN** l'import lit une fiche produite par le passage local pour l'émetteur `ars-normandie`
- **THEN** la fiche enregistrée porte `scrapeMetadata.source = ars-normandie`, `sourceNom = ARS Normandie` et
  `fichier = extraction_locale`

### Requirement: Financeur canonique

L'import SHALL remplacer le nom de financeur extrait par le nom canonique de `scraping/sources/financeurs.json` quand
le nom extrait ou l'émetteur de la fiche correspond à un alias, SHALL conserver le nom extrait dans
`scrapeMetadata.financeurExtrait`, et SHALL laisser le nom extrait tel quel sinon.

#### Scenario: Six orthographes, un financeur

- **WHEN** six fiches de l'ARS Île-de-France portent six orthographes du financeur
- **THEN** les six fiches enregistrées portent `financeurName = ARS Île-de-France`, et le filtre Financeur de
  l'application ne propose qu'une entrée pour cette ARS

### Requirement: Territoire déduit, jamais « france » par défaut

L'import SHALL reconnaître les régions et les départements dans le territoire extrait (département -> région),
SHALL déduire le territoire de l'émetteur quand la fiche n'en dit rien (ARS, conseil régional, conseil
départemental, ville), SHALL réserver `france` aux appels nationaux explicites et SHALL écrire `non-precise` sinon.

#### Scenario: Appel d'une ARS sans territoire extrait

- **WHEN** une fiche de l'ARS Normandie ne précise aucun territoire
- **THEN** elle porte `territoriesEligible = [normandie]` et le filtre « Normandie » la renvoie

#### Scenario: Territoire inconnu

- **WHEN** le territoire extrait n'est ni une région, ni un département, ni une mention nationale, et l'émetteur
  n'est pas territorial
- **THEN** la fiche porte `non-precise` et l'application affiche « Territoire non précisé »

### Requirement: Rapport des doublons

L'outil SHALL produire la liste des fiches publiées dont le titre normalisé et le financeur canonique sont
identiques, pour décision humaine, sans fusion automatique.

#### Scenario: Deux fiches pour un même appel

- **WHEN** le rapport est lancé après le ré-import
- **THEN** il liste chaque groupe de doublons avec les adresses, et Monsieur DUCOUT décide dans la validation
  quotidienne laquelle garder
