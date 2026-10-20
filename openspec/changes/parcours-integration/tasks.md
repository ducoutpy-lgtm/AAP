# Tasks

Point 1 des six points de transposition validés par Monsieur DUCOUT le 2026-10-20 (relevé helloDarwin). Zéro euro.
Règles : aucun `git push`, aucun archivage sans demande, aucun déploiement, la session ne crée aucun compte sur le
vrai projet.

## 1. Fonctions pures et tests

- [x] 1.1 `pages/onboarding/parcours.ts` (listes du secteur, `regionDepuisCodePostal`, `etapeComplete`,
  `profilPorteurDepuisParcours`, `profilFinanceurDepuisParcours`) et `parcours.test.ts`. Fait quand : `npm test`
  vert, compte collé. (Fait le 2026-10-20 : « Tests 27 passed (27) », 19 avant, 8 tests du parcours ajoutés.)

## 2. Page du parcours

- [x] 2.1 `pages/onboarding/ParcoursIntegrationPage.tsx` : accueil (CGU, rôle si compte Google), trois écrans avec
  `Stepper`, « Retour » / « Suivant » grisé, écran des offres à trois colonnes, enregistrement et redirection ;
  `CompleteProfile.tsx` aiguille vers le parcours ; `AuthContext` expose `creerDocumentUtilisateur`. Fait quand : lint
  et build verts ; `/complete-profile` sans compte redirige vers `/login` (relu par la session). (Fait le 2026-10-20 : lint sans avertissement, build « built in 6.99s », `/complete-profile` sans compte -> `/login` « Connexion », aucune erreur console.)

## 3. Profil enrichi

- [x] 3.1 `types/index.ts` (champs optionnels, `cguAccepteLe`), `profilFormulaire.ts` et son test,
  `CompletePorteurProfile.tsx` (formes juridiques du secteur, type d'établissement, taille, budget, publics). Fait
  quand : lint, build et `npm test` verts. (Fait le 2026-10-20, même passage : 27 tests, dont un test des nouveaux champs du profil.)

## 4. Documentation et vérification

- [x] 4.1 `docs/resume_application_web_2026-10.md`, `app/README.md`, `CHANGELOG.md`, `CLAUDE.md`, `REPRISE.md`,
  `docs/parcours_hellodarwin_2026-10.md` (point 1 : fait).
- [ ] 4.2 Monsieur DUCOUT joue le parcours avec un compte de test neuf (e-mail) et, s'il le souhaite, un compte
  Google ; valide ou corrige les montants des offres ; erreurs rencontrées listées ici.
