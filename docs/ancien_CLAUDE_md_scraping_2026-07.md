# AAP Santé — Contexte projet pour Claude Code

Ce fichier est chargé automatiquement à chaque session Claude Code. Il donne le contexte nécessaire pour éviter de recommencer à zéro.

---

## Qui / Quoi

- **Porteur** : Monsieur Pierre-Yves DUCOUT, fondateur de **ARCADIA SASU** (Évry, 91).
- **Projet** : **AAP Santé** — plateforme B2B SaaS d'agrégation et de matching IA d'appels à projets du secteur santé / médico-social français.
- **Cible** : ~18 000 établissements (MCO, SSR, EHPAD, SSIAD, HAD, IME, ESAT, etc.) côté porteurs + financeurs publics/privés côté AAP.
- **Phase actuelle** : pre-MVP, candidature **IMT Starter 2026**, objectif de financement **T2 2026**.
- **Développement** : fait en **solo par Monsieur DUCOUT dans Claude Code** (pas de studio externe).
- **Niveau technique** : Python basique OK, pas expert. Toujours expliquer le POURQUOI avant le COMMENT. Préférer les explications pédagogiques aux raccourcis.

---

## Style de réponse attendu

- **Français**, registre professionnel neutre.
- Nommer **« Monsieur DUCOUT »** et **« ARCADIA SASU »** systématiquement dans les documents livrables.
- **Justifier chaque choix technique** (pourquoi telle lib, tel pattern, tel arbitrage).
- **Épistémie honnête** : si on ne sait pas, le dire. Si une ambiguïté existe, marquer `[À VALIDER — Monsieur DUCOUT]` plutôt que d'inventer.
- **Pas d'emojis** dans les fichiers produits (code, .md, .txt). OK dans la conversation.
- Diagrammes **Mermaid** pour l'architecture et les flux.
- Références **RGPD** explicites quand pertinent (DPO = M. DUCOUT, AIPD reportée post-MVP).

---

## Stack technique retenue (CDC v1)

- **Backend** : Python 3.12 + FastAPI + Celery + Redis
- **Scraping** : Playwright async + Claude API (tool use)
- **Frontend** : Next.js 15 + shadcn/ui + Tailwind
- **Base** : PostgreSQL 16 (pgvector + tsvector full-text FR)
- **Stockage** : S3 Scaleway FR
- **Infra** : Clever Cloud FR (MVP), GitHub Actions CI/CD
- **Observabilité** : Sentry + Grafana Cloud + UptimeRobot
- **3 environnements** : dev / staging / prod

---

## Principes d'architecture non négociables

1. **Schéma unique `AapNormalized` (Pydantic)** — tout scraper produit le même format de sortie, quelle que soit la source.
2. **Claude tool use pour l'extraction** — pas de parsers HTML spécifiques par site (trop fragile).
3. **Signature de dédoublonnage** = `sha1(titre|financeur|date_cloture)[:16]`.
4. **Delta scraping obligatoire** en prod (sinon coût API prohibitif) : dédup signature + hash contenu + cadence différenciée par source.
5. **Auto-healing IA des scrapers** : l'IA propose un patch de sélecteur, un humain valide. Jamais de mise en prod automatique.
6. **Prompt caching activé** sur le system prompt Anthropic (économie ~3× sur runs longs).
7. **Retry automatique** sur 429 / 529 / 5xx (backoff exponentiel).
8. **Séparation stricte des outils** (Unix "do one thing well"). `run.py` produit du JSON (machine), `validate.py` produit du HTML (humain), `analyze_costs.py` produit un tableau texte, `debug_page.py` ouvre un navigateur visible. Ne pas les fusionner même si « une seule commande » est tentant. Raisons : cadences différentes (cron vs acte humain), isolation des pannes, itération rapide en dev, contrats de sortie distincts, prod future ≠ POC. Si confort voulu : wrapper `.bat`, jamais dans le code Python.

---

## État d'avancement (à maintenir à jour)

