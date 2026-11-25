# AAP Santé

Plateforme SaaS d'agrégation et de matching d'appels à projets (AAP) du secteur sanitaire et médico-social français.
Projet porté par ARCADIA SASU.

Ce dépôt regroupe **tout** le projet (fusion du 2026-10-09) :

| Dossier | Contenu | Technologie |
|---|---|---|
| `app/` | Application web (porteurs, financeurs, admin) | React 18 + TypeScript + Vite + Tailwind + Firebase |
| `scraping/` | Collecte automatique des AAP sur les sites sources | Python 3.12 + Playwright + Claude API |
| `scripts/` | Import des AAP scrapés dans la base de l'application | Python + firebase-admin |
| `docs/` | Cahiers des charges, comparatifs, résumés | — |
| `_archive/` | Prototypes abandonnés | — |

Le contexte complet pour Claude Code est dans `CLAUDE.md`.

---

## Démarrage rapide

### 1. Application web

```bash
cd app
npm install
copy .env.example .env        # puis renseigner les clés Firebase (console > Paramètres du projet > Vos applications)
npm run dev                   # http://localhost:3000
```

Côté console Firebase (projet `aapi-11bc3`) : activer Authentication (E-mail/Mot de passe), créer Firestore
et publier `app/firestore.rules`, activer Storage et publier `app/storage.rules`.
Compte administrateur : `.venv\Scripts\python scripts/creer_admin.py --email <adresse>` (essai à blanc avec
`--dry-run`), puis choix du mot de passe par « Mot de passe oublié ? » sur `/login`.

### 2. Scraping

```bash
cd scraping
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python -m playwright install chromium
copy .env.example .env        # puis renseigner ANTHROPIC_API_KEY
python run.py --source fondation_de_france
python validate.py --source fondation_de_france   # rapport HTML de qualité
```

Guide détaillé non technique : `scraping/MODE_EMPLOI.txt`.

### 3. Import des AAP scrapés dans l'application

```bash
python -m venv .venv                       # environnement Python à la racine (ignoré par Git)
.venv\Scripts\python -m pip install -r scripts/requirements.txt
# Clé de compte de service : console Firebase > Paramètres du projet > Comptes de service > Générer une nouvelle clé privée
# Enregistrer le fichier sous scripts/serviceAccountKey.json (ignoré par Git, jamais commité)
.venv\Scripts\python scripts/import_to_firestore.py --dry-run     # affiche ce qui serait importé, n'écrit rien
.venv\Scripts\python scripts/import_to_firestore.py               # écrit dans la collection Firestore "aap"
```

