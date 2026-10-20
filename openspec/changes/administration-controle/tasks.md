# Tasks

Retours de Monsieur DUCOUT du 2026-10-20, heure 2 du plan. Zéro euro. Règles : aucun `git push`, aucun archivage sans
demande, aucun déploiement, migration = essai à blanc + sauvegarde + accord.

## 1. Règles et tests

- [x] 1.1 `utils/relecture.ts` (`visiblePubliquement`, test) ; `scripts/import_to_firestore.py`
  (`publication_selon_controle`, test pytest) ; `scripts/depublier_non_controlees.py` avec essai à blanc. Fait quand :
  `npm test` et `pytest scripts/tests` verts, essai à blanc collé. (Fait le 2026-10-20 : `npm test` « 45 passed », pytest « 31 passed » ; essai à blanc : « Publiees : 303 ; a depublier : 34 ({'proposee': 26, 'a_corriger': 8}) », exemples ARS Corse, ARS Île-de-France, Fondation de France, ARS Guyane, rien d'écrit.)

- [x] 1.2 Rattachement des financeurs étendu (`scraping/financeurs.py` : parenthèses, cofinanceur, « Département du
  X » ; test ajouté). Fait le 2026-10-20 : tests scraping verts ; essai à blanc de l'import « financeurs distincts : 69
  (229 fiches au nom canonique) » contre 86 (199) avant. Ré-import réel après accord de Monsieur DUCOUT.

## 2. Application

- [x] 2.1 `SearchAapPage` (fiches contrôlées seulement, filtres Source et Relecture retirés), `AdminDashboard`
  (compteurs, carte « Fiches à contrôler »), `ManageAAPsPage` (filtre depuis l'adresse, « Valider et publier »,
  « Rejeter », « Modifier »), `EditAapPage` (administrateur accepté). Fait quand : lint et build verts ; `/aap/search`
  vérifié sans compte (compteur et absence des deux filtres). (Fait le 2026-10-20 : lint sans avertissement, build « built in 3.29s », écran vérifié : `/aap/search` sans compte « 269 appels à projets totalisant 276 442 366 € annoncés (43 fiches chiffrées) », filtres Recherche, Thématique, Territoire, Financeur, Statut, Budget seulement, aucune erreur console.)

## 3. Migration, documentation et vérification

- [x] 3.1 Accord de Monsieur DUCOUT (« Oui, fais-le », 2026-10-20), puis `depublier_non_controlees.py` réel : « 34 fiches repassees en brouillon », sauvegarde `scripts/sauvegardes/depublication_2026-10-20_1101.json` ; ré-import des financeurs sur son accord : « 0 crees, 546 mis a jour », 69 financeurs distincts. Traitement en masse ajouté ensuite à sa demande (filtre par financeur, cases à cocher, « Valider et publier la sélection », « Rejeter la sélection »).
- [x] 3.2 `docs/resume_application_web_2026-10.md`, `scripts/README` ou `README.md` racine (section import),
  `CHANGELOG.md`, `CLAUDE.md`, `REPRISE.md`.
- [ ] 3.3 Monsieur DUCOUT contrôle une fiche depuis `/admin/aaps` et la retrouve dans la recherche ; retours ici.
  Retour du 2026-10-20 soir (tri des fiches en cours) : la liste des financeurs proposait tous les financeurs au lieu
  de ceux des fiches filtrées -> corrigé : la liste suit la recherche, le statut et la validation, avec le nombre de
  fiches par financeur ; un financeur choisi qui sort du filtre remet « Tous ».
  Second retour du soir : « pourquoi les financeurs ne sont toujours pas fusionnés ? » (Bpifrance en quatre écritures,
  DREETS et DRAAF par région, État avec et sans accent, FSE et FSE.gouv, mairie / ville / commune, trois ministères de
  l'Agriculture, PREFET en majuscules). Cause : la fusion ne traitait que les noms proches d'une entrée du registre ;
  les fiches hors champ viennent de sites hors santé. Correction dans `scraping/financeurs.py` : familles
  d'organismes nationaux (Bpifrance, DREETS, DRAAF, FSE+, FEDER, État, ministères, ANCT, ADEME, CAF, Préfecture - X),
  « Ville de X » pour mairie / commune / ville, « Conseil régional X » pour Région X, « Conseil départemental X »
  pour Département de X ou Collectivité départementale, « Fondation de France » pour ses délégations, casse propre,
  nom de l'émetteur quand le nom extrait est générique (« Région », « Département », « Le64 »), les noms du registre
  passent aussi par ces règles. Tests scraping 112 verts. Ré-import réel : fiches à contrôler 146 -> 112 financeurs
  distincts (Bpifrance 11, DREETS 10, DRAAF 13, État 6, FSE 5, Ville de Toulon 7) ; fiches publiées 86 financeurs.
  Les fiches closes présentes en base ne sont pas réécrites par l'import (règle d'exclusion des expirées) : leurs
  anciens noms restent jusqu'au prochain passage.
