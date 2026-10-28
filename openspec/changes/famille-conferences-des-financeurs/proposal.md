# Proposal

## Why

Lot B1 du pilote MVP (`docs/PILOTE_MVP.md`, plan accepté par Monsieur DUCOUT le 2026-10-28, « Oui, continue » après le
lot A) : couvrir les **conférences des financeurs de la prévention de la perte d'autonomie** (CFPPA). Ce sont les
financeurs les plus proches des cibles d'AAP Santé (EHPAD, SSIAD, services à domicile, résidences autonomie), avec un
appel par département chaque année, lancé le plus souvent entre septembre et janvier pour l'année suivante : la saison
est en cours (éditions 2027 du Gard, des Pyrénées-Orientales, des Hautes-Pyrénées, de la Creuse, de l'Orne déjà vues).

État mesuré le 2026-10-28 (script de lecture seule sur `registre.json`, `departements.json` et
`decouverte/*/liens.json`) : les 101 départements sont au registre, mais le plus souvent par leur seule page d'accueil
(« CFPPA et AAP du Département ... rubrique AAP à préciser ») ; 22 départements ont un lien d'appel CFPPA repéré par la
découverte ; 4 autres ont une source dédiée (Drôme, Alsace pour le 67 et le 68, Rhône) ; 75 restent sans page CFPPA
connue. La famille figure dans `familles.json` (total 101) sans extrait ni couverture mesurée.

## What Changes

- **Liste de référence** `scraping/sources/annuaires/conferences_financeurs.csv` : une ligne par département (101) plus
  la Métropole de Lyon, qui a sa propre conférence ; colonnes `code;departement;id_registre;page;motif`. La couverture
  de la famille devient mesurée (`registre.py --tableau`).
- **Page CFPPA de chaque département**, cherchée par recherche web puis relue, inscrite au registre selon une règle fixe
  (voir `design.md`) : rattachement à la source du département quand elle liste déjà l'appel, adresse validée posée sur
  la source du département quand la page stable est sa rubrique « appels à projets » et qu'aucune adresse n'y est encore
  validée, sinon source dédiée `<departement>-commission-des-financeurs`. Un département sans page reste sans
  `id_registre`, avec le motif.
- Découverte, veille et collecte (gratuites) des sources touchées, puis extraction, contrôle et qualification dans la
  délégation du pilote (devis, `--plafond`), import en « Proposée, non relue ».
- **Mesure des appels publiés seulement en PDF** : la collecte écarte les fichiers (`extraction_locale.liens_web`, règle
  de l'échantillon du 2026-10-13) ; le nombre de départements dont l'appel CFPPA n'existe qu'en PDF est compté et
  rapporté. Aucune lecture de PDF n'est ajoutée ici : si la mesure le justifie, changement séparé.
- Hors périmètre : fondations abritées et famille Recherche (lots B2 et B3), lecture des PDF, toute modification du
  schéma `AapNormalized` ou du type `AAP`.

## Capabilities

### Modified Capabilities

- `registre-sources` : couverture mesurée des conférences des financeurs.

## Impact

- Données : `scraping/sources/registre.json`, `scraping/sources/annuaires/familles.json`,
  `scraping/sources/annuaires/conferences_financeurs.csv`, `scraping/REGISTRE_SOURCES.md`.
- Code : aucun prévu (les réglages `url_validee` et `page_appel` existent).
- Coût : zéro euro jusqu'à l'extraction ; extraction, contrôle et qualification dans la délégation du pilote
  (0,20 euro par commande, 0,50 euro par semaine), chaque commande avec son devis et `--plafond`.
