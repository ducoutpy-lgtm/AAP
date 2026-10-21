# connecteur-appelsprojetsrecherche Specification

## Purpose

Que chaque appel du portail appelsprojetsrecherche.fr devienne une fiche de l'application, avec ses vraies dates,
sans lecture par un modèle.

## Requirements

### Requirement: Lecture de l'export CSV

`portail_recherche.py` SHALL télécharger l'export CSV du portail et SHALL produire une fiche `AapNormalized` par
ligne : `titre`, `financeur` (colonne Partenaire), `description`, `url_source` (lien de la fiche), `date_ouverture`
et `date_cloture` au format ISO, `scrape_metadata` avec `source` = `appelsprojetsrecherche-fr`, `moteur` = `csv`,
`collecte_le`, `produite_le`, `vue_rubrique_le`. Une ligne sans titre ou sans lien SHALL être ignorée et comptée.

#### Scenario: Fichier produit

- **WHEN** Monsieur DUCOUT lance `python scraping/portail_recherche.py`
- **THEN** le terminal affiche le nombre de lignes lues, de fiches écrites et d'appels encore ouverts, et
  `scraping/results/appelsprojetsrecherche.json` contient autant de fiches que de lignes valides

#### Scenario: Conversion d'une ligne

- **WHEN** une ligne porte « 21/10/2026 11:00 » en date d'ouverture et « 30/06/2027 17:00 » en clôture
- **THEN** la fiche porte `date_ouverture` = `2026-10-21` et `date_cloture` = `2027-06-30`

#### Scenario: Export indisponible

- **WHEN** le portail ne répond pas ou renvoie autre chose qu'un CSV
- **THEN** le script s'arrête avec un message clair et ne touche pas au fichier de résultats précédent

### Requirement: Entrée dans la chaîne existante

Les fiches SHALL être lues par `scripts/import_to_firestore.py` comme celles d'un connecteur (émetteur du registre
`appelsprojetsrecherche-fr`, financeur canonique d'après le partenaire), classées par `champ.py` après devis, puis
contrôlées et qualifiées par la chaîne habituelle.

#### Scenario: Appel ouvert dans l'application

- **WHEN** l'import a tourné après le classement du champ
- **THEN** l'appel INCa « ZEROEXPO » (clôture 24 novembre 2026) est visible dans la recherche avec le financeur INCa
  et sa date de clôture
