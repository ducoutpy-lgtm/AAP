# Tasks

Décision de Monsieur DUCOUT (2026-10-13, soir) : extraction au modèle local sur les 242 pages validées,
zéro euro, fiches marquées à vérifier, risque d'erreurs de l'échantillon accepté. Règle « Preuve avant
affirmation » : chaque tâche n'est cochée qu'avec la preuve indiquée.

## 1. Outil

- [x] 1.1 `scraping/echantillon.py` : `extraire` accepte un chemin de sortie et des métadonnées ajoutées
  (modification chirurgicale, comportement de l'échantillon inchangé). Fait quand : `pytest tests -q` vert.
  (Fait le 2026-10-13 : `pytest tests -q` : 49 passed in 0.44s.)
- [x] 1.2 `scraping/extraction_locale.py` : sélection et ordre des sources confirmées, liens web uniques,
  `--collecter`, `--extraire --modele`, `--bilan`, `--limite`, `--ids`. Tests `tests/test_extraction_locale.py`
  (ordre des sources, liens web uniques, bilan). Fait quand : pytest vert, `--bilan` collé.
  (Fait le 2026-10-13 : 3 tests dans les 49 ; `--bilan` : « Sources en rubrique confirmée : 242 », « Pages web candidates
  (adresses uniques) : 2395 », « Textes collectés : 40 » avant collecte.)
- [x] 1.3 `scripts/import_to_firestore.py` : étiquette `a-verifier` quand `scrape_metadata.moteur` vaut
  `ollama`. Fait quand : essai à blanc `--source extraction_locale` collé avec l'étiquette.
  (Fait le 2026-10-13 : « AAP lus : 2 | a importer : 1 ... [ed5bae1d99a0696e] ARS Normandie - Appel à projet - ESMS
  Numérique 2026 - cloture 2026-10-15 - a-verifier ».)
- [x] 1.4 Application : badge « À vérifier » dans `SearchAapPage.tsx` et `AapDetailPage.tsx` quand
  l'étiquette est présente. Fait quand : `npm run build` passe et la mention est lue dans le navigateur.
  (Fait le 2026-10-13 : « built in 6.09s » ; après import de 2 fiches, la liste affiche « 97 AAP disponibles » et deux
  badges « À vérifier » ; la fiche `/aap/scraped-ed5bae1d99a0696e` affiche le badge sous le titre ; lu avec le navigateur
  intégré de la session.)

## 2. Exécution

- [x] 2.1 `--extraire --limite 3` puis relance : fiches marquées, reprise prouvée (sortie collée).
  (Fait le 2026-10-13 : « [1/3] ok 52s Appel à projet - ESMS Numérique 2026 », « [2/3] ok 43s Appels à candidatures
  Référent handicap territorial », « [3/3] échec 790e842042.txt TimeoutError » (Dentobus, déjà en délai dépassé à
  l'échantillon) ; relance sur `--ids ars-normandie --limite 3` : « 3 pages déjà traitées sur 3 », « 0 nouvelles, 0 s ».
  Fiches avec `a_verifier` true et `moteur` ollama.)
- [x] 2.2 `--collecter` sur les 242 sources (navigateur). Fait quand : `--bilan` collé (textes collectés sur pages
  candidates). (Fait : lancée le 2026-10-13 à 16 h 50, terminée le 2026-10-14 à 0 h 30, soit 7 h 40 : « 2138 pages lues à
  ce passage », 109 erreurs de chargement, 113 textes trop courts ignorés ; `--bilan` : « Textes collectés : 2178 » sur
  2 395 adresses.)
- [ ] 2.3 `--extraire --modele qwen3:8b` en tâche de fond, par nuits (lancée le 2026-10-13 à 17 h 20 sur les 117 textes
  collectés ; à relancer après chaque passage de collecte pour les textes nouveaux) ; import par lots
  (`python scripts/import_to_firestore.py --source extraction_locale`) ; `--bilan` collé à chaque lot.
  Fait quand : toutes les pages collectées sont traitées (fiche, refus ou échec).

## 3. Documentation

- [x] 3.1 README scraping (section « Extraction locale globale »), CHANGELOGs, CLAUDE.md (tableau),
  REPRISE.md, feuille de route (étape 3). Fait quand : les fichiers citent les mêmes commandes que l'outil.
  (Fait le 2026-10-13 : section « Extraction locale globale » du README scraping, CHANGELOGs, CLAUDE.md, REPRISE.md,
  feuille de route ; décomptes finaux à reporter à la fin du passage.)

## 4. Vérification

- [ ] 4.1 Vérification par Monsieur DUCOUT : il ouvre http://localhost:3000/aap/search, voit des AAP
  « À vérifier » d'ARS ou de fondations absents avant, en ouvre un et compare à la page d'origine.
