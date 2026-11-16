# Tâches

- [x] 1.1 Tests d'abord : cas communs (montants en texte), pytest (`_parse_float`, recherche d'avril vide, critères non
  repris, nom nettoyé, candidat isolé), tests de règles (`userId` figé, financeur suspendu). Fait quand : ils échouent.
  (2026-11-16 : pytest « 6 failed », règles « 2 failed » ; les deux cas communs passaient déjà côté TypeScript, qui
  utilisait `parseFloat`.)
- [x] 1.2 Corrections dans `alertes.py`, `recherche.ts`, `SavedSearchesPage.tsx`, `SearchAapPage.tsx`,
  `ConfidentialitePage.tsx`, `firestore.rules`. Fait quand : `npm test`, pytest, `npm run test:rules`, lint et build verts.
  (2026-11-16 : `npm test` 117, pytest 172, règles 36 verts ; règles d'avant remises un instant : les deux nouveaux tests
  échouent ; lint, types et build verts.)
- [x] 2.1 Documentation (`CHANGELOG.md`, `docs/A_VALIDER.md` questions 27, 28, 31).
- [x] 2.2 Mise en ligne de l'hébergement et des règles du stockage (accord du 2026-11-16) ; règles Firestore sur accord
  (question 31). (2026-11-16 : version servie `index-BB_FScPX.js` ; règles Firestore non déployées, question 31.)
