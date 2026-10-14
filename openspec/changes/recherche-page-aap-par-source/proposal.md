# Proposal

Brouillon du 2026-10-13 matin, réécrit le 2026-10-13 soir après la validation à l'écran des 257 pages
par Monsieur DUCOUT (changement `validation-manuelle-aap`) et sa consigne « fais tout ».

## Why

Les 257 pages gardées par la découverte (146 confirmées par le modèle local, 111 exclues) ont
maintenant un verdict humain dans `results/validation_pages.json` : 181 bonnes pages, 47 mauvaises
pages avec l'adresse de la vraie rubrique, 10 pages mortes, 18 hors champ. Ces verdicts corrigent
le modèle (50 des 88 « hors santé » sont de bonnes pages) mais rien n'est encore reporté dans le
registre : la qualification en vigueur reste celle du modèle. Sans ce report, l'extraction des
appels (étape 3) partirait de 47 mauvaises adresses et ignorerait 62 bonnes sources.

## What Changes

- `validation.py --appliquer-pages` : lit les verdicts du mode « pages », retrouve les sources par
  l'adresse gardée dans `decouverte/resultats.json`, et écrit une relecture par source dans
  `sources/relecture_qualification.json` (mécanisme existant de la spec `qualification-sources`,
  relecteur « Monsieur DUCOUT, validation à l'écran »). Pourquoi ce fichier : une seule trace
  humaine, versionnée, déjà appliquée au registre par `qualification.py --registre --rapport`.
- Correspondance des verdicts : bonne page -> rubrique confirmée ; hors champ -> hors santé ;
  page morte -> à vérifier (adresse à retrouver) ; mauvaise page avec adresse -> `url_aap` corrigée
  dans le registre (ancienne adresse gardée dans les notes), rubrique confirmée, puis redécouverte
  de la source (`decouverte.py --ids ... --forcer`) pour rafraîchir la page et les liens.
- Les sources dont la découverte, après correction, garde une page d'un autre domaine que
  l'adresse donnée sont listées pour une nouvelle validation à l'écran.
- Les pages mortes et les 577 sources sans page sont cherchées ensuite par la recherche web de la
  session (méthode prouvée sur la vague 1 des fondations : adresse choisie dans les résultats,
  sonde code 200 et mot du nom, journal), sans moteur automatique (le moteur gratuit refuse,
  Google est fermé, Tavily est épuisé).

## Capabilities

### New Capabilities

Aucune.

### Modified Capabilities

- `qualification-sources` : la relecture manuelle peut venir des verdicts à l'écran et corriger
  l'adresse de la rubrique.
- `decouverte-rubriques-aap` : une source corrigée est redécouverte à la demande.

## Impact

- Modifiés : `scraping/validation.py` (fonction pure + option), `tests/test_validation.py`,
  `sources/relecture_qualification.json`, `sources/registre.json`, `REGISTRE_SOURCES.md`,
  `QUALIFICATION.md`, `DECOUVERTE.md`, `decouverte/resultats.json` (hors Git), README scraping,
  CHANGELOGs, CLAUDE.md, REPRISE.md, feuille de route.
- Coût : zéro euro ; redécouverte de 47 sources, quelques minutes de navigateur.
- Aucun changement du schéma `AapNormalized` ni du type `AAP`.

## Hors périmètre

- L'extraction des appels (étape 3) et son moteur.
- La recherche des 577 sources sans page : tâche de fond de ce changement, lancée après le report
  des verdicts, lot par lot, avec validation à l'écran de chaque page proposée.
- Les agrégateurs à aspirer (changement à part).
