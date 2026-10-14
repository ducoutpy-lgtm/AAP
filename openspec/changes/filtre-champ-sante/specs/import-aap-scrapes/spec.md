# import-aap-scrapes Specification

## ADDED Requirements

### Requirement: Fiche hors champ en brouillon

À la création d'un document, l'import SHALL placer toute fiche dont `scrape_metadata.champ` vaut `hors-champ` en
brouillon avec `validation.statut = a_corriger`, le commentaire « hors champ (modèle) », `par = import (champ)` et
l'étiquette `hors-champ` ; une fiche `incertain` SHALL recevoir l'étiquette `champ-incertain` sans autre changement ;
les autres valeurs ne changent rien. Sur un document existant, `status` et `validation` restent jamais réécrits.

#### Scenario: Appel agricole importé

- **WHEN** l'import lit une fiche nouvelle dont le champ vaut `hors-champ`
- **THEN** le document créé est en brouillon, à corriger, commentaire « hors champ (modèle) », étiquettes
  `a-verifier` et `hors-champ`, et il n'apparaît pas sur `/aap/search`

#### Scenario: Fiche incertaine

- **WHEN** l'import lit une fiche nouvelle dont le champ vaut `incertain`
- **THEN** le document est traité comme aujourd'hui et porte en plus l'étiquette `champ-incertain`

#### Scenario: Document existant inchangé

- **WHEN** un document déjà publié est réimporté avec un champ `hors-champ`
- **THEN** son statut et sa validation ne changent pas, et seule la migration dédiée peut le repasser en brouillon

### Requirement: Verdict « hors champ » rejeté

L'import SHALL traiter le verdict `hors-champ` de `sources/verdicts_fiches.json` comme `rejetee`, commentaire
« hors champ », document archivé.

#### Scenario: Verdict hors champ appliqué

- **WHEN** Monsieur DUCOUT a donné le verdict `hors-champ` sur une fiche et l'import est relancé
- **THEN** le document passe en `validation.statut = rejetee` et `status = archived`, comme pour « pas un AAP »

### Requirement: Migration des fiches publiées hors champ

`scripts/migrer_champ.py` SHALL retrouver les documents publiés dont la fiche est classée `hors-champ`, SHALL
sauvegarder ces documents en JSON dans `scripts/sauvegardes/`, SHALL afficher en essai à blanc le compte et cinq
exemples, et SHALL, après accord écrit, les passer en brouillon à corriger « hors champ (modèle) ».

#### Scenario: Essai à blanc puis migration

- **WHEN** `migrer_champ.py --dry-run` puis, après accord, `migrer_champ.py` sont lancés
- **THEN** le compte avant et après est affiché, le fichier de sauvegarde existe, et `/aap/search` ne montre plus
  ces fiches
