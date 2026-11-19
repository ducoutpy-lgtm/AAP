# Tasks

Semaine 2 du plan de quatre semaines (« continue avec la semaine 2 », Monsieur DUCOUT, 2026-11-13). Zéro euro.

- [x] 1.1 Cartographie en lecture seule (page actuelle, champs du profil et des appels, tests existants). Fait quand :
  carte écrite. (Fait le 2026-11-13 : la page actuelle compare des secteurs toujours égaux, cherche « National » que
  l'import n'écrit jamais, invente un budget, montre des fiches non contrôlées et clos, affiche « Infinity jours ».)
- [x] 1.2 Tests rouges de `app/src/utils/recommandations.ts`. Fait quand : test rouge collé. (Fait le 2026-11-13 :
  « Failed to resolve import "./recommandations" ».)
- [x] 1.3 Règles, puis page `/recommandations` réécrite. Fait quand : `npm test`, lint et compilation verts. (Fait le
  2026-11-13 : « 6 passed ».)
- [x] 2.1 Parcours joué sur les émulateurs (compte `candidat@test.local` : association, EHPAD, Île-de-France ; semis
  corrigé : appels de test sur `territoriesEligible`, appels qualifiés importés depuis `extraction_api`). Fait quand :
  liste collée. (Fait le 2026-11-13 : premier passage « 42 appels », dont une quinzaine sans rapport pour un EHPAD :
  appels nationaux de recherche (cancer, organoïdes) ou d'industrie (« Première Usine ») ouverts aux associations.
  Trois règles ajoutées, chacune avec son test rouge puis vert : appel qui ne finance que de la recherche écarté, champ
  qui contredit le profil écarté, appel national recommandé seulement sur un élément concret commun ; réserve « Domaine
  de l'appel non précisé » sinon ; « Clôture aujourd'hui ». Second passage : « 16 appels », puis « 14 appels » : douze
  appels réels (création d'EHPAD et de résidence autonomie, label Culture et Santé, conférences des financeurs, proches
  aidants, aide aux soignants, vieillir dans les ruralités, deux appels nationaux du médico-social) et deux appels de
  test ; un douteux selon la session (unité d'enseignement pour enfants autistes, médico-social de la région) ; aucune
  mention « Infinity ». `npm test` « 80 passed », lint, compilation ; `scripts/tests` « 43 passed ».)
- [x] 3.1 Documentation : `CHANGELOG.md`, `REPRISE.md`.
- [ ] 4.1 Mise en ligne après accord de Monsieur DUCOUT.
- [x] 5.0 (ajoutée le 2026-11-16) Préparer le tirage de la vérification 5.1 : `scripts/exporter_fiches_visibles.py`
  (lecture seule de la base, fiches visibles par le public, fichier local ignoré par Git) et
  `app/scripts/tirage_recommandations.ts` (fonction `recommander` de l'application sur quatre profils types, vingt
  recommandations tirées avec une graine fixe) ; liste à juger dans `docs/TIRAGE_RECOMMANDATIONS.md`. Zéro euro.
  (2026-11-16 : 363 fiches, 130 recommandations, vingt tirées, tirage identique au second passage (`cmp`) ; avis de la
  session : environ 4 pertinentes sur 20, qualification trop large ; question 29.)
- [x] 5.0 bis (2026-11-19, question 29 « (a) maintenant ») Règles sans coût : pas de point de statut pour un appel ouvert à
  toute structure ou aux équipes de recherche ; un appel national a besoin d'un type cité ou d'un objet commun ; un appel
  Horizon Europe est réservé aux profils de recherche (ajout de la session, même famille de règles). Tests d'abord
  (3 en échec, 2 anciens tests adaptés), `npm test` 116 verts. Tirage refait : 129 recommandations, au mieux 12
  pertinentes sur 20 (avis dans `docs/TIRAGE_RECOMMANDATIONS.md`). Reste la voie (b), par le modèle local.
- [ ] 5.1 Vérification par Monsieur DUCOUT : vingt recommandations tirées au sort pour un profil réel, au moins dix-huit
  pertinentes ; validation des choix par défaut (GCS, exercice coordonné, appel écarté s'il ne cite que d'autres types
  d'établissement, règles nationales et de domaine, seuil de 3 points).
