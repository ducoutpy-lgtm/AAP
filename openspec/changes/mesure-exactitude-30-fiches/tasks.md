# Tâches

- [x] 1.1 Tests d'abord (`scraping/tests/test_exactitude.py`) : tirage rejouable et filtré, calcul du rapport. Fait
  quand : ils échouent (module absent). (2026-11-16 : écrits avant le module, mais le premier échec venait d'une faute
  d'échappement dans le test lui-même, pas de l'absence du module ; écart noté.)
- [x] 1.2 `scraping/exactitude.py` (`--tirer`, `--rapport`). Fait quand : pytest vert. (2026-11-16 : pytest 167 verts ;
  `--tirer` lancé deux fois, fichiers identiques (`cmp`).)
- [ ] 2.1 Tirage réel, verdicts des 30 fiches contre leur texte source (`sources/exactitude_verdicts.json`), rapport
  `EXACTITUDE.md`.
- [ ] 2.2 Documentation (`docs/PILOTE_MVP.md` ligne Exactitude, `scraping/README.md`, `CHANGELOG.md`, `REPRISE.md`).
- [ ] 2.3 Relecture de 10 fiches par Monsieur DUCOUT (liste dans `EXACTITUDE.md`).
