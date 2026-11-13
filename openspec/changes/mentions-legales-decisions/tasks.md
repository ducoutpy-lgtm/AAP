# Tasks

Décisions de Monsieur DUCOUT du 2026-11-13 (question 5 de `docs/A_VALIDER.md`). Zéro euro.

- [x] 1.1 Test rouge : plus aucune mention « À VALIDER » ; emplacement des comptes écrit ; tarifs provisoires. Fait
  quand : test rouge collé. (Fait le 2026-11-13 : « 2 failed | 2 passed ».)
- [x] 1.2 Textes des trois pages, import inutile retiré. Fait quand : `npm test`, `npm run lint`, `npm run build` verts.
  (Fait le 2026-11-13 : `npm test` « 16 passed (16) », « 72 passed (72) » ; lint sans erreur ; « built in 5.50s ».)
- [x] 2.1 Documentation : `CHANGELOG.md`, `docs/A_VALIDER.md`.
- [ ] 3.1 Mise en ligne après accord de Monsieur DUCOUT : `npm run build && firebase deploy --only hosting --project
  aapi-11bc3` depuis `app`.
- [ ] 4.1 Vérification par Monsieur DUCOUT : `/cgu`, `/confidentialite`, `/mentions-legales` sans encadré jaune.
