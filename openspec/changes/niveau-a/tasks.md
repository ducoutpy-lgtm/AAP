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

- [ ] 3.1 Messages d'erreur en français et composant d'erreur commun ; bandeaux au lieu d'`alert`. (Messages faits le
  2026-11-24 : `utils/erreurs.ts`, `messageErreur` dans 17 affichages de 13 écrans ; test unitaire et test de la page
  de connexion, en échec sans la correction ; 176 tests verts. Restent : états d'erreur des pages, où une panne s'affiche
  comme « aucun résultat », et `alert()` remplacés par des bandeaux.)
- [ ] 3.2 Menu sur téléphone.
- [ ] 3.3 Cartes ouvrables au clavier, fenêtre modale accessible, couleurs manquantes de la palette. (Palette faite le
  2026-11-24 : échelles complètes de success, warning, error, info ; `src/test/palette.test.ts` en échec avec l'ancienne
  configuration, vert avec la nouvelle ; classes générées vérifiées dans la feuille compilée. Restent clavier et modale.)
- [x] 3.4 Fiche non visible fermée par son adresse directe ; saisie des montants et dates contrôlée ; CSV échappés.
  (2026-11-25 : `ficheConsultable` dans la fiche et le formulaire de candidature, `candidatureOuverte` exige la
  visibilité ; `utils/csv.ts` (guillemets, apostrophe devant = + - @, point-virgule et UTF-8, choix à confirmer) dans les
  deux exports ; `erreursEtape` dans `aapFormulaire.ts`, un message sous chaque champ. Tests en échec avant chacune des
  trois corrections ; 199 tests verts, construction réussie. La règle de lecture Firestore laisse encore tout compte en
  essai lire une fiche non publiée par le SDK : la resserrer demande de revoir les requêtes de liste, non fait.)
- [x] 3.5 Connexion qui attend le profil et redirige selon le rôle. (2026-11-25 : `AuthContext` garde `loading` vrai
  jusqu'à la lecture du profil ; la page de connexion redirige dans un effet par `destinationApresConnexion`
  (`utils/connexion.ts`), sans l'attente fixe d'une seconde. Test d'un profil lu 1,5 s après : l'ancienne page menait à
  `/complete-profile` ; 201 tests verts. Parcours des trois rôles sur les émulateurs : dans la vérification 5.1.)
- [ ] 3.6 Chargement découpé, Stripe seulement là où il sert.
- [x] 3.7 Favori branché ; vraie page 404 ; écrans « en cours de développement » retirés des menus ; mention
  « paiement bientôt disponible » sur l'écran Abonnement. (2026-11-25 : `favorisService.ts` et `useFavoris` (document
  `uid_aapId` dans `favoriteAap`), cœur de la fiche et des cartes de la recherche, libellé et `aria-pressed` ;
  `PageIntrouvable` ; boutons et routes `/admin/paiements` et `/admin/parametres` retirés avec le gabarit provisoire ;
  mention et boutons d'abonnement inactifs, l'essai reste accessible. Tests en échec avant ; 207 verts. Pas encore de
  liste « Mes favoris » à l'écran : les favoris se voient au cœur plein.)

## 4. Outillage, tests, documentation

- [ ] 4.1 Python : `pyproject.toml` (ruff, mypy sur la chaîne du lundi), dépendances complètes, tests indépendants de
  l'ordre.
- [ ] 4.2 Prettier, appliqué en un commit de mise en forme seul.
- [ ] 4.3 Tests des pages clés, des règles du formulaire de contact, de la reprise sur erreur de l'API.
- [ ] 4.4 README, `app/README.md`, `scraping/README.md`, `scraping/.env.example`, spec de consultation, tableau de
  `CLAUDE.md`, CHANGELOG.

## 6. Décisions du 2026-11-24 (questions 35 à 43, choix à cocher relayés par la séance de pilotage)

- [x] 6.1 (35) Compteur de vues : +1 à l'ouverture d'une fiche, règle Firestore qui n'autorise que cet ajout.
  (2026-11-25 : `ajouteUneVue` dans `firestore.rules` (compte connecté, appel publié, `views` seul, +1 exactement) ;
  la fiche appelle `incrementViews` une fois par ouverture, ni pour l'auteur ni pour l'administrateur. Tests en échec
  avant : règle (55 tests sur l'émulateur) et page (185 tests). Règle à mettre en ligne après accord.)
- [x] 6.2 (36) « Se souvenir de moi » : case décochée, session fermée à la fermeture du navigateur. (2026-11-25 :
  `login(email, mot de passe, seSouvenir)` et `setPersistence` ; décochée par défaut ; test en échec sans la correction ;
  181 tests verts. La connexion par Google garde la session, non modifiée.)
- [x] 6.3 (37) Thématique des appels de financeur déduite des « Secteurs ciblés » (application et `scraping/alertes.py`).
  (2026-11-25 : sans champ classé, Santé donne santé et Social donne médico-social, `thematique` de `territoires.ts` et
  filtre de `alertes.py` ; fiche g des cas communs, en échec des deux côtés avant la correction ; 181 et 265 tests verts.)
- [x] 6.4 (38) Jour de clôture compté en jours du calendrier, règle commune à l'import, à l'application et au courriel.
  (2026-11-25 : `getDaysUntilDeadline` compare le jour de clôture (minuit UTC) à la date du jour du visiteur, la prochaine
  échéance du financeur la reprend ; `jours_avant_cloture` dans `alertes.py` (le courriel retirait l'appel qui clôt le
  jour même) ; l'import comparait déjà des dates. Tests en échec avant (Martinique : -1 au lieu de 0) ; 183 et 266 verts.
  Reste : les dates affichées (`toLocaleDateString`) montrent la veille outre-mer, à traiter avec les dates du lot 3.)
- [x] 6.5 (39) Bouton « Clôturer » dans « Mes appels ». (2026-11-25 : sur un appel publié, avec confirmation ; test de page
  en échec sans le bouton.)
- [x] 6.6 (40) Avis du financeur visible par le candidat. (2026-11-25 : la page du candidat lit `financeurFeedback`,
  champ écrit par l'évaluation ; test en échec avant.)
- [x] 6.7 (41) Cinq régions d'outre-mer dans Mon profil. (2026-11-25 : liste commune `REGIONS` dans
  `profilFormulaire.ts`, 18 régions, identifiants du parcours ; test en échec avant.)
- [x] 6.8 (42) Case « Recevoir le courriel du lundi » dans Mon profil. (2026-11-25 : `PreferenceCourrielCarte`, pour un
  candidat ; écrit `notificationPreferences.email` ; test en échec avant ; 180 tests verts.)
- [x] 6.9 (43) `depublier_non_controlees.py` et `corriger_financeur_relais.py` gardés, mais sans écriture sans option
  explicite ; vérifier dans la base s'ils ont servi. (2026-11-24 : tous deux ont servi, d'après leurs sauvegardes
  `depublication_2026-10-20_1101.json` et `financeur_relais_2026-10-28_1229.json` ; `corriger_financeur_relais` exigeait
  déjà `--reel` ; `depublier_non_controlees` bloqué derrière `--reel`. Test en échec avant, 265 tests Python verts.)

## 5. Clôture

- [ ] 5.1 Vérification finale (lint, types, tests, règles, compilation, démarrage) et nouvelle note.
- [ ] 5.2 Question à part : poussée et mise en ligne des règles et de l'hébergement.
