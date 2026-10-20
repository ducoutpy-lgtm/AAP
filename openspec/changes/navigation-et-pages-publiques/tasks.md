# Tasks

Retours de Monsieur DUCOUT du 2026-10-20 (parcours de l'application), heure 1 du plan. Zéro euro. Règles : aucun
`git push`, aucun archivage sans demande, aucun déploiement sans accord, la session ne crée aucun compte sur le vrai
projet.

## 1. Gabarit et menus

- [x] 1.1 `components/layout/menus.ts` et `menus.test.ts` ; `Gabarit`, `EnTetePublic`, `BarreLaterale`, `BarreHaute`,
  `PiedDePage`, `RemonterEnHaut` ; routes sous le gabarit dans `App.tsx` ; en-têtes locaux des tableaux de bord
  retirés. Fait quand : `npm test`, lint et build verts ; `/login` montre l'en-tête avec Retour (relu par la session). (Fait le 2026-10-20 : « Tests 44 passed (44) », 39 avant, 5 tests des menus ; lint sans avertissement ; build « built in 4.62s ».)

## 2. Accueil et pages publiques

- [x] 2.1 Accueil : trois cartes de profil et accès administrateur, en-tête et pied de page locaux retirés ;
  `GrilleOffres` partagée ; pages Fonctionnalités, Tarifs, FAQ, À propos, Contact ; règle `messagesContact` écrite
  dans `firestore.rules` (non déployée). Fait quand : lint et build verts ; chaque lien du pied de page ouvre une page
  rédigée (relu par la session).

## 3. Documentation et vérification

- [ ] 3.1 `docs/resume_application_web_2026-10.md`, `app/README.md`, `CHANGELOG.md`, `CLAUDE.md`, `REPRISE.md`.
- [ ] 3.2 Monsieur DUCOUT reparcourt l'application (sans compte, puis avec ses comptes de test) ; retours listés ici.
