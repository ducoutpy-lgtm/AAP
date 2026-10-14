# Tasks

Instruction 26 du rapport de critique (section 8, validée par Monsieur DUCOUT le 2026-10-14 au soir). Règle
« Preuve avant affirmation » : chaque tâche cochée avec sa preuve. Règles absolues : aucun appel API avant l'accord
écrit sur le modèle, le prix et le coût estimé ; plafond cumulé 5 euros ; aucun secret affiché ; aucun `git push` ;
aucun archivage sans demande ; schéma `AapNormalized` et type `AAP` inchangés.

## 1. Définition et question fermée

- [ ] 1.1 Définition du champ (design, décision 1) relue et validée par Monsieur DUCOUT, y compris les cas limites
  (insertion par l'emploi, jeunesse, logement). Fait quand : sa réponse écrite collée ici, liste reportée dans la
  consigne et dans `CHAMP.md`.
- [ ] 1.2 `echantillon.py` : `CONSIGNE_CHAMP`, `SCHEMA_CHAMP`, fonction pure `normaliser_champ(reponse)` (cinq valeurs,
  `incertain` par défaut), `VERSION_CONSIGNE = 4` ; `extractor.py` : outil `champ` et fonction `champ_aap(...)` sur le
  même modèle que `est_un_aap` ; tests sans appel. Fait quand : pytest scraping vert, journal des coûts inchangé.

## 2. Classification rétroactive

- [ ] 2.1 `scraping/champ.py --classer` (fichiers de résultats lus par l'import, texte de la page si disponible sinon
  champs de la fiche, sauvegarde dans `scripts/sauvegardes/`, reprise, `--dry-run` avec compte et coût estimé,
  `--moteur ollama|api`, `--modele`, `--limite`) ; tests des fonctions pures. Fait quand : pytest vert ; `--dry-run`
  collé : fiches à classer par fichier et coût estimé.
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
