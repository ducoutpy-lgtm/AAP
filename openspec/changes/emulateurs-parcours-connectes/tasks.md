# Tasks

Décision de Monsieur DUCOUT du 2026-10-20 (« oui émulateurs »). Zéro euro, aucune écriture sur le vrai projet.

- [x] 1.1 Mode émulateurs (`.env.emulateurs`, scripts npm, `emulateurs_dev.cmd`, `launch.json`), option `--projet`
  de l'import, `scripts/semer_emulateurs.py`. Fait quand : émulateurs démarrés, semis affiché (trois comptes, nombre
  d'appels), `http://localhost:3001` ouvert et connexion du compte candidat jouée par la session (capture). (Fait le 2026-10-20 : émulateurs « All emulators ready », semis « 3 comptes, 85 appels », connexion candidat@test.local, tableau de bord « Bienvenue, EHPAD Les Lilas (test) » ; parcours complet joué : fiche, candidature en trois étapes avec une pièce déposée dans le stockage émulé, « Mes candidatures » colonne « Envoyée (1) », détail avec la pièce, tableau de bord « Mes candidatures 1 ».)
- [x] 1.2 Documentation : `app/README.md` (section émulateurs), `README.md` racine, `CLAUDE.md` (règle : parcours
  connectés joués par la session sur les émulateurs avant livraison), `CHANGELOG.md`, `REPRISE.md`.
- [ ] 1.3 Monsieur DUCOUT lance `app/emulateurs_dev.cmd` une fois et voit l'application sur le port 3001.
