# Proposal

## Why

Lors de la validation de la démo (2026-10-09), Monsieur DUCOUT a constaté que la fiche d'un AAP
scrapé ne montre pas ses documents (cahier des charges, dossier de candidature, annexes). Pourtant,
72 des 105 AAP scrapés ont des pièces jointes, et leurs liens sont déjà enregistrés dans la base à
l'import ; l'application ne les affiche simplement pas.

## What Changes

- La fiche d'un AAP scrapé affiche une section « Pièces jointes » avec un lien par document,
  ouvert dans un nouvel onglet.
- Les fichiers déjà téléchargés par le scraping (117 Mo, `scraping/downloads/`) sont servis par
  l'application quand elle tourne sur le PC de Monsieur DUCOUT (démo locale). Historique du
  2026-10-09 : les sites des ARS répondent « Forbidden » à tout accès direct (39 documents sur une
  centaine) ; l'hébergement dans Firebase Storage a été codé puis bloqué (compte de facturation du
  projet fermé, forfait Blaze exigé) ; Monsieur DUCOUT a choisi la solution locale, sans frais, en
  gardant le code Storage pour un déploiement ultérieur.
- La liste de recherche indique le nombre de pièces jointes de chaque AAP.
- Le type `AAP` de l'application déclare le bloc `scrapeMetadata` (déjà écrit en base par l'import)
  pour que le code puisse le lire proprement. Ajout optionnel, sans effet sur les AAP saisis à la main.

## Capabilities

### New Capabilities
(aucune)

### Modified Capabilities
- `consultation-aap-scrapes` : nouvelle exigence « les pièces jointes d'un AAP scrapé sont
  consultables » (fiche et liste).

## Impact

- `app/src/types/index.ts` : champ optionnel `scrapeMetadata` sur `AAP`.
- `app/src/pages/porteur/AapDetailPage.tsx` : section « Pièces jointes ».
- `app/src/pages/porteur/SearchAapPage.tsx` : compteur de pièces jointes sur la carte.
- `scripts/import_to_firestore.py` : envoi des fichiers locaux vers Firebase Storage
  (`uploads/aap-documents/<id AAP>/<fichier>`, chemin déjà couvert par `storage.rules` : lecture
  réservée aux comptes connectés avec abonnement ou essai) et enregistrement du chemin dans
  `scrapeMetadata.fichiersJoints`.
- `app/public/documents` : lien vers `scraping/downloads` (ignoré par Git) ; aucun fichier dans Firebase.

## Hors périmètre

- Aperçu du PDF dans l'application, extraction du contenu, recherche dans les documents.
- Téléchargement de nouveaux fichiers : seuls ceux déjà présents dans `scraping/downloads/` sont
  hébergés ; un document absent du disque garde son lien d'origine.
- Pièces jointes des AAP saisis à la main par un financeur (autre circuit, déjà prévu ailleurs).

## Coût estimé

- API Anthropic : 0 euro. Firebase : aucun stockage, aucune facturation.
- Temps : environ 2 à 3 heures (révisé après la décision d'héberger les fichiers).