| Brique | État | Commentaire |
|---|---|---|
| CDC v1 (16 sections) | ✅ | `CDC_AAP_Sante_v1.md` |
| Comparatif scraping | ✅ | `COMPARATIF_SCRAPING_AAP_Sante.md` |
| POC scraper Fondation de France | ✅ | 62 AAP extraits, 0,029 €/AAP en régime |
| Outil validation qualité HTML | ✅ | `poc-scraping/validate.py` |
| Logging coût API | ✅ | `poc-scraping/analyze_costs.py` |
| Refactor POC post-`/simplify` P1 | ✅ | `utils.py`, cache inter-runs, cleanup DOM, PDF cache disque, retry, FORCE_REFRESH |
| Git initialisé (poc-scraping) | ✅ | Premier commit `8b67a7e`, `.gitignore` configuré |
| CHANGELOG.md | ✅ | `poc-scraping/CHANGELOG.md`, format Keep-a-Changelog FR |
| Skill code-tracker | ✅ | Installé dans `~/.claude/skills/`, bilan fin de session automatisé |
| Hook UserPromptSubmit | ✅ | `~/.claude/hooks/detect_session_end.py` — déclenche code-tracker sur phrases fin session |
| Hook SessionStart | ✅ | `~/.claude/hooks/session_start.py` — contexte projet injecté à chaque ouverture (chemin corrigé 2026-07-03 après déménagement de juillet vers `Projets Claude Code/`) |
| Scraper ARS Corse | ✅ | `sources/ars_corse.py`, résultats dans `results/ars_corse.json` (2 AAP — normal, peu de contenu sur ce site) |
| Scraper ARS IDF | ✅ | `sources/ars_idf.py`, résultats dans `results/ars_idf.json` |
| Scraper ARS IDF (variante locale) | ✅ | `sources/ars_idf_local.py`, résultats dans `results/ars_idf_local.json` |
| Commit Git des 3 scrapers ci-dessus | ✅ | Commit `0ed769a`, 2026-07-03 |
| Archivage prototypes legacy | ✅ | `aap_web_scraper.py`, `httrack_aap_extractor.py`, `build_csv.py`, `scraping_aap_sante/` (stack crawl4ai rejetée) déplacés dans `_archive/` le 2026-07-03, voir `_archive/README.md` |
| Scrapers CNSA / sante.gouv / ameli | ⏳ | Prochaine étape majeure |
| Migration PostgreSQL + delta scraping | ⏳ | Sprint 1 MVP |
| Matching IA bi-face (pgvector) | ⏳ | Sprint 2 MVP |
| Back-office admin (cherry-pick) | ⏳ | Sprint 3 MVP |
| Front Next.js porteurs | ⏳ | Sprint 4 MVP |

---

## Critères d'acceptance relâchés POC (décision Monsieur DUCOUT)

- 5 sources (pas 20)
- 50 AAP minimum (pas 500)
- Coût moyen ≤ 0,10 €/AAP
- Moyenne qualité rapport HTML ≥ 7/10

---

## Conventions de code

- Fichiers source scraper : 1 source = 1 fichier dans `poc-scraping/sources/<nom>.py`, ~150 lignes max.
- 2 fonctions obligatoires par scraper : `async def list_aaps(page)` et `async def fetch_detail(page, url, downloads_dir)`.
- Les imports Anthropic utilisent `claude-sonnet-4-6` (pas de changement sans demande explicite).
- Toujours `load_dotenv(override=True)` dans `run.py` (fix pour env Windows).

---

## Outillage Claude Code configuré

### Skill code-tracker
- **Emplacement** : installé automatiquement via le plugin cowork
- **Rôle** : produit un bilan complet en fin de session — compte rendu `.claude/sessions/`, mise à jour `CHANGELOG.md`, proposition de commits Git
- **Déclenchement auto** : hook `detect_session_end.py` injecte le rappel quand l'utilisateur dit « on s'arrête », « bonne journée », « à demain », etc.
- **Déclenchement manuel** : invoquer le skill depuis la conversation

### Hook UserPromptSubmit — detect_session_end.py
- **Fichier** : `C:/Users/pierr/.claude/hooks/detect_session_end.py`
- **Rôle** : détecte les phrases de fin de session dans chaque message utilisateur et injecte un rappel automatique pour invoquer le skill code-tracker
- **Fonctionnement** : silencieux quand aucune phrase détectée, transparent pour l'utilisateur

