# Proposal

## Why

Le 2026-11-21, Monsieur DUCOUT a fait inscrire dans `CLAUDE.md` la règle « modèle local d'abord » : tout traitement en
lot non urgent tourne sur le modèle local, et l'API payante n'est utilisée que s'il la demande. La veille du lundi
(`scraping/veille_payante.py`, lancée par la tâche « AAP Sante - veille hebdomadaire ») faisait encore l'extraction, le
contrôle et la qualification avec Haiku, dans la délégation de 0,50 euro par semaine. Question posée le 2026-11-21 :
« Pour la veille de lundi, quel moteur utiliser ? » ; réponse : « Modèle local ».

## What Changes

- Par défaut, la veille extrait les pages web nouvelles, les contrôle et les qualifie avec `qwen3:8b` (Ollama), à zéro
  euro, sans devis ni plafond. Les fiches vont dans un fichier à part, `results/extraction_veille_locale.json`. Pourquoi
  un fichier à part : le fichier local d'octobre (`extraction_locale.json`, étiquette `v3-local`) reste figé, et celui
  de l'API garde son historique. Un texte déjà traité par l'API n'est pas refait.
- Import en « à valider » depuis ce fichier, puis tri de la file : la chaîne est inchangée, seul le moteur change.
- Sur batterie, les étapes du modèle local sont reportées à la veille suivante, avec un message dans le journal ; les
  textes restent en attente. Pourquoi : la carte graphique viderait la batterie, déjà en cause pour la chaîne des PDF.
- Pendant les étapes locales, Windows est prié de ne pas se mettre en veille, comme dans la chaîne des PDF.
- `veille.cmd` démarre Ollama s'il ne tourne pas (même commande que la chaîne des PDF).
- L'ancien chemin payant reste disponible sur demande : `veille_payante.py --reel --moteur api`, avec les mêmes devis et
  plafonds qu'avant.

Hors périmètre : la chaîne des PDF de nuit (inchangée), le nom du fichier `veille_payante.py` (gardé pour ne pas toucher
la tâche planifiée), toute mesure de qualité nouvelle.

Coût : zéro euro. Temps de calcul estimé : environ 2 min 30 par texte nouveau (extraction, contrôle, qualification ;
mesure du 2026-11-19), soit environ 2 heures pour 50 textes. Estimation, non mesurée sur une veille réelle.

## Capabilities

### Modified Capabilities

- `veille-autonome` : moteur local par défaut, report sur batterie.
