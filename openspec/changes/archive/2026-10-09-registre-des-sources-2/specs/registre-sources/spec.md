# Spec Delta

## ADDED Requirements

### Requirement: Couverture des émetteurs locaux de l'État et des caisses

Le registre SHALL couvrir, un organisme par site web, les caisses locales (CAF, CPAM, Carsat,
MSA) et les services déconcentrés de l'État (préfectures, DREETS, DDETS, DRAAF) de tous les
départements, ainsi que les plateformes de dépôt qui hébergent des appels sans page financeur.

#### Scenario: Couverture locale

- **WHEN** Monsieur DUCOUT ouvre `scraping/REGISTRE_SOURCES.md`
- **THEN** il trouve la CAF, la CPAM et la préfecture de l'Essonne, la DREETS Île-de-France et la DRAAF de sa région
- **AND** le décompte total dépasse 600 sources

#### Scenario: Plateformes de dépôt

- **WHEN** il consulte la catégorie « Autres émetteurs »
- **THEN** Démarches simplifiées, Démarche numérique, Dauphin et Le Compte Asso y figurent
