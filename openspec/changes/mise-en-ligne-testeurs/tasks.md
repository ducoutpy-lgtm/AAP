# Tasks

Jour 7 du plan MVP, décision de Monsieur DUCOUT du 2026-10-21 (« ok »). Zéro euro. Règles : aucun `git push`, aucun
archivage sans demande, aucun déploiement par la session (commandes remises à Monsieur DUCOUT) ; parcours joués sur
les émulateurs.

- [x] 1.1 `utils/retours.ts` (types de retour, validation du message, tri) et test Vitest. Fait quand : tests verts. (Fait le 2026-10-21 : 3 tests verts, 71 Vitest au total.)
- [x] 1.2 Page `/retour`, route, entrée « Donner mon avis » dans la section Support ; règle `retours` et test de règles ;
  section « Retours des testeurs » dans `/admin/testeurs` (et clé manquante de la liste des comptes corrigée). Fait
  quand : lint, build, `npm test`, tests de règles verts. (Fait le 2026-10-21 : lint exit 0, build vert, 71 tests Vitest,
  28 tests de règles sur l'émulateur ; l'entrée de menu transmet la page d'où l'on vient.)
- [x] 1.3 Scénarios joués sur les émulateurs : envoi par candidat@test.local, lecture par admin@test.local, message trop
  court refusé. Fait quand : lectures de page collées. (Fait le 2026-10-21 : « court » refusé avec « au moins 10 caractères (5 pour
  l'instant) » ; retour « Idée » envoyé depuis /aap/test-fin-2 avec la page pré-remplie, « Merci, votre retour est bien
  arrivé » ; admin@test.local lit sur /admin/testeurs « Retours des testeurs (3) » avec compte, rôle, type, page, message ;
  plus d'avertissement de clé dans la console.)
- [x] 1.4 `docs/MISE_EN_LIGNE.md` (vérifications, commandes, contrôles, invitation) ; liste des champs d'entreprise à
  remplir dans `editeur.ts` ; documentation (résumé de l'application, CHANGELOG, CLAUDE.md, REPRISE.md, plan). (Fait le 2026-10-21.)
- [ ] 2.1 Monsieur DUCOUT remplit `editeur.ts`, déploie (règles puis hébergement) depuis `app`, envoie l'invitation à
  trois testeurs ; le premier retour arrive dans `/admin/testeurs`.
