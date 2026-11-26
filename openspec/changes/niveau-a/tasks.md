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
- [x] 2.6 Scripts d'écriture à blanc par défaut (option `--reel`) pour les scripts revus (plusieurs anciens écrivent
  encore sans option : liste dans `scraping/README.md`, relecture du 2026-11-25) ; migrations déjà jouées rangées à part. (2026-11-24 :
  `migrer_identifiants`, `migrer_echeances`, `publier_sans_date` rangés dans `scripts/migrations_jouees/` avec un README ;
  les scripts récurrents lancés par la veille sans option (`import_to_firestore`, `publier_chiffres`, `publier_couts`)
  gardent leur convention, sinon la chaîne cassait : convention à documenter (4.4) ; `depublier_non_controlees` et
  `corriger_financeur_relais` : question 43. 264 tests Python verts.)

## 3. Application

- [x] 3.1 Messages d'erreur en français et composant d'erreur commun ; bandeaux au lieu d'`alert`. (Messages faits le
  2026-11-24 : `utils/erreurs.ts`, `messageErreur` dans 17 affichages de 13 écrans ; test unitaire et test de la page
  de connexion, en échec sans la correction ; 176 tests verts. 2026-11-25 : `MessageErreur` (message et « Réessayer »)
  dans 13 pages dont la lecture échouait en silence (recherche, tableaux de bord, statistiques, administration,
  calendrier, notifications) ; 25 `alert()` remplacés par `annoncer()` (`utils/annonces.ts`, bandeau `Annonces` posé dans
  `App.tsx`) ; envoi de message en échec annoncé. Tests en échec avant (recherche, annonces, aucun `alert(` dans les
  sources) ; 213 verts. Les `confirm()` et `prompt()` restent, comme le prévoyait l'audit.)
- [x] 3.2 Menu sur téléphone. (2026-11-25 : sous 768 px la barre latérale est masquée ; bouton « Ouvrir le menu »
  (`aria-expanded`, `aria-controls`) dans la barre haute, menu par-dessus la page, refermé au changement de page, par
  Échap, par sa croix ou un clic à côté ; `menus.ts` inchangé. Test en échec avant ; 214 verts. Rendu sur un écran de
  375 px : dans la vérification 5.1.)
- [x] 3.3 Cartes ouvrables au clavier, fenêtre modale accessible, couleurs manquantes de la palette. (Palette faite le
  2026-11-24 : échelles complètes de success, warning, error, info ; `src/test/palette.test.ts` en échec avec l'ancienne
  configuration, vert avec la nouvelle ; classes générées vérifiées dans la feuille compilée. 2026-11-25 :
  `activableAuClavier` (`utils/clavier.ts`) dans `Card` cliquable, les cases et événements du calendrier, les
  conversations et les lignes des testeurs ; `Modal` en `role="dialog"` nommé par son titre, croix « Fermer », Échap,
  focus gardé dans la fenêtre et rendu à la fermeture. Tests en échec avant ; 218 verts.)
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
- [x] 3.6 Chargement découpé, Stripe seulement là où il sert. (2026-11-25 : `config/stripe.ts` sans import de Stripe,
  `SelectPlanPage` par `@stripe/stripe-js/pure` au moment du paiement ; pages des comptes connectés en `lazy`, attente dans
  le gabarit. Construction : fichier principal 1 073 ko -> 765 ko (Firebase en tête, avertissement des 500 ko encore
  affiché), 70 morceaux, script Stripe dans le seul morceau de l'écran Abonnement. Test en échec avant ; 209 verts.)
- [x] 3.7 Favori branché ; vraie page 404 ; écrans « en cours de développement » retirés des menus ; mention
  « paiement bientôt disponible » sur l'écran Abonnement. (2026-11-25 : `favorisService.ts` et `useFavoris` (document
  `uid_aapId` dans `favoriteAap`), cœur de la fiche et des cartes de la recherche, libellé et `aria-pressed` ;
  `PageIntrouvable` ; boutons et routes `/admin/paiements` et `/admin/parametres` retirés avec le gabarit provisoire ;
  mention et boutons d'abonnement inactifs, l'essai reste accessible. Tests en échec avant ; 207 verts. Pas encore de
  liste « Mes favoris » à l'écran : les favoris se voient au cœur plein.)

## 4. Outillage, tests, documentation

- [x] 4.1 Python : `pyproject.toml` (ruff, mypy sur la chaîne du lundi), dépendances complètes, tests indépendants de
  l'ordre. (2026-11-25 : `pyproject.toml` à la racine ; pytest avec `pythonpath` (`test_validation` et `test_annuaires`
  échouaient lancés seuls, 8 et 8 verts maintenant) ; ruff E, F, I, B sans longueur de ligne ni noms courts (style du
  code existant) : 981 signalements, 43 corrigés d'office (imports), 10 à la main, « All checks passed » ; mypy sur les
  sept modules lancés par `veille.cmd`, une correction, « no issues found in 7 source files » ; `requests` déclaré,
  `requirements-dev.txt`. 266 tests verts. Reste : le test du relais lit encore les vrais `financeurs.json` et
  `registre.json`.)
