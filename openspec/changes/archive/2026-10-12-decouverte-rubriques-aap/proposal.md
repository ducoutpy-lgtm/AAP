# Proposal

## Why

Le registre compte 847 émetteurs, mais pour la plupart l'adresse enregistrée est le site officiel,
pas la rubrique où les appels à projets sont publiés. Écrire un connecteur par site est impossible
à cette échelle. Monsieur DUCOUT demande d'essayer sur les 847 sources, et rappelle son idée de
départ : télécharger les pages en local, puis les analyser à froid. C'est exactement l'étape à
construire : un robot générique qui, sans IA, trouve sur chaque site la rubrique « appels à
projets », collecte les liens vers les AAP et garde les pages en local pour l'extraction à venir.

## What Changes

- Un outil `scraping/decouverte.py` : pour chaque source du registre, ouvre la page enregistrée
  avec le navigateur piloté (même technique que les connecteurs, qui passe les sites refusant les
  robots simples), repère les liens dont le texte ou l'adresse évoque un appel à projets, visite
  les meilleurs candidats et retient la page qui contient le plus de liens vers des AAP.
- Pour chaque source : page retenue enregistrée en local, liste des liens d'AAP trouvés, statut
  (rubrique trouvée, aucune rubrique, site bloquant, erreur). Reprise possible après interruption.
- Un rapport `scraping/DECOUVERTE.md` : taux de rubriques trouvées par famille, nombre de liens
  d'AAP collectés, sites bloquants, pour décider de la suite.
- Lancement sur tout le registre, en arrière-plan, quelques pages en parallèle.

## Capabilities

### New Capabilities
- `decouverte-rubriques-aap` : repérage automatique, sans IA, des rubriques et des liens d'appels à
  projets sur les sites des sources, avec conservation locale des pages.

### Modified Capabilities
(aucune)

## Impact

- Nouveaux : `scraping/decouverte.py`, `scraping/tests/test_decouverte.py`, dossier
  `scraping/decouverte/` (pages et résultats, ignoré par Git), `scraping/DECOUVERTE.md`.
- Dépendances : Playwright et Chromium installés dans l'environnement `.venv` du dépôt.
- Aucun changement du registre, des connecteurs, de l'import ni de l'application.

## Hors périmètre

- L'extraction des champs d'un AAP (titre, dates, montants) : changement suivant, après un test
  comparatif sur échantillon (Claude Code, modèle local Ollama, API Claude).
- Télécharger un site entier : seules les pages candidates (accueil, rubriques, listing) sont
  gardées.
- Tout appel à l'API Anthropic.

## Coût estimé

- API Anthropic : 0 euro.
- Temps machine : environ 1 à 2 heures pour 847 sources (4 pages en parallèle, délais de
  politesse). Temps de travail : 3 à 4 heures.
