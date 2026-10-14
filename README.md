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
Pour un compte admin : mettre `users/{uid}.userType = "admin"` dans Firestore.

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

Option utile : `--include-expired` (AAP dont la clôture est passée). Sans elle, seuls les AAP encore ouverts
sont importés ; une fiche sans date de clôture entre en brouillon (`status: draft`, `deadline` nulle : plus aucune
échéance fictive depuis le lot 0 du 2026-10-14, étiquette `sans-date-cloture`, validation « à corriger »), invisible
sans compte, en attente de Monsieur DUCOUT.
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
3. `cd app && npm run dev`, puis http://localhost:3000 : depuis le 2026-10-13 (changement
   `consultation-aap-sans-compte`), la consultation des AAP ne demande aucun compte : lien « Voir les appels
   à projets » sur l'accueil, ou directement http://localhost:3000/aap/search. Un compte porteur (inscription,
   14 jours d'essai, ou compte de démo) n'est nécessaire que pour candidater.
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

## Historique

- `main` : branche de référence (tout le projet).
- Tag `archive/export-v0` : prototype React 19 avec service d'export CSV/Excel/PDF testé, conservé pour réutilisation.
- Les branches `claude/implement-app-requirements-*` et `claude/test-monitoring-code-*` sont les anciennes branches de travail, fusionnées ou archivées.