Depuis le 2026-10-20 (décision de Monsieur DUCOUT, changement `administration-controle`) : une fiche nouvelle que le
contrôle du modèle n'a pas validée entre en brouillon, et seules les fiches validées sont visibles dans la recherche
publique ; elles se contrôlent depuis `/admin/aaps` (« Valider et publier », « Rejeter », « Modifier »). Les fiches
publiées avant cette décision sans contrôle se repassent en brouillon par
`scripts/depublier_non_controlees.py` (`--dry-run` d'abord, sauvegarde dans `scripts/sauvegardes/`).

Option utile : `--include-expired` (AAP dont la clôture est passée). Sans elle, seuls les AAP encore ouverts
sont importés ; une fiche sans date de clôture est publiée avec `deadline` nulle (plus aucune échéance fictive depuis
le lot 0 du 2026-10-14), l'étiquette `sans-date-cloture` et le badge « À vérifier » : l'application affiche « Date de
clôture non précisée » et la classe après les appels datés (décision de Monsieur DUCOUT du 2026-10-14 au soir, qui
remplace le brouillon du lot 0 ; `scripts/publier_sans_date.py` publie les brouillons existants, après essai à blanc
et accord). Une fiche classée hors champ par le modèle (`scrapeMetadata.champ`, changement `filtre-champ-sante`) entre
en brouillon à corriger, jamais publiée sans verdict ; `scripts/migrer_champ.py` repasse en brouillon les fiches
publiées avant le filtre ; le verdict « hors champ » de la validation quotidienne (touche 7) rejette la fiche.
Nettoyage des financeurs et des territoires (changement `nettoyage-financeurs-territoires`, 2026-10-14 au soir,
constat de Monsieur DUCOUT : « base sale ») : `scrapeMetadata.source` est l'émetteur du registre (`sourceNom` son nom,
`fichier` le fichier de résultats d'origine) ; `financeurName` est le nom canonique de `scraping/sources/financeurs.json`
(table construite depuis le registre par `scraping/financeurs.py --construire`, alias complétables à la main, nom lu
par l'IA conservé dans `scrapeMetadata.financeurExtrait`, noms restés sans rattachement : `--non-rattaches`) ;
`territoriesEligible` est déduit du texte du territoire (régions, départements et grandes villes de
`scraping/sources/departements.json`, lus par `scraping/territoires.py`) puis du nom de l'émetteur, `france` seulement
pour un appel national, `non-precise` sinon (affiché « Territoire non précisé »). Fiches publiées en double (même titre,
même financeur) : `.venv\Scripts\python scripts/doublons.py` (lecture seule, décision humaine). Avec `--file`
(changement `doublons-file-a-valider`, 2026-10-28) : publiées et file « à valider », appariement aussi par code de
programme européen et par date de clôture et mots distinctifs du titre (un relais garde le titre mais pas le nom du
financeur), fiche à garder proposée, rapport `docs/DOUBLONS.md` ; rien n'est écrit en base. Financeur d'un appel publié
par un relais (changement `financeur-reel-des-relais`, 2026-10-28) : l'import affiche le financeur cité entre
parenthèses par le modèle (« Lyonbiopôle … (appel émis par la Commission européenne) » -> « Commission européenne ») ;
`.venv\Scripts\python scripts/corriger_financeur_relais.py [--reel]` l'applique aux brouillons « proposee » déjà en base.
Contrôle des fiches par le modèle (changement `verification-assistee-haiku`, 2026-10-15) : `scraping/verification.py`
relit chaque fiche publiable à côté de sa page et liste les champs douteux ; l'import en reporte le résumé dans
`scrapeMetadata.verification`. Depuis le 2026-10-15 à midi (décision de Monsieur DUCOUT), ce contrôle vaut relecture :
une fiche sans doute, ou corrigeable d'après la page (dates, montants), est validée au nom du modèle ; une page qui
n'est pas un appel est rejetée ; un doute sur le titre, le financeur ou le territoire reste à relire. Les fiches déjà en
base ont reçu cette décision par `scripts/appliquer_controle.py` (essai à blanc, sauvegarde) ; l'outil de validation ne
présente plus que les fiches restantes.
L'import est rejouable : un second passage met à jour sans dupliquer. Règles depuis le 2026-10-14 (changement
`organisation-donnees-validees`) : identifiant du document dérivé de l'adresse de l'appel (deux moteurs, un
seul document) ; sur un document existant, `status`, `publishedAt` et `validation` ne sont jamais réécrits
(un AAP archivé dans l'administration reste archivé) ; les verdicts de `scraping/sources/verdicts_fiches.json`
pilotent le bloc `validation` (« pas un AAP » -> archivé, « AAP juste » -> badge « À vérifier » retiré et champs
métier protégés, « à corriger » -> badge gardé avec le commentaire). Migration des identifiants :
`scripts/migrer_identifiants.py` (sauvegarde dans `scripts/sauvegardes/`, hors Git).

Règles ajoutées par le lot 0 du rapport de critique (changement `lot-0-assainissement`, 2026-10-14) : `validation.statut` est la seule source de la
fiabilité d'une fiche et l'étiquette `a-verifier` en découle (`proposee` ou `a_corriger`, quel que soit le moteur) ;
`validation.par` est renseigné ; seuls les champs d'une liste blanche partent vers Firestore, un champ inconnu arrête
l'import à blanc comme en réel en le nommant. Migration des échéances fictives vers `deadline` nulle :
`.venv\Scripts\python scripts/migrer_echeances.py --dry-run` puis sans option (sauvegarde JSON d'abord).
Tests de l'import (faux Firestore en mémoire) : `.venv\Scripts\python -m pytest scripts/tests -q`.

Pourquoi `grpcio` est fixé en 1.74.0 dans `scripts/requirements.txt` : les versions plus récentes sont
bloquées par Smart App Control de Windows (constaté le 2026-10-09).

### 4. Rejouer la démo de bout en bout (vérifiée le 2026-10-09)

Ordre des opérations, après les étapes 1 à 3 ci-dessus :

1. Index et règles Firestore (une fois, nécessite votre compte Google) : depuis `app/`,
   `npm install -g firebase-tools`, `firebase login`, puis
   `firebase deploy --only firestore:rules,firestore:indexes --project aapi-11bc3`.
2. Import avec l'option : `.venv\Scripts\python scripts/import_to_firestore.py --include-expired`
   (105 AAP lus, 89 documents distincts : les doublons entre sources sont fusionnés).
3. `cd app && npm run dev`, puis http://localhost:3000 : la recherche et les fiches demandent un compte depuis le 2026-10-20 (décision de Monsieur DUCOUT ;
   la consultation sans compte du 2026-10-13 est retirée) : inscription avec 14 jours d'essai, ou compte de test
   des émulateurs, puis http://localhost:3000/aap/search.
4. Page « Rechercher des AAP » : les AAP scrapés apparaissent, les AAP clos portent la mention « Clôturé »,
   la recherche par mot filtre la liste, chaque fiche a un lien « Voir l'annonce officielle » et liste ses
   pièces jointes. En développement, les fichiers sont servis depuis le PC : créer une fois le lien de
   jonction `app\public\documents` vers `scraping\downloads` (PowerShell :
   `New-Item -ItemType Junction -Path app\public\documents -Target scraping\downloads`). Sans ce lien,
   ou sur la version en ligne, les liens renvoient chez le financeur (les ARS répondent « Forbidden »).
   Option `--vers-storage` de l'import : copie des fichiers dans Firebase Storage, réservée au jour où
   le projet aura un compte de facturation (forfait Blaze).

Spécifications correspondantes : `openspec/specs/import-aap-scrapes/` et `openspec/specs/consultation-aap-scrapes/`
(après archivage du changement `demo-aap-scrapes-visibles`).

## Vérifier le projet

Commandes de contrôle (plan niveau A, 2026-11-25), à lancer avant chaque commit d'une modification :

```powershell
cd app
npm run lint            # ESLint, aucun avertissement toléré
npm run typecheck       # TypeScript, sans compilation
npm run format:check    # mise en forme Prettier
npm test                # tests Vitest de l'application (jsdom, sans Firebase)
npm run test:rules      # règles Firestore et Storage sur l'émulateur (JDK 21 en tête du PATH, port 8080 libre)
npm run build           # compilation de production
cd ..
.venv\Scripts\python.exe -m pip install -r requirements-dev.txt   # une fois : collecte, jonction, pytest, ruff, mypy
.venv\Scripts\python.exe -m ruff check .                         # contrôle du code Python
.venv\Scripts\python.exe -m mypy                                 # types des modules de la chaîne du lundi
.venv\Scripts\python.exe -X utf8 -m pytest -q                    # tests de scraping/ et scripts/
```

Réglages : `pyproject.toml` (pytest, ruff, mypy), `app/.prettierrc.json`, `app/.eslintrc.cjs`. Le commit de mise en
forme Prettier est listé dans `.git-blame-ignore-revs` (`git config blame.ignoreRevsFile .git-blame-ignore-revs`).
Parcours connectés : sur les émulateurs Firebase (`app/README.md`, section Émulateurs ; comptes de
`scripts/semer_emulateurs.py`), jamais sur le vrai projet.

## Variables d'environnement

Deux fichiers `.env`, jamais commités, à créer depuis leurs modèles : `app/.env.example` (clés publiques Firebase et
Stripe de l'application) et `scraping/.env.example` (clé Anthropic, recherche web, boîte d'envoi des courriels). La clé
du compte de service Firebase se range dans `scripts/serviceAccountKey.json` (ignoré par Git).

## Mise en ligne

Application en ligne : https://aapi-11bc3.web.app (Firebase Hosting). Procédure, réglages réseau du poste et contrôles
après déploiement : `docs/MISE_EN_LIGNE.md`. Toute mise en ligne et toute poussée vers GitHub se font après l'accord de
Monsieur DUCOUT.

## Historique

- `main` : branche de référence (tout le projet).
- Tag `archive/export-v0` : prototype React 19 avec service d'export CSV/Excel/PDF testé, conservé pour réutilisation.
- Les branches `claude/implement-app-requirements-*` et `claude/test-monitoring-code-*` sont les anciennes branches de travail, fusionnées ou archivées.
