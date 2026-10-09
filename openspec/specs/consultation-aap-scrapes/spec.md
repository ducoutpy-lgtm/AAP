# consultation-aap-scrapes Specification

## Purpose
Permet à un porteur de projet de voir et de consulter dans l'application les AAP issus du
scraping, exactement comme des AAP saisis à la main.

## Requirements

### Requirement: Les AAP scrapés apparaissent dans la recherche

La page « Rechercher des AAP » SHALL lister les AAP scrapés, avec titre et nom du financeur,
pour tout utilisateur connecté disposant d'un abonnement actif ou en période d'essai.

#### Scenario: Liste après import

- **WHEN** Monsieur DUCOUT se connecte avec un compte porteur en période d'essai et ouvre « Rechercher des AAP »
- **THEN** la liste affiche des AAP dont le financeur est « ARS Île-de-France », « Fondation de France », « CNSA » ou « ARS Corse »

#### Scenario: Recherche par mot

- **WHEN** il tape « Corse » dans le champ de recherche
- **THEN** seuls les AAP dont le titre, la description ou le financeur contient « Corse » restent affichés

### Requirement: La fiche d'un AAP scrapé est complète

La fiche d'un AAP scrapé SHALL afficher la description, la date de clôture, les critères
d'éligibilité et un lien vers la page d'origine chez le financeur.

#### Scenario: Ouverture d'une fiche

- **WHEN** Monsieur DUCOUT clique sur l'AAP « Contrat d'Allocation d'Études - Campagne 2026 » (ARS Île-de-France)
- **THEN** la fiche affiche la date de clôture 16/10/2026 et la liste des critères d'éligibilité
- **AND** le lien vers la source ouvre la page iledefrance.ars.sante.fr correspondante dans un nouvel onglet

### Requirement: Un AAP clos est signalé comme tel

Un AAP dont la date de clôture est passée SHALL afficher la mention « Clôturé » dans la liste et
dans la fiche, à la place d'un nombre de jours restants négatif.

#### Scenario: AAP clos dans la liste

- **WHEN** la liste affiche un AAP dont la clôture est antérieure à aujourd'hui
- **THEN** la carte porte la mention « Clôturé » et aucun nombre de jours négatif n'apparaît

#### Scenario: AAP ouvert

- **WHEN** la liste affiche un AAP dont la clôture est dans 7 jours
- **THEN** la carte affiche « 7 jours restants » comme aujourd'hui
