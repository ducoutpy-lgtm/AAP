# Proposal

## Why

Question 8 de `docs/A_VALIDER.md`, « Oui, avec devis » (Monsieur DUCOUT, 2026-11-13) ; semaine 2 du plan. Dans les 278
rubriques confirmées, 575 liens d'appel pointent vers un PDF (cahier des charges, avis d'appel) et sont écartés par la
collecte (`extraction_locale.liens_web`, extension `.pdf`) ; d'autres échouent dans le navigateur (`media/<id>/download`,
« texte trop court » ou `Error`). Dans 23 départements couverts, l'appel de la conférence des financeurs n'existe qu'en
PDF (estimation par mots-clés du lot B1).

## What Changes

- `scraping/lecture_pdf.py` : reconnaître un PDF (adresse, type de contenu, premiers octets « %PDF- »), le télécharger
  sans navigateur (httpx, 20 Mo au plus), en lire le texte avec `pypdf` (40 pages au plus, pages scannées sans texte :
  « PDF sans texte lisible »). Pourquoi `pypdf` : bibliothèque légère en pur Python, sans dépendance système ; pas de
  lecture optique (hors périmètre).
- `extraction_locale.py --collecter --pdf` : collecte aussi les liens PDF ; le texte est écrit au même format que celui
  d'une page web (dossier `fiches/`, en-tête `# collecte_le`), donc compté par le devis et lu par l'extraction sans
  autre changement. Sans `--pdf`, rien ne change.
- Le stock (575 liens) n'est pas collecté par la veille du lundi : son devis (1,8 à 4,7 euros estimés) dépasserait la
  délégation de 0,50 euro par semaine et bloquerait les pages web de la semaine. Il se traite par familles, devis écrit
  et accord de Monsieur DUCOUT avant tout appel payant, en commençant par les conférences des financeurs. La veille
  passera à `--pdf` une fois le stock traité.
- Choix à valider par Monsieur DUCOUT : 20 Mo et 40 pages au plus par fichier.
- Hors périmètre : lecture optique des PDF scannés ; doublon entre la page web d'un appel et son cahier des charges
  (deux adresses du même site, que le rapport des doublons ne rapproche pas) ; filtre des annexes et formulaires.

## Capabilities

### New Capabilities

- `collecte-pdf` : lecture du texte des appels publiés en PDF.

## Impact

- Code : `scraping/lecture_pdf.py`, `scraping/extraction_locale.py`, `scraping/requirements.txt` (`pypdf`), tests.
- Coût de la collecte : zéro euro. Extraction : devis par famille, sur accord.
