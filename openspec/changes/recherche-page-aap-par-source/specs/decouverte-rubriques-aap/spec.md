# decouverte-rubriques-aap Specification

## ADDED Requirements

### Requirement: Redécouverte d'une source corrigée

Quand l'adresse de départ d'une source a été corrigée par une validation à l'écran, la découverte
SHALL pouvoir être relancée sur cette seule source (`--ids` avec `--forcer`), repartir de la nouvelle
adresse et, avec `--garder-depart`, garder cette adresse comme page gardée sans visiter d'autres candidats
(c'est la page désignée à l'écran), en remplaçant la page gardée et ses liens. Le compte rendu de l'application des verdicts
SHALL lister les sources dont la page gardée après redécouverte n'est pas sur le domaine de
l'adresse donnée, pour une nouvelle validation à l'écran.

#### Scenario: Page rafraîchie après correction

- **WHEN** Monsieur DUCOUT lance `decouverte.py --ids inserm --forcer --garder-depart` après la correction de
  l'adresse de l'INSERM
- **THEN** `DECOUVERTE.md` montre pour l'INSERM une page gardée sur `pro.inserm.fr` avec son
  nombre de liens, et `validation_pages.cmd` présente cette nouvelle page

#### Scenario: Découverte qui s'écarte de l'adresse donnée

- **WHEN** la page gardée après redécouverte est sur un autre domaine que l'adresse donnée
- **THEN** la source figure dans la liste « à revalider à l'écran » du compte rendu
