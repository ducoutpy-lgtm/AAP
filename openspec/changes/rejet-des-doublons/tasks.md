# Tasks

Question 3 bis de `docs/A_VALIDER.md`, « La séance, avec sauvegarde » (Monsieur DUCOUT, 2026-11-13). Zéro euro.

- [x] 1.1 Test rouge : fiche « rejeter » archivée et « rejetée » au nom de la séance, fiche relue épargnée, Axe 3 non
  rejeté. Fait quand : pytest rouge collé. (Fait le 2026-11-13 : « 1 failed », module absent.)
- [x] 1.2 `scripts/rejeter_doublons.py` (essai à blanc par défaut, `--reel`, sauvegarde, relecture). Fait quand : tests
  verts. (Fait le 2026-11-13 : `scripts/tests` « 41 passed ».)
- [x] 2.1 Essai à blanc sur la base réelle. Fait quand : décompte collé. (Fait le 2026-11-13 : « 499 fiches comparées ;
  63 à rejeter (draft / proposee : 30, published / validee : 33) » ; « Relues par Monsieur DUCOUT, à trancher par lui : 0 » ;
  « Essai à blanc : rien n'a été écrit. » Les 33 publiées ont été validées par le modèle (`claude-haiku-5-5`), aucune par
  Monsieur DUCOUT.)
- [ ] 2.2 BLOQUÉE le 2026-11-13 : la relecture du rapport montre de faux doublons (appels « ESMS numérique » de plusieurs
  ARS, une par région ; trois collèges distincts de la CRSA de Mayotte ; deux appels différents de l'ARS Guyane, dont le
  fonds d'amorçage ouvert jusqu'au 2027-03-31), 18 fiches environ d'après leurs adresses (`docs/DOUBLONS.md` lignes 94-101,
  289-296, 311-316). Corriger d'abord le rapprochement (financeurs de territoires différents jamais rapprochés, adresses
  d'objets différents), régénérer le rapport, puis passage réel après son « oui » dans la conversation :
  `python scripts/rejeter_doublons.py --reel`. Fait quand : sauvegarde `scripts/sauvegardes/doublons_<date>.json` et
  relecture en base collées.
- [ ] 3.1 Documentation : `CHANGELOG.md`, `docs/A_VALIDER.md`, `REPRISE.md`, liste remise à Monsieur DUCOUT.
- [ ] 4.1 Vérification par Monsieur DUCOUT : `/aap/search` affiche 345 appels (378 moins 33) ; la file « à valider »
  compte 91 fiches (121 moins 30).
