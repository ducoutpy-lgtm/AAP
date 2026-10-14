# registre-sources Specification

## ADDED Requirements

### Requirement: Adresse validée distincte de l'adresse d'origine

Une source du registre SHALL pouvoir porter `url_validee`, `validee_par` et `validee_le` à côté de
`url_aap` ; les outils SHALL lire l'adresse de travail par `registre.adresse_aap(source)` (`url_validee`
sinon `url_aap`) et seul le report des verdicts à l'écran (`validation.py --appliquer-pages`) SHALL écrire
`url_validee`. `registre.py --verifier-format` SHALL refuser une `url_validee` qui n'est pas une adresse http.

#### Scenario: Correction à l'écran

- **WHEN** Monsieur DUCOUT donne une nouvelle adresse pour une source dans la validation des pages, puis
  lance `--appliquer-pages`
- **THEN** la source garde son `url_aap` d'origine, reçoit `url_validee` avec la date, et la redécouverte
  part de `url_validee`

#### Scenario: Migration des corrections passées

- **WHEN** la migration est lancée sur le registre du 2026-10-13
- **THEN** les 42 sources dont la note dit « Adresse corrigée par Monsieur DUCOUT » ont `url_validee` égale
  à l'ancienne valeur de `url_aap` et `url_aap` égale à l'adresse « ancienne » de la note
