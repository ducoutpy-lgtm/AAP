# Reprise du projet AAP Santé (écrit le 2026-10-12, à lire au début de chaque session)

## Objectif de Monsieur DUCOUT

Prouver, en local et sans dépense, qu'il est possible de récupérer tous les appels à projets (AAP)
du secteur santé et médico-social français, de les mettre dans la plateforme (application React +
Firebase du dossier `app/`), et d'utiliser cette plateforme. Déploiement seulement après que tout
fonctionne en local. GitHub sert de trace (commit et push à chaque changement validé).

## Règles non négociables

- Zéro dépense sans accord explicite : pas de crédit API Anthropic, pas de forfait Firebase Blaze.
  Un passage global payant (10 à 15 euros) est envisageable seulement quand la chaîne est prouvée
  et son coût estimé.
- Jamais de secret dans la conversation ni dans Git (`app/.env`, `scripts/serviceAccountKey.json`
  sont ignorés par Git ; vérifier avant chaque commit).
- Push uniquement sur demande explicite ("Validé : archiver, commit et push").
- Chaque évolution passe par un changement OpenSpec (`openspec/changes/`), avec tâches cochées,
  puis archivage. Documentation à jour avant de déclarer une tâche finie.
- Expliquer le pourquoi avant le comment, en français, sans jargon, sans emojis dans les fichiers.
- Une session = un seul dossier : ouvrir la session dans `AAP`, jamais dans `Scrapling`.

## Chaîne de traitement et état réel

| Étape | Outil | État |
|---|---|---|
| 1. Registre des émetteurs (qui publie des AAP) | `scraping/registre.py`, `sources/registre.json` | 847 sources ; 657 adresses répondent. "Page vérifiée" veut dire que l'adresse répond, pas qu'elle contient des AAP. |
| 2. Découverte des rubriques (où ils publient) | `scraping/decouverte.py`, `DECOUVERTE.md` | 270 rubriques candidates et 3 748 liens candidats, repérés par mots-clés, NON vérifiés. Pages gardées dans `scraping/decouverte/` (hors Git). |
| 3. Qualification des sources (publient-ils vraiment des AAP ?) | `scraping/qualification.py`, `QUALIFICATION.md` | FAIT le 2026-10-12 : 270 rubriques relues, 127 confirmées, 133 hors santé, 4 à vérifier ; sondage 83 % d'accord. Verdict dans le registre (champ `qualification`) et `QUALIFICATION.md`. |
| 4. Extraction des fiches (page -> fiche AAP) | `scraping/echantillon.py`, `ECHANTILLON.md` | EN ATTENTE (changement `extraction-echantillon-aap`). 45 textes collectés, 24 fiches écrites par Claude Code et validées, 21 pages hors sujet, coût API estimé 99 euros pour 3 748 liens (trop cher : d'où la qualification d'abord). |
| 5. Import dans l'application | `scripts/import_to_firestore.py` | OK : 89 AAP des 5 connecteurs historiques visibles dans "Rechercher des AAP", pièces jointes servies depuis le PC. |
| 6. Veille des changements (re-scraper ce qui bouge) | à créer | Idée validée par Monsieur DUCOUT : passage initial lent, puis comparaison quotidienne des pages gardées. |

## Leçons apprises (ne pas refaire)

- Les mots-clés ("aides", "prix", "financement") font remonter des pages sans rapport (facture
  d'eau, résultats de recherche, listes filtrées). Il faut un tri "est-ce un AAP ?" avant
  d'extraire : c'est l'objet de la qualification.
- Beaucoup d'AAP n'existent qu'en PDF (Cancéropôle Est, ministère de la Culture) : la lecture des
  PDF sera un changement à part.
- Les 92 sites de préfectures refusent les adresses de centres de données (réseau public, VPN) et
  coupent l'adresse domestique après une rafale : y aller depuis la box, un site à la fois, avec
  pause. Ameli (CPAM) et les CAF ne publient pas d'AAP sur leurs pages départementales.
- Le modèle local Ollama (`mistral:7b-instruct`) sert d'outil de tri gratuit ; il se trompe
  parfois (sondage obligatoire). La décision "Claude API pour le produit final" n'est pas remise
  en cause.

## Où en est le projet (mis à jour le 2026-10-12 au soir)

- Changement `qualification-des-sources` : tâches 1.1 à 3.2 faites. Reste **3.3, la validation par Monsieur
  DUCOUT** : lire `scraping/QUALIFICATION.md`, contrôler un verdict "rubrique confirmée" et un "pas d'AAP" sur
  les pages d'origine, puis dire "Validé : archiver, commit et push". Ensuite : `openspec archive
  qualification-des-sources --yes`, commit, push.
- Résultat : 270 rubriques qualifiées, 127 confirmées, 133 hors santé, 5 sans AAP, 4 à vérifier, 1 PDF seulement ;
  577 sources sans page gardée (à vérifier plus tard). Sondage manuel de 31 verdicts : 83 % d'accord. Attention :
  le modèle déclare "hors santé" des listes mixtes où un seul appel concerne la santé (Gard, Interreg Sudoe) ;
  les 133 "hors santé" méritent une relecture rapide avant d'être écartés définitivement.
- Essai de modèles de décision : Laya multilingue testé (48 % d'accord, trop sûr de lui), non retenu ; Kev écarté
  (anglais, 16 Go de mémoire graphique). Mistral 7b via Ollama reste le moteur de tri. Laya est installé dans
  `.venv` mais inutilisé.
- Changement `extraction-echantillon-aap` (en attente) : 45 textes collectés, 24 fiches Claude Code validées,
  grille de contrôle remplie pour Claude Code, estimation API faite. L'extraction Ollama des 45 fiches écrit
  `scraping/results/echantillon_ollama.json` à la fin seulement : si ce fichier a moins de 40 fiches, la
  relancer (`echantillon.py --extraire --moteur ollama`, 12 minutes seule sur la carte graphique). Restent :
  contrôle des fiches Ollama, `--rapport`, import des fiches justes, documentation, validation.
- Tout est commité en local (pas de push tant que Monsieur DUCOUT ne l'a pas demandé). Le dossier
  `scraping/decouverte/` et `scraping/results/` restent sur le PC (ignorés par Git).
- Règle d'exploitation d'Ollama : un seul travail à la fois sur le modèle ; ne pas lancer un autre modèle
  (Qwen 27B) ni un calcul lourd sur le processeur pendant un passage.

## Phrase à écrire au début de la prochaine session (ouverte dans le dossier AAP)

"Lis REPRISE.md, dis-moi la tâche suivante et attends ma validation du rapport de qualification."

## Commandes utiles (depuis `AAP/scraping`, environnement `../.venv`)

```bash
../.venv/Scripts/python -m pytest tests -q
../.venv/Scripts/python qualification.py --qualifier      # reprend où il s'est arrêté
../.venv/Scripts/python qualification.py --registre --rapport
../.venv/Scripts/python echantillon.py --extraire --moteur ollama
openspec validate <changement> ; openspec archive <changement> --yes
```
