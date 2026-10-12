# Tasks

## 1. Outil

- [x] 1.1 `qualification.py` : fonction pure `appliquer_relecture`, report de `verdict_modele` et `relecture` dans le registre, section « Relecture manuelle » du rapport, application lors de `--registre` et `--rapport`. Fait quand : les deux tests ajoutés dans `tests/test_qualification.py` passent avec les tests existants.
- [x] 1.2 Fichier initial `sources/relecture_qualification.json` (10 passages en confirmée, 60 en à vérifier, motifs en clair), généré par un script qui vérifie chaque identifiant. Fait quand : `--registre --rapport` régénère le registre et `QUALIFICATION.md` avec la section de relecture, et `registre.py --verifier-format` ne signale rien.

## 2. Relecture des pages

- [x] 2.1 Relecture par la session des 60 pages « à vérifier » (texte des pages gardées, sans Ollama ni API) ; pour les pages d'accueil et d'archives, recherche de la vraie rubrique sur le site, une à la fois. Fait quand : une liste de décisions (verdict proposé, motif, nouvelle adresse éventuelle) est présentée à Monsieur DUCOUT.
- [x] 2.2 Après accord de Monsieur DUCOUT : décisions écrites dans le fichier de relecture, nouvelles adresses dans le champ `notes` du registre, `--registre --rapport` relancé. Fait quand : plus aucune source « à vérifier » sans motif dans `QUALIFICATION.md`.

## 3. Documentation et vérification

- [x] 3.1 README scraping (section Qualification : relecture), `scraping/CHANGELOG.md`, `CHANGELOG.md`, `CLAUDE.md` (état d'avancement), `REPRISE.md`. Fait quand : fichiers relus.
- [x] 3.2 Vérification par Monsieur DUCOUT : lecture de la section « Relecture manuelle » de `QUALIFICATION.md`, contrôle d'une correction de chaque sorte (une passée en confirmée, une passée en à vérifier) sur la page d'origine. Fait quand : validation.

## Workflow follow-up

- Archiver après 3.2 ; reprendre ensuite `extraction-echantillon-aap` (tâche 2.1 faite, reste 3.1 à 3.4).
