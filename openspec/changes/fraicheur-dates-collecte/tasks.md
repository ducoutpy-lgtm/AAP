# Tasks

Lot 2 du rapport de critique, instruction 10 ; accord de Monsieur DUCOUT du 2026-10-19 (« reprends le lot 2 »). Zéro
euro. Règles : aucun `git push`, aucun archivage sans demande, rattrapage des fichiers après essai à blanc et sauvegarde,
import réel après essai à blanc.

## 1. Code

- [x] 1.1 `echantillon.py` : en-tête `# collecte_le` écrit par les deux collecteurs, `lire_fiche` compatible ancien et
  nouveau format, `date_collecte`, `collecte_le` dans `extraire` et `extraire_api`, `--dater-collecte [--dry-run]`.
  Fait quand : pytest scraping vert (tests de `lire_fiche`, `date_collecte`, fiche produite avec `collecte_le`). (Fait le
  2026-10-19 : pytest scraping 99 verts dont deux tests nouveaux.)
- [x] 1.2 `import_to_firestore.py` : `collecteLe`, `derniereVueLe` ; type `AAP`. Fait quand : pytest scripts vert
  (connecteur -> `scraped_at`, fiche locale -> `collecte_le`, `derniereVueLe` réécrit sur un document validé), lint et
  build verts. (Fait le 2026-10-19 : pytest scripts 29 verts, lint et build verts.)
- [x] 1.3 Constat en cours de route : l'import réel a lu « verdicts lus : 6 » (les six fiches relues par Monsieur DUCOUT
  dans son raccourci à 16 h 15, cinq « AAP juste » et un « hors champ ») sans les écrire, `validation` étant protégée sur
  tout document existant depuis le lot 0. Corrigé : un verdict humain (`validation.par` = relecteur) est la seule chose
  qui réécrit `validation` et `status` d'un document existant ; `publishedAt`, les champs métier et les tags restent
  protégés. Test ajouté ; import réel : les six documents portent le verdict (cinq validés, un rejeté et archivé).

## 2. Données

- [x] 2.1 `--dater-collecte` : essai à blanc collé, puis réel (sauvegarde nommée, compte des fiches datées). (Fait le
  2026-10-19 : essai à blanc « 2047 fiches à dater » sur sept fichiers ; réel « 2047 fiches datées ; sauvegardes dans
  scripts/sauvegardes/collecte_2026-10-19_1649 » ; second essai à blanc 0 ; dates de collecte : 12, 13 et 14 octobre.)
- [x] 2.2 Import à blanc puis réel : « 0 crees », compte des documents portant `derniereVueLe` collé. (Fait le 2026-10-19
  à 16 h 50 puis 17 h : « Termine : 0 crees, 537 mis a jour » ; 228 des 289 fiches publiées portent `collecteLe` et
  `derniereVueLe`, les 61 autres sont closes ou hors du jeu importé ; exemple : collectée le 2026-10-13 à 17 h 24,
  extraite le 2026-10-19 à 10 h 43, vue le 2026-10-19 à 14 h 49 UTC.)

## 3. Documentation et vérification

- [x] 3.1 README scraping, README racine, CHANGELOGs, CLAUDE.md, REPRISE.md, `docs/FLUX_DONNEES.md`,
  `docs/FEUILLE_DE_ROUTE.md` (étape 4, veille), rapport section 8. (Fait le 2026-10-19.)
- [ ] 3.2 Monsieur DUCOUT relit une fiche dans la base ou l'application et y voit la date de collecte.
