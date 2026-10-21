# Tasks

Décision de Monsieur DUCOUT du 2026-10-21 (« ok pour améliorer les mots-clés, c'est-à-dire en ajouter »). Zéro euro.

- [x] 1.1 Test `test_score_lien_anglais_et_adresses` (lien anglais, code HORIZON-HLTH, « Lire la suite » vers /appel/,
  « Appel à communication » toujours à 0). Fait quand : pytest rouge collé. (Fait le 2026-10-21 : « assert 0 >= 3 » sur le lien anglais.)
- [x] 1.2 Listes `MOTS` et `TOKENS` complétées. Fait quand : `tests/test_decouverte.py` et `tests/test_rejeu.py` verts. (Fait le 2026-10-21 : « 15 passed in 3.01s ».)
- [x] 1.3 Redécouverte `--ids hadea-eu4health,horizon-europe-cluster-sante-pcn-france,appelsprojetsrecherche-fr --forcer
  --garder-depart`, puis `--rapport` : statut et nombre de liens par source collés. (Fait le 2026-10-21 : HaDEA rubrique-trouvee 20 liens ; appelsprojetsrecherche.fr rubrique-trouvee 6 liens (page d'accueil, tous ANR) ; Horizon Europe erreur ERR_CONNECTION_TIMED_OUT, troisième fois du jour.)
- [x] 1.4 Documentation : `scraping/README.md` (découverte : mots-clés), `scraping/CHANGELOG.md`, `CLAUDE.md`. (Fait le 2026-10-21.)
- [ ] 2.1 Vérification par Monsieur DUCOUT : il relance la commande de 1.3 sur HaDEA et lit « rubrique trouvée ».
