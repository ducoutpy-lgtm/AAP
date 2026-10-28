# Tasks

Lot A2 du pilote (plan accepté par Monsieur DUCOUT le 2026-10-28). Zéro euro.

- [x] 1.1 Tests rouges (`scripts/tests/test_import_to_firestore.py`) : code de programme, date et mots distinctifs,
  deux appels différents au titre proche, fiche à garder. Fait quand : pytest rouge collé. (Fait le 2026-10-28 :
  « 4 failed, 1 passed ».)
- [x] 1.2 `scripts/doublons.py --file` : lecture des publiées et des brouillons « proposee », règles, fiche à garder,
  rapport `docs/DOUBLONS.md`. Fait quand : tests verts, sortie collée. (Fait le 2026-10-28 : « 37 passed » ; un échec
  ancien hors sujet, `test_six_orthographes_un_financeur_nom_extrait_conserve`, échoue déjà sur le commit du 2026-10-23
  (vérifié dans une copie de travail) : le registre rattache désormais « Département du Rhône » ; signalé dans
  `docs/A_VALIDER.md`, non modifié.)
- [x] 2.1 Rapport réel sur la base : nombre de groupes et de fiches collé ; scénarios « Première Usine » et appel
  européen relayé vérifiés dans `docs/DOUBLONS.md`. (Fait le 2026-10-28 : « 486 fiches comparées ; 47 groupes (109
  fiches) » ; 62 à rejeter, dont 29 dans la file (25 % des 116) et 33 publiées ; « Première Usine » : Bpifrance gardée,
  Lyonbiopôle à rejeter ; HORIZON-HLTH-2027-01-DISEASE-08 : fiche du connecteur gardée, relais Lyonbiopôle à rejeter.
  Correctif en cours de route, test rouge puis vert : une fiche du financeur lue en suivant un relais est gardée pour son
  vrai financeur (raison « financeur réel »).)
- [x] 3.1 Documentation : `scraping/CHANGELOG.md`, `README.md` (section import), `REPRISE.md`, `docs/A_VALIDER.md`.
- [ ] 4.1 Vérification par Monsieur DUCOUT : il ouvre `docs/DOUBLONS.md` et rejette dans `/admin/aaps` les fiches non
  gardées.
