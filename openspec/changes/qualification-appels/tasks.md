# Tasks

Jour 2 du plan MVP. Règles : coût supposé écrit et accepté avant tout appel, plafond 5 euros cumulés ; aucun
`git push`, aucun archivage sans demande, aucun déploiement.

- [x] 2.1 `scraping/qualifier_fiches.py`, `extractor.qualifier_fiche`, tests ; devis à blanc collé ici. (Fait le 2026-10-20 soir : tests scraping 110 verts ; essai à blanc « 303 fiches à qualifier, 0.087 euros estimés » (API 250, locale 30 après retrait des doublons, Fondation de France 22, ARS IdF local 1), modèle claude-haiku-5-5, cumul déjà dépensé 2,107 euros, plafond 5.)
- [x] 2.2 Accord de Monsieur DUCOUT (« oui, lance la qualification »), `--qualifier` réel le 2026-10-20 à 17 h 13 : « 303 fiches qualifiées ; coût cumulé 2,194 euros » (0,087 euro réel, égal au devis), sauvegarde `scripts/sauvegardes/qualification_2026-10-20_1713`. Bilan : destinataires public 123, privé non lucratif 142, privé lucratif 106, collectivités 66, recherche 39, toute structure 128, aucun 3 ; types : appel à projets 145, appel à candidatures 107, AMI 27, prix 9, autre 8, subvention 7 ; hors champ relevés 6 ; date d'ouverture lue 118 ; pièces attendues 134. Ré-import réel : « 0 crees, 589 mis a jour », 392 hors champ en brouillon (386 avant), 248 publiables.
- [x] 2.3 Import : `appliquer_qualification`, listes blanches, test (fait le 2026-10-20 soir : 34 tests d'import verts) ; ré-import à faire après 2.2.
- [x] 2.4 Application : `utils/qualification.ts` et test, type, filtres, fiche, fenêtre « Qualifier » ; lint, build,
  tests ; parcours joué sur les émulateurs (filtre, fiche, correction en administration). (Fait le 2026-10-20 soir : 56
  tests Vitest, lint, build ; sur les émulateurs, compte administrateur de test : fenêtre « Qualifier » ouverte, cases
  « Établissements publics » et « Prévention » cochées, type « Appel à candidatures », enregistré ; la liste affiche
  « Qualification (Monsieur DUCOUT) : Appel à candidatures · Établissements publics » et le document de l'émulateur
  porte `qualification.par = Monsieur DUCOUT`. Filtre et fiche rejoués sur les émulateurs après le semis des fiches qualifiées : `?destinataire=prive-non-lucratif&typeAppel=appel-a-projets` -> « 8 appels à projets », deux étiquettes « Privé non lucratif (associations, fondations, ESPIC) » et « Appel à projets » ; `?destinataire=recherche` -> 9 appels.)
- [x] 2.5 Documentation (`docs/resume_application_web_2026-10.md`, `scraping/README.md`, `CHANGELOG.md`,
  `CLAUDE.md`, `REPRISE.md`).
- [ ] 2.6 Monsieur DUCOUT relit vingt fiches tirées au sort (destinataires) ; score et remarques ici. Tirage fait : `scraping/TIRAGE_QUALIFICATION.md` (graine 2026).
