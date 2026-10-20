# Tasks

Lot 2 du rapport de critique (rejeu, péremption, rapport de veille) ; accord de Monsieur DUCOUT des 2026-10-19 et
2026-10-20. Rejeu à zéro euro ; extraction des textes nouveaux soumise à devis et accord ; aucun `git push`, aucun
archivage sans demande ; migrations après essai à blanc et sauvegarde.

## 1. Outil de rejeu

- [x] 1.1 `scraping/rejeu.py` : fonctions pures `comparer_liens`, `marquer_fiches`, `rapport_markdown` testées ;
  `--relire [--ids] [--limite]`, `--collecter`, `--marquer`, `--rapport`. Fait quand : pytest scraping vert. (Fait le
  2026-10-20 : `tests/test_rejeu.py` 4 tests, pytest scraping 103 verts.)
- [x] 1.2 Rejeu réel sur les vingt premières sources confirmées (ARS, portail des ARS, CNSA) : journal collé (sources
  relues, erreurs, nouveaux, disparus), textes nouveaux collectés, fiches marquées, `VEILLE.md` écrit. (Fait le 2026-10-20,
  10 h 05 à 10 h 11 : « 20 sources relues, 0 ignorées, 20 liens nouveaux, 53 disparus » (ARS Bourgogne-Franche-Comté,
  Grand Est et Normandie 6 disparus chacune : listes qui ne montrent que les derniers appels, voir risque du design) ;
  collecte « 19 pages lues à ce passage », 4 liens ignorés (textes trop courts : page cookies, deux fichiers média, une
  page vide) ; marquage « 303 fiches marquées » (extraction_api 154, extraction_locale 146, cnsa 3 ; les fiches des
  connecteurs ars_idf, ars_corse et fondation_de_france ne sont pas marquées, leur identifiant de source diffère de
  celui du registre : à rapprocher), sauvegarde `scripts/sauvegardes/rejeu_2026-10-20_1011` ; « Rapport écrit :
  VEILLE.md (20 sources avec journal, 0 fiches à péremption) ».)

## 2. Import et péremption

- [x] 2.1 `import_to_firestore.py` : `derniereVueLe` depuis `vue_rubrique_le`, `absences` ; type `AAP` ; test. Import à
  blanc puis réel, compte collé. (Fait le 2026-10-20 : pytest scripts 30 verts ; import réel « 0 crees, 529 mis a jour » ;
  288 fiches publiées, 227 avec `derniereVueLe` au 2026-10-20 (rejeu) et `absences` 0, 61 sans (closes ou connecteurs).)
- [x] 2.2 `scripts/perimer_fiches.py` (essai à blanc, sauvegarde, accord) et test de la fonction pure. (Script et test
  faits le 2026-10-20 ; aucune fiche à deux absences avant le second rejeu, donc pas d'exécution.) Exécution réelle
  seulement quand une fiche atteindra deux absences (pas avant le second rejeu).

## 3. Extraction des textes nouveaux

- [x] 3.1 Devis `extraction_locale.py --extraire --moteur api --dry-run` collé (2026-10-20 : « 19 textes restants, 60,040
  caractères ; coût estimé 0.02 euros au plus ; déjà dépensé 1.978 euros ; plafond 5.00 euros ») ; après accord, extraction, contrôle
  (devis), import, décision du modèle ; compte des appels publiés collé. (Fait le 2026-10-20, 10 h 40, accord « 1 oui » :
  extraction « 875 réussites (19 nouvelles), 1 échecs ; coût cumulé 2.005 euros » (échec : une fiche Ville de Paris
  invalide au schéma) ; contrôle, devis « 15 fiches à vérifier, 0.005 euros estimés », réel « 15 fiches vérifiées ;
  coût cumulé 2.014 euros » ; import « 17 crees, 529 mis a jour » ; base : 640 documents, 303 publiées (269 validées,
  26 proposées, 8 à corriger), 292 brouillons, 45 archivées ; les 17 créées : 15 publiées validées, 2 brouillons à corriger.)
- [ ] 3.2 Garde-fou « une page relue une fois par jour au plus » (`rejeu.deja_relue`, test) et mode `veille.cmd auto`
  (sans pause, journal `logs/veille.log`) ; tâche planifiée Windows « AAP Sante - veille hebdomadaire » (lundi 8 h,
  décision de Monsieur DUCOUT « une fois par semaine automatique ») ; veille lancée sur les 222 pages confirmées
  restantes (zéro euro), devis des textes nouveaux collé, extraction après accord.
  Avancement au 2026-10-20, 12 h 15 : passage complet sur les 207 pages terminé (journal `scraping/logs/veille_2026-10-20_complet.log`, code 0) : 198 sources relues, 9 en erreur, 2 673 liens vus, 184 nouveaux, 295 disparus, 129 textes nouveaux lus ; 1 566 fiches marquées « vue aujourd'hui » (sauvegarde `scripts/sauvegardes/rejeu_2026-10-20_1213`), 0 fiche à péremption (seconde absence requise). Devis d'extraction à blanc : 129 textes, 428 152 caractères, 0,16 euro au plus, cumul Haiku 2,014 euros sur 5. Extraction en attente de l'accord de Monsieur DUCOUT.

## 4. Lancement et documentation

- [x] 4.1 `scraping/veille.cmd` (relire, collecter, marquer, rapport, devis affiché) ; décision de planification laissée
  à Monsieur DUCOUT.
- [x] 4.2 README scraping, README racine, CHANGELOGs, CLAUDE.md, REPRISE.md, `docs/FLUX_DONNEES.md`,
  `docs/FEUILLE_DE_ROUTE.md` (étape 4), rapport section 8. (Fait le 2026-10-20.)
- [ ] 4.3 Monsieur DUCOUT lit `VEILLE.md` et rejoue le scénario « vingt émetteurs » de la spec.
