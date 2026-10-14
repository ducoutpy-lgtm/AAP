# POC Scraping — AAP Santé

Preuve de concept d'un moteur d'agrégation d'appels à projets (AAP) du secteur sanitaire et médico-social français — projet **AAP Santé** (ARCADIA SASU).

**Objectif** : valider qu'une architecture **Playwright + Claude API (tool use)** traite correctement une source réelle (Fondation de France) bout en bout : liste paginée des AAP, fiche détaillée, téléchargement des pièces jointes, extraction structurée, logging coût, validation visuelle.

---

## Architecture

```
poc-scraping/
├─ schema.py              # AapNormalized (Pydantic) — contrat de sortie unique
├─ utils.py               # Helpers partagés (stdout UTF-8, datetime, JSONL, context Playwright, cookies)
├─ extractor.py           # Appel Claude (tool use) + prompt caching + retry 529/429
├─ orchestrator.py        # Boucle commune : navigation, cache inter-runs, logs, persistance
├─ run.py                 # Point d'entrée CLI (scraping)
├─ validate.py            # Génère un rapport HTML de validation visuelle
├─ analyze_costs.py       # Analyse du journal de consommation API
├─ debug_page.py          # Diagnostic Playwright (headless=False, dump DOM)
├─ sources/
│  └─ fondation_de_france.py   # 1 source = 1 fichier (~150 lignes)
├─ results/               # Sorties JSON (créé au run)
├─ downloads/             # PDF / DOCX téléchargés (créé au run)
├─ logs/
│  └─ extraction_costs.jsonl   # 1 ligne par appel Claude
└─ validation_reports/    # Rapports HTML (créé par validate.py)
```

**Principe** : chaque source ne code QUE la navigation (lister les URLs + ouvrir chaque fiche + télécharger les pièces). L'extraction des champs structurés est déléguée à Claude via un schéma d'outil (`tools=[extract_aap]`), ce qui élimine le besoin d'écrire un parser HTML spécifique à chaque site.

---

## Prérequis

