# Recopie des coûts sans relire la base

## Pourquoi

Le quota gratuit de Firestore est de 50 000 lectures par jour ; il a été épuisé le 2026-11-26 vers 14 h (site vide
jusqu'au lendemain 9 h). À chaque veille, `scripts/publier_couts.py` relit tous les documents « collecte » de `coutsIa`
pour savoir quelles lignes du journal sont déjà recopiées : 8 512 lectures le 26/11, un nombre qui croît chaque semaine
(une lecture par document, même avec `select([])`). Décision 5b de Monsieur DUCOUT (2026-11-27, question à boutons) :
« Oui, le nouveau seulement ».

## Ce qui change

- Le script garde, sur le PC, la liste des lignes déjà recopiées (`scraping/logs/couts_publies.txt`, ignoré par Git :
  identifiants seulement, aucune donnée personnelle). Il n'écrit que les lignes absentes de cette liste, sans lire
  Firestore.
- Sans cette liste (premier passage, PC neuf) ou avec `--relire-base`, il relit la base une fois, comme avant, puis
  écrit la liste.
- La liste n'est mise à jour qu'après une écriture réussie ; l'essai à blanc ne l'écrit pas.

## Hors périmètre

Les autres lectures complètes de la veille (`alertes.py`, `publier_chiffres.py`, `trier_file.py`).

## Coût estimé

Zéro euro. Environ 8 500 lectures Firestore de moins par veille, puis plus aucune pour ce script tant que la liste
existe.

## Risques

Un document de `coutsIa` effacé à la main dans la console ne serait pas recopié de nouveau : `--relire-base` reconstruit
la liste d'après la base. Écrire une ligne déjà présente (liste perdue) ne crée pas de doublon : l'identifiant vient du
contenu de la ligne.
