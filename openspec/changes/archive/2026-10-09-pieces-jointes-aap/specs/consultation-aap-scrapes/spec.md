# Spec Delta

## ADDED Requirements

### Requirement: Les pièces jointes d'un AAP scrapé sont consultables

La fiche d'un AAP scrapé SHALL afficher une section « Pièces jointes » listant chaque document
collecté (nom de fichier et lien ouvert dans un nouvel onglet) ; le lien SHALL servir, dans l'ordre,
la copie hébergée par la plateforme si elle existe, sinon la copie locale quand l'application tourne
sur le poste de Monsieur DUCOUT, sinon le fichier d'origine chez le financeur.
La liste de recherche SHALL indiquer le nombre de pièces jointes de chaque AAP.

#### Scenario: Fiche avec pièces jointes disponibles en local

- **WHEN** Monsieur DUCOUT, connecté avec son compte porteur, ouvre la fiche de l'AAP « Contrat d'Allocation d'Études - Campagne 2026 » (ARS Île-de-France)
- **THEN** une section « Pièces jointes » liste 5 documents (fichiers .docx)
- **AND** cliquer sur l'un d'eux ouvre ou télécharge le fichier dans un nouvel onglet, sans message « Forbidden »

#### Scenario: Document absent du disque

- **WHEN** la fiche affiche un document que le scraping n'a pas téléchargé localement (16 cas sur 109)
- **THEN** le lien pointe vers le fichier d'origine chez le financeur

#### Scenario: Fiche sans pièce jointe

- **WHEN** Monsieur DUCOUT ouvre la fiche d'un AAP scrapé sans document collecté
- **THEN** la section « Pièces jointes » n'apparaît pas

#### Scenario: Compteur dans la liste

- **WHEN** la liste de recherche affiche un AAP ayant des pièces jointes
- **THEN** la carte porte une indication « N pièce(s) jointe(s) »
- **AND** une carte sans pièce jointe ne porte aucune indication
