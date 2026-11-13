# import-aap-scrapes Specification

## ADDED Requirements

### Requirement: Axes distincts jamais rapprochés

Le rapport des doublons SHALL ne jamais rapprocher deux fiches dont les titres portent chacun un numéro d'axe, de lot ou
de volet, et dont ces numéros diffèrent.

#### Scenario: Axe 3 et Axe 5 du Pas-de-Calais

- **WHEN** Monsieur DUCOUT lance `python scripts/doublons.py --file` puis ouvre `docs/DOUBLONS.md`
- **THEN** aucun groupe ne réunit l'« Axe 3 » et l'« Axe 5 » de la conférence des financeurs du Pas-de-Calais

#### Scenario: Même axe repris deux fois

- **WHEN** deux fiches du même financeur, de même date de clôture, portent toutes deux « Axe 5 » dans leur titre
- **THEN** elles restent rapprochées comme doublons
