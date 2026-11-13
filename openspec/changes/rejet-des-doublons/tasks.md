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
- [x] 2.2 Fait le 2026-11-13 à 17 h 44 sur son « Oui, les trois » : nouvel essai à blanc avant écriture (515 fiches
  comparées après l'import de la veille, 43 à rejeter ; dans la paire du Morbihan, la fiche gardée a changé : l'ARS
  Bretagne plutôt que la page relayée par « Pour bien vieillir Bretagne », même appel relu sur les pages) ; passage réel :
  « Sauvegarde : scripts\sauvegardes\doublons_2026-11-13_1744.json (43 fiches) », « Relecture en base : {'archived': 43}
  sur 43 fiches rejetées » ; base relue : 363 publiées (378 moins 15), 109 dans la file (137 moins 28), 436 rejetées.
  Historique : débloquée le 2026-11-13 après le changement `doublons-appels-distincts` : nouvel essai à blanc « 499 fiches
  comparées ; 43 à rejeter (draft / proposee : 28, published / validee : 15) », « Relues par Monsieur DUCOUT, à trancher
  par lui : 0 », « Essai à blanc : rien n'a été écrit » ; passage réel en attente de son « oui ». Historique : bloquée
  le même jour parce que la relecture du rapport montrait de faux doublons (appels « ESMS numérique » de plusieurs
  ARS, une par région ; trois collèges distincts de la CRSA de Mayotte ; deux appels différents de l'ARS Guyane, dont le
  fonds d'amorçage ouvert jusqu'au 2027-03-31), 18 fiches environ d'après leurs adresses (`docs/DOUBLONS.md` lignes 94-101,
  289-296, 311-316). Corriger d'abord le rapprochement (financeurs de territoires différents jamais rapprochés, adresses
  d'objets différents), régénérer le rapport, puis passage réel après son « oui » dans la conversation :
  `python scripts/rejeter_doublons.py --reel`. Fait quand : sauvegarde `scripts/sauvegardes/doublons_<date>.json` et
  relecture en base collées.
- [x] 3.1 Documentation : `CHANGELOG.md`, `docs/A_VALIDER.md`, `REPRISE.md` ; liste des 43 fiches dans la sauvegarde et
  dans `docs/DOUBLONS.md` (lignes « rejeter »).
- [ ] 4.1 Vérification par Monsieur DUCOUT : `/admin/aaps` compte 363 publiées et 109 « Proposée, non relue » ;
  `/aap/search` affiche les appels ouverts et sans date parmi les 363 (option « Tous, clôturés compris » : 363).
