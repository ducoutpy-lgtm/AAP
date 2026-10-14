# Tasks

Lot 0 du rapport de critique validé le 2026-10-14 : instructions 1 à 9 et 17. Règle « Preuve avant affirmation » :
chaque tâche cochée avec sa preuve (commande exécutée, fichier lu). Règles absolues : zéro dépense hors plafond,
aucun secret affiché, aucun `git push`, aucun archivage OpenSpec sans demande de Monsieur DUCOUT, aucun fichier
des modules gelés modifié.

État de départ (2026-10-14) : pytest 49 + 6 verts ; `npm run build` vert ; `npm run lint` rouge (pas de
configuration ESLint) ; essai à blanc de l'import : « AAP lus : 702 | a importer : 310 (dont 2 doublons fusionnes,
149 sans date en brouillon) | ignores : {'incomplet': 0, 'expire': 390} | verdicts lus : 0 ».

Dépendance d'archivage : la spec `import-aap-scrapes` de ce changement modifie l'exigence « Fiches sans date de
clôture en attente », qui n'entrera dans `openspec/specs/` qu'à l'archivage du changement `organisation-donnees-validees`
(vérification 5.1 en attente). Archiver celui-ci d'abord, sur demande de Monsieur DUCOUT.

## 1. Périmètre de l'application (instructions 1 et 2)

- [x] 1.1 `app/src/App.tsx` : routes et imports réduits (design, décision 1) ; liens `/signup` retirés de
  `LandingPage.tsx` et `LoginPage.tsx` selon la décision de Monsieur DUCOUT. Fait quand : `npm run build` vert,
  serveur de développement lancé, `/signup` affiche « Page non trouvée », `/aap/search` et `/login` répondent.
  (Fait : `npm run build` « ✓ built in 4.09s » ; navigateur sur le serveur de développement : `/signup` -> « Page non
  trouvée », `/aap/search` -> « 194 AAP disponibles » avec la liste, accueil sans bouton « Commencer » et avec le lien
  « Voir les appels à projets ».)
- [x] 1.2 Configuration ESLint `app/.eslintrc.cjs` (gabarit Vite, `dist` et `functions` ignorés) ; fichiers gelés
  en `ignorePatterns` seulement s'ils produisent des erreurs et après accord. Fait quand : `npm run lint` code 0.
  (Fait : 61 problèmes au premier passage (42 erreurs, 19 avertissements) ; 7 fichiers du MVP typés (AuthContext,
  ManageAAPsPage, ManageUsersPage, LoginPage, AapDetailPage, SearchAapPage, aapService), 16 fichiers gelés ignorés ;
  `npm run lint` code 0.)
- [x] 1.3 Contrôle du gel : `git diff --stat` ne liste aucun fichier des modules gelés (liste dans `design.md`).
  Fait quand : sortie collée ici. (Fait : 25 fichiers modifiés, aucun gelé : firestore.rules, package.json,
  package-lock.json, App.tsx, AuthContext.tsx, ManageAAPsPage.tsx, ManageUsersPage.tsx, LoginPage.tsx, AapDetailPage.tsx,
  SearchAapPage.tsx, LandingPage.tsx, aapService.ts, types/index.ts, utils/deadline.ts, tsconfig.json, echantillon.py,
  extractor.py, validation.py, trois `.cmd`, import_to_firestore.py et les tests.)

## 2. Import strict et statut unique (instructions 3, 4, 5, 6 et partie import de 9)

