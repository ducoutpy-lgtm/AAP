# Archive — prototypes abandonnés

Fichiers archivés le 2026-07-03 sur décision de Monsieur DUCOUT, à la suite de l'audit du projet.

## Contenu

- `aap_web_scraper.py`, `httrack_aap_extractor.py`, `build_csv.py`, `LANCEMENT.txt`, `sources.json`,
  `aap_ile_de_france.txt`, `aap_ile_de_france_detail.txt`, `requirements.txt` (stack `requests` + `beautifulsoup4`)
- `scraping_aap_sante/` (stack `crawl4ai` + `openai` + LM Studio)

## Pourquoi archivé plutôt que supprimé

Ces scripts sont des prototypes antérieurs au POC officiel actuel (`poc-scraping/`, stack Playwright + Claude API).
Ils dupliquent en grande partie la même logique métier (extraction AAP, export Excel, déduplication) mais reposent
sur des choix techniques écartés depuis :

- `scraping_aap_sante/` utilise **crawl4ai**, explicitement rejeté après une expérience négative (voir
  `COMPARATIF_SCRAPING_AAP_Sante.md` et `CLAUDE.md`).
- Les scripts racine (`aap_web_scraper.py`, `httrack_aap_extractor.py`) utilisent `requests`/`BeautifulSoup`
  sans rendu JavaScript, remplacés par Playwright dans le POC officiel pour gérer les sites dynamiques.

Le POC officiel (`poc-scraping/`) est la seule base de code active pour la suite du développement (MVP).

## Ne pas réintégrer sans revalidation

Si une réutilisation de ces scripts est envisagée, revalider d'abord le choix technique avec Monsieur DUCOUT
(cf. règle CLAUDE.md : « Installer une lib lourde (ex : Crawl4AI — rejeté après expérience négative) »
nécessite une validation explicite).
