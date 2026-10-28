# registre-sources Specification (delta)

## ADDED Requirements

### Requirement: Couverture des conférences des financeurs

Le registre SHALL couvrir les conférences des financeurs de la prévention de la perte d'autonomie, une par département
plus la Métropole de Lyon, avec une liste de référence (`sources/annuaires/conferences_financeurs.csv`) et un taux de
couverture mesuré. Une ligne SHALL n'avoir d'`id_registre` que si la source désignée suit une page où l'appel de la
conférence est publié ; sinon elle SHALL porter le motif de l'absence.

#### Scenario: Couverture affichée

- **WHEN** Monsieur DUCOUT lance `python scraping/registre.py --tableau` puis ouvre `scraping/REGISTRE_SOURCES.md`
- **THEN** le tableau « Couverture par famille » affiche une ligne « Conférences des financeurs de la prévention de la
  perte d'autonomie » avec un compte « n / 102 » mesuré, et non plus « couverture non mesurée »

#### Scenario: Page sans lien lisible

- **WHEN** la découverte ne lit aucun lien sur une page inscrite (page bloquée, redirigée vers l'accueil, ou sans lien
  d'appel)
- **THEN** la ligne du département ne compte pas dans la couverture et son motif le dit ; une page qui porte elle-même
  l'appel est réglée `page_appel` et relue

#### Scenario: Pas de double lecture d'une même page

- **WHEN** la source d'un département liste déjà l'appel de la conférence
- **THEN** la ligne du département pointe vers cette source et aucune source dédiée n'est ajoutée pour la même page

#### Scenario: Adresse validée par Monsieur DUCOUT conservée

- **WHEN** la source d'un département porte une `url_validee` posée par Monsieur DUCOUT et que la page de la conférence
  est ailleurs
- **THEN** cette adresse reste inchangée et la page de la conférence est inscrite dans une source dédiée

#### Scenario: Pages suivies par la veille

- **WHEN** la découverte est lancée sur les sources ajoutées ou modifiées (`decouverte.py --ids ... --forcer
  --garder-depart`)
- **THEN** chaque source a un fichier `decouverte/<id>/liens.json`, même sans appel ce jour-là, et `rejeu.py` la relit

#### Scenario: Dépense dans la délégation

- **WHEN** les textes collectés sont extraits, contrôlés et qualifiés
- **THEN** chaque commande payante affiche son devis et tourne avec `--plafond` égal au cumul plus ce devis, dans les
  limites du pilote (0,20 euro par commande, 0,50 euro par semaine)
