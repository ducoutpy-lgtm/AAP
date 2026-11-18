# Tâches

- [x] 1.1 Tests d'abord (`app/src/utils/firestore.test.ts`). Fait quand : ils échouent (module absent). (2026-11-16 :
  « Failed to resolve import "./firestore" ».)
- [x] 1.2 `app/src/utils/firestore.ts`, `createAap` et `updateAap`. Fait quand : tests, lint et build verts. (2026-11-16 :
  `npm test` 113 verts, lint et types verts.)
- [x] 2.1 Rejouer l'étape 7 sur les émulateurs (publication, « Mes appels »). (2026-11-16, `financeur@test.local` : avant le
  correctif, « Unsupported field value: undefined (found in field budgetMin) » ; après, redirection vers `/mes-aap`,
  « Appel de test : aide aux aidants en Essonne », « Publié » ; document lu dans l'émulateur : `status` published,
  `territoriesEligible` ["ile-de-france"], pas de `budgetMin`. Le scénario « champ vidé à la modification » repose sur
  le test de `pourMiseAJour`, pas joué à l'écran.)
- [x] 2.2 Documentation
- [x] 1.3 (2026-11-18, niveau du correctif relevé par /simplify) Réglage unique `ignoreUndefinedProperties` à
  l'initialisation de Firestore (`app/src/config/firebase.ts`) à la place de `sansIndefinis` (retirée avec son test) ;
  `pourMiseAJour` gardée pour effacer un champ vidé à la modification. `npm test` 113 verts, lint et build verts ; rejoué
  sur les émulateurs : « Appel de test : reglage global Firestore » publié (`/mes-aap`), document sans `budgetMin`,
  `publicationDate` ni `contactPhone`. (`docs/DEMO_FINANCEUR.md`, `CHANGELOG.md`, `docs/PRET_POUR_TESTEURS.md` ligne 11).
- [ ] 2.3 Vérification de Monsieur DUCOUT ; mise en ligne sur accord.
