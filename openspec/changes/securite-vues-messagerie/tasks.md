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

- [ ] 2.1 Tests de règles : création refusée par identifiant et par adresse, fiche protégée, compte rétabli (échec
  avant).
- [ ] 2.2 Règles `suspensions` et `users` ; suspension et rétablissement écrivent et effacent la fiche ; test de page.
- [ ] 2.3 Parcours sur les émulateurs : suspension, suppression, nouvelle inscription refusée, rétablissement.

## 3. Mises à niveau (question 53)

- [ ] 3.1 `firebase` 12 et `react-router-dom` 7 ; corrections d'API ; lint, types, tests, règles, compilation verts.
- [ ] 3.2 `npm audit --omit=dev` avant et après ; parcours des trois rôles sur les émulateurs.

## 4. Vues (question 52)

- [ ] 4.1 Tests de règles : vue acceptée avec sa marque, refusée sans marque ou en double (échec avant).
- [ ] 4.2 Marque de vue écrite avec l'ajout dans une même écriture ; test de page ; parcours sur les émulateurs.

## 5. Messagerie (question 50)

- [ ] 5.1 Tests de règles : conversation à deux participants, tiers refusé, message borné, usurpation refusée (échec
  avant).
- [ ] 5.2 Création d'une conversation depuis une candidature (candidat et financeur) ; page Messages ; tests de page.
- [ ] 5.3 Parcours sur les émulateurs : le financeur écrit, le candidat répond.

## 6. Clôture

- [ ] 6.1 Documentation (README, CHANGELOG, `CLAUDE.md`), `REPRISE.md` pour ce qui ne serait pas fini avant le 29/11.
- [ ] 6.2 Une question à boutons : envoi et mise en ligne.
