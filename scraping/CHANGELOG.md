# Journal des modifications

Ce fichier liste les changements notables apportés au POC AAP Santé.

## [Non publié]

### Ajouté (2026-10-14 au soir)
- `comparaison.py` : comparaison de deux moteurs sur 50 pages (tirage reproductible par famille, `--familles`, `--ids`,
  `--mots`, `--inclure-traites`, `--score-min` ; extraction locale et API sur les mêmes textes ; écran de jugement port
  8766, `comparaison_juger.cmd` ; rapport `COMPARAISON.md`). `echantillon.extraire` et `extraire_api` acceptent une liste
  de textes et un fichier de sortie.
- `champ.py` : filtre du champ santé et médico-social (`--classer` avec essai à blanc et sauvegarde, `--evaluer`,
  `--rapport`), consigne `CONSIGNE_CHAMP` et `normaliser_champ` dans `echantillon.py`, outil `champ` dans `extractor.py` ;
  `validation.py` : touche 7 « hors champ » en mode fiches.

### Modifié (lot 0 d'assainissement, 2026-10-14)
- `validation.py` : verdicts des pages et des liens dans `sources/verdicts_pages.json` et `sources/verdicts_liens.json`
  (versionnés), option `--migrer-verdicts [--dry-run]` (sauvegarde dans `scripts/sauvegardes/`, fusion sans écraser,
  anciens fichiers renommés `.json.migre`), option `--dry-run` sur `--appliquer-pages` ; raccourcis `.cmd` mis à jour.
- `extractor.py` : modèle en paramètre, table de tarifs par modèle (`TARIFS_USD_PAR_MTOK`, prix vérifiés le
  2026-10-14), question fermée `est_un_aap`, champ `etape` dans le journal des coûts ; modèle sans tarif refusé.
