# Tâches

- [x] 1.1 Tests d'abord : `pourExport` (dates Firestore et JavaScript, tableaux, objets, valeurs nulles) et
  `nomFichierExport` dans `app/src/utils/exportDonnees.test.ts`. Fait quand : ils échouent (module absent). (2026-11-16 :
  « Failed to resolve import "./exportDonnees" ».)
- [x] 1.2 `app/src/utils/exportDonnees.ts`, lecture par partie (`app/src/services/exportService.ts`), carte sur `/profil`,
  phrase de la page Confidentialité. Fait quand : tests, lint et build verts. (2026-11-16 : `npm test` 111 verts, lint,
  types et build verts.)
- [x] 2.1 Jouer sur les émulateurs (candidat de test) : fichier produit, parties attendues, dates ISO. (2026-11-16,
  `candidat@test.local`, fichier capté dans la page : `mes-donnees-aap-sante-2026-11-16.json`, 14 parties dont
  `compteDeConnexion` (adresse, fournisseur « password »), `profilDeStructure` « EHPAD Les Lilas (test) », 4 candidatures
  (date « 2026-11-14T09:46:52.091Z »), `recherchesSauvegardees` vide (aucune dans le semis), aucune partie « nonLue »,
  `surDemandeAuDpo` présent. Le scénario « partie illisible » n'a pas été provoqué à l'écran : il repose sur le code de
  `lire` dans `exportService.ts`.)
- [x] 2.2 Documentation (`CHANGELOG.md`, `REPRISE.md`, `docs/A_VALIDER.md` question 25).
- [ ] 2.3 Vérification de Monsieur DUCOUT.
