# Tasks

Comparaison demandée par Monsieur DUCOUT le 2026-10-14 (section 8 du rapport de critique). Règle « Preuve avant
affirmation » : chaque tâche cochée avec sa preuve. Règles absolues : aucun appel API avant l'accord écrit (tâche
2.1), plafond cumulé 5 euros, aucun secret affiché, aucun `git push`, aucun archivage sans demande.

## 1. Tirage et préparation

- [x] 1.1 `scraping/comparaison.py --tirer` : fonction pure `tirer_pages(candidats, nombre, graine)` (répartition par
  famille au prorata, graine fixe, une adresse une fois) testée dans `tests/test_comparaison.py` ; candidats = textes
  collectés des sources confirmées jamais traités par le passage local (ni fiche, ni refus, ni échec) et hors des
  45 adresses de l'échantillon (demande de Monsieur DUCOUT du 2026-10-14) ; écriture de `sources/comparaison_pages.json`.
  Fait quand : pytest vert ; deux exécutions donnent le même fichier (`git diff` vide) ; répartition par famille collée.
  (Fait le 2026-10-14 : pytest scraping 60 verts, dont `test_tirer_pages_reproductible_au_prorata_sans_doublon`,
  `test_tirer_pages_bornes`, `test_candidats_jamais_traites_exclut_traites_echantillon_et_doublons` ; `--tirer` :
  « 765 textes jamais traités (collectivite 765) », « 50 pages tirées, graine 2026 (collectivite 50) » ; second passage
  « (inchangé) ». Constat : les textes jamais traités sont tous de la famille collectivité, dernière de l'ordre du
  passage global ; les 50 pages sont donc toutes des pages de collectivités. Constat de Monsieur DUCOUT le soir :
  tirage inutilisable, aucun appel de santé. Second tirage le 2026-10-14 au soir, options `--familles`, `--ids`,
  `--mots`, `--inclure-traites`, `--score-min` (tests 68 verts) : « 458 textes jamais traités (ars 184, fondation 97,
  caisse-nationale 72, agence-nationale 50, etablissement 36, societe-savante 19) », « 50 pages tirées, graine 2026
  (ars 20, fondation 11, caisse-nationale 8, agence-nationale 5, etablissement 4, societe-savante 2) », 32 sources ;
  premier tirage archivé dans `sources/comparaison_pages_collectivites_2026-10-14.json`, ses 18 verdicts dans
  `sources/verdicts_comparaison_collectivites_2026-10-14.json`, ses résultats sous le suffixe `_collectivites`.)
- [x] 1.2 `echantillon.extraire` et `extraire_api` : paramètres optionnels (liste de textes, fichier de sortie),
  comportement inchangé sans eux ; tests. Fait quand : pytest scraping vert ; le journal des coûts n'a pas bougé.
  (Fait le 2026-10-14 : `test_extraire_accepte_une_liste_explicite_de_textes` et
  `test_extraire_api_accepte_adresses_et_fichier_de_sortie`, moteurs remplacés par des refus ; journal des coûts :
  66 lignes `claude-haiku-5-5`, inchangé.)
