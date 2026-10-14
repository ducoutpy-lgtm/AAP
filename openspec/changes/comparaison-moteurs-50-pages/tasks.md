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
  passage global ; les 50 pages sont donc toutes des pages de collectivités.)
- [x] 1.2 `echantillon.extraire` et `extraire_api` : paramètres optionnels (liste de textes, fichier de sortie),
  comportement inchangé sans eux ; tests. Fait quand : pytest scraping vert ; le journal des coûts n'a pas bougé.
  (Fait le 2026-10-14 : `test_extraire_accepte_une_liste_explicite_de_textes` et
  `test_extraire_api_accepte_adresses_et_fichier_de_sortie`, moteurs remplacés par des refus ; journal des coûts :
  66 lignes `claude-haiku-5-5`, inchangé.)
- [ ] 1.3 `comparaison.py --extraire-local --modele qwen3:8b` sur les 50 textes (0 euro, pendant le passage global).
  Fait quand : compte des fiches et des refus collé, durée cumulée collée, journal des coûts inchangé.

## 2. Extraction par le modèle API

- [ ] 2.1 Accord écrit de Monsieur DUCOUT sur : modèle `claude-haiku-5-5`, prix vérifiés le 2026-10-14 (0,10 et 0,50
  USD par million de tokens), coût estimé 0,03 euro pour 50 textes (moins de 0,10 euro avec marge), recalculé sur
  la longueur réelle des 50 textes tirés (183 708 caractères, 3 674 en moyenne : 0,054 euro estimé, deux appels par
  texte) et présenté avec la liste, plafond cumulé 5 euros. Puis `--extraire-api
  --modele claude-haiku-5-5 --limite 1`. Fait quand : lignes du journal collées (sans clé).
- [ ] 2.2 Les 49 autres textes. Fait quand : « 50 textes (1 déjà traités) » affiché, compte des fiches et des refus
  collé, coût cumulé collé.

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
- [ ] 3.2 Monsieur DUCOUT juge les 50 pages. Fait quand : 50 clés dans `sources/verdicts_comparaison.json`.

## 4. Rapport et documentation

- [ ] 4.1 `comparaison.py --rapport` : `scraping/COMPARAISON.md` (tableau par moteur, liste des pages, graine, date,
  coût réel lu dans le journal). Fait quand : rapport collé dans le compte rendu.
- [ ] 4.2 Documentation : README scraping (outil et commandes), CHANGELOGs, CLAUDE.md (état d'avancement), REPRISE.md,
  section 8 du rapport de critique (résultat). Fait quand : fichiers relus.

## 5. Vérification

- [ ] 5.1 Monsieur DUCOUT rejoue les scénarios : relance `--tirer` et constate le fichier inchangé ; ouvre l'écran de
  jugement et retrouve ses verdicts ; lit `COMPARAISON.md` et retrouve les deux pourcentages par moteur et le coût.
