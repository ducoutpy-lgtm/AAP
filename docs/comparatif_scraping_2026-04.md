# Comparatif des solutions d'agrégation / scraping pour AAP Santé

**Document annexe au CDC_AAP_Sante_v1.md**
Auteur : Monsieur DUCOUT (ARCADIA SASU), assisté de Claude Code
Date : 2026-04-21
Statut : document d'aide à la décision — reco finale à acter avant jalon 1

---

## 1. Ce qu'il faut faire maintenant du CDC

Le CDC est un livrable de cadrage. Il sert à trois usages, dans cet ordre de priorité pour votre contexte :

| Usage | Destinataire | Moment |
|---|---|---|
| **Annexer au dossier IMT Starter** | Jury d'incubateur | Dépôt candidature |
| **Piloter votre propre développement** en mode solo + Claude Code | Vous | En continu |
| **Chiffrer / cadrer** un CTO ou freelance au moment de la dotation | Recrutement | Post-dotation T2 2026 |

Concrètement, vos 3 prochaines actions :

1. **Prototyper le scrapeur** (c'est l'objet de ce document) sur **1 à 3 sources réelles** pour dé-risquer le MVP avant toute autre ligne de code.
2. **Valider juridiquement** les CGU des sources scrapées — pour des AAP publics des ARS/CNSA/data.gouv, le risque est quasi nul ; pour les fondations privées, à vérifier au cas par cas.
3. **Mettre en place le squelette technique minimal** (repo, CI, base Postgres) seulement **après** avoir validé que 2–3 sources sont effectivement scrapables.

---

## 2. Cartographie des solutions de scraping

Cinq familles de solutions, avec des profils coût/contrôle/ops très différents.

| Famille | Exemples | Positionnement |
|---|---|---|
| **A. Librairies Python DIY** | Playwright, httpx+BeautifulSoup, Scrapy | Contrôle total, effort max |
| **B. Frameworks LLM-natifs open source** | Crawl4AI, ScrapeGraphAI, LLM Scraper | Extraction guidée IA, auto-healing natif |
| **C. APIs scraping SaaS** | Firecrawl, ScrapingBee, ScraperAPI, Bright Data | On paie pour ne plus gérer proxies/captchas |
| **D. Plateformes acteurs/no-code** | Apify, Browse.ai, Octoparse | Scrapers prêts + infra managée |
| **E. APIs d'extraction IA** | Diffbot, Reducto, Unstructured.io | On envoie URL ou PDF, on reçoit JSON structuré |

Pour les PDF (20 % des sources estimées), il y a un axe orthogonal — cf. §5.

---

## 3. Comparatif détaillé — solutions de collecte HTML/JS

### 3.1 Tableau synthétique

| Solution | Type | Coût MVP (50 AAP/j) | Courbe apprentissage | Auto-healing | Souveraineté | Langage |
|---|---|---:|---|---|---|---|
| **Playwright + BeautifulSoup** | Lib Python | 0 € (infra seule) | Moyenne | Non natif | Locale | Python |
| **Scrapy** | Framework Python | 0 € | Élevée | Non | Locale | Python |
| **Crawl4AI** | Framework OSS | 0 € (+ coût LLM) | Faible | Oui (LLM) | Locale | Python |
| **ScrapeGraphAI** | Framework OSS | 0 € (+ coût LLM) | Faible | Oui (LLM) | Locale | Python |
| **Firecrawl** | SaaS API | ~20–80 €/mois | Très faible | Partiel | US (self-host possible) | REST API |
| **Firecrawl self-hosted** | OSS SaaS | 0 € (infra) | Moyenne | Partiel | Locale | Docker |
| **ScrapingBee** | SaaS API | ~30–100 €/mois | Très faible | Non | US/UE | REST API |
| **ScraperAPI** | SaaS API | ~30–150 €/mois | Très faible | Non | US | REST API |
| **Bright Data** | SaaS entreprise | ~200–500 €/mois | Moyenne | Oui (dans leur IDE) | Monde (UE dispo) | REST / SDK |
| **Apify** | Plateforme acteurs | Gratuit → ~50 €/mois | Faible | Partiel | US (UE en option) | JS/Python/API |
| **Browse.ai** | No-code SaaS | ~40–100 €/mois | Très faible | Oui (IA) | US | UI |
| **Octoparse** | No-code desktop/cloud | ~80–150 €/mois | Faible | Partiel | US/Chine | UI |
| **Diffbot** | API extraction IA | ~300+ €/mois | Très faible | N/A | US | REST |
| **Zyte API** | SaaS entreprise | ~100–400 €/mois | Faible | Oui | UE | REST/Scrapy |

