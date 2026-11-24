# Tâches

Plan validé le 2026-11-24 (« Tout, failles d'abord »). Chaque tâche : test en échec d'abord, puis correction ; un commit
local par lot vérifié.

## 1. Sécurité

- [x] 1.1 (P0) Courriel du lundi : destinataire = adresse de connexion Firebase vérifiée ; nom de structure sans lien
  et borné ; propriétaire limité à `demarrage`, `profileComplete`, `cguAccepteLe`, `userType`, `notificationPreferences`
  dans `users` ; compte créé en essai seulement. (2026-11-24 : 2 tests Python et 2 tests de règles en échec avant ;
  254 tests Python et 49 tests de règles verts après.)
- [x] 1.2 Appels saisis par un financeur : validation « proposée » à la création, publication par l'administrateur.
  Toute modification par l'auteur repasse l'appel « Proposée », sauf la clôture ; le tri automatique ne le publie
  jamais (motif « saisi par un financeur ») ; message du financeur : « visible après validation par l'administrateur ».
  Les appels manuels déjà publiés, sans bloc de validation, restent visibles. (2026-11-24 : 2 tests du service, 2 tests
  de règles et 1 test du tri en échec avant ; 255 tests Python, 170 de l'application, 51 de règles verts après.
  Parcours sur les émulateurs à rejouer à la vérification finale.)
- [x] 1.3 Formulaire de contact borné, liens `javascript:` et `data:` refusés, messagerie limitée au champ « lu ».
  (2026-11-24 : `utils/liens.ts`, `lienSur` sur les 7 liens d'adresses saisies ou collectées ; contact : sujet de la
  liste, adresse de 254 caractères au plus, compte vide ou le sien ; le nombre d'envois par visiteur ne se borne pas
  par une règle Firestore, limite notée. Tests en échec avant ; 172 tests de l'application et 53 de règles verts.)
- [x] 1.4 Dépendances : 7 inutilisées retirées, `npm audit fix` sans version majeure. (2026-11-24 : `zod`, `dompurify`
  et ses types, `react-hook-form`, `recharts`, `@sentry/react`, `@sentry/tracing`, `@tanstack/react-query` retirés ;
  vulnérabilités de production de 20 (2 critiques, 7 élevées) à 13 (0 critique, 5 élevées) ; 172 tests, 53 tests de
  règles et compilation verts.)
- [ ] 1.5 Mises à niveau majeures restantes : `firebase` 10 vers 12 et `react-router-dom` 6 vers 7 (les 13
  vulnérabilités restantes) ; correctif proposé par npm inutilisable (`firebase` 9.14.0) ; parcours complets sur les
  émulateurs avant de conclure.

## 2. Chaîne du lundi

- [x] 2.1 Courriels en tête de `veille.cmd` ; Python en `-u` et heure par étape. (2026-11-24 : courriel des candidats
  en premier, bilan de l'administrateur après la collecte, modèle local en dernier ; test en échec avant, 256 tests
  Python verts. À blanc sur la vraie base : fenêtre ouverte au 16/11 10 h 32, un seul candidat retenu, le compte de test
  Google vérifié (25 appels) ; `test@test.com`, non vérifié, n'est plus destinataire.)
- [x] 2.2 Textes en échec retentés (trois fois au plus) ; JSON écrits sans fichier coupé et relus avec garde.
  (2026-11-24 : `noter_echec`, `echecs_definitifs`, règle commune à l'extraction et à `textes_restants` ; les anciens
  échecs sans compteur sont retentés ; écriture par fichier temporaire puis remplacement ; un fichier illisible arrête
  l'étape avec un message clair. 4 tests en échec avant, 260 tests Python verts après.)
- [x] 2.3 Journal des coûts à chemin fixe. (2026-11-24 : `extractor.COST_LOG_FILE` et `analyze_costs.LOG_FILE` absolus,
  identiques au journal lu par le plafond ; test en échec avant, 261 tests Python verts.)
- [x] 2.4 Chaîne des PDF : codes d'erreur propagés, ligne « terminée », tâches Windows exportées dans le dépôt.
  (2026-11-24 : bilan « chaîne terminée : N étapes réussies, en échec : … », code 1 si une étape échoue, les suivantes
  tournent quand même ; `chaine_pdf_locale.cmd` en `-u`. Export des tâches écarté : leur XML contient le nom du compte
  Windows ; leurs réglages seront décrits dans la documentation (4.4). Test en échec avant, 262 tests Python verts.)
- [x] 2.5 Import : compteurs et corrections préservés, montants en millions. (2026-11-24 : vues et candidatures écrites à
  la création seulement ; adresse officielle et secteurs protégés sur une fiche validée ; montants en millions,
  milliards, M€ et k€, virgule décimale, espaces insécables. 2 tests en échec avant, 264 tests Python verts.)
- [x] 2.6 Scripts d'écriture à blanc par défaut (option `--reel`) ; migrations déjà jouées rangées à part. (2026-11-24 :
  `migrer_identifiants`, `migrer_echeances`, `publier_sans_date` rangés dans `scripts/migrations_jouees/` avec un README ;
  les scripts récurrents lancés par la veille sans option (`import_to_firestore`, `publier_chiffres`, `publier_couts`)
  gardent leur convention, sinon la chaîne cassait : convention à documenter (4.4) ; `depublier_non_controlees` et
  `corriger_financeur_relais` : question 43. 264 tests Python verts.)

## 3. Application

- [ ] 3.1 Messages d'erreur en français et composant d'erreur commun ; bandeaux au lieu d'`alert`.
- [ ] 3.2 Menu sur téléphone.
- [ ] 3.3 Cartes ouvrables au clavier, fenêtre modale accessible, couleurs manquantes de la palette. (Palette faite le
  2026-11-24 : échelles complètes de success, warning, error, info ; `src/test/palette.test.ts` en échec avec l'ancienne
  configuration, vert avec la nouvelle ; classes générées vérifiées dans la feuille compilée. Restent clavier et modale.)
- [ ] 3.4 Fiche non visible fermée par son adresse directe ; saisie des montants et dates contrôlée ; CSV échappés.
- [ ] 3.5 Connexion qui attend le profil et redirige selon le rôle.
- [ ] 3.6 Chargement découpé, Stripe seulement là où il sert.
- [ ] 3.7 Favori branché ; vraie page 404 ; écrans « en cours de développement » retirés des menus ; mention
  « paiement bientôt disponible » sur l'écran Abonnement.

## 4. Outillage, tests, documentation

- [ ] 4.1 Python : `pyproject.toml` (ruff, mypy sur la chaîne du lundi), dépendances complètes, tests indépendants de
  l'ordre.
- [ ] 4.2 Prettier, appliqué en un commit de mise en forme seul.
- [ ] 4.3 Tests des pages clés, des règles du formulaire de contact, de la reprise sur erreur de l'API.
- [ ] 4.4 README, `app/README.md`, `scraping/README.md`, `scraping/.env.example`, spec de consultation, tableau de
  `CLAUDE.md`, CHANGELOG.

## 5. Clôture

- [ ] 5.1 Vérification finale (lint, types, tests, règles, compilation, démarrage) et nouvelle note.
- [ ] 5.2 Question à part : poussée et mise en ligne des règles et de l'hébergement.
