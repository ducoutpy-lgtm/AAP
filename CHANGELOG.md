# Journal des modifications

Ce fichier liste les changements notables apportés au POC AAP Santé.

## [Non publié]

### Ajouté
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
