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
- [ ] 2.2 `champ.py --evaluer` sur les 50 pages de la comparaison (référence : verdicts « appel » et commentaires
  « hors champ » de Monsieur DUCOUT) avec le modèle local, 0 euro. Fait quand : taux d'accord collé, désaccords
  listés.
- [ ] 2.3 Accord écrit de Monsieur DUCOUT sur le modèle de la classification rétroactive (local 0 euro ou
  `claude-haiku-5-5`, prix vérifiés le 2026-10-14, coût estimé collé ici), puis, si Haiku : évaluation sur les 50
  pages (0,01 euro estimé) avant les 900 fiches. Fait quand : accord collé, coût réel collé.
- [ ] 2.4 Classification des fiches du passage global et des connecteurs. Fait quand : répartition des cinq réponses
  collée, coût réel collé, sauvegardes listées.

## 3. Import et validation quotidienne

- [ ] 3.1 `scripts/import_to_firestore.py` : règle `hors-champ` et `incertain` à la création (fonction pure testée sur
  le faux Firestore : brouillon, a_corriger, étiquettes), verdict `hors-champ` dans `STATUTS_VALIDATION`, liste
  blanche inchangée (champ dans `scrapeMetadata`). Fait quand : pytest scripts vert, essai à blanc de l'import collé
  avec le compte des fiches hors champ.
- [ ] 3.2 `validation.py` : touche 7 « hors champ » en mode fiches, `VERDICTS` étendu, test. Fait quand : pytest vert,
  écran ouvert par la session et verdict d'essai écrit puis retiré.

## 4. Migration des fiches publiées

- [ ] 4.1 `scripts/migrer_champ.py` : sauvegarde JSON, `--dry-run` (compte, cinq exemples), accord écrit, exécution.
  Fait quand : compte avant et après collé, `/aap/search` relu dans le navigateur.

## 5. Chaîne d'extraction et registre

- [ ] 5.1 Question `champ` dans `echantillon.extraire`, `extraire_api` et `extraction_locale.py` (après la fin du
  passage global en cours, consigne version 4). Fait quand : pytest vert ; un texte extrait en local porte son champ.
- [ ] 5.2 `champ.py --rapport` : `scraping/CHAMP.md` (définition, répartition, part par source, sources à revoir).
  Fait quand : rapport collé, `git diff` vide sur `sources/registre.json`.

## 6. Documentation

- [ ] 6.1 README scraping, README racine (import), CHANGELOGs, CLAUDE.md (état d'avancement, règle du champ),
  REPRISE.md, `docs/FLUX_DONNEES.md`, rapport de critique (section 8 : résultat). Fait quand : fichiers relus.

## 7. Vérification

- [ ] 7.1 Monsieur DUCOUT rejoue les scénarios : lit `CHAMP.md`, ouvre la validation quotidienne et écarte une fiche
  hors champ d'une touche, relance l'import à blanc et retrouve le compte des fiches hors champ, vérifie sur
  `/aap/search` qu'aucune fiche hors champ migrée n'est visible.
