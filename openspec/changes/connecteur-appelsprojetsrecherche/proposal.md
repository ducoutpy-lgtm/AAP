# Proposal

## Why

Le portail appelsprojetsrecherche.fr (ANR, Inserm, ANRS, Anses, INCa, ADEME et vingt autres partenaires) publie
125 appels de recherche, dont une vingtaine en santé encore ouverts (INCa, ANRS, Cancéropôle Île-de-France, GIRCI,
Fondation de France, Fondation pour l'Audition, Health Data Hub). Monsieur DUCOUT l'a constaté le 2026-10-21 ; la
découverte par mots-clés n'y voit que six liens, car la liste se charge par pages à adresse codée et les liens
s'intitulent « Lire la suite ». Le portail offre un export CSV complet (« Exporter la recherche ») : partenaire,
titre, description, dates de publication, d'ouverture et de clôture, lien de la fiche. Décision de Monsieur DUCOUT :
« 1 oui ».

## What Changes

- `scraping/portail_recherche.py` : lit `https://www.appelsprojetsrecherche.fr/export-csv` (une requête, sans
  navigateur ni IA), construit une fiche `AapNormalized` par ligne (titre, financeur = partenaire, description, dates,
  adresse de la fiche sur le portail) et écrit `scraping/results/appelsprojetsrecherche.json`, lu par l'import comme
  les connecteurs existants. Pourquoi le CSV plutôt que les pages : les dates y sont structurées (pas d'extraction
  par le modèle, zéro euro, aucune fabrication possible) et une seule requête remplace 125 pages.
- Le classement du champ (santé, médico-social, hors champ) reste fait par `champ.py` avec Haiku, après devis ;
  contrôle et qualification suivent la chaîne habituelle sur les fiches ouvertes.
- `veille.cmd` appelle le script chaque semaine avant l'import ; les lignes disparues du CSV sont marquées absentes
  comme pour les autres sources (mécanisme `absences` de l'import).
- Hors périmètre : lecture des pages de détail du portail (montants, pièces attendues), pièces jointes, autres
  portails.

## Capabilities

### New Capabilities

- `connecteur-appelsprojetsrecherche` : fiches du portail construites depuis son export CSV.

## Impact

- Code : `scraping/portail_recherche.py`, `scraping/tests/test_portail_recherche.py`, `scraping/veille.cmd`,
  README scraping, CHANGELOG.
- Coût : zéro euro pour la lecture ; classement du champ par Haiku environ 0,03 euro pour les 125 lignes la première
  fois, puis quelques centimes par semaine (lignes nouvelles seulement). Devis écrit avant chaque appel.
