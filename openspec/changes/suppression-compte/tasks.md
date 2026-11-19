# Tâches

- [x] 1.1 Tests d'abord : plan de suppression et connexion récente (Vitest), règles (émulateur). Fait quand : ils échouent.
  (2026-11-19 : module absent ; règles « 2 failed | 36 passed ».)
- [x] 1.2 Service, bouton, règles, textes, script du journal. Fait quand : tests, règles, lint et build verts. (2026-11-19 :
  `npm test` 120, règles 38, scripts 49 verts, lint et build verts ; `anonymiser_journal.py` à blanc sur la vraie base :
  « 7 lignes de journal, 0 d'un compte supprimé ».)
- [x] 2.1 Jouer sur les émulateurs avec le candidat de test. (2026-11-19, `candidat@test.local` connecté à l'instant :
  « Supprimer mon compte », confirmation, retour à `/` ; émulateur relu : compte de connexion supprimé, document `users` et
  profil absents, 4 candidatures au financeur de test gardées avec `porteurId` « compte-supprime ». Le cas « connexion
  ancienne » repose sur le test de `connexionRecente`, pas joué à l'écran.)
- [ ] 2.2 Documentation ; règles et hébergement mis en ligne sur accord de Monsieur DUCOUT.
