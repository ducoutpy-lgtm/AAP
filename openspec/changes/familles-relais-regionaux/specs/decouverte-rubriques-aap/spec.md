# decouverte-rubriques-aap Specification (delta)

## ADDED Requirements

### Requirement: Liens d'un relais vers les sites des financeurs

Quand une source porte `relais: true` au registre, la découverte et la veille SHALL garder aussi les liens d'appel qui
mènent vers d'autres sites (page du financeur), en plus de ceux du site du relais. Les autres sources gardent la règle
du même site.

#### Scenario: Kozh Ensemble, veille de gérontopôle

- **WHEN** Monsieur DUCOUT lance `python scraping/decouverte.py --ids kozh-ensemble-gerontopole-bretagne --forcer --garder-depart`
- **THEN** le terminal affiche « rubrique-trouvee » avec plus de dix liens, dont l'appel de la Fondation du domicile
  (fondationdomicile.fr)

#### Scenario: Source ordinaire inchangée

- **WHEN** une source sans `relais` affiche un lien d'appel vers un autre site
- **THEN** ce lien n'est pas gardé, comme avant ce changement

#### Scenario: Contrôle du champ

- **WHEN** une source porte `relais: "oui"`
- **THEN** `python scraping/registre.py --verifier-format` affiche la source et le champ `relais`, et s'arrête avec un
  code de sortie non nul
