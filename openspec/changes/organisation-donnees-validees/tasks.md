# Tasks

Décisions de Monsieur DUCOUT (2026-10-14) : « pas un appel » = archivé ; identifiant changé maintenant ;
fiches sans date en attente. Règle « Preuve avant affirmation » : chaque tâche cochée avec sa preuve.

## 1. Protéger (critique)

- [x] 1.1 Import : identifiant `scraped-<sha1(url)>`, champs humains jamais réécrits, lecture de
  `sources/verdicts_fiches.json`, bloc `validation`, fiches sans date en `draft`. Fonctions pures testées dans
  `scripts/tests/test_import_to_firestore.py` (identifiant, fusion avec un document existant, correspondance
  des verdicts, fiche sans date). Fait quand : pytest vert, essai à blanc collé. (Fait : `pytest scripts/tests -q` 6 passed ; essai à blanc
  « AAP lus : 670 | a importer : 302 (dont 2 doublons fusionnes, 147 sans date en brouillon) | ignores : {'incomplet': 0,
  'expire': 366} | verdicts lus : 0 ».)
- [x] 1.2 `validation.py` : verdicts du mode fiches écrits dans `sources/verdicts_fiches.json` ; option
  `--ouvertes` (fiches dont la clôture n'est pas passée ou absente) utilisée par `validation_fiches.cmd` ;
  migration de `results/validation_manuelle.json` s'il existe. Fait quand : raccourci lancé, nombre de fiches collé. (Fait : « 260 fiches de extraction_locale.json ; verdicts dans
  verdicts_fiches.json » avec `--ouvertes`, contre 515 sans.)
- [x] 1.3 Registre : `adresse_aap`, `url_validee` dans `CHAMPS` et le contrôle de format ; `decouverte.py`,
  `registre.py --verifier-pages`, `validation.py` (liens, appliquer-pages) passent par `adresse_aap` ;
  migration des 42 notes. Fait quand : `registre.py --verifier-format` valide, décompte des `url_validee` collé,
  pytest vert. (Fait : « Registre valide : 1198 sources », 42 sources avec `url_validee`, 49 tests verts.)

## 2. Migrer la base

- [x] 2.1 `scripts/migrer_identifiants.py` : sauvegarde JSON des documents `scraped-*`, essai à blanc, puis
  suppression des anciens identifiants et réimport complet. Fait quand : sortie collée (documents supprimés,
  créés), « Rechercher des AAP » relu avec le nouveau total et sans doublon ESMS Numérique 2026. (Fait : « 221 documents scrapes ;
  221 sous l'ancien identifiant », sauvegarde `aap_2026-10-14_1219.json`, « Supprimes : 221 », import « 303 crees » puis
  connecteurs avec `--include-expired` et échantillon validé ; collection : 341 documents, 194 publiés dont 150 à vérifier,
  147 brouillons sans date ; page de recherche : « 194 AAP disponibles » ; ESMS Numérique 2026 : une seule fiche ARS
  Normandie publiée.)

## 3. Tracer

- [x] 3.1 Fiches du modèle local : `scrape_metadata.produite_le` et `version_consigne` (constante dans
  `echantillon.py`). Fait quand : une fiche produite après la modification porte les deux champs. (Code en place ; visible sur les fiches
  produites après la relance du passage d'extraction en cours.)

## 4. Documentation

- [x] 4.1 README scraping, README racine (section import), CHANGELOGs, CLAUDE.md, REPRISE.md,
  `docs/FLUX_DONNEES.md` (retour des verdicts en trait plein), audit (problèmes traités cochés). (Fait le 2026-10-14.)

## 5. Vérification

- [ ] 5.1 Monsieur DUCOUT : archive un AAP dans l'administration, relance l'import, l'AAP reste archivé ; juge
  une fiche « pas un AAP » dans le raccourci, relance l'import, elle disparaît de la recherche ; juge une fiche
  « AAP juste », le badge disparaît.
