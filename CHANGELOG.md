# Changelog

Toutes les modifications notables du dépôt AAP Santé sont documentées ici (format Keep a Changelog, en
français). Le journal propre au volet scraping reste dans `scraping/CHANGELOG.md`.

## [Non publié]

### Ajouté
- Jour 6 du plan MVP (2026-10-21, changement `financeur-vendable`) : page publique `/financeurs` (bénéfices tenus,
  chiffres réels du document `statistiquesPubliques/accueil` écrit par `scripts/publier_chiffres.py` à la fin de la
  veille, tarif lu dans `config/stripe.ts`), tableau de bord financeur réel (appels, candidatures par statut, vues,
  dernières candidatures, prochaine échéance), page `/candidatures-recues` en colonnes, entrée de menu, liens cassés
  corrigés, nombre de candidatures compté dans « Mes appels », statut « présélectionnée » ajouté au type, accueil sans
  promesses non tenues et sans montants recopiés ; `scripts/semer_emulateurs.py` sème trois appels et quatre
  candidatures pour le financeur de test ; `docs/DEMO_FINANCEUR.md`. Lint, build, 68 tests Vitest, 26 tests de règles.
  Règle Firestore `statistiquesPubliques` (lecture publique) à déployer sur accord.
- Suivi des appels externes (2026-10-21, changement `suivi-couts-externes`, demande de Monsieur DUCOUT) :
  `scripts/publier_couts.py` recopie le journal `scraping/logs/extraction_costs.jsonl` dans la collection `coutsIa`
  (une ligne par appel au modèle, sans doublon, appelé par `veille.cmd`), page `/admin/couts-ia` « Appels externes »
  (cumul total et du mois face au plafond de 5 euros, coût par étape, par modèle, par semaine, coût par appel
  qualifié, derniers appels filtrables), entrée de menu et bouton du tableau de bord ; `utils/couts.ts` testé.
  Jour 5 joué sur les émulateurs : lecture du dossier de test réussie pour 0,0009 euro ; la fonction serveur écrit
  désormais ses lignes de coût dans la même forme (API modulaire `firebase-admin/firestore`, qui corrige l'erreur
  INTERNAL de l'émulateur).
- `scraping/configurer_courriel.cmd` (2026-10-21) : assistant de configuration de la boîte d'envoi Zoho. Règles
  Firestore `journal` et `messagesContact` déployées le 2026-10-21 sur accord.
- Jour 4 du plan MVP (2026-10-21, changement `suivi-testeurs`) : journal des actions écrit par l'application
  (connexion, recherche et ses filtres, fiche ouverte, recherche sauvegardée, candidature envoyée, appel publié ;
  dédoublonnage de cinq secondes, administrateur exclu), page `/admin/testeurs` (résumé par compte, dernières actions,
  chiffres de la semaine), entrée de menu et bouton du tableau de bord, règle Firestore `journal` (création par le
  compte lui-même, lecture par l'administrateur) testée ; déploiement de la règle après accord. 61 tests Vitest, 25
  tests de règles.
- Jour 3 du plan MVP (2026-10-20 soir, changement `alertes-courriel`) : `scraping/courriel.py` (envoi SMTP par la boîte
  Zoho d'ARCADIA, écriture à blanc dans `logs/courriels/`), `scraping/alertes.py` (bilan hebdomadaire de
  l'administrateur, appels de la semaine pour chaque candidat selon sa région et sa famille de structure), appel
  ajouté à `veille.cmd` ; 119 tests scraping ; boîte d'envoi à renseigner par Monsieur DUCOUT.
- Jour 2 du plan MVP (2026-10-20 soir, changement `qualification-appels`) : qualification des appels par le modèle
  (`scraping/qualifier_fiches.py`, choix fermés : destinataires, type d'appel, objets, date d'ouverture, pièces, champ),
  import (bloc `qualification`, `startDate`, pièces attendues, brouillon si hors champ, qualification manuelle protégée),
  filtres « À qui s'adresse l'appel » et « Type d'appel », fiche enrichie, fenêtre « Qualifier » en administration.
  Devis 303 fiches 0,087 euro accepté et lancé.
- Émulateurs Firebase (2026-10-20, « oui émulateurs », changement `emulateurs-parcours-connectes`) : mode
  `npm run dev:emulateurs` (port 3001, `.env.emulateurs` sans secret, projet `demo-aap`), `app/emulateurs_dev.cmd`,
  `scripts/semer_emulateurs.py` (trois comptes de test, 85 appels), option `--projet` de l'import ; le parcours
  candidat complet a été joué par la session (candidature avec pièce déposée). Garde-fou d'affichage sur toutes les
  pages (plus d'écran blanc), garde d'abonnement durcie, page des offres pour un administrateur.
- Jour 1 du plan MVP (2026-10-20, changement `parcours-candidat-jour-1`) : fiche d'appel en trois cases (montant,
  dates, territoire en clair) avec « À qui s'adresse cet appel » ; tableau de bord candidat réel (appels de sa région
  ou nationaux, échéances sous 30 jours, candidatures, recherches) ; page de détail d'une candidature
  (`/candidature/:id`) ; « Mes candidatures » en cinq colonnes par étape. 51 tests Vitest.

### Modifié
- Firebase (2026-10-20 soir, accord de Monsieur DUCOUT) : règles Storage déployées (dossier des pièces de candidature
  `uploads/applications/<compte>/`) ; compte ducout@hotmail.fr passé administrateur (`scripts/creer_admin.py`) ;
  document utilisateur orphelin supprimé après sauvegarde (`scripts/sauvegardes/users_orphelin_rBf4lsNS_2026-10-20.json`).

### Corrigé
- Administration (2026-10-20 soir, retour de Monsieur DUCOUT pendant le tri) : la liste des financeurs ne propose
  que ceux des fiches déjà filtrées, avec leur nombre.
- Financeurs (2026-10-20 soir, second retour) : familles d'organismes hors registre fusionnées (Bpifrance, DREETS,
  DRAAF, FSE+, État, ministères, préfectures, villes, régions, départements, délégations de la Fondation de France),
  nom de l'émetteur quand le nom extrait est générique ; ré-import : 146 -> 112 financeurs sur les fiches à contrôler.
- Application (2026-10-20 soir, premier parcours du jour 1 par Monsieur DUCOUT) : mentions « contrôlée par le modèle »
  réservées à l'administrateur, le candidat voit « Mise à jour le » ; « À qui s'adresse cet appel » lit les familles de
  structures dans les critères quand la fiche n'a pas de types structurés ; formulaire de candidature réduit à trois
  étapes (projet, montant, pièces avec le dossier de l'appel) ; règle Storage ajoutée pour le dossier des pièces de
  candidature (`uploads/applications/<compte>/`), déploiement après accord. 52 tests.
### Corrigé
- Application (2026-10-20, second parcours de Monsieur DUCOUT) : « Mes candidatures » restait vide après l'envoi (la
  requête triée par `submittedAt` exigeait un index composite absent) : tri en mémoire, erreur affichée, bandeau de
  confirmation « Candidature envoyée à <financeur> » ; l'étape Documents bloque l'envoi quand l'appel exige des pièces ;
  le raccourci du bureau ouvre l'accueil ; la recherche et les fiches demandent un compte (décision du jour, remplace la
  consultation sans compte du 2026-10-13 : liens « Voir les appels » retirés, carte « J'administre la plateforme » à la
  place de la consultation libre, FAQ et CGU mises à jour) ; « Candidat » remplace « Porteur de projet » dans les
  écrans ; Déconnexion aussi sous Paramètres ; publics accueillis facultatifs ; la recherche d'un candidat part de la
  région de son profil ; administration : filtre par financeur, cases à cocher, validation ou rejet en masse.
