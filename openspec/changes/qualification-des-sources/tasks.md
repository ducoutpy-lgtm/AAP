# Tasks

## 1. Outil

- [x] 1.1 `scraping/qualification.py` : texte de la page gardée, appel Ollama (JSON contraint), calcul du verdict, enregistrement dans `decouverte/qualification.json` avec reprise, options `--qualifier`, `--limite`, `--ids`, `--registre`, `--rapport`. Fait quand : `--limite 5` affiche 5 verdicts plausibles.
- [x] 1.2 Tests `scraping/tests/test_qualification.py` (texte sans balises, calcul du verdict, report dans le registre, décompte du rapport). Fait quand : pytest vert.

## 2. Passage et sondage

- [x] 2.1 Qualification des 270 rubriques en arrière-plan. Fait quand : `qualification.json` a 270 entrées.
- [x] 2.2 Sondage manuel de 30 verdicts au moins, répartis par famille, noté dans `decouverte/sondage_qualification.json`. Fait quand : taux d'accord calculé ; si inférieur à 80 %, second passage avec `qwen3.6` sur les désaccords.
- [x] 2.3 `--registre` : champ `qualification` écrit pour les 847 sources (`a-verifier` sans page gardée) ; `registre.py --verifier-format` sans erreur ; `REGISTRE_SOURCES.md` régénéré avec la colonne. Fait quand : les trois conditions sont remplies.

## 3. Rapport, documentation, vérification

- [x] 3.1 `--rapport` écrit `QUALIFICATION.md`. Fait quand : décompte par famille, sources confirmées, sources à vérifier.
- [x] 3.2 README scraping, CHANGELOGs, CLAUDE.md. Fait quand : fichiers relus.
- [ ] 3.3 Vérification par Monsieur DUCOUT : lecture de `QUALIFICATION.md`, contrôle de deux verdicts (un confirmé, un pas-d-aap) sur les pages d'origine. Fait quand : validation.

## Workflow follow-up

- Archiver après 3.3 ; reprendre ensuite `extraction-echantillon-aap` sur les rubriques confirmées.
