# Tasks

Seuil fixé par Monsieur DUCOUT le 2026-10-13 : au moins 20 fiches justes sur 24 et au plus 2 fiches
fabriquées sur les 21 pages hors sujet.

## 1. Outil

- [x] 1.1 `echantillon.py` : question fermée « fiche d'un AAP ? » avant extraction, pages refusées gardées avec la raison ; contrôle strict des formats avec seconde demande citant l'écart puis null et marque « à relire » ; fichier par modèle écrit fiche par fiche avec reprise ; `--moteur ollama --modele <modele>`. Fait quand : `--extraire --limite 3` produit `results/echantillon_ollama_<modele>.json` et affiche refusées / réussites / échecs / temps.
- [x] 1.2 `--controler --modele <modele>` : comparaison automatique aux fiches de référence (titre normalisé, financeur, clôture, montant), fiches fabriquées à tort comptées, grille remplie sous la clé du modèle. Fait quand : lancé sur `echantillon_claude_code.json` contre lui-même, 24 justes sur 24.
- [x] 1.3 `--rapport` : une ligne par fichier `echantillon_ollama_*.json`, colonne « fabriquées à tort », seuil affiché, mention « seuil atteint » ou « non atteint ». Fait quand : `ECHANTILLON.md` montre la ligne du premier tour (« ollama, premier tour ») et le seuil.
- [x] 1.4 Tests `tests/test_echantillon.py` : contrôle de format (date, montant, enveloppe), normalisation de titre, comparaison d'une fiche à sa référence, nom de fichier par modèle. Fait quand : pytest vert.

## 2. Tours

- [x] 2.1 Seuil confirmé par Monsieur DUCOUT et inscrit en tête de ce fichier. Fait quand : la ligne « Seuil proposé » est remplacée par « Seuil fixé ».
- [x] 2.2 Tour `mistral:7b-instruct` sur les 45 textes, puis `--controler`, puis `--rapport`. Fait quand : la ligne du modèle apparaît dans `ECHANTILLON.md` avec son verdict. (Fait le 2026-10-13 : 7 pages refusées, 36 fiches, 2 délais dépassés, 2 358 s ; 14 justes sur 23 comparées, 13 fabriquées à tort : seuil non atteint. Le comparateur a été corrigé après sondage pour accepter une valeur confirmée par la page : 7 justes avant, 14 après.)
- [x] 2.3 Téléchargement d'un modèle de 7 à 8 milliards de paramètres après accord (candidat `qwen3:8b`, environ 5 Go), vérification qu'il tient dans 8 Go (`ollama ps` : 100 % GPU), puis tour, contrôle, rapport. Fait quand : la ligne du modèle apparaît dans `ECHANTILLON.md` avec son verdict ; sinon, mention « non testé » et raison. (Fait le 2026-10-13 : `qwen3:8b` téléchargé (5,2 Go), chargé à 80 % sur la carte et 20 % sur le processeur (contexte de 16 384 jetons), environ 70 s par texte. 21 pages refusées (20 des 21 hors sujet, plus l'appel clos Offensive Sciences 2024), 22 fiches, 2 délais dépassés (Dentobus, FIRAH 2024), 3 202 s ; 16 justes sur 21 comparées, 1 fabriquée à tort : seuil non atteint, mais de peu.)
- [x] 2.4 Sondage humain : 5 fiches tirées au sort par modèle, comparaison du verdict automatique à la page d'origine. Fait quand : accord noté dans `controle_echantillon.json` (clé `_sondage`). (Fait : mistral 5 accords sur 5 après correction du comparateur ; qwen 4 sur 5, le comparateur reste sévère sur un titre court exact.)

## 3. Documentation et décision

- [x] 3.1 README scraping (section Extraction sur échantillon), `scraping/CHANGELOG.md`, `CHANGELOG.md`, `CLAUDE.md`, `REPRISE.md`. Fait quand : fichiers relus.
- [ ] 3.2 Décision de Monsieur DUCOUT : lecture de `ECHANTILLON.md`, choix du moteur du passage global (modèle local ayant atteint le seuil, sinon estimation API au changement suivant). Fait quand : décision inscrite dans `CLAUDE.md` et `REPRISE.md`.

## Workflow follow-up

- Archiver après 3.2 ; changement suivant : passage global avec le moteur retenu, ou estimation API sur les 155 rubriques confirmées.
