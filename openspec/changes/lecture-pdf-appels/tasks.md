# Tasks

Question 8 de `docs/A_VALIDER.md`, « Oui, avec devis » (Monsieur DUCOUT, 2026-11-13) ; semaine 2 du plan.

- [x] 1.1 Cartographie en lecture seule (collecte, devis, liens PDF en jeu). Fait quand : carte écrite. (Fait le
  2026-11-13 : 575 liens PDF dans les 278 rubriques confirmées, aucun texte collecté ; pypdf absent.)
- [x] 1.2 `pypdf` installé (6.21.4) et ajouté à `scraping/requirements.txt`.
- [x] 1.3 Tests rouges sans réseau (`tests/test_lecture_pdf.py` : adresses, réponses, texte borné, téléchargement simulé
  par `httpx.MockTransport`, option `--pdf` de `liens_web`). Fait quand : test rouge collé. (Fait le 2026-11-13 :
  « 1 error during collection », module absent.)
- [x] 1.4 `scraping/lecture_pdf.py`, option `--pdf` de `extraction_locale.py --collecter`. Fait quand : suite verte. (Fait
  le 2026-11-13 : `scraping/tests` « 159 passed ».)
- [x] 2.1 Collecte gratuite des PDF des conférences des financeurs (31 sources sur 73 portent des liens PDF, 266
  liens). Fait quand : bilan collé. (Fait le 2026-11-13 : « 211 pages lues à ce passage. PDF : 202 lus, 52 sans texte
  ou introuvables » : 28 PDF scannés sans texte lisible, 24 introuvables, trop gros ou page d'erreur ; texte moyen
  d'environ 21 000 caractères.)
- [x] 2.2 Devis à blanc de l'extraction sur ces 31 sources. Fait quand : devis collé. (Fait le 2026-11-13 : « Devis :
  211 textes restants, 4,299,418 caractères ; [...] coût estimé 0.59 euros au plus (trois appels par texte) ; déjà
  dépensé pour ce modèle 2.873 euros ». Au-delà du reste de la délégation de la semaine (0,449 euro) : accord de
  Monsieur DUCOUT demandé, question 17 de `docs/A_VALIDER.md`.)
- [ ] 2.3 Sur son accord : extraction avec `--plafond 3.463` (cumul 2,873 plus devis 0,59), puis contrôle et
  qualification (devis à part, environ 0,07 euro), puis import en « à valider ».
- [ ] 3.1 Familles suivantes (collectivités, ministères, agences : 309 autres liens PDF), une par une, devis à chaque fois.
- [ ] 3.2 `--pdf` ajouté à la veille du lundi une fois le stock traité.
- [x] 4.1 Documentation : `scraping/README.md`, `scraping/CHANGELOG.md`, `docs/A_VALIDER.md`.
- [ ] 5.1 Vérification par Monsieur DUCOUT : fiches des conférences des financeurs tirées des PDF, dans `/admin/aaps` ;
  validation des bornes 20 Mo et 40 pages.