- [x] 2.1 `scripts/import_to_firestore.py` : étiquette `a-verifier` dérivée de `validation.statut` ;
  `validation.par` ; listes `CHAMPS_TECHNIQUES` et `verifier_champs` (sortie et entrée) ; `sans_date_en_attente`
  écrit `deadline: None` ; boucle d'écriture extraite en `ecrire_documents`. Fait quand : pytest scripts vert,
  essai à blanc collé (mêmes comptes qu'au départ, « clôture non précisée » sur les brouillons). (Fait : pytest
  12 verts ; l'extraction locale alimentant les résultats en direct, l'ancien et le nouvel import ont été comparés
  sur une copie figée des résultats : lignes identiques « AAP lus : 774 | a importer : 331 (dont 2 doublons fusionnes,
  154 sans date en brouillon) | ignores : {'incomplet': 0, 'expire': 441} | verdicts lus : 0 » ; brouillons affichés
  « cloture non precisee - a-verifier - draft - validation a_corriger ». Défaut corrigé au passage : avant, le
  `a_corriger` des fiches sans date était écrasé par `proposee` (constaté dans l'essai à blanc de départ).)
- [x] 2.2 `scripts/tests/test_import_to_firestore.py` : faux Firestore en mémoire, les cinq tests nommés de l'audit,
  test « champ inconnu », test « fiche validée sans étiquette », test « connecteur sans verdict étiqueté ». Fait
  quand : `pytest scripts/tests -q` vert, noms des tests collés. (Fait : 12 passed, dont
  test_un_document_archive_reste_archive_apres_reimport, test_un_verdict_validee_protege_les_champs_metier,
  test_un_verdict_rejetee_empeche_la_publication, test_url_validee_jamais_ecrite_par_annuaires_ni_registre,
  test_deux_moteurs_un_seul_document_pour_un_meme_url_source, test_un_champ_inconnu_fait_echouer_l_import_en_le_nommant,
  test_une_fiche_validee_ne_porte_jamais_l_etiquette_a_verifier,
  test_l_etiquette_a_verifier_decoule_du_statut_quel_que_soit_le_moteur, test_fiche_sans_date_deadline_nulle_brouillon_a_corriger.)
- [x] 2.3 `app/src/types/index.ts` : bloc `validation` (`statut`, `commentaire`, `date`, `par`) et `deadline`
  nullable ; `app/tsconfig.json` : exclusion des trois fichiers gelés si l'option (b) est retenue. Fait quand :
  `npm run build` vert. (Fait : `npx tsc --noEmit` signalait 5 erreurs « possibly null » dans CalendarPage,
  RecommendationsPage, MyAapPage ; option (b) retenue par Monsieur DUCOUT, les trois fichiers exclus ; tsc code 0,
  build vert.)

## 3. Verdicts humains versionnés (instruction 7)

- [x] 3.1 `scraping/validation.py` : chemins `sources/verdicts_pages.json` et `sources/verdicts_liens.json`, option
  `--migrer-verdicts [--dry-run]` avec sauvegarde dans `scripts/sauvegardes/`, option `--dry-run` sur
  `--appliquer-pages` ; quatre `validation_*.cmd` mis à jour ; tests dans `scraping/tests/test_validation.py`. Fait
  quand : pytest scraping vert ; bilan `--appliquer-pages --dry-run` collé (avant migration). (Fait : pytest scraping
  54 verts ; `--migrer-verdicts --dry-run` : « validation_pages.json : 257 verdicts -> verdicts_pages.json (0 déjà
  présents, 257 repris) ; validation_liens.json : 34 verdicts -> verdicts_liens.json (0 déjà présents, 34 repris) ;
  Essai à blanc : rien n'a été écrit » ; `--appliquer-pages --dry-run` avant migration : « 257 verdicts lus
  (validation_pages.json) : 0 sources confirmées (plus 193 déjà confirmées), 5 adresses corrigées, 10 à retrouver,
  18 hors champ, 1 ignorés (passer), 44 sans source ».)
- [x] 3.2 Migration : essai à blanc collé, accord de Monsieur DUCOUT, exécution réelle, `git add` des deux fichiers.
  Fait quand : `git status` montre les deux fichiers suivis ; bilan `--appliquer-pages --dry-run` identique à 3.1 ;
  comptes 257 pages et 34 liens retrouvés. (Fait le 2026-10-14 après accord : « validation_pages.json : 257 verdicts
  -> verdicts_pages.json (0 déjà présents, 257 repris, 257 au total) ; validation_liens.json : 34 verdicts ->
  verdicts_liens.json (0 déjà présents, 34 repris, 34 au total) » ; sauvegarde `scripts/sauvegardes/verdicts_2026-10-14_1514`,
  anciens fichiers renommés `.json.migre` ; `git status --short` : « A scraping/sources/verdicts_liens.json »,
  « A scraping/sources/verdicts_pages.json » ; `--appliquer-pages --dry-run` après migration : ligne de bilan
  identique à celle de 3.1.)

## 4. Règles Firestore (instruction 8)

- [x] 4.1 `app/firestore.rules` : `aap` et `users` (actions admin), collections gelées en écriture interdite
  (design, décision 7). Fait quand : fichier relu, diff collé. (Fait : fichier réécrit, `git diff --stat` 106 lignes.)
- [x] 4.2 Tests sur l'émulateur : `vitest` et `@firebase/rules-unit-testing` en dépendances de développement,
  `app/tests/rules/firestore.rules.test.ts`, script `npm run test:rules`. Fait quand : sortie verte collée (ou
  constat précis si l'émulateur refuse la version de Java installée). (Fait : vitest 2.1.9 et rules-unit-testing
  3.0.4 (vitest 5 exige Vite 6, la bibliothèque 6.0 exige firebase 13) ; la CLI Firebase a refusé Java 11 (« no longer
  supports Java version before 21 ») ; JDK 21 Temurin trouvé sur le poste et placé en tête du PATH pour la commande ;
  `npm run test:rules` : « Tests 13 passed (13) », « Script exited successfully (code 0) ».)
- [x] 4.3 Déploiement des règles après accord écrit de Monsieur DUCOUT (`firebase deploy --only firestore:rules
  --project aapi-11bc3`). Fait quand : sortie du déploiement collée. (Fait le 2026-10-14 après accord : « rules file
  firestore.rules compiled successfully », « released rules firestore.rules to cloud.firestore », « Deploy complete! » ;
  `/aap/search` relu ensuite dans le navigateur : « 194 AAP disponibles », la lecture publique des fiches publiées
  fonctionne avec les nouvelles règles.)

## 5. Échéance nulle côté application et migration (instruction 9)

- [x] 5.1 `utils/deadline.ts`, `SearchAapPage.tsx` (libellé, tri datés d'abord), `AapDetailPage.tsx` (libellé,
  jamais « Clôturé »), `ManageAAPsPage.tsx` (« Non précisée », bouton « Publier » conditionné). Fait quand : build et
  lint verts ; vérification visuelle sur `/admin/aaps` et sur la fiche d'un brouillon connecté en administrateur
  (capture ou lecture de page collée). (Fait pour le code : build et lint verts, `/aap/search` relu dans le navigateur
  (liste rendue, « 1 jour », « Clôturé » sur un appel passé). La vérification sur `/admin/aaps` et sur la fiche d'un
  brouillon demande une connexion administrateur : laissée à Monsieur DUCOUT en 8.1.)
- [x] 5.2 `scripts/migrer_echeances.py` : sauvegarde JSON, essai à blanc collé, accord de Monsieur DUCOUT, exécution
  réelle. Fait quand : compte avant et après collé, un document relu avec `deadline: null`. (Essai à blanc fait :
  « 141 documents portent l'etiquette sans-date-cloture ; 141 avec une echeance fictive a migrer ; 0 deja a null »,
  échéances fictives au 2027-10-14. Accord donné le 2026-10-14 ; l'exécution par la session a été refusée par le
  classificateur de sécurité de Claude Code, qui a pris la mise à jour groupée de 141 documents pour une suppression
  de masse : commande remise à Monsieur DUCOUT, à lancer depuis la racine du dépôt
  `./.venv/Scripts/python scripts/migrer_echeances.py`, puis contrôle `--dry-run` attendu « 0 avec une echeance
  fictive a migrer ; 141 deja a null ». Fait par Monsieur DUCOUT depuis son terminal le 2026-10-14 : contrôle collé
  « 141 documents portent l'etiquette sans-date-cloture ; 0 avec une echeance fictive a migrer ; 141 deja a null » ;
  sauvegarde `scripts/sauvegardes/echeances_2026-10-14_1523.json` (419 Ko) présente ; deux documents relus par la
  session : `scraped-041501c1d991c078` et `scraped-07b22e46f5d909d0`, `deadline` None, `status` draft,
  `validation.statut` proposee.)
- [x] 5.3 `docs/application_spec.json` (contrainte `deadline`, règle du 2026-10-14 confirmée) et
  `docs/CAHIER_DES_CHARGES_APPLICATION.md` (mention « à confirmer » de la réponse Q6 retirée). Fait quand : diff collé.
  (Fait le 2026-10-14 avec la documentation, tâche 7.1 ; JSON revalidé.)

## 6. Mesure d'un modèle API sur l'échantillon (instruction 17)

- [x] 6.1 `scraping/extractor.py` (paramètre `model`, tarifs par modèle, question fermée `est_aap`) et
  `scraping/echantillon.py` (`--moteur api`, 45 textes, `--plafond`, sorties `echantillon_api_*`, `--controler` et
  `--rapport` étendus) ; tests des fonctions pures (filtre des 45 adresses, calcul du plafond, prix par modèle) sans
  aucun appel. Fait quand : pytest scraping vert. (Fait : pytest scraping 54 verts ; `anthropic` 1.13.0 et
  `python-dotenv` installés dans `.venv` (déclarés dans `scraping/requirements.txt`, absents) ; aucun appel effectué,
  le journal des coûts ne contient aucune ligne `claude-haiku-5-5`.)
- [x] 6.2 Accord écrit de Monsieur DUCOUT sur : modèle `claude-haiku-5-5`, prix 0,10 et 0,50 USD par million de
  tokens (vérifiés le 2026-10-14), coût estimé 0,05 euro, plafond 5 euros. Puis `--limite 1`, coût lu dans le
  journal et collé. Fait quand : ligne du journal collée (sans clé). (Accord donné le 2026-10-14 : fonds disponibles
  sur le compte Anthropic, budget accepté jusqu'à 10 dollars, plafond du rapport conservé à 5 euros. Premier texte
  « Appel à projet - ESMS Numérique 2026 » (ars-normandie) en 6,7 s ; journal : étape `est_aap` 1 225 tokens d'entrée,
  142 de sortie, 0,000264 USD ; étape `extraction` 1 251 d'entrée, 1 382 de sortie, 0,000947 USD ; cumul 0,001 euro.)
- [x] 6.3 Les 44 autres textes, `--controler`, `--rapport`. Fait quand : coût réel total et résultat contre le seuil
  20 justes / 2 fabriquées collés depuis `ECHANTILLON.md`. (Fait le 2026-10-14 : 40 textes lus pour les 45
  adresses : les 5 textes FIRAH « appel-a-projets-general » 2021 à 2025 de la référence existent
  (`decouverte/firah/fiches/`, 12 octobre) mais la rubrique FIRAH, redécouverte le 13 octobre avec 2 liens d'AAP,
  n'est plus celle que `choisir_rubriques` retient pour la famille « fondation » (Fondation de France, 20 liens) ; 16 fiches produites (15 de la référence, 1 page hors sujet extraite à tort, 1 à relire),
  24 refus à la question fermée (20 pages hors sujet, 4 pages de référence refusées à tort : bourses SFMU et trois
  pages Interreg Rhin Supérieur présentant un appel clos avec ses résultats), 0 échec ; contrôle : « 15 fiches
  comparées à la référence : 14 justes sur les quatre champs ; 1 fabriquées à tort ; 0 sans référence ; seuil non
  atteint » ; `ECHANTILLON.md` : « api_claude-haiku-5-5 | 16 | 16 | 14 | 1 | 122 s | 0.02 euros » ; journal : 56 appels,
  97 124 tokens d'entrée, 26 801 de sortie, 0,0237 USD soit 0,022 euro. Le maximum atteignable est 19 justes tant que
  les 5 textes FIRAH manquent.)

## 7. Documentation

- [x] 7.1 `README.md` (racine), `app/README.md` (routes, règles, tests), `scraping/README.md` (verdicts, moteur api),
  `CHANGELOG.md`, `scraping/CHANGELOG.md`, `CLAUDE.md` (état d'avancement, règle du statut unique), `REPRISE.md`,
  `docs/FLUX_DONNEES.md`, `docs/AUDIT_DONNEES_2026-10-14.md` (points traités), `docs/RAPPORT_CRITIQUE_AAP_SANTE_2026-10-14.md`
  (section 8 : réponses hors section 7, état vérifié du déploiement). Fait quand : fichiers relus. (Fait le 2026-10-14 ;
  `ECHANTILLON.md` sera régénéré par `--rapport` après la mesure API.)

## 8. Vérification

- [ ] 8.1 Monsieur DUCOUT rejoue les scénarios : `/signup` en 404 ; archive un AAP, relance l'import, l'AAP reste
  archivé ; ouvre `/admin/aaps` et voit « Non précisée » sans bouton « Publier » sur un brouillon `a_corriger` ;
  lance un raccourci de validation et retrouve ses verdicts ; lit le coût réel de la mesure dans `ECHANTILLON.md`.
