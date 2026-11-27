# Tâches

Décisions de Monsieur DUCOUT du 2026-11-26 (questions 49 à 53 de `docs/A_VALIDER.md` ; 51 : « Registre des
suspensions »). Ordre : sécurité d'abord. Chaque lot : test en échec d'abord, puis correction, parcours sur les
émulateurs, un commit par lot. Envoi et mise en ligne après son accord direct.

## 1. Lecture des appels (question 49)

- [x] 1.1 Tests de règles : brouillon, rejeté et publié « Proposée » refusés au candidat en essai et au visiteur ;
  publié validé accepté ; auteur et administrateur acceptés (échec avant).
- [x] 1.2 Règle de lecture resserrée ; requêtes de liste revues (recherche, calendrier, tableaux de bord,
  recommandations, administration, Mes appels).
- [x] 1.3 Fiches publiées sans bloc de validation : décompte et migration à blanc ; écriture réelle sur son accord.
- [x] 1.4 Parcours des listes sur les émulateurs (candidat, financeur, administrateur). (2026-11-26 : règle `get` et `list`
  séparées, `validation.statut == 'validee'` dans les requêtes du candidat, index ajoutés ; 70 tests de règles (dont 9
  nouveaux, 6 en échec avant), 258 de l'application, 302 Python ; essai à blanc sur le vrai projet : 0 appel publié sans
  bloc, aucune migration utile ; émulateurs : recherche, tableau de bord, recommandations, calendrier du candidat, Mes
  appels et calendrier du financeur, administration sans erreur. Index à mettre en ligne AVANT les règles.)

## 2. Registre des suspensions (question 51)

- [x] 2.1 Tests de règles : création refusée par identifiant et par adresse, fiche protégée, compte rétabli (échec
  avant).
- [x] 2.2 Règles `suspensions` et `users` ; suspension et rétablissement écrivent et effacent la fiche ; test de page.
- [x] 2.3 Parcours sur les émulateurs : suspension, suppression, nouvelle inscription refusée, rétablissement. (2026-11-26 : 2.1 et
  2.2 faits, 78 tests de règles et 265 de l'application, contre-vérifiés ; parcours joué le 2026-11-26 vers 16 h :
  l'administrateur suspend candidat@test.local depuis `/admin/utilisateurs` (fiches `suspensions/<uid>` et
  `suspensions/email:candidat@test.local` écrites) ; le candidat ne lit ni n'efface sa fiche (403, 403), supprime son
  document (200), ne le recrée pas (403) ; compte d'authentification supprimé puis rouvert avec la même adresse :
  création refusée (403) ; « Rétablir » dans « Comptes suspendus sans document » efface les deux fiches, puis la création
  réussit (200). Le message « Inscription refusée » à l'écran n'a pas été rejoué (test de page seulement). La page
  `/admin/utilisateurs` plantait sur des comptes sans `createdAt` laissés par les tests des règles dans l'émulateur
  (« reading 'toDate' », code antérieur, ligne 21) : non corrigé ; présence de comptes sans date en base réelle non
  vérifiée (quota de lectures épuisé).
  Limites notées : une adresse contenant « / » ne peut pas être suspendue ; l'administration des utilisateurs exige les
  nouvelles règles en ligne (lecture de `suspensions`) ; une autre adresse ouvre toujours un compte en essai.)

## 3. Mises à niveau (question 53)

