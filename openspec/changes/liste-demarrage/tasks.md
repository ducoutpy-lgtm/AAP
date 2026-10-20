# Tasks

Point 2 des six points validés par Monsieur DUCOUT le 2026-10-20. Zéro euro. Règles : aucun `git push`, aucun
archivage sans demande, aucun déploiement, la session ne crée aucun compte sur le vrai projet.

## 1. Fonctions pures et tests

- [x] 1.1 `components/demarrage/demarrage.ts` (actions par rôle, `etatDemarrage`, listes des objets de projet et
  des rayons d'action) et `demarrage.test.ts`. Fait quand : `npm test` vert, compte collé. (Fait le 2026-10-20 : « Tests 32 passed (32) », 27 avant, 5 tests ajoutés.)

## 2. Carte, fenêtre et marquage

- [x] 2.1 `components/demarrage/ListeDemarrage.tsx` (carte, fenêtre de profil), `hooks/useMarquerDemarrage.ts`,
  appel dans les deux tableaux de bord et dans `SearchAapPage`, `AapDetailPage`, `ApplicationFormPage`,
  `CreateAapPage` ; `types/index.ts` ; trois champs ajoutés au formulaire long du porteur. Fait quand : lint et build
  verts ; `/aap/search` sans compte s'affiche sans erreur console (aucun marquage). (Fait le 2026-10-20 : lint sans avertissement, build « built in 6.81s » ; écran vérifié ci-dessous.)

## 3. Documentation et vérification

- [x] 3.1 `docs/resume_application_web_2026-10.md`, `CHANGELOG.md`, `CLAUDE.md`, `REPRISE.md`,
  `docs/parcours_hellodarwin_2026-10.md` (point 2 : fait).
- [ ] 3.2 Monsieur DUCOUT joue les scénarios avec ses comptes de test ; erreurs listées ici.