- [x] 1.3 `comparaison.py --extraire-local --modele qwen3:8b` sur les 50 textes (0 euro, pendant le passage global).
  Fait quand : compte des fiches et des refus collé, durée cumulée collée, journal des coûts inchangé. (Fait le
  2026-10-14 : « 26 pages refusées, 24 réussites (24 nouvelles), 0 échecs, 2501 s pour ce passage (qwen3:8b) » ;
  0 fiche à relire ; 50 pages avec un résultat local ; le journal des coûts n'a reçu aucune ligne de ce passage.)

## 2. Extraction par le modèle API

- [x] 2.1 Accord écrit de Monsieur DUCOUT sur : modèle `claude-haiku-5-5`, prix vérifiés le 2026-10-14 (0,10 et 0,50
  USD par million de tokens), coût estimé 0,03 euro pour 50 textes (moins de 0,10 euro avec marge), recalculé sur
  la longueur réelle des 50 textes tirés (183 708 caractères, 3 674 en moyenne : 0,054 euro estimé, deux appels par
  texte) et présenté avec la liste, plafond cumulé 5 euros. Puis `--extraire-api
  --modele claude-haiku-5-5 --limite 1`. Fait quand : lignes du journal collées (sans clé). (Accord donné le 2026-10-14
  (« accord pour haiku, vas-y ») ; premier texte (ladrome.fr, travailler autrement) refusé à la question fermée
  « La page présente les tiers-lieux, les fablabs... » ; journal : étape `est_aap`, 951 tokens d'entrée, 111 de sortie,
  0,000221 USD soit 0,000204 euro ; pas d'étape extraction puisque refusée ; cumul du modèle 0,028 euro.)
- [x] 2.2 Les 49 autres textes. Fait quand : « 50 textes (1 déjà traités) » affiché, compte des fiches et des refus
  collé, coût cumulé collé. (Fait le 2026-10-14 : « 50 textes de l'échantillon (1 déjà traités) » ; « 30 pages refusées,
  20 réussites (20 nouvelles), 0 échecs ; coût cumulé de claude-haiku-5-5 : 0.058 euros » ; 0 fiche à relire ; durée
  184 s ; coût sur les 50 adresses lu dans le journal : 70 appels, 0,0296 euro (estimation 0,054) ; cumul du modèle
  depuis l'échantillon 0,058 euro, plafond 5 euros. Avant jugement : les deux moteurs prennent la même décision fiche /
  refus sur 46 pages sur 50 (local 24 fiches, Haiku 20).)

## 2 bis. Second tirage (financeurs de la santé)

- [ ] 2b.1 Extraction locale `qwen3:8b` des 50 nouvelles pages (lancée le 2026-10-14 au soir, 0 euro). Fait quand :
  compte des fiches et des refus collé, durée collée.
- [ ] 2b.2 Accord écrit de Monsieur DUCOUT pour Haiku sur les 50 nouvelles pages (coût estimé 0,03 euro, même modèle
  et mêmes prix qu'en 2.1), puis extraction. Fait quand : compte des fiches et des refus collé, coût réel collé.

## 3. Jugement

- [x] 3.1 `comparaison.py --juger` : serveur local (port 8766), page par adresse avec texte collecté, lien officiel,
  deux fiches côte à côte ou refus, boutons page et par moteur, verdicts dans `sources/verdicts_comparaison.json`,
  reprise ; fonctions pures de calcul (repérage, qualité, fabrications) testées ; raccourci `comparaison_juger.cmd`.
  Fait quand : pytest vert ; la session ouvre l'écran dans son navigateur et relit une page avec les deux fiches.
  (Fait le 2026-10-14 : pytest scraping 65 verts (`test_mesures_reperage_qualite_fabrications`,
  `test_cout_journal_filtre_par_adresse_et_modele`, `test_resultats_moteur_et_duree_totale`, `test_verdict_invalide`,
  `test_rapport_markdown_pourcentages_et_liste`) ; écran ouvert dans le navigateur de la session : « Page 1 / 50 ;
  0 jugées », texte collecté, « Modèle local (qwen3:8b) : Refusée : La page est une page de vérification de sécurité... »,
  « Modèle API (claude-haiku-5-5) : Pas encore traitée par ce moteur », boutons 1 à 6. Constat : la première page tirée
  (oise.fr) est un contrôle anti-robot collecté à la place de la page ; 1 texte sur 50 dans ce cas, 35 textes sur 751
  candidats portent une marque de ce type (surtout « cloudflare », parfois légitime). Liste conservée telle quelle, la
  page sera jugée « pas un appel » sur le texte collecté ; filtre des contrôles anti-robot à ajouter avant un prochain
  tirage `[A VALIDER - Monsieur DUCOUT]`.)
- [x] 3.2 Monsieur DUCOUT juge les 50 pages. Fait quand : 50 clés dans `sources/verdicts_comparaison.json`. (Fait le
  2026-10-14 au soir sur le premier tirage, collectivités : 50 verdicts, 23 « appel » et 27 « pas un appel », aucun
  commentaire « hors champ » ; fichier archivé `sources/verdicts_comparaison_collectivites_2026-10-14.json`. À refaire
  sur le second tirage, financeurs de la santé, quand les deux moteurs auront fini.)

## 4. Rapport et documentation

- [ ] 4.1 `comparaison.py --rapport` : `scraping/COMPARAISON.md` (tableau par moteur, liste des pages, graine, date,
  coût réel lu dans le journal, compte des pages commentées « hors champ » : question de Monsieur DUCOUT du 2026-10-14,
  section 8 du rapport de critique). Fait quand : rapport collé dans le compte rendu. (Premier tirage, collectivités,
  rapport `scraping/COMPARAISON_collectivites_2026-10-14.md` généré le 2026-10-14 au soir à partir des fichiers
  archivés : « Modèle local | qwen3:8b | 50 / 50 | 45 / 50 (90 %) | 19 / 23 (83 %) | 3 | 2501 s | 0 euro » ;
  « Modèle API | claude-haiku-5-5 | 50 / 50 | 47 / 50 (94 %) | 19 / 23 (83 %) | 0 | 184 s | 0.030 euros (70 appels) ».
  Lecture : même qualité de fiche, Haiku refuse mieux les pages qui ne sont pas des appels (0 fabrication contre 3)
  et va treize fois plus vite ; mesure faite sur des pages de collectivités, hors du cœur du projet. Rapport du
  second tirage à produire.)
- [ ] 4.2 Documentation : README scraping (outil et commandes), CHANGELOGs, CLAUDE.md (état d'avancement), REPRISE.md,
  section 8 du rapport de critique (résultat). Fait quand : fichiers relus.

## 5. Vérification

- [ ] 5.1 Monsieur DUCOUT rejoue les scénarios : relance `--tirer` et constate le fichier inchangé ; ouvre l'écran de
  jugement et retrouve ses verdicts ; lit `COMPARAISON.md` et retrouve les deux pourcentages par moteur et le coût.
