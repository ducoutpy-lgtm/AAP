# Tasks

« Oui, corrige-les » (Monsieur DUCOUT, 2026-11-13). Zéro euro.

- [x] 1.1 Test rouge : ESMS numérique de deux ARS, deux collèges de la CRSA de Mayotte, résidence autonomie et EHPAD
  aux capacités différentes non rapprochés ; relais Bpifrance et Lyonbiopôle rapproché. Fait quand : pytest rouge collé.
  (Fait le 2026-11-13 : « 1 failed, 41 passed ».)
- [x] 1.2 Règles territoires disjoints, même site et pages différentes, nombres disjoints dans `meme_appel`. Fait quand :
  suite verte. (Fait le 2026-11-13 : `scripts/tests` « 42 passed ».)
- [x] 2.1 `python scripts/doublons.py --file` (lecture seule). Fait quand : décompte collé et faux doublons absents.
  (Fait le 2026-11-13 : « 499 fiches comparées ; 39 groupes (82 fiches) », 43 fiches à rejeter (28 « draft / proposee »,
  15 « published / validee ») contre 63 ; aucune ligne ESMS numérique, CRSA de Mayotte, Guyane ni psychiatrie
  périnatale dans la liste du rejet.)
- [x] 2.2 Contrôle des 20 groupes rapprochés par la règle approximative sur leurs vraies pages (quatre lecteurs, lecture
  seule). Fait quand : verdict par fiche collé. (Fait le 2026-11-13 : 22 fiches, toutes le même appel que la fiche
  gardée : 14 sûres, 6 probables, 2 incertaines faute de page lisible (Challenge prévention de Bpifrance relayé par
  Lyonbiopôle ; Amorçage de jeunes équipes de la FRM, page du Cancéropôle Île-de-France disparue). Les 10 groupes à titre
  identique et les 9 groupes à code européen identique ne sont pas relus : règles exactes.)
- [x] 3.1 Documentation : `CHANGELOG.md`, `REPRISE.md`, `openspec/changes/rejet-des-doublons/tasks.md`.
- [ ] 4.1 Vérification par Monsieur DUCOUT : `docs/DOUBLONS.md` sans ESMS numérique ni CRSA de Mayotte.
