# Tasks

Retours de Monsieur DUCOUT du 2026-10-20, heure 2 du plan. Zéro euro. Règles : aucun `git push`, aucun archivage sans
demande, aucun déploiement, migration = essai à blanc + sauvegarde + accord.

## 1. Règles et tests

- [x] 1.1 `utils/relecture.ts` (`visiblePubliquement`, test) ; `scripts/import_to_firestore.py`
  (`publication_selon_controle`, test pytest) ; `scripts/depublier_non_controlees.py` avec essai à blanc. Fait quand :
  `npm test` et `pytest scripts/tests` verts, essai à blanc collé. (Fait le 2026-10-20 : `npm test` « 45 passed », pytest « 31 passed » ; essai à blanc : « Publiees : 303 ; a depublier : 34 ({'proposee': 26, 'a_corriger': 8}) », exemples ARS Corse, ARS Île-de-France, Fondation de France, ARS Guyane, rien d'écrit.)

## 2. Application

- [x] 2.1 `SearchAapPage` (fiches contrôlées seulement, filtres Source et Relecture retirés), `AdminDashboard`
  (compteurs, carte « Fiches à contrôler »), `ManageAAPsPage` (filtre depuis l'adresse, « Valider et publier »,
  « Rejeter », « Modifier »), `EditAapPage` (administrateur accepté). Fait quand : lint et build verts ; `/aap/search`
  vérifié sans compte (compteur et absence des deux filtres). (Fait le 2026-10-20 : lint sans avertissement, build « built in 3.29s », écran vérifié : `/aap/search` sans compte « 269 appels à projets totalisant 276 442 366 € annoncés (43 fiches chiffrées) », filtres Recherche, Thématique, Territoire, Financeur, Statut, Budget seulement, aucune erreur console.)

## 3. Migration, documentation et vérification

- [ ] 3.1 Accord de Monsieur DUCOUT, puis `depublier_non_controlees.py` réel (sauvegarde), résultat collé ici.
- [ ] 3.2 `docs/resume_application_web_2026-10.md`, `scripts/README` ou `README.md` racine (section import),
  `CHANGELOG.md`, `CLAUDE.md`, `REPRISE.md`.
- [ ] 3.3 Monsieur DUCOUT contrôle une fiche depuis `/admin/aaps` et la retrouve dans la recherche ; retours ici.
