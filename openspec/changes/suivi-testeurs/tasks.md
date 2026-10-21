# Tasks

Jour 4 du plan MVP. Zéro euro. Règles : aucun `git push`, aucun archivage sans demande, déploiement des règles après
accord.

- [x] 4.1 `utils/journal.ts` et test ; `services/journalService.ts` ; appels dans les pages ; règle `journal` et test
  des règles. Fait quand : `npm test` et `npm run test:rules` verts. (Fait le 2026-10-21 : 61 tests Vitest, 25 tests de règles sur l'émulateur.)
- [x] 4.2 `pages/admin/TesteursPage.tsx`, route `/admin/testeurs`, menu, carte du tableau de bord ; lint, build ;
  parcours joué sur les émulateurs (candidat : connexion, recherche, fiche, candidature ; administrateur : page
  Testeurs avec les compteurs attendus). (Fait le 2026-10-21 : lint, build ; sur les émulateurs, candidat de test : connexion, recherche « Île-de-France · Ouvert », deux fiches ; administrateur : `/admin/testeurs` « 6 comptes, 9 actions », ligne candidat@test.local « 1 connexion, 2 recherches, 4 fiches » -> doublons dus au double montage du mode strict de React en développement, corrigés par un dédoublonnage de cinq secondes (test) ; après correction, une nouvelle fiche ouverte donne une seule ligne ; l'administrateur n'est plus journalisé ; comptes sans adresse laissés par les tests de règles affichés « (sans adresse) ».)
- [ ] 4.3 Accord de Monsieur DUCOUT, déploiement des règles Firestore (`firebase deploy --only firestore:rules`).
- [x] 4.4 Documentation (`docs/resume_application_web_2026-10.md`, politique de confidentialité : ligne journal,
  `CHANGELOG.md`, `CLAUDE.md`, `REPRISE.md`, `docs/PLAN_MVP_2026-10-20.md`).
- [ ] 4.5 Monsieur DUCOUT voit, sur `/admin/testeurs`, les actions qu'il vient de faire avec son compte candidat.
