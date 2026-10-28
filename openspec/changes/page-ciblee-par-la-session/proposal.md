# Proposal

## Why

Le champ `url_validee` du registre est réservé aux adresses validées à l'écran par Monsieur DUCOUT
(`scraping/registre.py`, ligne 32 : « seul validation.py --appliquer-pages l'ecrit »). Au lot B1 (2026-10-28), la
session l'a posé sur 47 sources des conférences des financeurs, avec la mention « à confirmer à l'écran ». Trois de ces
sources (Landes, Oise, Seine-Saint-Denis) n'ont même pas été lues. La relecture du lot par un second modèle l'a relevé ;
Monsieur DUCOUT a accepté la correction (« Oui, corrige »), puis choisi le 2026-10-28 un « marqueur propre » plutôt qu'un
retrait pur et simple.

Pourquoi pas un retrait pur et simple : `url_validee` règle aussi la lecture. Sans elle, la découverte exige deux liens
d'appel au lieu d'un (`decouverte.reglages`), et le contrôle de format refuse `page_appel`. Jusqu'à 14 des 75
départements couverts ne seraient plus lus à la prochaine découverte complète.

## What Changes

- Nouveau champ facultatif du registre `page_ciblee` (avec `ciblee_par` et `ciblee_le`) : page d'appels trouvée par une
  session, en attente de la confirmation de Monsieur DUCOUT. Pourquoi trois champs : même forme que `url_validee`,
  `validee_par`, `validee_le`, déjà connue des outils et de la relecture.
- Adresse de travail : `url_validee`, sinon `page_ciblee`, sinon `url_aap`. Une page ciblée est lue comme une page
  validée : un lien d'appel suffit, `page_appel` est permis.
- Confirmation à l'écran : quand Monsieur DUCOUT juge « bonne page » une source à page ciblée, `--appliquer-pages`
  inscrit la page dans `url_validee` à son nom et retire la page ciblée. Pourquoi : sans ce passage, la mention « à
  confirmer » resterait vraie pour toujours.
- Migration des 47 sources du lot B1 : la valeur de `url_validee` passe dans `page_ciblee`, la provenance dans
  `ciblee_par` ; Landes, Oise et Seine-Saint-Denis passent « à vérifier » à la qualification.
- Hors périmètre :
  - les 25 autres sources dont `url_validee` a été posée par une session « à confirmer à l'écran » (2026-10-27 et
    2026-10-28 : cancéropôles, gérontopôles, pôles, FEHAP, Gérond'if, Turenne). Elles sont soumises à Monsieur
    DUCOUT ; la même migration leur sera appliquée sur son accord ;
  - les 4 adresses posées par une session avec son accord explicite (2026-10-21) ;
  - toute page d'appel nouvelle.

## Capabilities

### Modified Capabilities

- `registre-sources` : page ciblée par la session, distincte de l'adresse validée.
- `decouverte-rubriques-aap` : une page ciblée est lue comme une page validée.

## Impact

- Code : `scraping/registre.py`, `scraping/decouverte.py`, `scraping/validation.py`, tests.
- Données : `scraping/sources/registre.json` (47 sources), `scraping/REGISTRE_SOURCES.md`.
- Coût : zéro euro. Aucun appel au modèle ; la preuve de lecture rejoue la découverte (navigateur local, gratuit) sur
  deux sources.
