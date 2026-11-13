# Tasks

Questions 3 ter et 7 de `docs/A_VALIDER.md`, « Oui, les deux » (Monsieur DUCOUT, 2026-11-13). Zéro euro.

- [x] 1.1 Tests rouges : Axe 3 et Axe 5 du même financeur et de même clôture non rapprochés ; deux « Axe 5 » rapprochés.
  Fait quand : pytest rouge collé. (Fait le 2026-11-13 : « 2 failed, 5 passed », `AttributeError` sur
  `numero_axe`, et l'ancien test « Département du Rhône ».)
- [x] 1.2 `doublons.numero_axe` et règle dans `meme_appel`. Fait quand : tests verts. (Fait le 2026-11-13 : « 7 passed ».)
- [x] 1.3 Test `test_six_orthographes_un_financeur_nom_extrait_conserve` sur un nom vraiment inconnu. Fait quand : suite
  `scripts/tests` entièrement verte. (Fait le 2026-11-13 : « 40 passed » ; `scraping/tests` « 150 passed ».)
- [x] 2.1 `python scripts/doublons.py --file` (lecture seule de la base). Fait quand : décompte collé et l'Axe 3 absent
  de tout groupe. (Fait le 2026-11-13 : « 499 fiches comparées ; 48 groupes (111 fiches) » (49 groupes avant) ;
  63 fiches à rejeter, 30 « draft / proposee » et 33 « published / validee » ; aucune ligne « Axe 3 » ni groupe
  « Axe 5 » dans `docs/DOUBLONS.md`.)
- [x] 3.1 Documentation : `CHANGELOG.md`, `docs/A_VALIDER.md`, `REPRISE.md`.
- [ ] 4.1 Vérification par Monsieur DUCOUT : `docs/DOUBLONS.md` ne propose plus de rejeter l'« Axe 3 » du Pas-de-Calais.
