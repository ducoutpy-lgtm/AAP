# Proposal

## Why

Le 2026-10-27, deux des trois appels transmis par Monsieur DUCOUT depuis LinkedIn manquaient parce que leur famille
d'émetteurs était absente du registre : l'appel Tubbe venait d'un gérontopôle (Gérond'if), et l'appel de la Fondation
Béatrice Denys n'est repris que par des relais régionaux de la recherche en santé (cancéropôles, pôles de santé). Le
changement `pages-a-un-seul-appel` a ajouté Gérond'if et cinq relais un par un ; la cause reste : trois familles ne sont
pas couvertes. Décision de Monsieur DUCOUT le 2026-10-28 : « continue surtout ».

## What Changes

- Trois familles ajoutées au registre, chacune adossée à une liste de référence dans `sources/annuaires/familles.json`
  pour mesurer sa couverture :
  - **Cancéropôles** : les sept cancéropôles labellisés par l'Institut national du cancer (brochure INCa) ; quatre sont
    déjà au registre, trois à ajouter (Nord-Ouest, Île-de-France, Grand Sud-Ouest).
  - **Pôles de compétitivité santé** : les six pôles du réseau « Pôles Santé » (annuaire des pôles du ministère de
    l'Économie) : Atlanpole Biotherapies, Clubster NSL, Eurobiomed, BioValley France, Lyonbiopôle, Medicen Paris Region.
  - **Gérontopôles** : liste de l'Union des gérontopôles de France (https://uniondesgerontopoles.fr/les-gerontopoles/,
    12 gérontopôles avec leur site, plus La Réunion et la Martinique annoncées le 19 octobre 2026 : 14, chiffre de la
    page d'accueil de l'Union). Gérond'if est déjà au registre. Le gérontopôle du CHU de Toulouse, absent de la liste de
    l'Union et sans site, n'est pas inscrit.
- Pour chaque membre : page d'appels à projets ou d'actualités vérifiée au navigateur, inscrite en rubrique confirmée
  (`url_validee`) ; un membre sans page d'appels est inscrit « identifiée » avec la raison. Découverte, veille et
  collecte (gratuites), puis devis de l'extraction.
- Pourquoi des familles entières plutôt que les seuls émetteurs vus sur LinkedIn : un relais publie aussi les appels des
  autres financeurs de sa région ; la couverture mesurée dit ce qui manque encore.
- Hors périmètre : connecteur du portail européen Funding & Tenders (changement suivant), lecture de LinkedIn,
  extraction payante sans devis accepté, autres familles (GIRCI, instituts Carnot, IHU).

- **Liens d'un relais vers les financeurs** (constat de la première découverte du 2026-10-28) : champ `relais: true` au
  registre ; la découverte et la veille gardent alors aussi les liens d'appel vers d'autres sites (voir `design.md`).

## Capabilities

### Modified Capabilities

- `registre-sources` : couverture des familles de relais régionaux de la santé ; champ facultatif `relais`.
- `decouverte-rubriques-aap` : liens d'un relais vers les sites des financeurs.

## Impact

- Données : `scraping/sources/registre.json`, `scraping/sources/annuaires/familles.json` et trois extraits
  `sources/annuaires/*.csv` (colonne `id_registre`), `REGISTRE_SOURCES.md`, `DECOUVERTE.md`.
- Code : `decouverte.py`, `rejeu.py`, `registre.py` (réglage `relais`), tests associés.
- Coût : zéro euro jusqu'au devis de l'extraction, présenté avant tout passage.