- **Python 3.11+** (testé sur 3.12)
- **Clé API Anthropic** (https://console.anthropic.com/) — format `sk-ant-...`
- Navigateur Chromium de Playwright (installé en une commande, voir `MODE_EMPLOI.txt`)

---

## Installation rapide

Voir **`MODE_EMPLOI.txt`** pour les commandes exactes à copier-coller dans `cmd` ou PowerShell.

En résumé :
```
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python -m playwright install chromium
copy .env.example .env
```
Puis éditer `.env` pour renseigner `ANTHROPIC_API_KEY`.

---

## Les 4 outils du POC

### Pourquoi 4 outils séparés et pas un seul script « tout-en-un » ?

Chaque outil a **un seul rôle**, c'est volontaire. Les regrouper (ex : lancer automatiquement `validate.py` à la fin de `run.py`) serait tentant pour le confort mais créerait 5 problèmes :

1. **Cadences différentes** — `run.py` tournera en cron automatique en prod (quotidien). `validate.py` est un acte **humain** de relecture, fait ponctuellement. Générer un HTML que personne ne lit 90 % du temps pollue `validation_reports/` et gaspille du temps.
2. **Failure isolation** — si `validate.py` plante (bug template, champ schéma manquant), ça ne doit pas casser le pipeline de scraping.
3. **Itération rapide** — quand on développe une nouvelle source (ARS, CNSA...), on relance `run.py` 20 fois en 1 h. Générer un rapport HTML à chaque run = +10 s perdues à chaque fois.
4. **Contrats de sortie distincts** — `run.py` produit du **JSON** (consommé par la plateforme / la base). `validate.py` produit du **HTML** (consommé par un humain dans Chrome). Deux formats, deux consommateurs, deux outils.
5. **Prod ≠ POC** — à terme (sprint 3 MVP), la validation humaine passera par un back-office admin en Next.js (cherry-pick, révision). `validate.py` est un outil temporaire ; le coupler au scraper créerait une dette à défaire.

**Si vous voulez le confort « une seule commande »** : créez un fichier batch `run_and_validate.bat` :
```bat
@echo off
python run.py --source %1 && python validate.py --source %1
```
Usage : `run_and_validate.bat fondation_de_france`. Le `&&` garantit que la validation ne se déclenche que si le scraping a réussi (fail-fast propre).

---

### 1. `run.py` — le scraper

Lance le scraping d'une source, appelle Claude pour extraire chaque AAP, sauvegarde en JSON.

```
python run.py --source fondation_de_france
```

**Sorties** :
- `results/<source>.json` — liste d'AAP normalisés (schéma Pydantic `AapNormalized`).
- `results/<source>.errors.json` — AAP en échec avec traceback (si présents).
- `downloads/<source>/` — PDF / DOCX téléchargés.
- `logs/extraction_costs.jsonl` — 1 ligne par appel Claude (tokens, coût).

**Contrôle du nombre d'AAP** :
```
set MAX_AAPS=20 && python run.py --source fondation_de_france
```
Par défaut 100. Mettez `5` pour tester vite, `1000` pour tout.

**Cache inter-runs** : au 2e lancement, les AAP déjà extraits (URL inchangée) sont servis depuis `results/<source>.json` **sans réinterroger Claude**. En régime de croisière (~5 % de delta/jour), cela divise le coût API par ~20. Pour forcer une ré-extraction complète :
```
set FORCE_REFRESH=1 && python run.py --source fondation_de_france
```

### 2. `validate.py` — rapport de contrôle qualité

Génère un rapport HTML qui met en vis-à-vis chaque AAP extrait et sa page source (iframe), avec score /10 et pastilles par champ.

```
python validate.py --source fondation_de_france
```

**Sortie** : `validation_reports/<source>.html` à ouvrir dans le navigateur.

**À relire après chaque scraping** pour détecter les champs manquants avant d'industrialiser.

### 3. `analyze_costs.py` — suivi du coût API

Analyse le journal `logs/extraction_costs.jsonl` et affiche un tableau par source : tokens consommés, coût €, moyenne/AAP, projections mensuelles.

```
python analyze_costs.py                              # tout le journal
python analyze_costs.py --today                      # aujourd'hui uniquement
python analyze_costs.py --source fondation_de_france # filtrer par source
```

### 4. `debug_page.py` — diagnostic Playwright

Quand un scraper retourne 0 URL ou 0 extraction, ouvre Chromium **en mode visible**, accepte les cookies, scrolle, et dumpe le HTML + screenshot + tous les liens de la page dans `debug/`.

```
python debug_page.py https://www.fondationdefrance.org/fr/appels-a-projets
```

---

## Registre des sources

Avant de scraper, savoir qui publie. `sources/registre.json` est l'inventaire des émetteurs d'appels
à projets santé et médico-social (ARS, ministères, caisses, agences, fondations, Europe,
collectivités, agrégateurs), avec pour chacun la page des AAP et un statut d'avancement :
`identifiee` -> `page-verifiee` -> `connecteur-teste` -> `operationnelle`.

```bash
python registre.py --verifier-format   # structure du fichier
python registre.py --verifier-pages    # chaque page répond-elle ? (met à jour code HTTP et date)
python registre.py --tableau           # écrit REGISTRE_SOURCES.md, la vue lisible
```

Le fichier de vérité est le JSON ; `REGISTRE_SOURCES.md` est régénéré et ne s'édite pas à la main.
Un connecteur ne passe `operationnelle` qu'après la grille d'acceptance ci-dessous.
Spécification : `openspec/specs/registre-sources/`.

### Annuaires de référence et couverture (changement `registre-par-annuaires`, 2026-10-13)

Le registre n'est plus constitué de mémoire : chaque famille d'émetteurs est adossée à un annuaire de référence
(`sources/annuaires/familles.json` : annuaire, adresse, date, total, vague) et `REGISTRE_SOURCES.md` commence par
le taux de couverture de chaque famille (entrées rapprochées de l'annuaire / total, ou « couverture non mesurée »).
Première vague : les fondations reconnues d'utilité publique et d'entreprise du Registre national des fonds et
fondations (ministère de l'Intérieur, data.gouv.fr), actives, à domaine santé-social.

```bash
python annuaires.py --rnf <opendata-donnees-fonds-fondations.zip>   # extrait sources/annuaires/rnf_fondations_sante_social.csv (664)
python annuaires.py --rapprocher                                     # correspondances par nom avec le registre (sûres / douteuses)
python annuaires.py --chercher 100                                   # recherche du site par l'API Tavily (clé TAVILY_API_KEY dans .env)
python annuaires.py --sites candidats.json                           # inscription manuelle de sites {numero_rnf: adresse}, vérifiés
python annuaires.py --integrer                                       # une entrée « identifiée » par fondation ayant un site trouvé
python registre.py --verifier-format --tableau
```

Aucune adresse n'est devinée : un site n'est inscrit que si son domaine porte le nom de la fondation (nom compact,
domaine « fondation » plus un mot du nom, mot distinctif ou sigle ; annuaires et réseaux sociaux écartés) et si la
page répond en citant ce nom. Les recherches sont journalisées dans `results/recherche_sites.jsonl` ; les
fondations « incertaines » restent dans l'extrait sans site. Le moteur gratuit sans clé refuse les requêtes
automatiques et l'API Google est fermée aux nouveaux clients : Tavily (1 000 crédits par mois sans carte) est le
moteur retenu. Quand le quota Tavily est atteint, la session cherche elle-même avec son moteur de recherche et
applique la même vérification (adresse choisie dans les résultats, sonde code 200 + mot du nom, journal avec
`moteur: session` et une note) ; les organismes qui existent déjà au registre reçoivent leur `id_registre` au lieu
d'une nouvelle entrée.

## Découverte des rubriques appels à projets

Avant d'écrire un connecteur, savoir où chaque source publie. `decouverte.py` ouvre la page de chaque
source du registre avec le navigateur piloté, note les liens qui évoquent un appel à projets, visite
au plus trois pages candidates et retient la plus riche en liens d'AAP. Sans IA, sans appel d'API.

```bash
python decouverte.py --limite 10            # essai
python decouverte.py --ids ars-bretagne     # une source
python decouverte.py --parallele 4          # tout le registre (reprise automatique)
python decouverte.py --rapport              # écrit DECOUVERTE.md
```

Résultats dans `decouverte/resultats.json` et, par source, `decouverte/<id>/rubrique.html` et
`liens.json` (dossier ignoré par Git). Premier passage du 2026-10-09 : 847 sources traitées,
268 rubriques trouvées, 3744 liens d'AAP collectés (détail : `DECOUVERTE.md`).
Spécification : `openspec/specs/decouverte-rubriques-aap/`.
Limites connues (constat du 2026-10-12) : les sites des préfectures partagent une protection qui refuse
les adresses de centres de données (réseau public, VPN) et qui coupe l'adresse domestique après une
dizaine de pages en quelques secondes. Les parcourir depuis la box personnelle, un site à la fois
(`--parallele 1`), avec une pause entre deux sites. Ameli (CPAM) accepte la box personnelle mais ses
pages dépassent souvent le délai de 180 s ; les 19 pages lues ne contiennent pas d'appel à projets.

## Qualification des sources

La découverte repère des rubriques par mots-clés : ce sont des candidates, pas des certitudes. `qualification.py`
relit la page gardée de chaque rubrique avec le modèle local Ollama (`mistral:7b-instruct`, gratuit) et répond à
trois questions fermées : la page liste-t-elle des appels à projets, sous quelle forme (web, PDF), dans le champ
santé ou médico-social ? Le verdict est calculé par le script : `rubrique-confirmee`, `pdf-seulement`,
`hors-sante`, `pas-d-aap`, `a-verifier`.

```bash
python qualification.py --qualifier            # toutes les rubriques, reprise automatique
python qualification.py --registre --rapport   # champ "qualification" dans le registre, QUALIFICATION.md
```

Passage du 2026-10-12 : 270 rubriques qualifiées, 127 confirmées, 1 en PDF seulement, 133 hors santé,
5 sans AAP, 4 à vérifier ; sondage manuel de 31 verdicts : 83 % d'accord
(`decouverte/sondage_qualification.json`). Détail : `QUALIFICATION.md`. Le modèle se trompe surtout sur les pages
bloquées (bandeau cookies, message d'accès refusé) et sur les listes mixtes où un seul appel concerne la santé.

### Relecture manuelle des verdicts

Le modèle juge une seule page par source, celle gardée par la découverte : si c'est une page d'accueil, une page
d'archives ou un bandeau cookies, le verdict ne dit rien de l'organisme. Les corrections humaines vont dans
`sources/relecture_qualification.json` (versionné, contrairement à `decouverte/`) : une entrée par source avec
`verdict`, `motif`, `date`, `relecteur`. `--registre --rapport` applique ces verdicts par-dessus ceux du modèle,
garde le verdict du modèle sous `verdict_modele`, et ajoute une section « Relecture manuelle » à `QUALIFICATION.md`.
Pour corriger une source : ajouter son identifiant dans le fichier, relancer `--registre --rapport`.
Quand la vraie rubrique est ailleurs, son adresse est notée dans le champ `notes` du registre.

Relecture du 2026-10-12 (changement `relecture-qualification`) : 70 corrections décidées avec Monsieur DUCOUT
(10 « hors santé » dont le motif prouvait la santé, 60 pages relues sans Ollama ni API), puis 60 décisions après
relecture. Bilan : 155 confirmées, 1 PDF seulement, 88 hors santé, 6 sans AAP, 20 à vérifier (6 cas limites à
trancher, 9 sites illisibles par le robot à ouvrir à la main, 2 préfectures bloquées, 2 pages sans AAP).

Essai d'un modèle de décision (2026-10-12) : Laya multilingue (322 millions de paramètres, paquet `laya`, sur
processeur) rejoué sur les 31 sources du sondage : 48 % d'accord avec la relecture (74 % en ignorant sa question
sur la forme PDF/web), contre 83 % pour mistral, et des probabilités trop sûres d'elles (0,85 à 0,99 de "santé"
pour une agence de l'eau). Non retenu sans entraînement spécifique ; résultats dans
`decouverte/qualification_laya.json`. Kev (anglais seulement, 16 Go de mémoire graphique) écarté sans essai.

## Extraction sur échantillon (comparaison des moteurs)

Avant de dépenser des crédits API sur les 3 748 liens découverts, `echantillon.py` compare trois moteurs sur un
échantillon : le modèle local Ollama, la session Claude Code elle-même (fiches écrites à la main à partir du texte des
pages), et une estimation du coût de l'API Anthropic sans aucun appel. Aucun appel à l'API n'est fait par ce script.

```bash
python echantillon.py --collecter                 # texte de 5 fiches au plus pour 10 rubriques (navigateur)
python echantillon.py --extraire --moteur ollama  # fiches par le modèle local -> results/echantillon_ollama.json
python echantillon.py --verifier results/echantillon_claude_code.json
python echantillon.py --estimer                   # coût API estimé (échantillon et ensemble des liens)
python echantillon.py --rapport                   # ECHANTILLON.md à partir des résultats et de la grille de contrôle
```

La grille `results/controle_echantillon.json` note, pour chaque fiche et chaque moteur, si le titre, le financeur, la
date de clôture et le montant correspondent à la page d'origine. Résultat du 2026-10-12 (`ECHANTILLON.md`) : 45 textes
collectés, 21 pages hors sujet (listes, présentations, pages sans rapport) ; Ollama produit 41 fiches dont 9 justes sur
les quatre champs (il fabrique une fiche même pour une page hors sujet, écrit des dates hors format comme
« 20 Septembre 2026 » et des enveloppes « oui ») ; la session 24 fiches justes sur 24 ; API estimée à 1,19 euro pour
l'échantillon et 99 euros pour les 3 748 liens (avant qualification des sources). Le modèle local ne suffit donc pas
pour l'extraction ; il reste l'outil de tri gratuit. Les fichiers `echantillon_*.json` et `controle_*.json` sont
ignorés par l'import global de `scripts/import_to_firestore.py` (import possible seulement par `--source`).
Le 2026-10-12, les 6 fiches validées encore ouvertes et du champ santé (`results/echantillon_valides.json`) ont été
importées dans Firestore par `python scripts/import_to_firestore.py --source echantillon_valides` (95 AAP scrapés en base).

### Second tour du modèle local (changement `extraction-ollama-second-tour`, 2026-10-13)

Décision de Monsieur DUCOUT : avant tout appel payant, « lentement et sûrement sur Ollama ». Le second tour corrige
les trois défauts du premier :

- une question fermée « cette page est-elle la fiche d'un appel à projets ? » est posée avant toute extraction ; les
  pages refusées sont gardées avec la raison dans `results/echantillon_ollama_<modele>_non_aap.json` ;
- les formats sont contrôlés après extraction (dates AAAA-MM-JJ ou null, montants entiers, enveloppe chiffrée,
  financeur nommé) ; en cas d'écart, le modèle est resollicité une fois avec l'écart cité ; s'il persiste, le champ est
  mis à null et la fiche marquée `a_relire` (une date absente vaut mieux qu'une date fausse) ;
- un fichier par modèle (`results/echantillon_ollama_<modele>.json`), écrit fiche par fiche, avec reprise.

```bash
python echantillon.py --extraire --moteur ollama --modele mistral:7b-instruct   # ou qwen3:8b
python echantillon.py --controler --modele mistral:7b-instruct                  # comparaison automatique à la référence
python echantillon.py --rapport
```

`--controler` compare chaque fiche aux 24 fiches de référence validées (`echantillon_claude_code.json`) : titre
normalisé, financeur (mots communs), date de clôture, montant ; une fiche produite pour une page de
`echantillon_non_aap.json` compte comme « fabriquée à tort ». Lancé sur la référence contre elle-même : 24 justes sur 24.
Seuil fixé par Monsieur DUCOUT pour retenir un modèle local : au moins 20 fiches justes sur 24 et au plus 2 fabriquées
sur 21 ; `ECHANTILLON.md` affiche le verdict par modèle. Carte graphique du poste : 8 Go, donc modèles de 7 à 8
milliards de paramètres (mistral 7b, qwen3:8b), un seul à la fois.

Résultat du second tour (2026-10-13, nuit) :

| Modèle | Pages refusées (sur 21 hors sujet) | Fiches | Justes sur les comparées | Fabriquées à tort | Temps |
|---|---|---|---|---|---|
| mistral:7b-instruct | 7 | 36 (2 délais dépassés) | 15 sur 23 | 13 | 40 min |
| qwen3:8b | 21 (20 hors sujet + 1 appel clos) | 22 (2 délais dépassés) | 16 sur 21 | 1 | 53 min |

Aucun des deux n'atteint le seuil (20 justes, 2 fabriquées au plus). `qwen3:8b` s'en approche : son filtre est presque
parfait, et parmi ses 5 désaccords, 2 sont des formulations exactes jugées sévèrement (nom complet de l'ANAP au lieu
du sigle, titre court) et 3 des enveloppes financières manquées (Interreg, habitat inclusif). Ses limites : 70 s par
texte (le modèle déborde sur le processeur avec un contexte de 16 384 jetons), 2 délais dépassés sur des pages longues.
Le comparateur a été relu par sondage (5 fiches par modèle) et corrigé deux fois : il accepte une échéance ou un titre
confirmés par le texte de la page, et compare les montants cités quel que soit le champ. La décision du moteur du
passage global revient à Monsieur DUCOUT (tâche 3.2 du changement).

## Extraction locale globale (changement `extraction-locale-globale`, 2026-10-13)

Décision de Monsieur DUCOUT (2026-10-13, soir) : extraire les pages des 242 rubriques validées avec le modèle local
`qwen3:8b`, à zéro euro, fiches marquées « à vérifier », en acceptant le risque mesuré sur l'échantillon (environ une
fiche sur quatre avec un champ faux, une page hors sujet sur vingt transformée en fiche). `extraction_locale.py`
réutilise la chaîne d'`echantillon.py` (question fermée, extraction, contrôle des formats, écriture fiche par fiche avec
reprise) sur toutes les sources en « rubrique confirmée », dans l'ordre ARS, caisses nationales, fondations, agences,
ministères, sociétés savantes, établissements, Europe, autres, puis collectivités (listes les plus mixtes en dernier).

```bash
python extraction_locale.py --bilan                      # avancement, sans appel au modèle
python extraction_locale.py --collecter                  # texte de chaque lien web des 242 sources (navigateur, reprise)
python extraction_locale.py --extraire --modele qwen3:8b # fiches -> results/extraction_locale.json (reprise automatique)
python ../scripts/import_to_firestore.py --source extraction_locale   # import d'un lot (rejouable), depuis la racine
```

- Une adresse citée par deux sources (Région et Conseil régional d'Île-de-France, Drôme et sa commission des
  financeurs) n'est lue et extraite qu'une fois ; les fichiers PDF, Word, Excel et ZIP restent hors périmètre
  (2 395 adresses web uniques pour 3 236 liens).
- Chaque fiche porte `scrape_metadata.moteur = "ollama"`, `modele`, `source` (identifiant du registre) et
  `a_verifier = true` ; l'import ajoute l'étiquette `a-verifier` et l'application affiche le badge « À vérifier » dans
  la liste et la fiche. Pages refusées dans `results/extraction_locale_non_aap.json`, échecs dans
  `results/extraction_locale.errors.json`.
- Temps machine estimé d'après l'échantillon (22 s par page refusée, 69 s par fiche) : environ 4 heures de collecte,
  puis 25 à 40 heures de calcul sur la carte graphique, en plusieurs nuits ; l'outil reprend là où il s'est arrêté.
  L'import ignore les appels déjà clos.

## Validation manuelle (changement `validation-manuelle-aap`, 2026-10-13)

Report des verdicts du mode « pages » au registre (changement `recherche-page-aap-par-source`) :

```bash
python validation.py --appliquer-pages            # relecture + adresses corrigées, une seule fois, AVANT la redécouverte
python qualification.py --registre --rapport && python registre.py --tableau
..\.venv\Scripts\python decouverte.py --forcer --garder-depart --ids <identifiants corrigés>   # garde la page donnée
..\.venv\Scripts\python decouverte.py --rapport
```

Correspondance : bonne page -> rubrique confirmée ; hors champ -> hors santé ; page morte -> à vérifier (à retrouver) ;
mauvaise page avec adresse -> `url_aap` corrigée (ancienne adresse dans les notes), rubrique confirmée, source à
redécouvrir. Les verdicts sont indexés par l'adresse de la page gardée : relancer `--appliquer-pages` après une
redécouverte ne retrouve plus les sources dont la page a changé (« sans source »), ce n'est pas une erreur.
`--garder-depart` évite que la découverte remplace la page désignée par une autre page du site qui aurait plus de liens ;
si la page donnée n'a aucun lien d'appel repéré, la source est « aucune rubrique » et sa page sera lue à l'extraction.

Monsieur DUCOUT juge lui-même, dans son navigateur, ce que les robots ont trouvé. `validation.py` est
un petit serveur local (bibliothèque standard) ; chaque verdict est écrit immédiatement dans un
fichier JSON de `results/`, clé = adresse, avec commentaire et date ; une relance reprend au premier
élément non jugé. Deux raccourcis sur le bureau lancent les fichiers `validation_pages.cmd` et
`validation_manuelle.cmd` (fermer la fenêtre noire arrête le serveur).

| Mode | Commande (depuis `scraping/`) | Question posée | Verdicts (touches 1 à 6) | Fichier |
|---|---|---|---|---|
| Pages | `python validation.py --pages --port 8788` | la page gardée par la découverte est-elle la page des appels de cet organisme ? (155 rubriques confirmées) | bonne page / mauvaise page (bonne adresse saisie dans le champ) / page morte / passer / des appels mais jamais santé | `results/validation_pages.json` |
| Sources exclues | `python validation.py --pages --verdicts hors-sante,a-verifier,pas-d-aap,pdf-seulement --port 8790` (raccourci « Validation des sources exclues ») | même question, pour les sources que la qualification a écartées ; verdict actuel et motif affichés ; les sources sans page gardée sont ignorées (leur nombre est affiché) | les mêmes | `results/validation_pages.json` |
| Liens | `python validation.py --liens --echantillon 60 --port 8787` (`--source <id>` pour une seule source) | ce lien est-il un appel à projets ? | appel / appel douteux / pas un appel / passer / page qui recense des appels / appel permanent sans sujet ni montant | `results/validation_liens.json` |
| Fiches | `python validation.py --fichier results/echantillon_ollama_qwen3-8b.json` | la fiche extraite est-elle juste ? | juste / à corriger / pas un appel / passer | `results/validation_manuelle.json` |

La page officielle s'ouvre dans une fenêtre séparée du navigateur, toujours la même (option
décochable pour revenir à un cadre dans la page ; beaucoup de sites publics refusent le cadre). Le
texte de la page, lu par le serveur, est affiché à droite dans tous les cas. Entrée dans le champ de
commentaire l'enregistre sans changer d'élément ; les flèches permettent de revenir en arrière.
`--echantillon N` prend un lien par source à tour de rôle (ordre tiré au sort avec une graine fixe :
même liste à chaque lancement). Les liens cassés (gabarits non remplis, crochets dans l'adresse) sont
écartés. Tests : `tests/test_validation.py`.

## Ajouter une source

Créer `sources/<nom>.py` sur le modèle de `fondation_de_france.py`. Deux fonctions async à implémenter :

```python
async def list_aaps(page) -> list[str]:
    """Navigue vers la page de liste (paginée ou non),
    retourne la liste des URLs des fiches AAP."""
    ...

async def fetch_detail(page, url, downloads_dir) -> dict:
    """Ouvre l'URL, renvoie :
    {
      "text": <texte principal de la page>,
      "fichiers_joints": [{"url", "filename", "local_path"}, ...],
      "financeur_hint": "Nom de l'organisme"
    }
    """
    ...
```

Lancer :
```
python run.py --source <nom>
python validate.py --source <nom>
```

---

## Stratégies de pagination (utile pour les nouvelles sources)

Le fichier `sources/fondation_de_france.py` implémente une **pagination offset** (`?start=N` par pas de 15). Autres stratégies courantes :

| Pattern | Exemple | Implémentation |
|---|---|---|
| **Offset** | `?start=0, ?start=15, ?start=30...` | Boucle sur `start += PAGE_SIZE` |
| **Page numéro** | `?page=1, ?page=2...` | Boucle sur `page_num` |
| **Path** | `/page/2/`, `/page/3/` | Idem, concaténation URL |
| **Bouton Suivant** | Click `a.next` | `await page.click("a.next")` puis re-collecte |
| **Scroll infini** | Lazy-load JS | Boucle `mouse.wheel()` jusqu'à plateau `scrollHeight` |

**Règle d'arrêt unique et robuste** : on continue tant qu'une page apporte au moins 1 URL inconnue. Dès qu'une page ne donne rien de neuf → fin.

---

## Limitations connues du POC

- **OCR PDF non actif** : les pièces jointes sont téléchargées mais pas lues par Claude. Les champs uniquement présents dans le PDF (ex : grille précise de montants) restent `null`. Prévu en sprint 2 MVP (cascade pdfplumber → Docling → Mistral OCR).
- **Dédoublonnage inter-source non implémenté** : un AAP co-financé listé chez 2 financeurs générera 2 entrées (signatures différentes). Normal au POC, à gérer en base.
- **Pas encore** : indexation vectorielle (pgvector), back-office admin, matching IA bi-face.
- **Sources "hors pattern"** (ex : FDF AMI Mayotte à `/fr/mayotte-foret`) : le sélecteur CSS des cartes standard ne les capte pas. Traiter au cas par cas si pertinent pour le périmètre santé/médico-social.

---

## Grille d'acceptance d'une source (critères prod)

Avant de brancher une source sur la plateforme aapsante.fr, elle doit satisfaire :

| Critère | Seuil |
|---|---|
| Moyenne score qualité (rapport HTML) | ≥ 7/10 sur ≥ 10 AAP |
| Aucun AAP à score < 4/10 | oui |
| Champs obligatoires renseignés | titre, financeur, description (≥ 500 car.), date_cloture, territoire |
| Coût moyen par AAP | ≤ 0,10 € |
| Taux d'échec extraction | ≤ 5 % |

---

## Coût estimé

Mesures POC (20 avril 2026, Sonnet 4.6 + prompt caching activé) :
- **0,035 € / AAP en moyenne** (input ~3k tokens, output ~2k tokens).
- Projection 5 sources × 50 AAP / jour sans optimisation : **~260 €/mois**.
- Avec **delta scraping** (5 % de nouveautés/jour) : **~13 €/mois**.

---

## Lien avec le projet global

Ce POC valide la brique #1 du CDC AAP Santé (§7.3 — Moteur d'agrégation). Cf. `../CDC_AAP_Sante_v1.md` et `../COMPARATIF_SCRAPING_AAP_Sante.md`.
