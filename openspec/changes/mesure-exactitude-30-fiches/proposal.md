# Proposal

## Why

Critère « Exactitude » du pilote (`docs/PILOTE_MVP.md`, validé « Oui, tels quels » le 2026-11-13) : tirage de 30 fiches
importées pendant le pilote, comparées à leur source par la session (dont 10 relues par Monsieur DUCOUT) sur le titre, le
financeur, la date limite et le montant ; seuil : 90 % de champs justes, aucune date inventée. Semaine 4 du plan. La
mesure n'a jamais été faite ; elle conditionne le passage à l'échelle payé.

## What Changes

- `scraping/exactitude.py` :
  - `--tirer` : 30 fiches de `results/extraction_api.json` produites pendant le pilote (2026-10-28 au 2026-11-11) et
    classées dans le champ (santé ou médico-social, celles que l'import publie dans la file), tirées au hasard avec une
    graine fixe (rejouable) ; écrit `results/exactitude_tirage.json` avec, pour chaque fiche, les quatre champs et le
    chemin du texte source que le modèle a lu. Constat du 2026-11-16 : 180 fiches produites le 2026-10-28, dont 102 dans
    le champ, toutes avec leur texte.
  - `--rapport` : lit les verdicts `sources/exactitude_verdicts.json` et écrit `EXACTITUDE.md` (part de champs justes par
    champ et au total, dates inventées, liste des écarts, les 10 fiches à relire par Monsieur DUCOUT).
- Verdicts écrits par la session, champ par champ, contre le texte source : `juste`, `faux`, `invente` (valeur absente
  du texte), `manque` (valeur présente dans le texte, champ vide), `vide-juste` (rien dans le texte, champ vide), avec
  la phrase du texte qui le prouve. Pourquoi le texte source et non la page d'aujourd'hui : la mesure porte sur la
  justesse de l'extraction ; une page modifiée depuis fausserait le résultat.
- Aucun appel payant. Un champ `vide-juste` compte comme juste.

## Hors périmètre

- Fiches extraites des PDF des conférences (13 et 14 novembre) : seconde mesure possible, à décider.

## Capabilities

### New Capabilities

- `mesure-exactitude` : tirage rejouable et rapport d'exactitude des fiches extraites.