- Veille (2026-10-20, 13 h, accord de Monsieur DUCOUT) : 129 textes nouveaux extraits par Haiku (54 fiches, 0,084 euro), 17 contrôlées (0,009 euro), import 43 créées ; cumul Haiku 2,107 euros.
- Données (2026-10-20, accord de Monsieur DUCOUT) : 34 fiches publiées sans contrôle repassées en brouillon
  (sauvegarde `depublication_2026-10-20_1101.json`) ; ré-import appliquant la fusion des financeurs (546 mises à jour,
  69 noms distincts).

### Ajouté
- Application, retours de Monsieur DUCOUT du 2026-10-20 (après-midi) : gabarit commun à toutes les pages (en-tête
  public avec logo vers l'accueil et bouton Retour, barre latérale repliable par rôle façon helloDarwin, barre haute,
  pied de page avec liens réels, remontée en haut à chaque page ; changement `navigation-et-pages-publiques`), accueil
  avec choix du profil en trois cartes, pages Fonctionnalités, Tarifs, FAQ, À propos, Contact (collection
  `messagesContact`, règle écrite, non déployée) ; administration : compteurs candidats / financeurs / abonnements /
  appels publiés, carte « Fiches à contrôler », boutons « Valider et publier », « Rejeter », « Modifier » (changement
  `administration-controle`) ; recherche publique limitée aux fiches contrôlées, filtres Source et Relecture retirés ;
  import : une fiche sans validation entre en brouillon ; `scripts/depublier_non_controlees.py` (essai à blanc : 34
  fiches) ; rattachement des financeurs étendu (cofinanceur, parenthèse, « Département du X » : 86 -> 69 noms distincts
  à l'essai à blanc de l'import). 45 tests Vitest, 31 tests d'import, tests scraping verts.
