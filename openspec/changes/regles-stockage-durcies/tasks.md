# Tâches

- [x] 1.1 Tests d'abord (`app/tests/rules/storage.rules.test.ts`), `test:rules` avec Firestore et Storage. Fait quand :
  les tests des documents d'appel et de l'ancien dossier échouent sur les règles actuelles. (2026-11-16 : « 2 failed |
  32 passed », les deux attendus.)
- [x] 1.2 `app/storage.rules` corrigé. Fait quand : `npm run test:rules` vert. (2026-11-16 : « 34 passed ». Les fonctions
  `uploadDocument` et `deleteDocument` d'`aapService.ts`, jamais appelées, échoueraient désormais : code mort signalé,
  laissé en place.)
- [x] 2.1 Documentation (`CHANGELOG.md`, `docs/PRET_POUR_TESTEURS.md` ligne 14, `docs/A_VALIDER.md` question 27).
- [ ] 2.2 Déploiement des règles du stockage sur accord de Monsieur DUCOUT.