### 3.2 Fiches par solution

#### A.1 — Playwright + httpx + BeautifulSoup (DIY Python)

- **Modèle** : vous codez chaque scraper en Python, Playwright rend le JS moderne, BS4 parse le HTML, httpx fait les requêtes API/RSS.
- **Pour** : contrôle total, zéro dépendance SaaS, parfait pour sites stables institutionnels (CNSA, data.gouv, sites ARS).
- **Contre** : chaque refonte d'un site vous coûte une re-écriture du scraper. Pas d'auto-healing. Gestion manuelle des proxies/retries.
- **Coût** : 0 € de soft, ~5–15 € de VPS / mois si hors hébergement principal.
- **Verdict** : **indispensable comme socle** — même si vous payez un SaaS, vous aurez toujours 2–3 sources "capricieuses" à coder en Python pur.

#### A.2 — Scrapy

- **Modèle** : framework Python historique (2008), spider + pipeline + middlewares.
- **Pour** : très performant en volume, ecosystem mature, excellent pour crawler des sites entiers.
- **Contre** : sur-dimensionné pour votre cas (vous ne crawlez pas 1 M de pages, vous surveillez 50 sources ciblées). Courbe d'apprentissage plus raide que Playwright direct.
- **Verdict** : **non recommandé** pour AAP Santé — Playwright + httpx suffit.

#### B.1 — Crawl4AI (open source, très populaire 2024-2025)

- **Modèle** : Python async, crawl + extraction guidée par LLM. Gère JS via Playwright en dessous. Rendu en Markdown propre pour passage à LLM.
- **Pour** : conçu pour le cas "je veux extraire des données structurées d'une page sans coder un parser" — donne un JSON selon un schéma Pydantic que vous définissez. **Remplit votre besoin d'auto-healing "gratuitement"** puisque le LLM s'adapte tant qu'il comprend la page.
- **Contre** : coût variable LLM par page scrapée ; dépend de la stabilité du projet open source ; nécessite de jouer avec les prompts.
- **Coût** : soft gratuit + ~0,001–0,01 € par page via LLM (selon modèle).
- **Verdict** : **très fort candidat** pour le MVP, couvre 70 % du besoin avec peu de code.

#### B.2 — ScrapeGraphAI

- **Modèle** : proche de Crawl4AI, graphe de nœuds (fetch → parse → LLM extract → output).
- **Pour** : excellent pour des pipelines non-triviaux (listage puis entrée dans chaque AAP puis extraction PDF).
- **Contre** : écosystème plus jeune, moins de contributeurs que Crawl4AI à date de 2025.
- **Verdict** : **alternative solide** à Crawl4AI, à évaluer en POC.

#### B.3 — LLM Scraper (autres briques open source)

- Ex : `llm-scraper` (Node), `instructor` (Python) pour extraction structurée.
- Verdict : utile comme brique dans votre code Python si vous partez DIY, mais n'apportent pas de moteur complet.

#### C.1 — Firecrawl

