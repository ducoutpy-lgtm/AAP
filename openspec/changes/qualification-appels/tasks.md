# Tasks

Jour 2 du plan MVP. Règles : coût supposé écrit et accepté avant tout appel, plafond 5 euros cumulés ; aucun
`git push`, aucun archivage sans demande, aucun déploiement.

- [x] 2.1 `scraping/qualifier_fiches.py`, `extractor.qualifier_fiche`, tests ; devis à blanc collé ici. (Fait le 2026-10-20 soir : tests scraping 110 verts ; essai à blanc « 303 fiches à qualifier, 0.087 euros estimés » (API 250, locale 30 après retrait des doublons, Fondation de France 22, ARS IdF local 1), modèle claude-haiku-5-5, cumul déjà dépensé 2,107 euros, plafond 5.)
- [ ] 2.2 Accord de Monsieur DUCOUT, puis `--qualifier` réel ; bilan collé ici (destinataires, types, hors champ).
- [x] 2.3 Import : `appliquer_qualification`, listes blanches, test (fait le 2026-10-20 soir : 34 tests d'import verts) ; ré-import à faire après 2.2.
- [x] 2.4 Application : `utils/qualification.ts` et test, type, filtres, fiche, fenêtre « Qualifier » ; lint, build,
  tests ; parcours joué sur les émulateurs (filtre, fiche, correction en administration). (Fait le 2026-10-20 soir : 56
  tests Vitest, lint, build ; sur les émulateurs, compte administrateur de test : fenêtre « Qualifier » ouverte, cases
  « Établissements publics » et « Prévention » cochées, type « Appel à candidatures », enregistré ; la liste affiche
  « Qualification (Monsieur DUCOUT) : Appel à candidatures · Établissements publics » et le document de l'émulateur
  porte `qualification.par = Monsieur DUCOUT`. Filtre et fiche à rejouer après la qualification réelle (2.2).)
- [ ] 2.5 Documentation (`docs/resume_application_web_2026-10.md`, `scraping/README.md`, `CHANGELOG.md`,
  `CLAUDE.md`, `REPRISE.md`).
- [ ] 2.6 Monsieur DUCOUT relit vingt fiches tirées au sort (destinataires) ; score et remarques ici.
