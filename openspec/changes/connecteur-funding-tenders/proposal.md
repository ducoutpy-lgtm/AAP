# Proposal

## Why

Le portail européen Funding & Tenders publie tous les appels de la Commission européenne, mais c'est une application
chargée par script : la découverte n'y lit aucun lien d'appel (constat du 2026-10-21). Les appels européens de santé
n'entrent donc dans la base que par des relais (Lyonbiopôle, Biotech Santé Bretagne), avec le relais pour financeur,
sans date ou avec une date lue dans un résumé (cas I3-2026-INV2a, 2026-10-27). Lot A1 du plan accepté par Monsieur
DUCOUT le 2026-10-28.

Sonde du 2026-10-28 : l'interface de recherche publique du portail (`api.tech.ec.europa.eu/search-api`, clé publique
« SEDIA ») renvoie tous les appels ouverts ou à venir (1 209 résultats, 1 046 appels distincts, 13 pages de 100), avec
identifiant, titre, dates d'ouverture et de clôture, budget par action, type d'action, lien officiel. 49 relèvent de
programmes de santé (31 ouverts, 18 à venir).

## What Changes

- Nouveau connecteur `scraping/funding_tenders.py`, sur le modèle de `portail_recherche.py` : une lecture de
  l'interface, page par page, sans navigateur ni modèle ; une fiche `AapNormalized` par appel de santé dans
  `results/funding_tenders.json`. Pourquoi sans modèle : les données sont structurées, aucune fabrication possible,
  coût nul.
- Appels retenus : identifiant commençant par `HORIZON-HLTH` (pôle santé d'Horizon Europe), `EU4H` (EU4Health),
  `HORIZON-JU-IHI` (Initiative en santé innovante), `HORIZON-JU-GH-EDCTP3` (santé mondiale), ou `HORIZON-MISS-*-CANCER`
  (mission cancer). Champ `sante` posé par le connecteur.
- Financeur : « Commission européenne » suivi du programme ; date de clôture : la première date limite à venir
  (appels en deux étapes) ; montants : contribution minimale et maximale par projet lues dans le budget de l'action.
- Source au registre : `portail-funding-tenders-commission-europeenne` (déjà inscrite), rattachée au connecteur.
- Import : fiches nouvelles en brouillon, validation « proposee », comme les autres imports du pilote.
- Hors périmètre : programmes non spécifiques à la santé (I3, Digital, ESF+, SOCPL : extension possible avec classement
  du champ par le modèle), traduction des titres anglais, suppression des fiches relayées en double (lot A2, doublons).

## Capabilities

### New Capabilities

- `connecteur-funding-tenders` : lecture des appels européens de santé depuis l'interface publique du portail.

## Impact

- Code : `scraping/funding_tenders.py`, `scraping/tests/test_funding_tenders.py`, `scraping/veille.cmd` (appel du
  connecteur, comme `portail_recherche.py`).
- Coût : zéro euro pour la lecture ; la qualification par Haiku (filtres de l'application) reste dans le budget du
  pilote (quelques centimes pour une cinquantaine de fiches).
