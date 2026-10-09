# Proposal

## Why

À la relecture du registre (334 sources), Monsieur DUCOUT a transmis une liste de familles
manquantes : caisses et services de l'État au niveau local (CAF, CPAM, préfectures, DREETS et
DDETS, DRAAF), groupes de protection sociale, instituts hospitalo-universitaires et GIRCI, portes
d'entrée européennes régionales, fédérations et réseaux qui relaient des appels difficiles à
repérer, et plateformes de dépôt. Ces émetteurs portent des appels locaux concrets que la
plateforme doit couvrir pour tenir sa promesse d'exhaustivité.

## What Changes

- Ajout au registre, via l'annuaire officiel de l'administration (DILA), de tous les organismes
  locaux des types CAF, CPAM, Carsat, MSA, préfectures (et de région), DREETS, DDETS, DDETSPP,
  DRAAF et MDPH, un par site web.
- Ajout manuel : CNAF, groupes de protection sociale, 12 IHU, 6 GIRCI, cancéropôles, portail
  santé de la Commission européenne, fonds européens régionaux et programmes Interreg
  transfrontaliers, fédérations et réseaux (handicap, enfance, personnes âgées, psychiatrie,
  aide à domicile, Uriopss, promotion de la santé), presse et veilles spécialisées, plateformes
  de dépôt (Démarches simplifiées, Démarche numérique, Dauphin, Le Compte Asso).
- Contrôle des pages et régénération du tableau.

## Capabilities

### New Capabilities
(aucune)

### Modified Capabilities
- `registre-sources` : la couverture minimale inclut désormais les services déconcentrés de
  l'État et les caisses locales.

## Impact

- `scraping/sources/registre.json`, `scraping/REGISTRE_SOURCES.md`. Aucun code modifié.
- Documentation : CHANGELOGs, CLAUDE.md.

## Hors périmètre

- Trouver la rubrique « appels à projets » de chaque organisme local : les adresses sont les
  sites officiels ; les connecteurs le préciseront.
- Toute extraction ou appel d'API.

## Coût estimé

- 0 euro. Environ 1 heure, dont le contrôle automatique des pages.