- **Modèle** : SaaS API REST. Vous envoyez une URL, vous recevez du markdown propre ou un JSON structuré (avec schéma). Crawl automatique d'un site entier possible.
- **Pour** : **excellente ergonomie** pour un démarrage rapide. API simple. Version **self-hosted open source** dispo (Docker), ce qui règle la souveraineté.
- **Contre** : version cloud = données transitent par les US. Tarification à la "crédit de crawl" qui peut surprendre à gros volumes.
- **Coût** : gratuit 500 crédits puis ~20 €/mois (3000 crédits), ~80 €/mois (10000). Self-host = 0 €.
- **Verdict** : **très fort candidat**, surtout en mode self-hosted sur Clever Cloud, à benchmarker contre Crawl4AI.

#### C.2 — ScrapingBee / ScraperAPI

- **Modèle** : "proxy + headless browser as a service" — vous envoyez une URL, ils exécutent le JS et renvoient le HTML final, ils gèrent les captchas et rotations d'IP.
- **Pour** : contourner les sites difficiles (captcha, Cloudflare). Simple.
- **Contre** : ce n'est qu'un **transport**, vous devez toujours écrire le parser. Pas de valeur IA.
- **Verdict** : **peu pertinent** pour AAP Santé — les sites institutionnels français n'ont pas de captcha et ne bloquent pas les bots.

#### C.3 — Bright Data

- **Modèle** : géant du scraping entreprise, propose proxies, IDE scraper, "datasets" prêts, collecte managée.
- **Pour** : robustesse niveau Fortune 500.
- **Contre** : **sur-dimensionné et coûteux** pour votre volumétrie, image controversée sur la provenance des IPs résidentielles.
- **Verdict** : **non recommandé** MVP.

#### C.4 — Zyte API (ex-Scrapinghub)

- **Modèle** : entreprise derrière Scrapy, propose API de scraping + IA d'extraction. Souveraineté UE (Irlande).
- **Pour** : mature, orienté professionnel, auto-extraction d'articles/produits.
- **Contre** : pas de support natif FR pour les sites institutionnels français, coût.
- **Verdict** : **alternative enterprise** à tenir en réserve v2.

#### D.1 — Apify

- **Modèle** : marketplace d'"acteurs" (scrapers pré-faits) + plateforme d'exécution. Vous pouvez écrire vos propres acteurs en JS/Python.
- **Pour** : **écosystème très riche**. Un acteur Apify dédié à chaque AAP = on peut sous-traiter la maintenance de scrapers à la communauté. Scheduler inclus.
- **Contre** : vendor lock-in modéré, hébergement US par défaut (option UE).
- **Coût** : free tier, puis pay-as-you-go (~10–50 €/mois selon usage).
- **Verdict** : **candidat crédible**, intéressant surtout si certaines sources (data.gouv, grandes fondations) ont déjà des acteurs publics.

#### D.2 — Browse.ai

- **Modèle** : no-code visual, "je clique sur les éléments d'une page et il génère un robot".
- **Pour** : super rapide pour des POC non-techniques.
- **Contre** : **pas adapté** à une plateforme SaaS qui doit opérer 50 scrapers en production avec auto-healing intégré au back-office.
- **Verdict** : **utile pour un POC de quelques sources par M. DUCOUT** avant arbitrage technique, **non retenu** pour la prod MVP.

#### D.3 — Octoparse

- **Modèle** : proche de Browse.ai, desktop+cloud.
- **Verdict** : même conclusion — **non retenu**.

#### E.1 — Diffbot

- **Modèle** : API d'extraction par IA vision — on donne une URL, on reçoit un objet "article/product/..." structuré.
- **Pour** : excellent sur des articles standards.
- **Contre** : **peu adapté aux AAP** qui ne sont ni articles ni produits, schéma non standard.
- **Verdict** : **non retenu**.

---

## 4. Comparatif complémentaire — extraction depuis PDF

~20 % des sources AAP sont des PDF. C'est le maillon le plus coûteux et incertain.