- [x] 4.2 Prettier, appliqué en un commit de mise en forme seul. (2026-11-25 : Prettier 3.3.3 fixé, guillemets simples,
  120 caractères, fins de ligne du poste ; commandes `typecheck`, `format`, `format:check` ; mise en forme seule dans
  `58f627e` (132 fichiers), lint, types et 218 tests verts avant et après ; `.git-blame-ignore-revs`.)
- [x] 4.3 Tests des pages clés, des règles du formulaire de contact, de la reprise sur erreur de l'API. (2026-11-25 :
  pages clés testées pendant les lots 3 et 6 (fiche, recherche, connexion, abonnement, page 404, gabarit, Mes appels) ;
  règles du contact testées au lot 1.3 ; `test_extractor_reprise.py` : 529 puis réussite (trois appels, attentes 3 et
  6 s), 400 sans nouvel essai, quatre 429 puis arrêt clair, faux client sans coût ; reprise volontairement cassée
  (`range(1)`) : 2 échecs, fichier rétabli. 269 tests Python verts.)
- [x] 4.4 README, `app/README.md`, `scraping/README.md`, `scraping/.env.example`, spec de consultation, tableau de
  `CLAUDE.md`, CHANGELOG. (2026-11-25 : README racine (administrateur par `creer_admin.py`, consultation avec compte,
  sections « Vérifier le projet », « Variables d'environnement », « Mise en ligne ») ; `app/README.md` (Node 20, Google
  activé, commandes, résumé du plan, liens des cahiers, emojis retirés) ; `scraping/README.md` (tâches planifiées
  relevées par `schtasks`, conventions des scripts, tests et qualité) ; variables facultatives dans `.env.example` ;
  phrase périmée du bilan administrateur ; spec de consultation en delta (`specs/consultation-aap-scrapes`, fiche
  fermée, jours du calendrier, compte requis, lien d'accueil retiré), « Change 'niveau-a' is valid » ; ligne du plan
  au tableau de `CLAUDE.md` ; entrées des deux CHANGELOG.)

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

- [x] 5.1 Vérification finale (lint, types, tests, règles, compilation, démarrage) et nouvelle note. (2026-11-25 : lint,
  types, mise en forme, 254 tests de l'application, 61 de règles, 297 Python, ruff, mypy, compilation et spec verts ;
  parcours des trois rôles sur les émulateurs (section 7). Note indépendante finale : B, 14,3 sur 20 (départ : 9 à 12,5
  selon les axes ; B- avant la relecture). Pour un A franc, 27 points restent, hors questions 44 à 53 : chaîne du lundi
  jamais rejouée de bout en bout, `veille.cmd` sans dossier `logs` ni codes d'erreur, en-têtes HTTP de sécurité, règles
  des candidatures et des messages, essai de 14 jours jamais appliqué, contraste, `confirm()`, intégration continue et
  couverture, pages sans test, documentation de pilotage et changements OpenSpec non archivés.)
- [x] 5.2 Question à part : poussée et mise en ligne des règles et de l'hébergement. (2026-11-26 : « Oui, envoie et
  mets en ligne » ; `git push` `82bade3..5c7bfe4` ; « released rules firestore.rules », « Deploy complete » ; le site
  sert `index-C6x4fVWp.js` ; sans compte, publiés lus (200) et brouillons refusés (403).)

## 7. Relecture indépendante et vérification (2026-11-25)

- [x] 7.1 Parcours sur les émulateurs : connexion des trois rôles, saisie d'un appel avec erreurs puis valide,
  validation par l'administrateur, recherche par thématique, favori, clavier, menu à 375 px, page 404, Abonnement. Une
  régression de la connexion trouvée (page recréée par le gabarit) et corrigée (`481227c`, test en échec avant).
- [x] 7.2 Relecture en cinq angles et notation par des agents distincts, chaque constat contre-vérifié : 47 confirmés,
  7 réfutés, note B- (relecture du code, des règles, de la chaîne, de la documentation et des tests).
- [x] 7.3 Première passe, huit groupes de fichiers sans recouvrement, chacun contre-vérifié : `ae2e473`, `8a8271a`,
  `382d614`, `46a199b`, `e068903`, `0ca11f6`, `954ad36`, `bf99f2d`.
- [x] 7.4 Seconde passe sur les points « à reprendre » des sceptiques, six groupes contre-vérifiés : `153d190`,
  `9bbd9c9`, `7b7f6c0`, `1cae3d0`, `c7f5f26`, `c4beabe`. Retour sur une consigne de la session (montants : un point suivi
  de trois chiffres lu en milliers) sur avis bloquant : la seule valeur réelle devenait 1 000 fois trop grande.
- [x] 7.5 Documentation finale (CHANGELOG, README, `CLAUDE.md`), questions 44 à 53 dans `docs/A_VALIDER.md`.
- [ ] 7.6 Laissés à une décision de Monsieur DUCOUT (questions 49 à 53) : lecture des appels non publiés par tout compte
  en essai ; messagerie sans règle `conversations` ; suspension contournable en recréant son document `users` ; vues
  gonflables par des ouvertures répétées ; mises à niveau majeures (1.5).

