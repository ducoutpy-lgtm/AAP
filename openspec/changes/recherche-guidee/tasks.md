# Tasks

Point 3 des six points validés par Monsieur DUCOUT le 2026-10-20, premier groupe des filtres (calculables sans
nouvelle extraction). Zéro euro. Règles : aucun `git push`, aucun archivage sans demande, aucun déploiement.

## 1. Fonctions pures et tests

- [x] 1.1 `utils/recherche.ts` (statut, total des montants, étiquettes, filtres <-> adresse, filtres d'après le
  profil, fiches consultées) et `recherche.test.ts`. Fait quand : `npm test` vert, compte collé. (Fait le 2026-10-20 : « Tests 39 passed (39) », 32 avant, 7 tests ajoutés.)

## 2. Page de recherche

- [x] 2.1 `SearchAapPage` : filtres dans l'adresse, compteur avec montants, étiquettes actives et « Effacer tout »,
  filtre et pastille Statut, « Copier le lien », « Initialiser à mon profil », onglet « Consultées », appels nationaux
  inclus ; `AapDetailPage` mémorise la fiche. Fait quand : lint et build verts ; écran vérifié par la session sans
  compte (compteur, étiquette après un filtre, adresse réécrite, statut). (Fait le 2026-10-20 : lint sans avertissement, build « built in 3.48s » ; `/aap/search?territory=normandie&statut=bientot-clos` -> « 19 appels à projets totalisant 6 860 433 € annoncés (6 fiches chiffrées) », étiquettes « Normandie » et « Bientôt clôturé », 19 cartes avec pastille « Bientôt clôturé », la croix de « Normandie » réécrit l'adresse en `?statut=bientot-clos` et le compteur passe à 75 appels ; aucune erreur console.)

## 3. Documentation et vérification

- [x] 3.1 `docs/resume_application_web_2026-10.md`, `CHANGELOG.md`, `CLAUDE.md`, `REPRISE.md`,
  `docs/parcours_hellodarwin_2026-10.md` (point 3 : premier groupe fait).
- [ ] 3.2 Monsieur DUCOUT joue les scénarios (sans compte, puis avec son compte porteur de test pour « Initialiser à
  mon profil ») ; erreurs listées ici.
