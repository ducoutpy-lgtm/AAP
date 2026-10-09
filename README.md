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
pip install -r scripts/requirements.txt
# Clé de compte de service : console Firebase > Paramètres > Comptes de service > Générer une nouvelle clé privée
# Enregistrer le fichier sous scripts/serviceAccountKey.json (ignoré par Git)
python scripts/import_to_firestore.py --dry-run     # affiche ce qui serait importé, n'écrit rien
python scripts/import_to_firestore.py               # écrit dans la collection Firestore "aap"
```

---

## Historique

- `main` : branche de référence (tout le projet).
- Tag `archive/export-v0` : prototype React 19 avec service d'export CSV/Excel/PDF testé, conservé pour réutilisation.
- Les branches `claude/implement-app-requirements-*` et `claude/test-monitoring-code-*` sont les anciennes branches de travail, fusionnées ou archivées.
