# Tasks

## 1. Outil

- [x] 1.1 Installer Playwright et Chromium dans `.venv` ; `scraping/decouverte.py` (notation des liens, choix de la rubrique, navigateur, enregistrement, reprise, options `--limite`, `--ids`, `--categorie`, `--parallele`, `--forcer`, `--rapport`). Fait quand : `--ids ars-bretagne` affiche « rubrique trouvée » avec des liens.
- [x] 1.2 Tests `scraping/tests/test_decouverte.py` sur les fonctions pures (notation, choix de la rubrique, reprise). Fait quand : pytest vert.

## 2. Essai puis lancement complet

- [x] 2.1 Essai sur 10 sources de familles différentes (`--limite 10`), lecture des résultats, ajustement des mots-clés si besoin. Fait quand : au moins 5 rubriques trouvées sur 10.
- [x] 2.2 Lancement sur tout le registre en arrière-plan, puis `--rapport`. Fait quand : `DECOUVERTE.md` écrit avec le décompte global et par famille.

## 3. Documentation et vérification finale

- [x] 3.1 README scraping (section découverte), CHANGELOGs, CLAUDE.md (avancement). Fait quand : fichiers relus.
- [x] 3.2 Lecture du rapport par Monsieur DUCOUT ; décision sur l'étape suivante (test d'extraction sur échantillon). Fait quand : validation.

## Workflow follow-up

- Archiver après 3.2 ; changement suivant : extraction sur échantillon (comparatif Claude Code / Ollama / API).
