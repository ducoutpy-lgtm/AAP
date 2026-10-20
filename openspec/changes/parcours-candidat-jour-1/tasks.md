# Tasks

Jour 1 du plan MVP (`docs/PLAN_MVP_2026-10-20.md`). Zéro euro. Règles : aucun `git push`, aucun archivage sans
demande, aucun déploiement.

- [x] 1.1 `utils/candidat.ts` et `candidat.test.ts`. Fait le 2026-10-20 : « Tests 51 passed (51) », 45 avant, 6 tests ajoutés.
- [x] 1.2 Fiche d'appel (trois cases, « À qui s'adresse », libellés), tableau de bord candidat, page
  `/candidature/:id`, « Mes candidatures » en colonnes, route. Fait quand : lint et build verts. (Fait le 2026-10-20 : lint sans avertissement, build « built in 3.41s » ; pages derrière la connexion, non jouées par la session.)
- [x] 1.3 Documentation (`docs/resume_application_web_2026-10.md`, `CHANGELOG.md`, `REPRISE.md`, `CLAUDE.md`).
- [ ] 1.4 Monsieur DUCOUT joue inscription -> recherche -> fiche -> candidature -> suivi avec son compte candidat ;
  impasses et remarques listées ici.
  Premier passage du 2026-10-20 au soir (navigateur intégré, compte candidat ARCADIA, Bourgogne-Franche-Comté) :
  - tableau de bord et liste « Appels pour votre structure » : bien ;
  - fiche : étiquettes « Contrôlée par le modèle (claude-haiku-5-5) » à réserver à l'administration, montrer une date
    de mise à jour -> corrigé le soir même (fiche et cartes de recherche) ;
  - « À qui s'adresse » disait « non précisé » alors que les critères écrivaient « structures éligibles : associations »
    -> familles reconnues dans les critères (heuristique, test), en attendant le champ extrait (jour 2) ;
  - la fiche ouverte (mécénat de compétences, Fondation Eurogroup) n'a rien à voir avec la santé bien que validée par
    le modèle -> classement du champ à resserrer au jour 2 ; à rejeter depuis l'administration en attendant ;
  - le dossier de candidature PDF de l'annonce doit être téléchargeable depuis notre fiche, pas seulement depuis le
    site officiel -> collecte des pièces jointes par la veille, jour 2 ;
  - le formulaire de candidature (six étapes, « répartition du budget, gestion des risques, pérennisation ») est
    « bidon » : le vrai dossier est le formulaire du financeur -> réduit à trois étapes (projet, montant, pièces avec
    le dossier de l'appel rempli) ; pré-remplissage à partir du PDF au jour 5 ;
  - envoi : « storage/unauthorized » sur uploads/applications/<compte>/... -> règle Storage ajoutée pour ce dossier,
    déploiement en attente d'accord.
