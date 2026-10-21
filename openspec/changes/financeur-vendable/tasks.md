# Tasks

Jour 6 du plan MVP, décision de Monsieur DUCOUT du 2026-10-21 (« 2 oui »). Zéro euro. Règles : aucun `git push`,
aucun archivage sans demande, aucun déploiement sans accord ; parcours joués sur les émulateurs.

- [x] 1.1 `utils/financeur.ts` (agrégats : appels par statut, candidatures par statut, vues, dernières candidatures,
  prochaine échéance ; libellés des statuts) et son test Vitest. Fait quand : tests verts. (Fait le 2026-10-21 : 2 tests Vitest verts.)
- [x] 1.2 Tableau de bord financeur réel, liens corrigés ; page `/candidatures-recues` en colonnes ; route, menu ;
  `ApplicationStatus` complété ; `applicationsCount` calculé depuis les candidatures reçues (un candidat ne peut pas modifier l'appel selon les règles
  Firestore, le compteur du document ne peut donc pas être incrémenté par lui). Fait quand : lint et build verts. (Fait le
  2026-10-21 : lint exit 0, build vert.)
- [x] 1.3 `scripts/publier_chiffres.py` (document `statistiquesPubliques/accueil`, essai sur l'émulateur), règle Firestore
  (lecture publique) et test de règles ; page `/financeurs` ; accueil corrigé (promesses, tarifs depuis la
  configuration, carte vers `/financeurs`) ; lien dans le menu public et le pied de page. Fait quand : lint, build,
  `npm test`, `npm run test:rules` verts. (Fait le 2026-10-21 : 68 tests Vitest, 26 tests de règles sur l'émulateur ;
  `publier_chiffres.py --projet demo-aap` : « etablissements inscrits 4, appels suivis 4, financeurs 2, sources 1 ».)
- [x] 1.4 `scripts/semer_emulateurs.py` : trois appels du financeur de test, quatre candidatures aux statuts variés.
  Fait quand : semis rejoué sur l'émulateur, compteurs collés. (Fait le 2026-10-21 : « financeur de test : 3 appels, 4 candidatures semés ».)
- [x] 1.5 `docs/DEMO_FINANCEUR.md` et démonstration jouée par la session sur les émulateurs (captures ou lectures de
  page collées dans ce fichier). Fait quand : chaque étape du scénario est OK. (Fait le 2026-10-21 : sept étapes sur neuf lues par la session, voir
  `docs/DEMO_FINANCEUR.md` ; la présélection et la publication d'un appel sont laissées à Monsieur DUCOUT.)
- [x] 1.6 Documentation : `docs/resume_application_web_2026-10.md`, `CHANGELOG.md`, `CLAUDE.md`, `REPRISE.md`,
  `docs/PLAN_MVP_2026-10-20.md` (avancement). (Fait le 2026-10-21.)
- [ ] 2.1 Monsieur DUCOUT joue la démonstration sur les émulateurs avec financeur@test.local, puis déploie la règle
  `statistiquesPubliques` et lance `publier_chiffres.py` sur le vrai projet sur son accord. (2026-10-21 : accord « ok pour les trois » ; `publier_chiffres.py` passé sur le vrai
  projet : « etablissements inscrits 2, appels suivis 332, financeurs 99, sources 72 » ; règle à déployer par lui.)
