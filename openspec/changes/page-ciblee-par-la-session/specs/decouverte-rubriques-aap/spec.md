# decouverte-rubriques-aap Specification

## ADDED Requirements

### Requirement: Une page ciblée est lue comme une page validée

Quand une source porte `page_ciblee` au registre, la découverte SHALL partir de cette page (sauf `url_validee`, qui
prime) et SHALL la retenir dès un lien d'appel, comme une page validée à la main ; les réglages écrits dans `liens.json`
pour la veille (seuil, page d'appel, relais) SHALL être les mêmes qu'avant la migration du lot B1.

#### Scenario: Aucune lecture perdue par la migration

- **WHEN** la session compare, pour chacune des 47 sources migrées, les réglages calculés depuis le registre migré et
  ceux enregistrés dans `scraping/decouverte/<id>/liens.json`
- **THEN** aucun écart n'apparaît (seuil 1, page d'appel inchangée)

#### Scenario: Département à un seul lien d'appel

- **WHEN** Monsieur DUCOUT lance `python scraping/decouverte.py --ids aude-appels-a-projets --forcer --garder-depart`
- **THEN** le terminal affiche « rubrique-trouvee » avec au moins un lien d'appel, et non « aucune rubrique »

#### Scenario: Page qui est elle-même l'appel

- **WHEN** il lance `python scraping/decouverte.py --ids dordogne-commission-des-financeurs --forcer --garder-depart`
- **THEN** le terminal affiche « rubrique-trouvee » et `liens.json` contient l'adresse de la page elle-même