- Application, transposition du parcours helloDarwin (2026-10-20, points 1 à 3 validés par Monsieur DUCOUT) :
  parcours d'intégration à trois écrans après l'inscription (accueil avec CGU et choix du rôle pour un compte
  Google, structure, détails du secteur santé, offres à trois colonnes ; changement `parcours-integration`), liste de
  démarrage « Démarrer (n/4) » sur les tableaux de bord avec fenêtre « Préciser mon profil » (changement
  `liste-demarrage`), recherche guidée : compteur avec montants annoncés, étiquettes des filtres actifs, statut à
  quatre valeurs, filtres dans l'adresse de la page et « Copier le lien », « Initialiser à mon profil », onglet
  « Consultées », appels nationaux inclus dans un territoire (changement `recherche-guidee`). Profil porteur enrichi
  (forme juridique du secteur, type d'établissement FINESS, taille, budget, publics, objets de projet, année
  d'ouverture, rayon d'action). 39 tests Vitest, lint et build verts ; vérification par Monsieur DUCOUT en attente.
- Application : page « Mon profil » (`/profil`, compte et formulaire de profil pré-rempli) et modification d'un appel
  par son auteur (`/aap/:id/edit`), changement `profil-et-edition-aap` (2026-10-20) ; conversions appel / profil ->
  formulaire testées par Vitest (18 tests).
- Lot 2, veille hebdomadaire automatique (2026-10-20) : tâche planifiée Windows le lundi à 8 h (`veille.cmd auto`,
  journal `scraping/logs/veille.log`), garde-fou « une page relue une fois par jour au plus ».
- Lot 2, rejeu de la collecte et veille (changement `rejeu-collecte-veille`, 2026-10-20) : `scraping/rejeu.py`
  (relecture des pages validées, liens nouveaux et disparus, marquage des fiches, `VEILLE.md`), `scraping/veille.cmd`,
  `scripts/perimer_fiches.py` (fiche absente de sa page depuis deux rejeux -> « à corriger », jamais un verdict humain),
  `derniereVueLe` d'après le rejeu et `absences` à l'import.
