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

Essai d'un modèle de décision (2026-10-12) : Laya multilingue (322 millions de paramètres, paquet `laya`, sur
processeur) rejoué sur les 31 sources du sondage : 48 % d'accord avec la relecture (74 % en ignorant sa question
sur la forme PDF/web), contre 83 % pour mistral, et des probabilités trop sûres d'elles (0,85 à 0,99 de "santé"
pour une agence de l'eau). Non retenu sans entraînement spécifique ; résultats dans
`decouverte/qualification_laya.json`. Kev (anglais seulement, 16 Go de mémoire graphique) écarté sans essai.

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