- `echantillon.py` : moteur `api` sur les 45 textes de l'échantillon, plafond de dépense (`--plafond`, 5 euros),
  coût réel dans le rapport ; tests des fonctions pures. Mesure du 2026-10-14 avec `claude-haiku-5-5` : 40 textes
  traités (les 5 textes FIRAH existent mais leur rubrique n'est plus retenue par la sélection par famille), puis lecture par adresse
  (`fiches_par_adresse`, toutes les rubriques découvertes, un texte par adresse) et 5 textes FIRAH mesurés : 21 fiches,
  19 justes sur 20 comparées, 1 fabriquée, 4 pages de référence refusées à tort à la question fermée, seuil 20/2 manqué
  d'une fiche, 0,03 euro pour 66 appels.
- Import (`scripts/import_to_firestore.py`) : étiquette `a-verifier` dérivée de `validation.statut`, `validation.par`,
  liste blanche des champs (`ChampInconnu`), `deadline` nulle pour une fiche sans date, écriture extraite en
  `ecrire_documents` testée sur un faux Firestore ; `scripts/migrer_echeances.py`.

### Modifié (organisation des données validées, 2026-10-14)
- Registre : `url_validee`, `validee_par`, `validee_le` à côté de `url_aap` (adresse d'origine) ; `registre.adresse_aap`
  lu par `decouverte.py`, `registre.py --verifier-pages`, `validation.py` ; 42 corrections passées migrées.
- `validation.py` : verdicts sur les fiches dans `sources/verdicts_fiches.json` (versionné), option `--ouvertes`,
  migration de `results/validation_manuelle.json` ; `validation_fiches.cmd` ne présente que les fiches ouvertes.
- `echantillon.py` : `produite_le` et `version_consigne` dans `scrape_metadata` de chaque fiche.
- Import (`scripts/import_to_firestore.py`) : identifiant dérivé de l'adresse, champs humains jamais réécrits,
  verdicts appliqués, fiches sans date en brouillon, fichiers de verdicts et pages refusées exclus de l'import
  global ; `scripts/migrer_identifiants.py` ; tests `scripts/tests/`.

### Ajouté (extraction locale globale, 2026-10-13 soir)
- `extraction_locale.py` (changement `extraction-locale-globale`, décision de Monsieur DUCOUT : modèle local, zéro euro,
  fiches à vérifier) : `--collecter` (texte de chaque lien web des 242 rubriques validées, une adresse une fois,
  2 395 adresses uniques), `--extraire --modele qwen3:8b` (chaîne de l'échantillon, sortie
  `results/extraction_locale.json` avec `a_verifier`, reprise), `--bilan`. `echantillon.extraire` accepte un chemin de
  sortie et des métadonnées ajoutées. Tests `tests/test_extraction_locale.py`.
- Import : étiquette `a-verifier` sur les fiches du modèle local ; application : badge « À vérifier » dans la liste et
  la fiche.

### Ajouté (verdicts et registre, 2026-10-13 nuit)
- `validation.py --appliquer-pages` (changement `recherche-page-aap-par-source`) : report des 257 verdicts du mode
  « pages » dans `sources/relecture_qualification.json` (relecteur « Monsieur DUCOUT, validation à l'écran ») et dans le
  registre : 64 sources confirmées, 50 adresses corrigées, 10 à retrouver, 18 hors champ ; fonction pure
  `appliquer_verdicts_pages`, test. Après `qualification.py --registre --rapport` : 242 rubriques confirmées, 18 hors santé.
- `decouverte.py --garder-depart` : la page de départ est gardée telle quelle (adresse donnée à l'écran), sans visite
  d'autres candidats. Redécouverte des 50 sources corrigées : 39 pages rafraîchies, 11 sans lien d'appel repéré
  (la page donnée est elle-même l'appel ou un formulaire) ; le navigateur piloté dépasse le délai après une trentaine de
  sources, d'où trois passages.
- Vague 1 des fondations terminée : 445 fondations traitées par la recherche web de la session (165 sites inscrits,
  271 sans site dont 62 hors champ non cherchées, 9 rapprochées d'entrées existantes), 65 entrées de plus au registre
  (1 198 sources), couverture 365 / 664 ; 22 adresses plausibles à resonder.
- Famille « PLIE et organismes intermédiaires FSE+ » dans `sources/annuaires/familles.json` (annuaire : liste des appels
  FSE+ de fse.gouv.fr), à la demande de Monsieur DUCOUT.

### Ajouté (registre, 2026-10-13 soir)
- Vague 1, suite : recherche web de la session pour 203 fondations (journal `results/recherche_sites.jsonl`, `moteur: session`,
  note par fondation), 100 sites inscrits et intégrés (1 123 sources), 8 rapprochements manuels avec des entrées existantes (7 de la session, 1 de la vague Tavily),
  un doublon supprimé (`fondation-avenir-recherche-medicale-appliquee`), couverture 298 / 664.
- Sources `fimeco-walter-allinial-aap-digital-et-numerique` et `fimeco-walter-allinial-aap-sante-maladie-et-handicap`
  (agrégateur d'AAP tenu par un cabinet comptable), ajoutées à la demande de Monsieur DUCOUT.
- Veille mensuelle des AAP de l'URIOPSS PACA-Corse (PDF SharePoint du 2026-10-01, 82 appels, 32 financeurs) transmise par
  Monsieur DUCOUT : lien noté sur `uriopss-paca-corse`, 21 financeurs déjà au registre, 10 ajoutés (FAPE EDF, Fondation
  RAJA-Marcovici, fonds A2micile, France Active PACA, Pépinière d'avenirs, Silver Valley, ministère des Sports, ASP fonds
  accessibilité, fonds IMPACT Electro Dépôt, ANDES) ; 1 133 sources.

### Ajouté (registre, 2026-10-13)
- `registre.py --tableau` : tableau « Couverture par famille » en tête de `REGISTRE_SOURCES.md` (entrées rapprochées de l'annuaire /
  total, ou « couverture non mesurée »), lu dans `sources/annuaires/familles.json`.
- Vague 1 des fondations : `annuaires.py --chercher N` (recherche Tavily, `recherche_web.py`, sélection du site par règles et
  vérification de la page) et `--integrer` : 172 fondations créées au registre (1 022 sources), couverture 191 / 664.
- Sources `prefecture-region-ile-de-france-politique-de-la-ville` (page refusant les requêtes simples, code 403, statut
  identifiée) et `ditp-modernisation-gouv-appels-a-projet` (page vérifiée), ajoutées à la demande de Monsieur DUCOUT ; 850 sources.
- Vague 1 des fondations (`annuaires.py --rapprocher`, `--sites`, `--integrer`) : 19 correspondances sûres, 35 douteuses
  tranchées « organismes à part », 16 sites trouvés et vérifiés par recherche web de la session au 2026-10-13 (630 restants).
- `annuaires.py --rnf` : extrait versionné du Registre national des fonds et fondations (vague 1 : 664 fondations RUP et
  d'entreprise actives à domaine santé-social, sur 4 072 actives), colonnes « site trouvé » et « identifiant du registre » à
  remplir sans rien deviner. Tests `tests/test_annuaires.py`.
- Source `udaf-91-essonne` (UDAF de l'Essonne, page « Appels à projets » : relais de 20 appels pour ses associations,
  dont aidants, santé mentale, handicap), ajoutée à la demande de Monsieur DUCOUT ; 848 sources. Famille UDAF à étudier :
  la page d'accueil de l'UNAF liste 96 sites d'UDAF.
- Source `fondation-credit-mutuel-alliance-federale` : adresse corrigée vers le site propre de la fondation (elle pointait sur
  la liste des fondations abritées de la Fondation de France) ; découverte et qualification à relancer sur la bonne page.

### Ajouté (validation manuelle, changement `validation-manuelle-aap`, 2026-10-13)
- `validation.py` : serveur local de validation humaine, trois modes (`--pages` : page gardée de chaque rubrique
  confirmée ; `--liens` avec `--echantillon N` et `--source` : liens repérés ; fiches extraites par défaut), page
  officielle dans une fenêtre séparée ou un cadre, texte de la page lu par le serveur, commentaire enregistré par
  Entrée, verdicts écrits à chaque clic dans `results/validation_pages.json`, `validation_liens.json` ou
  `validation_manuelle.json`, reprise au premier élément non jugé, liens cassés écartés. Lanceurs
  `validation_pages.cmd` et `validation_manuelle.cmd`. Tests `tests/test_validation.py`.
- `validation.py --pages --verdicts <liste>` : relecture des sources exclues par la qualification (hors santé, à vérifier,
  sans AAP, PDF seulement : 115 pages gardées, 577 sources sans page ignorées), verdict actuel et motif affichés,
  verdict « des appels, mais jamais santé ni médico-social ». Lanceur `validation_exclues.cmd`. Demande de Monsieur DUCOUT
  après le cas Bpifrance (exclue sur ses appels du jour).

### Ajouté (second tour d'extraction Ollama avec seuil, 2026-10-13)
- `echantillon.py` : question fermée « fiche d'un appel à projets ? » avant extraction (pages refusées gardées avec la
  raison), contrôle strict des formats avec seconde demande au modèle puis champ mis à null et marque `a_relire`, fichier
  par modèle (`results/echantillon_ollama_<modele>.json`) écrit fiche par fiche avec reprise, `--controler` (comparaison
  automatique aux 24 fiches de référence : titre, financeur, clôture, montants cités ; valeur confirmée par la page
  acceptée), seuil et verdict par modèle dans `ECHANTILLON.md`. Cinq tests ajoutés.
- Tours : mistral:7b-instruct 15 justes sur 23, 13 fabriquées ; qwen3:8b (téléchargé, 5,2 Go) 16 justes sur 21,
  1 fabriquée. Seuil de 20 justes et 2 fabriquées non atteint. Sondage du comparateur : 5/5 et 4/5.

### Ajouté (relecture de la qualification, 2026-10-12)
- `qualification.py` : fonction `appliquer_relecture`, lecture de `sources/relecture_qualification.json` lors de
  `--registre` et `--rapport`, champs `verdict_modele` et `relecture` dans le registre, section « Relecture manuelle »
  dans `QUALIFICATION.md`, motif de relecture dans la liste des sources à vérifier. Deux tests ajoutés.
- `sources/relecture_qualification.json` : 70 corrections décidées avec Monsieur DUCOUT puis 60 décisions après relecture
  des pages (sans Ollama ni API). Bilan : 155 confirmées, 1 PDF seulement, 88 hors santé, 6 sans AAP, 20 à vérifier.
  18 adresses de rubrique corrigées dans le champ `notes` du registre.
- `echantillon.py --extraire --moteur ollama` terminé : 41 fiches sur 45 (`results/echantillon_ollama.json`), 4 échecs,
  1 767 s de calcul utile et une heure au total avec les délais dépassés.
- Contrôle des fiches Ollama (`results/controle_echantillon.json`, colonne `ollama`) et rapport `ECHANTILLON.md` :
  Ollama 9 fiches justes sur 41 (19 fiches fabriquées pour des pages hors sujet, dates hors format, enveloppes « oui »),
  session 24 sur 24. Les 6 fiches validées encore ouvertes du champ santé (`results/echantillon_valides.json`) importées
  dans Firestore. README : section « Extraction sur échantillon ».

### Ajouté (qualification des sources, 2026-10-12)
- `qualification.py` : verdict par rubrique via le modèle local Ollama, champ `qualification` dans le registre,
  colonne Qualification dans `REGISTRE_SOURCES.md`, rapport `QUALIFICATION.md`. 270 rubriques qualifiées :
  127 confirmées, 1 PDF seulement, 133 hors santé, 5 sans AAP, 4 à vérifier ; sondage de 31 verdicts, 83 % d'accord.
- `echantillon.py` (changement `extraction-echantillon-aap`, en attente) : collecte du texte de 45 fiches sur 9 rubriques,
  extraction par Ollama et par la session, estimation du coût API (99 euros pour 3 748 liens), rapport `ECHANTILLON.md`.
- Dépendance : `pydantic` installé dans `.venv` (schéma `AapNormalized`).

### Ajouté (découverte des rubriques, 2026-10-09)
- `decouverte.py` : robot générique (Playwright) qui trouve la rubrique appels à projets de chaque source du
  registre et garde la page et ses liens en local. Premier passage : 847 sources, 268 rubriques,
  3744 liens d'AAP, 110 sites bloqués. Rapport `DECOUVERTE.md`. Tests `tests/test_decouverte.py`.
- Playwright et Chromium installés dans `.venv` à la racine du dépôt.

### Ajouté (registre des sources, seconde extension, 2026-10-09)
- Registre porté à 847 sources (657 pages vérifiées) : CAF et CPAM de chaque département, Carsat, MSA,
  préfectures, DREETS, DDETS, DRAAF, MDPH (annuaire DILA), CNAF et groupes de protection sociale, 12 IHU,
  6 GIRCI, cancéropôles, portail santé de la Commission européenne, fonds européens régionaux et Interreg,
  fédérations et réseaux, presse spécialisée, plateformes de dépôt. Catégories ajoutées : sociétés savantes,
  établissements, centrales d'achat.

### Ajouté (registre des sources, 2026-10-09)
- `registre.py` et `sources/registre.json` : inventaire de 334 émetteurs d'AAP (18 ARS + portail
  national, ministères, caisses, agences de l'État, fondations, sociétés savantes, hôpitaux, centrales
  d'achat, Europe, toutes les régions et tous les départements, grandes villes, agrégateurs), contrôle
  HTTP des pages, tableau `REGISTRE_SOURCES.md`. Tests `tests/test_registre.py`.

### Corrigé (jonction scripts/import_to_firestore.py, 2026-10-09)
- Premier import réel dans Firestore (projet aapi-11bc3) : 105 AAP lus, 89 documents distincts.
- Les doublons entre sources (ars_idf et ars_idf_local, même signature) sont fusionnés avant
  l'écriture : le compteur « créés » correspond désormais au nombre réel de documents.
- `scripts/requirements.txt` : ajout de `google-cloud-firestore` (firebase-admin 7 ne l'installe
  plus) et `grpcio` fixé en 1.74.0 (la 1.75+ est bloquée par Smart App Control de Windows).

### Ajouté
- Installation de Graphify (outil de cartographie de code en graphe interactif) — génère `graph.html`, `GRAPH_REPORT.md`, `graph.json`
- Mode_emploi mis à jour : statistiques réelles (23 AAP, 0,031 €/AAP, 2 sources opérationnelles), arborescence complète avec ARS IDF, glossaire enrichi (terme "403 Forbidden")

### Ajouté (sessions précédentes)
- Extraction structurée des AAP via Claude API (tool use) avec schéma `AapNormalized`
- Cache inter-runs : les AAP déjà extraits sont servis sans réinterroger Claude (économie ~95 % des appels en régime)
- Téléchargement et cache disque des pièces jointes PDF/DOCX
- Rapport de validation qualité HTML (`validate.py`) avec score /10 par champ et iframe de la page source
- Suivi de consommation API avec projections de coût (`analyze_costs.py`)
- Outil de diagnostic Playwright en mode visible (`debug_page.py`)
- Variable `FORCE_REFRESH=1` pour forcer la ré-extraction complète
- Variable `MAX_AAPS=N` pour limiter le nombre d'AAP traités par run

### Interne
- Module `utils.py` regroupant les fonctions partagées (stdout UTF-8, context Playwright, cookies, JSONL)
- Nettoyage du DOM avant envoi à Claude (retrait nav/header/footer/menu/cookies) — réduit ~30 % les tokens input
- Client `httpx` réutilisé pour les téléchargements PDF (économie TLS handshake)
- Retry exponentiel automatique sur les erreurs 429/529 de l'API Anthropic
- Prompt caching activé sur le system prompt (économie ~3× sur les runs longs)
