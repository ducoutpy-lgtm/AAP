# import-aap-scrapes Specification

## ADDED Requirements

### Requirement: Rejet des doublons avec sauvegarde

L'outil de rejet SHALL rejeter exactement les fiches que `docs/DOUBLONS.md` marque « rejeter », SHALL ne rien écrire
sans l'option `--reel`, SHALL écrire une sauvegarde complète des fiches touchées avant toute écriture, et SHALL ne
jamais rejeter une fiche relue par Monsieur DUCOUT.

#### Scenario: Essai à blanc

- **WHEN** Monsieur DUCOUT lance `python scripts/rejeter_doublons.py`
- **THEN** le terminal donne le nombre de fiches à rejeter par statut (file, publiées) et la liste, et se termine par
  « Essai à blanc : rien n'a été écrit »

#### Scenario: Passage réel

- **WHEN** il lance `python scripts/rejeter_doublons.py --reel`
- **THEN** un fichier `scripts/sauvegardes/doublons_<date>.json` contient les fiches avant modification, chaque fiche
  rejetée est « archivée » avec une validation « rejetée » qui cite la fiche gardée, et `/aap/search` affiche autant
  d'appels en moins que de fiches publiées rejetées

#### Scenario: Fiche relue protégée

- **WHEN** une fiche à rejeter porte une validation au nom de Monsieur DUCOUT
- **THEN** elle n'est pas modifiée et figure dans la liste « relues, à trancher par Monsieur DUCOUT »
