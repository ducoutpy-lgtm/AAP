# Tasks

Lot A1 du plan accepté par Monsieur DUCOUT le 2026-10-28. Zéro euro pour la lecture ; qualification dans le budget du
pilote (`docs/PILOTE_MVP.md`).

- [x] 1.1 Tests rouges `tests/test_funding_tenders.py` sur des réponses de l'interface écrites à la main : conversion
  d'un appel, première date à venir, programmes retenus et écartés, budget, doublon d'identifiant. Fait quand : pytest
  rouge collé. (Fait le 2026-10-28 : « 1 error during collection », module absent.)
- [x] 1.2 `scraping/funding_tenders.py` (lecture paginée, filtre, fiches, résumé, erreur réseau sans écriture). Fait
  quand : tous les tests verts, sortie collée. (Fait le 2026-10-28 : « 5 passed », suite complète « 140 passed ».)
- [x] 2.1 Passage réel : nombre d'appels lus et retenus collé ; registre (connecteur rattaché) ; `veille.cmd` appelle le
  connecteur. (Fait le 2026-10-28. Trois défauts trouvés au passage réel, chacun avec scénario et test rouge puis vert :
  le contrôle du modèle aurait retiré des dates et montants structurés (`verification.decision_du_modele`, moteur
  `api-portail`) ; 26 appels marqués ouverts par le portail avec des clôtures de 2023-2024 (écartés) ; lecture instable
  sans tri (deux lectures différaient de 190 appels ; tri par identifiant : 1 104 distincts, identiques) ; et la
  réécriture du fichier effaçait la qualification (reprise par identifiant). Résultat stable sur deux passages :
  « 1209 résultats lus, 24 appels de santé retenus, dont 24 ouverts » (pôle Santé 18, mission Cancer 6) ; 144 tests
  verts ; source `portail-funding-tenders-commission-europeenne` en « connecteur-teste ».)
- [x] 2.2 Qualification des fiches (budget du pilote, `--plafond`), import des fiches nouvelles en brouillon, validation
  « proposee » ; relecture en base. (Fait le 2026-10-28 : qualification de 22 fiches perdue par la réécriture (0,006
  euro), puis 24 fiches, `--plafond 2.670`, 0,006 euro, cumul 2,669 ; relance du connecteur puis devis : « 0 fiches à
  qualifier » ; import : « 24 créés », relus « draft, proposee : 24 ». Contrôle du modèle non lancé : données
  structurées.)
- [x] 3.1 Documentation : `scraping/README.md`, `scraping/CHANGELOG.md`, `CLAUDE.md`, `REPRISE.md`,
  `docs/PILOTE_MVP.md` (journal des dépenses).
- [ ] 4.1 Vérification par Monsieur DUCOUT : il relance `python scraping/funding_tenders.py`, lit le décompte, puis
  retrouve les appels européens de santé dans sa file « à valider ».
