# Tasks

Jour 3 du plan MVP. Zéro euro. Règles : aucun secret affiché ni commité (`scraping/.env` ignoré par Git), aucun
`git push`, aucun archivage sans demande.

- [x] 3.1 `scraping/courriel.py`, `scraping/alertes.py`, tests ; `.env.example` ; `veille.cmd`. Fait quand : pytest
  vert ; `alertes.py --admin --candidats --dry-run` écrit les courriels dans `logs/courriels/` (chemins collés ici). (Fait le 2026-10-20 soir : pytest scraping 119 verts ; essai à blanc sur la vraie base, lecture seule : `logs/courriels/2026-10-20_194339_admin-..._304-fiches.txt` (« veille du 2026-10-20, 304 fiches à contrôler », 683 fiches nouvelles en sept jours dont 307 validées, lien direct), `..._magnus-link1973-gmail-com_...49-appels.txt` (49 appels pour ARCADIA, dix listés, clôture la plus proche d'abord), `..._test-test-com_...243-appels.txt`. Les chiffres « nouvelles en sept jours » sont gonflés cette première semaine par les ré-imports du 19 et du 20 octobre.)
- [x] 3.2 (Fait le 2026-10-21 : boîte contact@arcadiaco.fr, mot de passe d'application collé par Monsieur DUCOUT dans `scraping/.env`, `courriel.py --test` : « envoyé à ducout@hotmail.fr ».) Monsieur DUCOUT renseigne la boîte d'envoi : double-clic sur `scraping/configurer_courriel.cmd` (assistant ajouté le
  2026-10-21 : questions une par une, mot de passe d'application saisi sans s'afficher, écriture de `scraping/.env`, courriel
  de test envoyé) ; courriel reçu.
- [x] 3.3 Envoi réel `alertes.py --admin --candidats` le 2026-10-21 : « admin : envoyé à ducout@hotmail.fr ; candidat magnus.link1973@gmail.com : 49 appel(s) ; envoyé ; candidat test@test.com : 243 appel(s) ; envoyé » (test@test.com est une adresse fictive : le message reviendra en erreur dans la boîte contact@arcadiaco.fr). Réception à confirmer par Monsieur DUCOUT.
- [x] 3.4 Documentation (`scraping/README.md`, `CHANGELOG.md`, `CLAUDE.md`, `REPRISE.md`, `docs/PLAN_MVP_2026-10-20.md`).
