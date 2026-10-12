# Journal des modifications

Ce fichier liste les changements notables apportés au POC AAP Santé.

## [Non publié]

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
