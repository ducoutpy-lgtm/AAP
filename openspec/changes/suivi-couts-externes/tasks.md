# Tasks

Demande de Monsieur DUCOUT du 2026-10-21. Zéro euro. Règles : aucun `git push`, aucun archivage sans demande.

- [x] 6.1 `scripts/publier_couts.py` et test ; appel dans `veille.cmd` ; première recopie réelle (nombre de lignes
  collé ici).
  Fait le 2026-10-21 : `scraping/tests/test_publier_couts.py` 3 verts ; sur l'émulateur « 6433 lignes lues, 6433
  appels distincts, 0 deja en base, 6433 a ecrire » puis « 6433 appels ecrits », seconde passe « 6433 deja en base,
  0 a ecrire » (idempotence prouvée). Vrai projet : essai à blanc « 0 deja en base, 6433 a ecrire », recopie réelle
  faite le 2026-10-21 sur accord (« ok ») : « 6433 appels ecrits dans coutsIa », contrôle « 6433 deja en base, 0 a ecrire ».
  Règle `coutsIa` : déploiement refusé à la session par le garde-fou de l'outil (déploiement en production), commande
  remise à Monsieur DUCOUT, qui l'a lancée depuis `app` le 2026-10-21 : « released rules firestore.rules », « Deploy
  complete! » (lu dans son terminal).
- [x] 6.2 `utils/couts.ts` et test ; page `/admin/couts-ia` ; route, menu, bouton du tableau de bord ; lint, build ;
  page jouée sur les émulateurs (après recopie du journal dans l'émulateur).
  Fait le 2026-10-21 : lint exit 0, build vert, Vitest 91 verts (3 nouveaux). Page lue avec admin@test.local :
  cumul 13,631 euros pour 6 434 appels (sonnet du POC d'avril-juin 11,436 euros pour 363 appels, haiku 2,195 euros
  pour 6 071), mois en cours 2,195 euros face au plafond, étapes : extraction 12,311, tri 0,476, champ 0,456,
  contrôle 0,300, qualification 0,086, lecture de dossier 0,001 ; 11 fiches qualifiées sur l'émulateur, soit
  1,239 euro par fiche (valeur de l'émulateur, pas de la base réelle) ; table des 200 derniers appels filtrable.
- [x] 6.3 Documentation (`docs/resume_application_web_2026-10.md`, `scraping/README.md`, `CHANGELOG.md`, `CLAUDE.md`,
  `REPRISE.md`).
- [ ] 6.4 Monsieur DUCOUT ouvre `/admin/couts-ia` sur le vrai projet et retrouve les cumuls annoncés.
