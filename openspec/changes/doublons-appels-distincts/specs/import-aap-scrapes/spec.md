# import-aap-scrapes Specification

## ADDED Requirements

### Requirement: Appels distincts jamais rapprochés par la règle approximative

Le rapport des doublons SHALL ne pas rapprocher, par la règle « même clôture et mots en commun », deux fiches dont les
territoires précis sont disjoints, deux pages différentes d'un même site, ou deux fiches dont les nombres du titre
(hors années) sont disjoints. Un titre identique au même financeur ou un même code européen restent des doublons.

#### Scenario: Même programme dans deux régions

- **WHEN** Monsieur DUCOUT ouvre `docs/DOUBLONS.md` après `python scripts/doublons.py --file`
- **THEN** aucun groupe ne réunit les appels « ESMS numérique » de deux ARS différentes

#### Scenario: Deux appels d'un même site

- **WHEN** il cherche « CRSA de Mayotte » ou « Guyane Santé 2030 » dans `docs/DOUBLONS.md`
- **THEN** il ne les trouve dans aucun groupe

#### Scenario: Relais d'un même appel

- **WHEN** un pôle de compétitivité reprend un appel de Bpifrance (même clôture, titre proche, autre site)
- **THEN** les deux fiches restent rapprochées et la fiche de Bpifrance est proposée à garder
