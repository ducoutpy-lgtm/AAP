# Tasks

EN ATTENTE (2026-10-12) : Monsieur DUCOUT demande de qualifier d'abord les sources (changement
`qualification-des-sources`) ; l'extraction reprendra sur les rubriques confirmées. Fait : 1.1, 1.2, 2.2, 2.3.

## 1. Échantillon

- [x] 1.1 `scraping/echantillon.py --collecter` : choix de 10 rubriques (familles variées), ouverture de 5 fiches au plus par rubrique, texte lisible enregistré dans `decouverte/<id>/fiches/`. Fait quand : au moins 30 fichiers texte avec leur adresse en première ligne.
- [x] 1.2 Tests `scraping/tests/test_echantillon.py` sur les fonctions pures (choix des rubriques, nettoyage du texte, validation d'une fiche, estimation). Fait quand : pytest vert.

## 2. Trois moteurs

- [x] 2.1 `--extraire --moteur ollama` avec `mistral:7b-instruct`, sortie `results/echantillon_ollama.json`, compte des réussites et du temps. Fait quand : le fichier existe et le terminal affiche réussites / échecs / durée. (Fait le 2026-10-12 : 41 fiches, 4 échecs dans `echantillon_ollama.errors.json` (3 délais dépassés, 1 erreur 500 d'Ollama), 1 767 s de calcul utile, une heure au total.)
- [x] 2.2 Fiches écrites par la session dans `results/echantillon_claude_code.json`, vérifiées par `--verifier`. Fait quand : "N fiches valides, 0 invalide".
- [x] 2.3 `--estimer` : coût API estimé pour l'échantillon et pour les 3 744 liens. Fait quand : les deux montants s'affichent avec la mention "estimation".

## 3. Contrôle et rapport

- [x] 3.1 Grille `results/controle_echantillon.json` remplie (quatre champs par fiche et par moteur), `--rapport` écrit `ECHANTILLON.md`. Fait quand : tableau récapitulatif par moteur présent. (Fait le 2026-10-12 : Ollama 9 fiches justes sur 41 (19 fiches produites pour des pages hors sujet, dates hors format, enveloppes « oui », financeur manquant) ; Claude Code 24 sur 24.)
- [x] 3.2 Import des fiches justes dans Firestore avec `scripts/import_to_firestore.py`. Fait quand : fiches visibles dans "Rechercher des AAP" en local. (Fait le 2026-10-12 : 6 fiches ouvertes du champ santé, `--source echantillon_valides`, 6 documents créés et relus dans Firestore ; affichage dans l'application à constater par Monsieur DUCOUT en 3.4.)
- [x] 3.3 Documentation : README scraping, CHANGELOGs, CLAUDE.md. Fait quand : fichiers relus. (Fait : section « Extraction sur échantillon » du README scraping, CHANGELOGs, CLAUDE.md, REPRISE.md.)
- [x] 3.4 Vérification par Monsieur DUCOUT : lecture de `ECHANTILLON.md`, contrôle d'une fiche par moteur sur la page d'origine, choix du moteur pour le passage global. Fait quand : validation. (Validé le 2026-10-13. Décision : pas d'API tout de suite ; second tour Ollama à zéro euro avec question préalable « est-ce un AAP ? », contrôle strict des formats, essai de Qwen 27B, mesure contre les 24 fiches de référence et seuil fixé par Monsieur DUCOUT ; l'API n'est retenue que si le seuil n'est pas atteint.)

## Workflow follow-up

- Archiver après 3.4 ; changement suivant : passage global avec le moteur retenu (budget 10-15 euros si API).