- Lot 2, dates de collecte (changement `fraicheur-dates-collecte`, instruction 10, 2026-10-19) : en-tête daté des textes
  collectés, `collecte_le` dans les fiches (2 047 fiches datées), `scrapeMetadata.collecteLe` et `derniereVueLe` à
  l'import (537 documents mis à jour). Correction au passage : un verdict humain atteint désormais un document existant
  (les six premiers verdicts de Monsieur DUCOUT, du 2026-10-19 à 16 h 15, sont dans la base).
- Nom affiché « AAP Santé » (2026-10-19, décision de Monsieur DUCOUT, nom provisoire) à la place de « AAP Platform » ;
  raccourci « AAP Sante » sur son bureau (`app/lancer_application.cmd` : serveur local puis navigateur sur la recherche) ;
  règles Firestore du dégel déployées sur `aapi-11bc3` après accord ; connexion Google activée par lui dans la console.
- Dégel de l'application complète (changement `degel-application-complete`, 2026-10-19, décision de Monsieur DUCOUT :
  « on le lance ») : routes d'avril rétablies (inscription, profil, abonnement, porteur, financeur, messagerie,
  notifications, calendrier, statistiques), lint et compilation sur tout le code (26 `any` typés, dates de clôture
  nulles gérées, `utils/dates.ts`), règles Firestore des modules rouvertes et testées (23 tests émulateur), pages
  légales rédigées (`src/pages/legal/`, onze champs d'entreprise à valider), `npm test` (12 tests Vitest et Testing
  Library). Fonctions serveur non déployées (Blaze en cours d'activation par Monsieur DUCOUT).
- V4, extraction par l'API (changement `extraction-api-v4`, 2026-10-19, décision de Monsieur DUCOUT : V3 locale figée
  sous l'étiquette `v3-local`, V4 avec `claude-haiku-5-5`, devis écrit avant tout appel) : `extraction_locale.py --moteur
  api` avec devis, plafond, reprise ; passage de 1 808 textes en 2 h 30 pour 1,33 euro (856 fiches, 951 refus), contrôle
  Haiku des 218 fiches ouvertes dans le champ (0,13 euro), import (54 créées, 483 mises à jour), décision du modèle (14
  fiches), 4 appels hors champ retirés, valeurs API reportées sur 183 fiches validées par le modèle (`scripts/reporter_valeurs_api.py`). Base au 2026-10-19, 13 h 20 : 623 documents, 289 publiées (257 validées par le modèle, 28 proposées, 8 à corriger ; moteur api 207, connecteurs 37, local 48), 44 archivées, 290 brouillons ; « 289 AAP disponibles » sur /aap/search.
- Mention de relecture sur les fiches (changement `mention-relecture-fiches`, 2026-10-19, instruction 11) : « Relue par
  Monsieur DUCOUT », « Contrôlée par le modèle » ou « Non relue : informations extraites automatiquement » dans la liste
  et la fiche, date « Informations extraites le ... » (`scrapeMetadata.extraitLe` écrit par l'import, posé au prochain
  ré-import), lien « Annonce officielle » en évidence, filtre « Relecture » (231 fiches relues ou contrôlées sur 270 le
  2026-10-19). Remplace le badge « À vérifier ».
- Contrôle des fiches par le modèle (changement `verification-assistee-haiku`, 2026-10-15, accord de Monsieur DUCOUT) :
  `scraping/verification.py` relit chaque fiche publiable à côté de sa page avec `claude-haiku-5-5` et donne un verdict
  par champ ; 283 fiches contrôlées pour 0,15 euro, 129 sans doute, 74 douteuses sur une date, un montant, le financeur,
  le titre ou le territoire, 80 sur la seule description ; l'outil de validation présente les fiches douteuses en
  premier avec la valeur lue sur la page ; l'import reporte le résumé dans `scrapeMetadata.verification` ; rapport
  `scraping/VERIFICATION.md`. Le même jour à midi, sur décision de Monsieur DUCOUT (« j'ai payé pour qu'il le fasse à ma
  place »), le contrôle vaut relecture : l'import écrit la décision du modèle dans `validation` (validée, rejetée et
  archivée, ou à corriger ; un verdict humain l'emporte), applique ses corrections de dates et de montants ;
  `scripts/appliquer_controle.py` fait de même pour les fiches déjà en base (essai à blanc : 231 validées, 39 rejetées,
  8 à corriger sur 278, exécution réelle à 12 h 31 sur son accord, sauvegarde `controle_2026-10-15_1231.json`) ; base :
  270 publiées dont 231 validées par le modèle, 39 archivées, 38 badges « à vérifier » contre 307 ; l'outil de validation
  ne présente plus que les 6 fiches restantes.
- Accès à l'administration (changement `acces-administration`, 2026-10-15, demande de Monsieur DUCOUT : « le lien
  /admin ne fonctionne pas ») : script `scripts/creer_admin.py` (compte Firebase Auth créé sans mot de passe ou
  retrouvé, profil `users` avec le rôle admin, essai à blanc, idempotent) et page `/reset-password` « Mot de passe
  oublié » (e-mail de réinitialisation Firebase), dont le lien existait sur la page de connexion mais menait à la 404.
  Constat : aucun compte admin n'existait, fournisseur Google désactivé.
- Suivi de la validation dans `/admin/aaps` (changement `acces-administration` 2.1, 2026-10-19, instruction 12) :
  compteurs cliquables et filtre par `validation.statut`, badge, relecteur, date et commentaire sur chaque fiche. Base
  au 2026-10-19 : proposée 54, à corriger 245, validée 231, rejetée 39 (569 documents).

### Modifié
- Question du champ dans la chaîne d'extraction (changement `filtre-champ-sante` 5.1, 2026-10-19) : les fiches
  nouvelles, extraites en local ou par l'API, portent leur champ (santé, médico-social, hors champ, incertain) dès
  leur production, consigne version 4 ; le classement rétroactif `champ.py --classer` ne sert plus qu'en rattrapage.
- Fin du passage global d'extraction locale (2026-10-15, 7 h 40 : 2 178 textes, 1 086 fiches, 1 070 pages refusées,
  22 échecs, 28,6 h, 0 euro) puis classement du champ des 1 086 fiches par `claude-haiku-5-5` sur l'accord de Monsieur
  DUCOUT (santé 312, médico-social 209, hors champ 513, incertain 52 ; 0,23 euro réel), ré-import (120 fiches créées,
  409 mises à jour) et retrait des 147 appels hors champ publiés (`scripts/migrer_champ.py`, sauvegarde). Base : 308
  fiches publiées (santé 172, médico-social 106, incertain 29), 261 brouillons dont 258 hors champ. Rapport du champ
  par source : `scraping/CHAMP.md`.
- Nettoyage de la base (changement `nettoyage-financeurs-territoires`, 2026-10-14 au soir, constat de Monsieur DUCOUT :
  « base sale », filtres incohérents) : l'import écrit la source réelle de chaque fiche (émetteur du registre, nom et
  fichier d'origine dans `scrapeMetadata`), un nom de financeur canonique (table `scraping/sources/financeurs.json`
  construite depuis le registre, nom lu par l'IA conservé) et un territoire déduit du texte puis de l'émetteur
  (`scraping/sources/departements.json`, 101 départements, outre-mer, anciennes régions, grandes villes), « france »
  réservé aux appels nationaux et « non-precise » sinon ; filtre Source ajouté à la recherche, filtre Financeur sur le
  nom canonique ; rapport des fiches publiées en double `scripts/doublons.py`. Essai à blanc : 149 financeurs
  distincts pour 390 fiches publiées (203 pour 420 dans la base le soir), 101 territoires « france » au lieu de 243,
  3 non précisés. Ré-import réel fait le 2026-10-14 à 23 h 15 sur son accord : 415 fiches publiées, 151 financeurs
  distincts contre 201, les 18 ARS à une entrée chacune, territoire « National » 108 contre 234, 3 « non précisé »,
  plus aucune source « extraction_locale » ; 5 groupes de fiches en double (10 fiches) listés par `scripts/doublons.py`,
  à trancher à la main. Les 10 fiches publiées classées hors
  champ ont été repassées en brouillon (`scripts/migrer_champ.py`, sauvegarde dans `scripts/sauvegardes/`), sur sa
  décision (« oui tu les retires »).
- Recherche des AAP (changement `filtres-recherche`, 2026-10-14 au soir) : filtres Territoire (libellés des identifiants
  réellement présents), Thématique (santé, médico-social, non classée, d'après le champ classé) et Financeur construits
  à partir des fiches chargées ; le filtre budget n'écarte plus les fiches sans montant connu. Import réel du soir :
  420 AAP publiés, dont les fiches sans date de clôture (décision de Monsieur DUCOUT).
- Filtre du champ santé et médico-social (changement `filtre-champ-sante`, instruction 26 du rapport de critique,
  2026-10-14 au soir) : chaque fiche reçoit un champ (`sante`, `medico-social`, `hors-champ`, `incertain`) par une
  question fermée au modèle (`scraping/champ.py`, définition décidée par Monsieur DUCOUT), l'import met les fiches
  hors champ en brouillon à corriger, le verdict « hors champ » de la validation quotidienne rejette la fiche, et les
  fiches sans date de clôture sont désormais publiées avec « Date de clôture non précisée » au lieu d'entrer en
  brouillon (décision de Monsieur DUCOUT). L'import ignore les fichiers de la comparaison des moteurs.
- Comparaison de deux moteurs sur 50 pages (changement `comparaison-moteurs-50-pages`, 2026-10-14) :
  `scraping/comparaison.py`, premier tirage de collectivités jugé et rapporté, second tirage chez les financeurs de
  la santé.
- Lot 0 d'assainissement (changement `lot-0-assainissement`, 2026-10-14, rapport de critique validé par Monsieur
  DUCOUT) : routage de l'application réduit au MVP de consultation (inscription fermée, modules gelés sans
  modification), `validation.statut` seule source de la fiabilité d'une fiche (étiquette `a-verifier` dérivée, `par`),
  liste blanche des champs de l'import, `deadline` nulle pour les fiches sans date (type `AAP` nullable, bloc
  `validation` dans le type), règles Firestore du MVP (actions admin, collections gelées en écriture interdite),
  verdicts des pages et des liens versionnés dans `scraping/sources/`, mesure d'un modèle API sur l'échantillon
  sous plafond. Verdicts migrés et règles déployées le 2026-10-14 après accord de Monsieur DUCOUT ; 141 échéances
  fictives passées à `null` par Monsieur DUCOUT le 2026-10-14 ; mesure API `claude-haiku-5-5` faite le 2026-10-14 après
  accord (45 textes lus par adresse, 19 justes et 1 fabriquée sur 20 comparées, seuil 20/2 manqué d'une fiche, coût
  réel 0,03 euro, `scraping/ECHANTILLON.md`).
- Organisation des données validées (changement `organisation-donnees-validees`, 2026-10-14, suite à
  `docs/AUDIT_DONNEES_2026-10-14.md`) : identifiant Firestore dérivé de l'adresse de l'appel (341 documents
  migrés), décisions humaines (`status`, `validation`) jamais réécrites par l'import, verdicts de
  `scraping/sources/verdicts_fiches.json` appliqués, fiches sans date en brouillon, adresse validée distincte
  de l'adresse d'origine dans le registre. Schéma des flux : `docs/FLUX_DONNEES.md`.

### Ajouté
- Lot 0 : configuration ESLint de l'application, tests des règles Firestore sur l'émulateur (`npm run test:rules`,
  JDK 21), cinq tests de l'audit sur un faux Firestore (`scripts/tests/`), `scripts/migrer_echeances.py`, options
  `--migrer-verdicts` et `--appliquer-pages --dry-run` de `validation.py`, moteur `api` de `echantillon.py`.
- Extraction locale globale (changement `extraction-locale-globale`, 2026-10-13 soir) : `scraping/extraction_locale.py`
  extrait avec `qwen3:8b` les pages des 242 rubriques validées (2 395 adresses web uniques), fiches marquées
  « à vérifier » ; l'import pose l'étiquette `a-verifier` et l'application affiche le badge « À vérifier ».
- Verdicts de Monsieur DUCOUT sur les 257 pages reportés au registre (`validation.py --appliquer-pages`, changement
  `recherche-page-aap-par-source`), 50 adresses corrigées et redécouvertes (`decouverte.py --garder-depart`) ; vague 1 des
  fondations terminée (365 / 664, 1 198 sources) ; famille PLIE ajoutée à l'inventaire.
- Registre : vague 1 poursuivie par la recherche web de la session (203 fondations, 100 sites inscrits), 1 123 sources,
  couverture 298 / 664 ; agrégateur Fimeco Walter Allinial ajouté (deux pages) ; veille URIOPSS PACA-Corse exploitée
  (10 financeurs ajoutés, 1 133 sources).
- Registre : 172 fondations de la vague 1 créées (1 022 sources), couverture mesurée 191 / 664 en tête de `REGISTRE_SOURCES.md` ;
  recherche des sites par l'API Tavily (clés du projet Scrapling, limite de plan atteinte après 191).
- Changement OpenSpec `registre-par-annuaires` (2026-10-13) : familles d'émetteurs adossées à des annuaires de référence avec taux de
  couverture ; première vague = 664 fondations reconnues d'utilité publique et d'entreprise à domaine santé-social, extraites du
  Registre national des fonds et fondations (`scraping/annuaires.py`, `scraping/sources/annuaires/`).
- Registre : source UDAF de l'Essonne ajoutée (848 sources) ; famille UDAF (96 sites listés par l'UNAF) à étudier.
- Outil de validation manuelle des pages et des liens dans le navigateur de Monsieur DUCOUT (changement OpenSpec
  `validation-manuelle-aap`, 2026-10-13, vérification 2.1 par Monsieur DUCOUT en attente) ; brouillon de changement
  `recherche-page-aap-par-source` (recherche web de la page des appels de chaque source). Règle « Preuve avant
  affirmation » ajoutée dans `CLAUDE.md`. Feuille de route : étape 2 repassée « à valider à la main ».
- Second tour d'extraction par le modèle local (changement OpenSpec `extraction-ollama-second-tour`, 2026-10-13, en
  attente de la décision de Monsieur DUCOUT) : question fermée avant extraction, contrôle des formats, contrôle
  automatique contre les fiches de référence, seuil de décision. Résultat : mistral 7b 15 fiches justes sur 23 et
  13 fabriquées ; qwen3:8b 16 sur 21 et 1 fabriquée ; seuil (20 et 2) non atteint. Détail dans `scraping/ECHANTILLON.md`.
- Consultation des AAP sans compte (changement OpenSpec `consultation-aap-sans-compte`, 2026-10-13) : règle Firestore
  « lecture publique des AAP publiés » déployée sur `aapi-11bc3`, routes « Rechercher des AAP » et fiche sorties de la
  zone protégée, lien « Voir les appels à projets » sur l'accueil ; « Candidater » et favori renvoient vers la
  connexion sans compte. Les appels à projets sont des informations publiques ; le compte ne sert qu'aux actions.
- Relecture manuelle de la qualification (changement OpenSpec `relecture-qualification`, 2026-10-12) : fichier versionné
  `scraping/sources/relecture_qualification.json` appliqué par `qualification.py` par-dessus les verdicts du modèle (verdict
  du modèle conservé, section « Relecture manuelle » dans `QUALIFICATION.md`). 60 pages relues sans IA ; bilan : 155 rubriques
  confirmées (127 avant), 88 hors santé, 6 sans AAP, 20 à vérifier.
- Extraction sur échantillon (`extraction-echantillon-aap`, 2026-10-12) : extraction Ollama terminée (41 fiches sur 45 en une
  heure environ, dont trois délais dépassés de dix minutes), contrôle des fiches et rapport `scraping/ECHANTILLON.md`
  (Ollama 9 fiches justes sur 41, session 24 sur 24, API estimée 99 euros pour 3 748 liens) ; 6 fiches validées importées
  dans Firestore (95 AAP scrapés en base).
- `scripts/import_to_firestore.py` : l'import global ignore les fichiers `echantillon_*.json` et `controle_*.json`
  (import de l'échantillon seulement par `--source`), pour ne jamais verser en base des fiches non contrôlées.
- Qualification des sources (changement OpenSpec `qualification-des-sources`, 2026-10-12) : 270 rubriques relues par
  le modèle local, 127 confirmées comme publiant des appels à projets santé ; verdict dans le registre et `scraping/QUALIFICATION.md`.
- Échantillon d'extraction (`extraction-echantillon-aap`, en attente) : 24 fiches produites par la session, coût API estimé.
- `REPRISE.md` à la racine : résumé du projet et consigne de reprise pour chaque nouvelle session.
- Robot de découverte des rubriques appels à projets (changement OpenSpec `decouverte-rubriques-aap`,
  2026-10-09) : 847 sources explorées sans IA, 268 rubriques trouvées, 3744 liens d'AAP gardés en local
  pour l'extraction à venir. Rapport `scraping/DECOUVERTE.md`.
- Registre des sources, seconde extension (changement OpenSpec `registre-des-sources-2`, 2026-10-09) : 847
  sources, 657 pages vérifiées ; caisses et services de l'État locaux, IHU, GIRCI, Europe régionale, fédérations,
  plateformes de dépôt, sur la liste de Monsieur DUCOUT.
- Registre des sources (changement OpenSpec `registre-des-sources`, 2026-10-09) : 334 émetteurs d'AAP
  inventoriés dans `scraping/sources/registre.json` (régions, départements et grandes villes via l'annuaire
  officiel de l'administration), 304 pages vérifiées, outil `scraping/registre.py`,
  vue `scraping/REGISTRE_SOURCES.md`. Aucune dépense.
- Pièces jointes des AAP scrapés (changement OpenSpec `pieces-jointes-aap`, 2026-10-09) : section
  « Pièces jointes » sur la fiche et compteur « N pièces jointes » sur les cartes de la recherche ;
  champ optionnel `scrapeMetadata` déclaré sur le type `AAP`. Les fichiers déjà téléchargés par le
  scraping (93 sur 109) sont servis depuis le PC en développement (`app/public/documents` ->
  `scraping/downloads`, lien de jonction ignoré par Git), car les ARS refusent l'accès direct
  (« Forbidden ») ; les autres gardent leur lien d'origine. Envoi vers Firebase Storage codé mais
  désactivé (`--vers-storage`, nécessite le forfait Blaze : compte de facturation fermé).
- Démo de bout en bout (changement OpenSpec `demo-aap-scrapes-visibles`, 2026-10-09) : 89 AAP scrapés
  importés dans Firestore et visibles dans l'application ; procédure de rejeu dans le README (section 4).
- `app/src/utils/deadline.ts` : helper partagé « jours restants » ; mention « Clôturé » dans la liste et la
  fiche d'un AAP dont la date de clôture est passée.
- `scripts/import_to_firestore.py` : fusion des doublons entre sources avant écriture ; dépendances fixées
  (`google-cloud-firestore`, `grpcio` 1.74.0).

### Corrigé
- `app/src/pages/porteur/SearchAapPage.tsx` : la recherche par mot ne filtrait jamais (condition sur le
  financeur toujours vraie, parenthèse manquante).

### Connu, non corrigé (hors périmètre de la démo)
- À l'inscription, un message d'erreur s'affiche après la création réussie du compte (étape d'envoi de
  l'e-mail de vérification) ; la page de connexion ne redirige pas quand l'utilisateur est déjà connecté.
- `npm run lint` ne peut pas tourner : aucune configuration ESLint dans `app/`.
