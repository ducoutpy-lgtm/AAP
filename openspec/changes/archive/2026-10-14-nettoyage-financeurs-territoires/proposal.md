# Proposal

## Why

Constat de Monsieur DUCOUT le 2026-10-14 au soir sur les 420 fiches publiées : « les régions ne sont pas cohérentes,
plein d'AAP santé (ARS) qui ne sont pas labellisés santé, tu as mis un filtre financeur, il y a plein de doublons, ta
base de données est sale ». Mesuré dans la base : 203 noms de financeurs distincts pour 420 fiches, l'ARS
Île-de-France seule sous six orthographes ; 243 fiches sur 420 au territoire « france », valeur par défaut quand le
texte du territoire n'est pas reconnu (départements, villes) ; les fiches du passage local portent toutes la source
« extraction_locale » au lieu de leur émetteur du registre, ce qui empêche tout filtre par site d'origine ; 7 titres en
double (14 fiches). Le label santé manquant vient du classement du champ, fait pour 21 fiches seulement ce soir, le
reste après la fin du passage global (changement `filtre-champ-sante`).

## What Changes

- Source réelle : l'import écrit dans `scrapeMetadata.source` l'identifiant d'émetteur du registre porté par la fiche
  (`scrape_metadata.source`, par exemple `ars-normandie`) et son nom lisible dans `scrapeMetadata.sourceNom` ; le
  fichier d'origine reste dans `scrapeMetadata.fichier`.
- Financeur canonique : table `scraping/sources/financeurs.json` (nom canonique, alias, identifiant d'émetteur du
  registre) ; à l'import, `financeurName` devient le nom canonique quand le nom extrait ou l'émetteur correspond, le
  nom extrait est conservé dans `scrapeMetadata.financeurExtrait`. Les 18 ARS, la CNSA, l'INCa, l'Inserm, les CARSAT,
  les MSA et les fondations du registre y figurent.
- Territoire : table département -> région (101 départements) ; territoire déduit de l'émetteur quand la fiche n'en
  dit rien ou dit un département (ARS Normandie -> `normandie`, conseil départemental de l'Oise -> `hauts-de-france`,
  région -> elle-même) ; inconnu -> `non-precise` affiché « Territoire non précisé » (instruction 20), plus jamais
  « france » par défaut ; `france` réservé aux appels nationaux.
- Filtres de l'application : « Financeur » sur le nom canonique, « Source » (site d'origine) en plus, libellé
  « Territoire non précisé ».
- Doublons : rapport des titres en double par financeur après nettoyage, décision humaine fiche par fiche ; aucune
  fusion automatique dans ce changement.
- Ré-import pour appliquer les trois règles aux fiches existantes non validées (champs métier réécrits, décisions
  humaines intactes).

## Capabilities

### Modified Capabilities

- `import-aap-scrapes` : source réelle, financeur canonique, territoire déduit, plus de « france » par défaut.
- `consultation-aap-scrapes` : filtres Financeur canonique et Source.

## Impact

- Modifiés : `scripts/import_to_firestore.py` et ses tests, `app/src/pages/porteur/SearchAapPage.tsx`,
  `app/src/utils/territoires.ts`, `app/src/types/index.ts` (`sourceNom`, `financeurExtrait`, exigence explicite).
  Nouveaux : `scraping/sources/financeurs.json`, `scraping/sources/departements.json`, `scraping/financeurs.py`
  (construction de la table depuis le registre, rapport des noms non rattachés).
- Coût : aucun appel API ; ré-import dans la part gratuite ; une session.

## Hors périmètre

- La fusion automatique des doublons ; le classement du champ (changement `filtre-champ-sante`) ; le matching.
