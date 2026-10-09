# Proposal

## Why

L'objectif de la reprise d'octobre 2026 est une démo testable de bout en bout : les appels à
projets (AAP) collectés par le scraping doivent être visibles dans l'application web. Aujourd'hui,
les trois briques existent séparément (105 AAP en JSON dans `scraping/results/`, un script
d'import écrit mais jamais exécuté contre la base réelle, une application qui sait afficher des
AAP) mais rien ne les relie : aucun AAP scrapé n'a jamais été affiché dans l'application.

## What Changes

- L'import des JSON scrapés vers la base Firestore du projet `aapi-11bc3` est exécuté et validé
  pour de vrai, avec un mode « essai à blanc » qui n'écrit rien.
- Les AAP clos (date de clôture passée) et les AAP sans date de clôture sont importés eux aussi :
  les données datent de juin 2026 et un seul AAP sur 105 est encore ouvert ; sans eux, la démo
  n'afficherait qu'un AAP. Choix validé par Monsieur DUCOUT le 2026-10-09.
- Un AAP dont la date de clôture est passée est signalé « Clôturé » dans la liste et la fiche,
  au lieu d'un nombre de jours négatif.
- Un compte « porteur » d'essai permet de parcourir les AAP scrapés : liste, filtres, fiche,
  lien vers la page d'origine du financeur.
- Documentation : procédure pas à pas pour rejouer la démo (README), état d'avancement (CLAUDE.md).

## Capabilities

### New Capabilities
- `import-aap-scrapes` : chargement des AAP scrapés dans la base de l'application (rejouable,
  sans doublon, options pour les AAP clos et sans date).
- `consultation-aap-scrapes` : affichage des AAP scrapés pour un porteur de projet (liste,
  fiche, indication « Clôturé », lien vers la source).

### Modified Capabilities
(aucune : le projet n'a pas encore de spécification)

## Impact

- `scripts/import_to_firestore.py` : corrections éventuelles constatées lors du premier import réel.
- `app/src/pages/porteur/SearchAapPage.tsx` et `AapDetailPage.tsx` : indication « Clôturé ».
- Base Firestore `aapi-11bc3`, collection `aap` : environ 89 documents distincts (les doublons
  ARS IDF / ARS IDF local ont la même signature et ne comptent qu'une fois).
- Secrets fournis par Monsieur DUCOUT uniquement, jamais commités : `app/.env` (paramètres web
  Firebase) et `scripts/serviceAccountKey.json` (clé de compte de service).

## Hors périmètre

- Relancer le scraping (données fraîches) : changement séparé, coût API estimé 3 à 5 euros.
- Nouvelles sources (sante.gouv, ameli, autres ARS).
- Cloud Functions, Stripe, tests automatisés de l'application, pages placeholder.
- Toute modification du schéma `AapNormalized` ou du type `AAP`.
- Émulateur Firebase local : écarté, le projet réel existe déjà et l'application y est configurée.

## Coût estimé

- API Anthropic : 0 euro (aucun scraping).
- Firebase : 89 documents, offre gratuite Spark suffisante.
- Temps : environ 3 à 4 heures, dont 30 minutes de manipulations dans la console Firebase par
  Monsieur DUCOUT.