| Solution | Modèle | Qualité | Coût / 1000 pages | Souveraineté |
|---|---|---|---|---|
| **Tesseract + pdfplumber** | OSS local | Bonne sur PDF textuel, médiocre sur scans | 0 € | Locale |
| **Docling** (IBM, OSS 2024) | OSS local | Excellente, gère tableaux | 0 € | Locale |
| **Unstructured.io** | OSS + SaaS | Très bonne | 0 € (OSS) ou ~10 €/1000 pages (SaaS US) | Variable |
| **Azure Document Intelligence** | Cloud MS | Excellente | ~1,50 €/1000 pages (layout) | UE (France Central dispo) |
| **AWS Textract** | Cloud AWS | Excellente | ~1,50 €/1000 pages | UE (Paris) |
| **Google Document AI** | Cloud GCP | Excellente | ~1,50 €/1000 pages | UE (Belgique) |
| **Mistral OCR** (2025) | Cloud Mistral | Très bonne, orienté markdown | ~0,50 €/1000 pages | **UE (France)** |
| **Reducto** | SaaS spécialisé | Excellente, tableaux complexes | ~8 €/1000 pages | US |

### Recommandation PDF

**Pipeline en cascade** :

1. **Tentative 1** — `pdfplumber` (gratuit, rapide, fonctionne sur PDF texte = 60 % des cas).
2. **Tentative 2 si échec** — `Docling` (OSS IBM, gratuit, gère scans + tableaux).
3. **Tentative 3 si qualité < seuil** — **Mistral OCR** (UE, ~0,50 €/1000 pages) ou **Azure Document Intelligence France Central**.

Ce pipeline garde 80–90 % des coûts à zéro et n'active le cloud que sur les 10–20 % de PDF complexes.

---

## 5. Grille d'évaluation pondérée pour AAP Santé

Critères appliqués à votre cas précis, pondérés.

| Critère | Poids | Pourquoi |
|---|---|---|
| Auto-healing / résilience aux refontes de sites | 25 % | 50 sources à surveiller, refontes fréquentes côté public |
| Coût mensuel MVP à volume réel | 20 % | Budget pré-dotation tendu |
| Souveraineté / RGPD-friendly | 15 % | Clients publics FR |
| Contrôle et portabilité (pas de lock-in) | 15 % | Projet long terme, observatoire v2031 |
| Vitesse de mise en place | 15 % | Livrable IMT Starter pressé |
| Support PDF / documents complexes | 10 % | 20 % des sources |

### Scoring des solutions retenues en lice

| Solution | Auto-healing | Coût | Souveraineté | Contrôle | Vitesse | PDF | **Total /100** |
|---|---:|---:|---:|---:|---:|---:|---:|
| Playwright + httpx (DIY) | 10 | 20 | 15 | 15 | 5 | 0 | **65** |
| Crawl4AI (+ Playwright en fallback) | 22 | 17 | 13 | 13 | 12 | 3 | **80** |
| Firecrawl self-hosted + Docling/Mistral OCR | 18 | 18 | 14 | 12 | 13 | 8 | **83** |
| Firecrawl cloud + Docling | 18 | 14 | 10 | 8 | 15 | 8 | **73** |
| Apify acteurs + workers custom | 15 | 15 | 10 | 10 | 13 | 5 | **68** |
| Bright Data | 20 | 5 | 8 | 7 | 10 | 4 | **54** |
| Pure SaaS cloud (Firecrawl+Diffbot+…) | 20 | 8 | 6 | 5 | 15 | 8 | **62** |

---

## 6. Recommandation finale

### 6.1 Architecture de scraping en 3 couches

```
Couche 1 — Orchestration (votre code)
  - Registre des sources
  - Scheduler Celery Beat (quotidien)
  - Normalisation vers schema AAP Pydantic
  - Dedoublonnage, persistance PG

Couche 2 — Moteur d'extraction (choix hybride)
  - Par defaut : Crawl4AI (extraction LLM-guidee) avec Playwright
  - Pour sources triviales (API, RSS) : httpx + feedparser directs
  - Pour sources rebelles : code Python custom dedie
  - Eval continue : Firecrawl self-host en backup / comparaison

Couche 3 — Pipeline PDF
  - pdfplumber -> Docling -> Mistral OCR (FR) si besoin
```

