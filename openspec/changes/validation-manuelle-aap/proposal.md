# Proposal

## Why

Monsieur DUCOUT veut juger lui-même, dans son propre navigateur et sans compte, ce que les robots
ont trouvé : la page des appels à projets gardée pour chaque source (étape 2 de la feuille de
route), puis les liens repérés sur ces pages (est-ce un appel à projets ?). Ses verdicts et ses
commentaires sont la vérité de référence du projet : ils corrigent le registre et serviront
d'exemples aux modèles. Un outil a été construit « en essai » le 2026-10-13 hors OpenSpec ; ce
changement le met sous spécification, avec des scénarios que Monsieur DUCOUT rejoue, conformément
à la règle « Preuve avant affirmation » de CLAUDE.md.

## What Changes

- `scraping/validation.py` : serveur local (bibliothèque standard, port au choix) servant une page
  de validation. Trois modes : `--pages` (page gardée de chaque rubrique confirmée), `--liens`
  (liens repérés sur ces pages, avec `--echantillon N` pour une première passe d'un lien par source
  et `--source <id>` pour une seule source), et par défaut les fiches extraites d'un fichier de
  résultats. Pourquoi un serveur local : le verdict doit être écrit sur le disque du poste, sans
  service extérieur ni dépense.
- Pour chaque élément : la page officielle dans une fenêtre séparée (ou dans un cadre, au choix,
  mémorisé par le navigateur), le texte de la page lu par le serveur (beaucoup de sites publics
  refusent l'affichage dans un cadre), un champ de commentaire enregistré par Entrée, des boutons
  numérotés et les touches correspondantes, flèches pour revenir en arrière.
- Verdicts écrits à chaque clic dans un fichier par mode (`results/validation_pages.json`,
  `results/validation_liens.json`, `results/validation_manuelle.json`), clé = adresse, avec
  commentaire et date ; une relance reprend au premier élément non jugé.
- Deux lanceurs `validation_pages.cmd` et `validation_manuelle.cmd` (raccourcis sur le bureau).
- Les liens cassés (gabarits non remplis par le site) sont écartés de la liste.

## Capabilities

### New Capabilities

- `validation-manuelle-aap` : validation humaine des pages et des liens, verdicts tracés.

### Modified Capabilities

Aucune.

## Impact

- Nouveaux : `scraping/validation.py`, `scraping/validation_pages.cmd`, `scraping/validation_manuelle.cmd`,
  `scraping/tests/test_validation.py`.
- Modifiés : README scraping, CHANGELOGs, CLAUDE.md, REPRISE.md, feuille de route.
- Coût : zéro euro. Temps de Monsieur DUCOUT : environ une demi-minute par page, une minute par lien.

## Hors périmètre

- L'application des verdicts au registre (correction de `url_aap`) et la recherche web des pages
  manquantes : changement `recherche-page-aap-par-source`.
- La grille de critères détaillée pour les liens (nature, thème, état, destinataires) : proposée,
  à décider après la première passe.
- L'usage des verdicts comme exemples pour les modèles.
