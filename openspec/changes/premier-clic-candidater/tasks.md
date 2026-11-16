# Tâches

- [x] 1.1 Test d'abord (`app/src/contexts/profil.test.ts`). Fait quand : il échoue (module absent). (2026-11-16 : « Test
  Files 1 failed », module absent.)
- [x] 1.2 `fusionnerProfil` et `refreshUserProfile`. Fait quand : tests, lint et build verts.
- [x] 2.1 Rejouer sur les émulateurs : étape remise à zéro, premier clic, trace des adresses sans `/admin`. (2026-11-16,
  compte neuf `parcours@test.local` : avant, trace « push /aap/test-fin-1/candidater », « replace /admin »,
  « replace /dashboard/porteur » ; après, trace « push /aap/test-fin-1/candidater » seule, formulaire affiché, étape
  `candidature` cochée, `userType` porteur. Parcours complet joué ensuite : inscription, accueil en trois écrans,
  tableau de bord, recommandations, fiche, candidature envoyée, Mes candidatures, détail, Alertes, Calendrier, Mon
  profil ; aucune erreur dans la console. La cause exacte de la relecture partielle reste supposée.)
- [x] 2.2 Documentation (`CHANGELOG.md`, `docs/PRET_POUR_TESTEURS.md`) ; vérification de Monsieur DUCOUT, mise en ligne
  sur accord.