### 6.2 Plan d'action concret sur 2-3 semaines

| Étape | Objectif | Livrable |
|---|---|---|
| 1. POC Crawl4AI | Prouver la faisabilité sur 3 sources typiques | 3 scrapers fonctionnels : 1 ARS (HTML), CNSA (API ou HTML), 1 fondation (PDF) |
| 2. POC Firecrawl self-hosted | Comparer à Crawl4AI sur les mêmes 3 sources | Benchmark qualité + coût |
| 3. POC Apify | Vérifier s'il existe déjà des acteurs communautaires pour data.gouv ou ARS | Liste acteurs exploitables |
| 4. Arbitrage | Choix définitif du moteur primaire | Décision actée dans un ADR |
| 5. Industrialisation | Intégration Celery + registre + dédoublonnage | Jalon 1 atteint |

### 6.3 Décisions à acter maintenant

- [ ] Valider l'approche **hybride Crawl4AI + httpx + code custom** plutôt que "tout SaaS" ou "tout DIY pur".
- [ ] Valider le **choix du provider LLM** pour Crawl4AI lors du POC (OpenAI/Anthropic/Mistral — Mistral recommandé pour souveraineté dès le POC si possible).
- [ ] Valider le **pipeline PDF en cascade**.
- [ ] **Budget POC** : prévoir ~20–50 € pour couvrir les appels LLM pendant les 2–3 semaines de POC.

### 6.4 Ce que le POC doit répondre

À l'issue du POC, vous devez pouvoir dire **oui/non** à :

1. Crawl4AI extrait-il correctement un AAP complet sur les 3 sources testées ?
2. Le coût LLM estimé à l'échelle 50 sources × 1 scrape/j est-il < 30 €/mois ?
3. Le mécanisme d'auto-healing (re-génération du schéma d'extraction) fonctionne-t-il sur un site dont la structure a changé ?
4. Le pipeline PDF garde-t-il 80 % des extractions en gratuit (pdfplumber + Docling) ?

Si les 4 réponses sont "oui" : on industrialise. Si l'une est "non" : on réévalue au cas par cas (passage à Firecrawl self-hosted, ou code custom sur cette source).

---

## 7. Ce que vous pouvez commencer dès ce soir

Ordre d'actions concret, solo + Claude Code :

1. Créer un dossier `poc-scraping/` dans votre repo.
2. Installer Crawl4AI : `pip install crawl4ai && crawl4ai-setup`.
3. Choisir **une seule source simple** en priorité (exemple : page CNSA qui liste les AAP ouverts — à vérifier).
4. Demander à Claude Code de générer un script Crawl4AI avec schéma Pydantic `AapNormalized`.
5. Vérifier manuellement la qualité d'extraction sur 3–5 AAP.
6. Itérer.

En parallèle : ouvrir un compte Firecrawl (free tier) et Apify (free tier) pour pouvoir comparer sans engagement.

---

## 8. Points à trancher avec Monsieur DUCOUT

| # | Question | Impact |
|---|---|---|
| S1 | Acceptez-vous une dépendance LLM (OpenAI/Mistral) pour la couche extraction ? | Oriente vers Crawl4AI ou DIY pur |
| S2 | Voulez-vous absolument zéro SaaS externe (tout self-hosted) ? | Oriente vers Firecrawl self-host + Docling local |
| S3 | Quel est votre niveau de confort en Python async / Playwright ? | Conditionne la part de code custom viable |
| S4 | Pouvez-vous consacrer 15–30 h sur 2–3 semaines au POC avant le reste ? | Conditionne la faisabilité du plan proposé |
| S5 | Disposez-vous déjà de la liste des 5 sources prioritaires du jalon 1 ? | Conditionne le démarrage du POC |

---

**Fin du document — COMPARATIF_SCRAPING_AAP_Sante.md**