- [x] 3.1 `firebase` 12 et `react-router-dom` 7 ; corrections d'API ; lint, types, tests, règles, compilation verts.
- [x] 3.2 `npm audit --omit=dev` avant et après ; parcours des trois rôles sur les émulateurs.
  (2026-11-27 : versions publiées depuis plus de deux semaines : `firebase` 12.19.0 (9 septembre), `react-router-dom`
  7.18.5 (27 octobre), `@firebase/rules-unit-testing` 5.0.2 (19 août), compatible avec `firebase` 12 ; aucune
  correction d'API nécessaire. `npm audit --omit=dev` : avant 13 failles (8 modérées, 5 élevées) ; après la mise à
  niveau 4 élevées, toutes par `@grpc/grpc-js` 1.9.16, que `@firebase/firestore` 12 fixe en « ~1.9.0 » (utilisé côté
  Node seulement : tests, scripts) ; forcé en 1.13.7 (8 octobre, corrigé) par `overrides` dans `package.json` : 0 faille.
  Après : lint, types, 268 tests de l'application, 80 tests de règles (émulateur lancé par `npm run test:rules`, qui
  exerce Firestore sous Node avec grpc-js 1.13.7) et compilation verts ; fichier compilé de 1 031 ko (270 ko compressé,
  avertissement de taille de Vite, taille d'avant non relevée). Parcours sur les émulateurs ressemés : visiteur
  renvoyé vers `/login` pour la recherche et les fiches (décision du 2026-10-20) ; candidat : connexion qui ramène à la
  fiche demandée, recherche (10 appels, filtres), tableau de bord, « Voir tous (10) » au clic, « Mes candidatures »
  (4) ; financeur : tableau de bord (43 vues), « Mes appels à projets » (3), « Candidatures reçues » (4), évaluation,
  « Mettre en examen » écrit `under_review` ; administrateur : tableau de bord, `/admin/aaps` (88), `/admin/utilisateurs`
  (3), `/admin/couts-ia` ; console sans erreur à chaque étape.)

## 4. Vues (question 52)

- [x] 4.1 Tests de règles : vue acceptée avec sa marque, refusée sans marque ou en double (échec avant).
- [x] 4.2 Marque de vue écrite avec l'ajout dans une même écriture ; test de page ; parcours sur les émulateurs.
  (2026-11-26, fait le jour même faute de quota pour 53, ordre changé et dit à la séance de pilotage : marque
  `aap/{id}/vues/{uid}` avec la seule date du serveur, créée par le compte lui-même dans le lot qui ajoute la vue ;
  `ajouteUneVue(aapId)` exige la marque absente avant et présente après ; jamais lue, réécrite ni effacée depuis
  l'application. Échec avant : 3 tests de règles sur 4 (le quatrième, refus seulement, passait déjà) et 2 de page.
  Après : 80 tests de règles (76 Firestore, 4 Storage), 268 de l'application, lint et compilation verts. Parcours sur les
  émulateurs : candidat@test.local ouvre « Aide aux soignants et aux aidants » : `views` 0 -> 1, marque écrite ; deux
  rechargements : 1, console sans message ; financeur@test.local ouvre la même fiche : 2, deux marques.
  Relecture adverse (workflow `revue-vue-unique`, 2 relecteurs puis un sceptique par constat, 11 agents) : 6 confirmés,
  3 réfutés. Corrigés avec un test en échec avant : garde-fou « marque absente avant » non couvert (prouvé en le
  retirant : 1 échec) ; financeur auteur qui fixait lui-même `views` à la création ou à la modification (défaut antérieur,
  contraire à la spec). Corrigé aussi : test de page qui échouait lancé seul (avertissements de React Router).
  Limites laissées, à décider par Monsieur DUCOUT (`REPRISE.md`) : les marques restent après la suppression d'un compte
  ou d'un appel (RGPD : identifiant du compte, fiche, date ; aucun effacement depuis l'application) ; une fiche supprimée
  puis recréée par l'import au même identifiant ne recompte pas ses anciens lecteurs ; les compteurs déjà en base
  comptent chaque compte une fois de plus après la mise en ligne ; plusieurs comptes comptent chacun une vue (périmètre
  choisi). Signalé sans correction, hors question 52 : l'auteur écrit aussi `applicationsCount`. Règles à mettre en
  ligne après son accord.)

## 5. Messagerie (question 50)

- [ ] 5.1 Tests de règles : conversation à deux participants, tiers refusé, message borné, usurpation refusée (échec
  avant).
- [ ] 5.2 Création d'une conversation depuis une candidature (candidat et financeur) ; page Messages ; tests de page.
- [ ] 5.3 Parcours sur les émulateurs : le financeur écrit, le candidat répond.

## 6. Clôture

- [ ] 6.1 Documentation (README, CHANGELOG, `CLAUDE.md`), `REPRISE.md` pour ce qui ne serait pas fini avant le 29/11.
- [ ] 6.2 Une question à boutons : envoi et mise en ligne.
