# Proposal

## Why

Le premier tour d'extraction par le modèle local (changement `extraction-echantillon-aap`) a donné
9 fiches justes sur 41 : le modèle fabrique une fiche pour toute page, même sans rapport (19 cas),
écrit des dates hors format (« 20 Septembre 2026 ») et des enveloppes « oui », et oublie parfois le
financeur ou la clôture. Monsieur DUCOUT a tranché le 2026-10-13 : avant tout appel payant à l'API
Anthropic, aller « lentement et sûrement » avec Ollama, en mesurant un second tour contre les
24 fiches de référence déjà validées, avec un seuil fixé à l'avance. L'API n'est retenue que si le
seuil n'est pas atteint.

## What Changes

- `scraping/echantillon.py --extraire --moteur ollama` enchaîne désormais trois étapes par texte :
  une question fermée « cette page est-elle la fiche d'un appel à projets ? » (le modèle local y est
  bon : 83 % d'accord à la qualification), puis l'extraction seulement si la réponse est oui, puis
  un contrôle strict des formats (dates AAAA-MM-JJ ou null, montants entiers ou null, enveloppe
  chiffrée ou null, financeur non vide) avec une seconde demande au modèle qui cite l'erreur ; si
  l'écart persiste, le champ est mis à null et la fiche marquée « à relire ».
- Le résultat est écrit fiche par fiche (pas seulement à la fin), dans un fichier par modèle
  (`results/echantillon_ollama_<modele>.json`), pour comparer plusieurs modèles.
- Un contrôle automatique `--controler` compare chaque fiche produite aux 24 fiches de référence
  (titre normalisé, financeur, date de clôture, montant) et remplit la grille de contrôle ; le
  rapport `ECHANTILLON.md` affiche une ligne par modèle, le nombre de fiches fabriquées à tort sur
  les 21 pages hors sujet, et le verdict par rapport au seuil.
- Modèles testés, un seul à la fois sur la carte graphique (8 Go) : `mistral:7b-instruct` (base de
  comparaison), puis un modèle de 7 à 8 milliards de paramètres récent et meilleur en extraction
  structurée, téléchargé après accord de Monsieur DUCOUT (candidat : `qwen3:8b`, environ 5 Go
  [À VALIDER - Monsieur DUCOUT]). Les Qwen de 17 et 23 Go installés ne tiennent pas dans 8 Go de
  mémoire graphique : non testés, sauf demande.
- Seuil proposé : au moins 20 fiches justes sur les 24 de référence, et au plus 2 fiches fabriquées
  sur les 21 pages hors sujet [À VALIDER - Monsieur DUCOUT avant le tour].

## Capabilities

### New Capabilities

Aucune.

### Modified Capabilities

- `extraction-echantillon-aap` : extraction locale en trois étapes, fichier par modèle, contrôle
  automatique et seuil de décision.

## Impact

- Modifié : `scraping/echantillon.py`, `scraping/tests/test_echantillon.py`, `scraping/ECHANTILLON.md`,
  README scraping, CHANGELOGs, CLAUDE.md, REPRISE.md.
- Nouveaux fichiers locaux (ignorés par Git) : `results/echantillon_ollama_<modele>.json` et
  `.errors.json`, `results/echantillon_ollama_<modele>_non_aap.json`.
- Coût : zéro euro. Temps machine : environ une heure par modèle pour 45 textes (3 appels par texte
  au plus). Téléchargement d'un modèle : environ 5 Go, sur accord.

## Hors périmètre

- Le passage global lui-même (changement suivant, avec le moteur retenu).
- L'extraction par l'API Anthropic et son estimation sur les rubriques confirmées (seulement si le
  seuil n'est pas atteint).
- La lecture des PDF.
