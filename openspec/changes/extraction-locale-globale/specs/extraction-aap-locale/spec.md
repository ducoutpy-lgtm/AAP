# extraction-aap-locale Specification

## ADDED Requirements

### Requirement: Collecte du texte des pages candidates des rubriques validées

`python extraction_locale.py --collecter` SHALL parcourir les sources du registre dont la
qualification vaut `rubrique-confirmee`, dans l'ordre des familles (ARS, caisses nationales,
fondations, agences nationales, ministères, sociétés savantes, établissements, Europe, autres,
collectivités), SHALL lire chaque lien web de `decouverte/<id>/liens.json` une seule fois (même
adresse citée par deux sources comprise, fichiers PDF, Word, Excel et ZIP exclus) et SHALL
enregistrer le texte lisible dans `decouverte/<id>/fiches/`, sans relire une page déjà
enregistrée.

#### Scenario: Collecte reprise

- **WHEN** Monsieur DUCOUT lance `--collecter` une seconde fois
- **THEN** le terminal indique pour chaque source le nombre de pages déjà présentes et le nombre
  de pages lues, et le total de pages lues au second passage vaut 0 si rien n'a changé

### Requirement: Extraction par le modèle local avec marque « à vérifier »

`python extraction_locale.py --extraire --modele qwen3:8b` SHALL appliquer à chaque texte collecté
la chaîne de l'échantillon (question fermée, extraction, contrôle des formats avec seconde demande
puis null) et SHALL écrire les fiches dans `results/extraction_locale.json`, chacune portant
`scrape_metadata.moteur = "ollama"`, `scrape_metadata.modele`, `scrape_metadata.source`
(identifiant du registre) et `scrape_metadata.a_verifier = true`. Les pages refusées SHALL être
gardées dans `results/extraction_locale_non_aap.json` avec la raison, les échecs dans
`results/extraction_locale.errors.json`. Une relance SHALL reprendre après la dernière page traitée.
Aucun appel à l'API Anthropic ne SHALL être fait.

#### Scenario: Fiches marquées

- **WHEN** Monsieur DUCOUT lance `--extraire --modele qwen3:8b --limite 3`
- **THEN** `results/extraction_locale.json` contient au plus 3 fiches, chacune avec
  `scrape_metadata.a_verifier` à true et `scrape_metadata.moteur` à « ollama »

#### Scenario: Reprise après arrêt

- **WHEN** l'extraction est interrompue puis relancée
- **THEN** le terminal affiche le nombre de pages déjà traitées et ne rappelle pas le modèle
  sur elles

### Requirement: Bilan d'avancement

`python extraction_locale.py --bilan` SHALL afficher le nombre de sources concernées, de pages
web candidates, de textes collectés, de fiches produites, de pages refusées, d'échecs, et le temps
de calcul cumulé, sans appeler le modèle.

#### Scenario: Bilan lisible

- **WHEN** Monsieur DUCOUT lance `--bilan` pendant ou après l'extraction
- **THEN** il lit une ligne par compteur et une estimation du temps restant d'après la durée
  moyenne constatée
