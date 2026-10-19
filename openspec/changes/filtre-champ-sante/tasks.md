# Tasks

Instruction 26 du rapport de critique (section 8, validée par Monsieur DUCOUT le 2026-10-14 au soir). Règle
« Preuve avant affirmation » : chaque tâche cochée avec sa preuve. Règles absolues : aucun appel API avant l'accord
écrit sur le modèle, le prix et le coût estimé ; plafond cumulé 5 euros ; aucun secret affiché ; aucun `git push` ;
aucun archivage sans demande ; schéma `AapNormalized` et type `AAP` inchangés.

## 1. Définition et question fermée

- [x] 1.1 Définition du champ (design, décision 1) relue et validée par Monsieur DUCOUT, y compris les cas limites
  (insertion par l'emploi, jeunesse, logement). Fait quand : sa réponse écrite collée ici, liste reportée dans la
  consigne et dans `CHAMP.md`. (Réponse du 2026-10-14 au soir : « enlève la partie sociale des recherches : pas
  d'insertion par l'emploi, pas la jeunesse, pas le logement, etc. Uniquement santé, médical, clinique ; ça peut donc
  être aussi des appels à projets comme CaRE qui finance des logiciels, mises à jour, audits cybersécurité pour les
  hôpitaux et cliniques (ANS ou ANSSI), ça peut être aussi des programmes de rénovation des hôpitaux ou des
  cliniques, etc. » Reportée dans le design (décision 1), la spec et la proposition ; consigne et `CHAMP.md` en 1.2
  et 5.2.)
- [x] 1.2 `echantillon.py` : `CONSIGNE_CHAMP`, `SCHEMA_CHAMP`, fonction pure `normaliser_champ(reponse)` (quatre valeurs,
  `incertain` par défaut), `VERSION_CONSIGNE = 4` ; `extractor.py` : outil `champ` et fonction `champ_aap(...)` sur le
  même modèle que `est_un_aap` ; tests sans appel. Fait quand : pytest scraping vert, journal des coûts inchangé.
  (Fait le 2026-10-14 au soir : consigne reprenant mot pour mot la définition de Monsieur DUCOUT, `CHAMPS`, schéma JSON,
  `normaliser_champ` testée (`test_normaliser_champ_ramene_a_quatre_valeurs`), `CHAMP_TOOL` et `champ_aap` dans
  `extractor.py` ; `VERSION_CONSIGNE` reste à 3 jusqu'à l'intégration dans la chaîne (5.1), note ajoutée ; pytest
  scraping 74 verts ; journal des coûts : 136 lignes Haiku, soit 66 de l'échantillon et 70 de la comparaison, aucune
  de ce changement.)

## 2. Classification rétroactive

- [x] 2.1 `scraping/champ.py --classer` (fichiers de résultats lus par l'import, texte de la page si disponible sinon
  champs de la fiche, sauvegarde dans `scripts/sauvegardes/`, reprise, `--dry-run` avec compte et coût estimé,
  `--moteur ollama|api`, `--modele`, `--limite`) ; tests des fonctions pures. Fait quand : pytest vert ; `--dry-run`
  collé : fiches à classer par fichier et coût estimé. (Fait le 2026-10-14 au soir : `scraping/champ.py` avec
  `--classer`, `--evaluer`, `--rapport`, mêmes exclusions de fichiers que l'import ; `tests/test_champ.py`, 6 tests ;
  `--classer --dry-run` : « ars_corse.json : 2 fiches, 2 à classer ; ars_idf.json : 18 ; ars_idf_local.json : 18 ;
  cnsa.json : 3 ; extraction_locale.json : 811 fiches, 811 à classer, environ 270 min en local ; fondation_de_france.json :
  64 ; Essai à blanc : 916 fiches à classer ; rien n'a été écrit » ; `--moteur api` : « 0.179 euros estimés », aucun
  appel.)
- [x] 2.2 `champ.py --evaluer` sur les 50 pages de la comparaison (référence : verdicts « appel » et commentaires
  « hors champ » de Monsieur DUCOUT) avec le modèle local, 0 euro. Fait quand : taux d'accord collé, désaccords
  listés. (Fait le 2026-10-14 à 23 h 10 sur les 24 fiches du premier tirage, collectivités : classements du modèle local
  (19 hors champ, 4 médico-social, 1 santé) relus par Monsieur DUCOUT, « les 24 sont justes », enregistrés dans
  `sources/verdicts_champ.json` ; `champ.py --evaluer --fichier results/comparaison_ollama_qwen3-8b_collectivites.json` :
  « qwen3:8b : 24 fiches comparées, 24 accords exacts, 24 accords dans / hors champ ». Le second tirage est arrêté sur
  sa décision ; pas d'évaluation sur ses pages sans sa demande.)
- [x] 2.3 Accord écrit de Monsieur DUCOUT sur le modèle de la classification rétroactive (local 0 euro ou
  `claude-haiku-5-5`, prix vérifiés le 2026-10-14, coût estimé collé ici), puis, si Haiku : évaluation sur les 50
  pages (0,01 euro estimé) avant les 900 fiches. Fait quand : accord collé, coût réel collé. (Accord du 2026-10-14,
  nuit : « ok, haiku pour classer les 916 fiches, vas-y » ; coût estimé 0,179 euro ; l'évaluation préalable est
  remplacée par la table des 24 fiches du premier tirage classées en local, à corriger par Monsieur DUCOUT.)
- [x] 2.4 Classification des fiches du passage global et des connecteurs. Fait quand : répartition des cinq réponses
  collée, coût réel collé, sauvegardes listées. (Connecteurs faits le 2026-10-14 à 21 h 49 : 105 fiches, « santé 55,
  médico-social 14, hors champ 34, incertain 2 », 105 appels, 0,027 euro, sauvegarde `scripts/sauvegardes/champ_2026-10-14_2149/` ;
  les 34 hors champ sont des appels Fondation de France hors santé (transition écologique, ruralité, petite enfance,
  jeunes). Passage local (`extraction_locale.json`) fait le 2026-10-15 de 8 h 22 à 8 h 49, après la fin du passage
  global (7 h 40 : 1 086 fiches, 1 070 refus, 22 échecs, 28,6 h) et sur l'accord de Monsieur DUCOUT (« ok vas-y pour
  haiku sur les fiches du passage local ») : essai à blanc « 1086 fiches à classer, 0.207 euros estimés » ; réel :
  1 086 fiches, « santé 312, médico-social 209, hors champ 513, incertain 52 », 1 086 appels, 0,231 euro réel lu dans le
  journal (étape `champ` du 2026-10-15), cumul Haiku 0,365 euro pour un plafond de 5 euros, sauvegarde
  `scripts/sauvegardes/champ_2026-10-15_0822/`.)

## 3. Import et validation quotidienne

- [x] 3.1 `scripts/import_to_firestore.py` : règle `hors-champ` et `incertain` à la création (fonction pure testée sur
  le faux Firestore : brouillon, a_corriger, étiquettes), verdict `hors-champ` dans `STATUTS_VALIDATION`, liste
  blanche inchangée (champ dans `scrapeMetadata`). Fait quand : pytest scripts vert, essai à blanc de l'import collé
  avec le compte des fiches hors champ. (Fait le 2026-10-14, nuit : `champ_en_attente` (un verdict humain l'emporte),
  `champ`, `champRaison`, `champModele` dans `scrapeMetadata`, verdict `hors-champ` -> rejetee ; tests
  `test_fiche_hors_champ_entre_en_brouillon_a_corriger`, `test_fiche_incertaine_garde_son_statut_avec_etiquette`,
  `test_verdict_humain_l_emporte_sur_le_champ_du_modele`, `test_verdict_hors_champ_rejette_et_archive` ; pytest scripts
  17 verts ; essai à blanc : « AAP lus : 921 | a importer : 405 (dont 2 doublons fusionnes, 196 sans date publiees,
  21 hors champ en brouillon) | ignores : {'incomplet': 0, 'expire': 514} ».)
- [x] 3.2 `validation.py` : touche 7 « hors champ » en mode fiches, `VERDICTS` étendu, test. Fait quand : pytest vert,
  écran ouvert par la session et verdict d'essai écrit puis retiré. (Fait le 2026-10-14, nuit : bouton « 7. Hors champ :
  ni santé ni médico-social » et touche 7 en mode fiches ; `VERDICTS` contenait déjà `hors-champ` ; écran lancé par la
  session sur le port 8799 et page lue : bouton présent, touche 7 câblée ; aucun verdict d'essai écrit, le fichier
  `verdicts_fiches.json` est intact ; pytest scraping 74 verts.)
- [x] 3.3 Fiches sans date publiées (décision de Monsieur DUCOUT du 2026-10-14, nuit) : `sans_date_en_attente`
  devient « sans date publiée » (deadline nulle, publié, proposee, étiquette `sans-date-cloture`), règle d'expiration
  au 31 décembre de l'année en cours sans date inscrite ; tests sur le faux Firestore. Fait quand : pytest scripts
  vert, essai à blanc collé (plus de « draft » pour les fiches sans date). (Fait le 2026-10-14, nuit :
  `test_fiche_sans_date_publiee_deadline_nulle_a_verifier` ; essai à blanc : « 196 sans date publiees » ; la fiche sans
  date n'a pas de date et n'est donc jamais écartée comme expirée : ouverte jusqu'au 31 décembre, rien d'inscrit.)

## 4. Migration des fiches publiées

- [x] 4.1 `scripts/migrer_champ.py` : sauvegarde JSON, `--dry-run` (compte, cinq exemples), accord écrit, exécution.
  Fait quand : compte avant et après collé, `/aap/search` relu dans le navigateur. (Script écrit ; essai à blanc du
  2026-10-14, nuit, connecteurs seuls classés : « 34 fiches classees hors champ dans les fichiers de resultats ; 10 fiches
  publiees a repasser en brouillon ; 0 publiees avec verdict humain », exemples Fondation de France (réveillons de la
  solidarité, solutions fondées sur la nature, eau du Grand Ouest, ruralité, art en milieu rural). À relancer après la
  classification du passage local ; exécution après accord.) Exécuté le 2026-10-14 à 22 h 51 sur décision de Monsieur
  DUCOUT (« oui tu les retires ») : « 10 fiches publiees a repasser en brouillon ; 0 publiees avec verdict humain »,
  « Sauvegarde : scripts/sauvegardes/champ_publiees_2026-10-14_2251.json (10 fiches) », « Migrees : 10 fiches » ;
  `/aap/search` relu : 410 AAP disponibles (420 avant). À relancer après la classification du passage local. Relancé
  le 2026-10-15 à 8 h 51, après le classement et le ré-import (« AAP lus : 1191 | a importer : 529 (256 sans date
  publiees, 248 hors champ en brouillon) », « Termine : 120 crees, 409 mis a jour ») : « 545 fiches classees hors champ ;
  147 fiches publiees a repasser en brouillon ; 0 publiees avec verdict humain », sauvegarde
  `scripts/sauvegardes/champ_publiees_2026-10-15_0851.json`, « Migrees : 147 fiches ». Base après coup : 569 documents,
  308 publiées (santé 172, médico-social 106, incertain 29, non classée 1 ; 131 sans date ; 307 à vérifier),
  261 brouillons dont 258 hors champ, 105 financeurs distincts.
- [ ] 4.2 `scripts/publier_sans_date.py` : les brouillons `sans-date-cloture` sans verdict humain et non hors champ
  passent en publié, proposee ; sauvegarde JSON, `--dry-run`, accord écrit (donné en principe le 2026-10-14 : « oui je
  veux qu'elles soient publiées »), exécution après la classification et l'import. Fait quand : compte avant et après
  collé, `/aap/search` relu. (Script écrit ; essai à blanc du 2026-10-14, nuit : « 141 fiches portent l'etiquette
  sans-date-cloture ; 141 en brouillon ; 120 a publier ; 0 avec verdict humain ; 21 hors champ, conservees en brouillon ».
  Ordre impératif : classification du passage local, import réel, `migrer_champ.py`, puis ce script, sinon des fiches
  hors champ sans date seraient publiées.) Décision de Monsieur DUCOUT (2026-10-14, 22 h) : « mets-moi tout ce que tu
  peux », import réel puis publication lancés sans attendre la classification du passage local ; import réel : « AAP
  lus : 922 | a importer : 406 (196 sans date publiees, 21 hors champ en brouillon) | Termine : 103 crees, 303 mis a
  jour » ; publication : « Publiees : 123 fiches sans date, a verifier », sauvegarde
  `scripts/sauvegardes/sans_date_publiees_2026-10-14_2213.json` ; collection après coup : 420 publiées (382 à vérifier,
  172 sans date, 397 non classées), 24 brouillons. Les fiches hors champ du passage local publiées ce soir seront
  repassées en brouillon par `migrer_champ.py` après la classification (4.1).

## 5. Chaîne d'extraction et registre

- [x] 5.1 Question `champ` dans `echantillon.extraire`, `extraire_api` et `extraction_locale.py` (après la fin du
  passage global en cours, consigne version 4). Fait quand : pytest vert ; un texte extrait en local porte son champ.
  (Fait le 2026-10-19 : `poser_question_champ`, `question_champ_sans_echec`, `metadonnees_champ` dans `echantillon.py`,
  appel après l'extraction dans les deux moteurs, `champ.py` réutilise la fonction ; pytest scraping 95 verts dont trois
  tests nouveaux. Preuve réelle sur le texte `decouverte/ars-ile-de-france/fiches/2a9520a754.txt` avec qwen3:8b, zéro
  euro : fiche « Label Culture et Santé en Île-de-France 2027-2029 » produite avec `version_consigne 4` et les cinq clés
  du champ, mais la question du champ a dépassé le délai de 600 s (le modèle local a généré plus de 8 000 jetons de
  réflexion) : champ « incertain », raison « échec : TimeoutError » ; la fiche n'est pas perdue, 668 s en tout contre 50 s
  pour cette page le 2026-10-15. Constat à trancher : la question du champ en local est lente avec qwen3:8b ; Haiku l'a
  classée en 1 s pour 0,02 centime.)
- [x] 5.2 `champ.py --rapport` : `scraping/CHAMP.md` (définition, répartition, part par source, sources à revoir).
  Fait quand : rapport collé, `git diff` vide sur `sources/registre.json`. (Fait le 2026-10-15 à 8 h 55 : « Rapport écrit :
  CHAMP.md (1191 fiches) », « Répartition : hors-champ 547, sante 367, medico-social 223, incertain 54 » ; part dans le
  champ par source : ARS de 93 à 100 %, CNSA, INCa, Fondation ARC, GIRCI Méditerranée 100 %, FHF Hauts-de-France 97 %,
  Inserm 95 %, Fondation de France 44 %, collectivités de 0 à 42 %, DRAAF et DREETS 0 % ; `git status` : `sources/registre.json`
  inchangé.)

## 6. Documentation

- [x] 6.1 README scraping, README racine (import), CHANGELOGs, CLAUDE.md (état d'avancement, règle du champ),
  REPRISE.md, `docs/FLUX_DONNEES.md`, rapport de critique (section 8 : résultat). Fait quand : fichiers relus. (Fait le
  2026-10-19 ; le README racine décrivait déjà la règle d'import du champ, inchangée.)

## 7. Vérification

- [ ] 7.1 Monsieur DUCOUT rejoue les scénarios : lit `CHAMP.md`, ouvre la validation quotidienne et écarte une fiche
  hors champ d'une touche, relance l'import à blanc et retrouve le compte des fiches hors champ, vérifie sur
  `/aap/search` qu'aucune fiche hors champ migrée n'est visible.