### Hook SessionStart — session_start.py
- **Fichier** : `C:/Users/pierr/.claude/hooks/session_start.py`
- **Rôle** : à chaque ouverture de Claude Code, injecte automatiquement dans le contexte : derniers commits Git, nombre d'AAP en cache, coût API total, prochaine étape
- **Bénéfice** : Claude connaît immédiatement l'état réel du projet sans que Monsieur DUCOUT ait besoin de le réexpliquer

### Configuration settings.json
- **Fichier** : `.claude/settings.json` (dans `ClaudeCode/`)
- **Contenu** : permissions MCP (data.gouv, Pappers) + hook SessionStart + hook UserPromptSubmit

---

## Fichiers et dossiers clés

```
ClaudeCode/
├─ CLAUDE.md                            <- ce fichier (contexte auto-chargé)
├─ CDC_AAP_Sante_v1.md                  <- cahier des charges complet (16 sections)
├─ COMPARATIF_SCRAPING_AAP_Sante.md     <- arbitrage technologique scraping
├─ .claude/
│  ├─ settings.json                     <- permissions + hooks Claude Code
│  ├─ sessions/                         <- comptes rendus de session (code-tracker)
│  └─ hooks/
│     ├─ detect_session_end.py          <- déclenche code-tracker en fin de session
│     └─ session_start.py              <- injecte contexte projet au démarrage
└─ poc-scraping/                        <- le POC scraping (dossier principal)
   ├─ README.md                         <- entrée technique pour un développeur
   ├─ MODE_EMPLOI.txt                   <- guide complet non-technique (ce document)
   ├─ CHANGELOG.md                      <- journal des modifications
   ├─ .gitignore                        <- fichiers exclus du versionnement Git
   ├─ .env / .env.example               <- clé API Anthropic (JAMAIS committer .env)
   ├─ requirements.txt                  <- liste des librairies Python nécessaires
   ├─ .claude/sessions/                 <- comptes rendus de session POC
   │
   ├─ schema.py                         <- structure de données AapNormalized
   ├─ utils.py                          <- fonctions partagées (helpers)
   ├─ extractor.py                      <- appel Claude API (extraction IA)
   ├─ orchestrator.py                   <- boucle principale Playwright
   ├─ run.py          <- OUTIL 1 : scraper (JSON)
   ├─ validate.py     <- OUTIL 2 : rapport qualité (HTML)
   ├─ analyze_costs.py <- OUTIL 3 : suivi coût (tableau texte)
   ├─ debug_page.py   <- OUTIL 4 : diagnostic navigateur (visible)
   │
   ├─ sources/
   │  └─ fondation_de_france.py         <- scraper source 1 (modèle à dupliquer)
   │
   ├─ results/                          <- AAP extraits en JSON (ignoré par Git)
   ├─ downloads/                        <- PDF/DOCX téléchargés (ignoré par Git)
   ├─ logs/                             <- journal coût API (ignoré par Git)
   └─ validation_reports/               <- rapports HTML qualité (ignoré par Git)
```

---

## Règle obligatoire : ajout d'une nouvelle source

Chaque fois qu'un nouveau site web (source AAP) est ajouté au POC :
1. Créer le fichier `sources/<nom>.py` et le tester avec `python run.py --source <nom>`.
2. **Générer immédiatement le rapport HTML** : `python validate.py --source <nom>`.
3. Ouvrir le rapport et vérifier visuellement la qualité (score, champs manquants, documents).
4. Ne pas considérer la source comme opérationnelle tant que le rapport n'a pas été généré et présenté.

---

## Ce qu'il NE faut PAS faire sans validation explicite

- Changer le schéma `AapNormalized` (impact toutes les sources).
- Installer une lib lourde (ex : Crawl4AI — rejeté après expérience négative, cf. comparatif).
- Proposer un modèle IA local pour le MVP (décision : Claude API jusqu'à >500 €/mois).
- Modifier le CDC sans en informer explicitement.
- Committer la clé API Anthropic (elle est dans `.env`, dans `.gitignore`).
- Fusionner les 4 outils en un seul script (principe de séparation des responsabilités).

---

## Références externes

- Console Anthropic (clé API, facture) : https://console.anthropic.com/
- IMT Starter 2026 : https://imt-starter.fr/
- Fondation de France (source POC) : https://www.fondationdefrance.org/fr/appels-a-projets
- Git (versionnement) : `cd poc-scraping && git log --oneline` pour voir l'historique

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
