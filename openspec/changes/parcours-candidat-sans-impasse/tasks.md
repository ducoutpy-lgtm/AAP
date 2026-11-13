# Tasks

Semaine 3 du plan (reprise du 2026-11-13 au soir). Zéro euro.

- [x] 1.1 Audit du parcours en lecture seule (sous-agent). Fait quand : impasses classées. (Fait le 2026-11-13 : 3
  bloquantes, 8 gênantes, mineures et deux failles de sécurité, avec fichiers et lignes.)
- [x] 1.2 Tests rouges : `sansValeursVides`, `pieceNonDeposee`, menus sans Messagerie ni Alertes. Fait quand : rouges
  collés. (Fait le 2026-11-13 : 4 tests en échec, « sansValeursVides is not a function », « pieceNonDeposee is not a
  function », menus porteur et financeur.)
- [x] 1.3 Corrections. Fait quand : `npm test`, lint, compilation verts. (Fait le 2026-11-13 : « 17 passed », « 84
  passed », lint sans erreur, compilation.)
- [x] 2.1 Joué sur les émulateurs (compte `candidat@test.local`). Fait quand : constats collés. (Fait le 2026-11-13 :
  menu sans Messagerie ni Alertes ; recherche « EHPAD Essonne » avec le seul nom enregistrée et listée, fenêtre fermée,
  aucune erreur. Non joué : la pièce refusée, car le stockage des émulateurs accepte les dépôts ; couvert par le test de
  `pieceNonDeposee` seulement. L'échec d'avant la correction n'a pas été rejoué.)
- [x] 2.2 Documentation : `CHANGELOG.md`, `REPRISE.md`, `docs/A_VALIDER.md`.
- [ ] 3.1 Mise en ligne après accord de Monsieur DUCOUT.
- [ ] 4.1 Vérification par Monsieur DUCOUT : parcours candidat complet en vingt minutes.
