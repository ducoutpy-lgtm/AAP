# registre-sources Specification

## Purpose
Tient l'inventaire des organismes qui publient des appels à projets santé et médico-social, avec
pour chacun la page à scraper, l'état de son connecteur et la date du dernier contrôle de la page.

## Requirements

### Requirement: Un registre unique des sources au format fixe

Le projet SHALL tenir un fichier unique `scraping/sources/registre.json` où chaque source porte
un identifiant, un nom, une catégorie fermée, la page où les AAP sont publiés, un périmètre, un
statut d'avancement, le connecteur associé s'il existe, des notes et le résultat du dernier
contrôle de page.

#### Scenario: Fichier valide

- **WHEN** Monsieur DUCOUT lance `python scraping/registre.py --verifier-format`
- **THEN** l'outil affiche « Registre valide : N sources » sans erreur
- **AND** chaque source a les champs `id`, `nom`, `categorie`, `url_aap`, `perimetre`, `statut`, `connecteur`, `notes`, `derniere_verification`, `code_http`

#### Scenario: Valeurs autorisées

- **WHEN** l'outil vérifie le format
- **THEN** `categorie` est l'une de : ars, ministere, caisse-nationale, agence-nationale, fondation, europe, collectivite, societe-savante, etablissement, centrale-achat, autre
- **AND** `perimetre` est l'un de : sante, medico-social, sante-et-medico-social
- **AND** `statut` est l'un de : identifiee, page-verifiee, connecteur-teste, operationnelle

#### Scenario: Source incomplète

- **WHEN** une source du fichier n'a pas de `url_aap` ou a une `categorie` inconnue
- **THEN** l'outil affiche la source fautive et le champ en cause, et s'arrête avec un code de sortie non nul

### Requirement: Les pages des sources sont contrôlées

L'outil SHALL, sur demande, interroger la page `url_aap` de chaque source, enregistrer le code HTTP
et la date du contrôle dans le registre, et passer au statut `page-verifiee` toute source
`identifiee` dont la page répond 200 ; une page en erreur ne change pas de statut et est listée en
fin de rapport.

#### Scenario: Contrôle des pages

- **WHEN** Monsieur DUCOUT lance `python scraping/registre.py --verifier-pages`
- **THEN** le terminal affiche, pour chaque source, son code HTTP, puis un résumé « N pages OK, M en erreur »
- **AND** le registre contient pour chaque source la date du jour et le code obtenu

#### Scenario: Page en erreur

- **WHEN** une source répond 403, 404 ou ne répond pas
- **THEN** elle apparaît dans la liste « à revoir » du rapport, avec son code, et garde son statut

### Requirement: Une vue lisible du registre

L'outil SHALL produire `scraping/REGISTRE_SOURCES.md` : un tableau par catégorie (nom, périmètre,
statut, page, dernier contrôle), précédé d'un décompte des sources par statut.

#### Scenario: Génération du tableau

- **WHEN** Monsieur DUCOUT lance `python scraping/registre.py --tableau`
- **THEN** le fichier `scraping/REGISTRE_SOURCES.md` est écrit et commence par le décompte, par exemple « 42 sources : 5 opérationnelles, 37 page vérifiée »
- **AND** chaque ligne du tableau porte un lien cliquable vers la page des AAP

### Requirement: Première constitution du registre

Le registre SHALL couvrir, à l'issue de ce changement, chaque famille d'émetteurs d'AAP santé et
médico-social (ARS, caisses et agences nationales, ministères, fondations, programmes européens,
collectivités), avec au moins 40 sources dont la page est vérifiée, et les connecteurs existants
rattachés à leur source.

#### Scenario: Couverture minimale

- **WHEN** Monsieur DUCOUT ouvre `scraping/REGISTRE_SOURCES.md`
- **THEN** il voit les 17 ARS, la CNSA, la CNAM, la CNAV, le ministère de la Santé et la Fondation de France
- **AND** le décompte indique au moins 40 sources en statut « page vérifiée » ou mieux
- **AND** `fondation_de_france`, `ars_idf`, `ars_idf_local`, `cnsa`, `ars_corse` apparaissent en « opérationnelle »
