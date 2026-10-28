# Tasks

Lot A3 du pilote (plan accepté par Monsieur DUCOUT le 2026-10-28). Zéro euro.

- [x] 1.1 Tests rouges : Commission européenne lue entre parenthèses chez Lyonbiopôle, INCa chez CLARA, appel propre au
  relais inchangé, source ordinaire inchangée. Fait quand : pytest rouge collé. (Fait le 2026-10-28 : « 2 failed, 10
  passed » (`AttributeError`), puis test d'intégration à l'import rouge.)
- [x] 1.2 `financeurs.financeur_reel_du_relais`, appel dans `import_to_firestore.to_app_aap`. Fait quand : tests verts.
  (Fait le 2026-10-28. Deux corrections en route, chacune prouvée : le vrai référentiel contient « Horizon Europe –
  Cluster Santé (PCN France) », préféré à tort par la règle « le plus long gagne » : le financeur cité le premier gagne
  désormais ; « financé par la Région Auvergne-Rhône-Alpes » donnait « Rhône » (alias d'un mot d'un département) : un
  nom d'un seul mot de collectivité, d'ARS ou de ministère est écarté (test rouge puis vert). Scraping « 147 passed » ;
  scripts « 38 passed », plus l'échec ancien déjà signalé.)
- [x] 2.1 `scripts/corriger_financeur_relais.py` : essai à blanc collé (corrigées, sans information), puis `--reel`
  avec sauvegarde, relecture en base. (Fait le 2026-10-28 : « 10 fiches à corriger, 36 restent au nom du relais » ;
  relecture de chaque correction : 4 Commission européenne, 3 Horizon Europe – Cluster Santé (PCN France), Bpifrance,
  Ligue contre le cancer, INCa ; `--reel` : sauvegarde `scripts/sauvegardes/financeur_relais_2026-10-28_1229.json`,
  « 10 / 10 fiches relues avec le nouveau financeur ». Parmi les 36 : appels propres aux relais (Cancéropôle Nord-Ouest,
  Gérontopôle Sud…) et appels relayés sans financeur cité (FEDER, Pack relocalisation AURA, EIT Health, MATWIN).)
- [x] 3.1 Documentation : `scraping/CHANGELOG.md`, `README.md`, `REPRISE.md`, `docs/A_VALIDER.md`, `docs/PILOTE_MVP.md`.
- [ ] 4.1 Vérification par Monsieur DUCOUT : dans `/admin/aaps`, les appels Horizon Europe repris par Lyonbiopôle
  affichent « Commission européenne ».
