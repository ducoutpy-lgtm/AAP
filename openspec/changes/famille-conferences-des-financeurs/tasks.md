# Tasks

Lot B1 du pilote (plan accepté par Monsieur DUCOUT le 2026-10-28, « Oui, continue », puis « ok » au lancement du lot B).
Zéro euro jusqu'à 3.1. Règles : aucune adresse validée par Monsieur DUCOUT remplacée, aucun appel payant hors délégation.

- [x] 1.1 État de départ mesuré (lecture seule) : départements avec un lien CFPPA repéré, sources dédiées, départements
  à chercher. Fait quand : décompte collé. (Fait le 2026-10-28 : « departements 101 avec liens CFPPA 22 » ; sources
  dédiées suivies : Drôme, Alsace (67, 68), Rhône, Métropole de Lyon ; 75 départements à chercher. Parmi les 22, 7
  n'ont l'appel qu'en fichier (Creuse, Eure, Gard, Mayenne, Orne en PDF ; Haute-Garonne, Indre-et-Loire en document
  servi sans extension) : la collecte ne les lit pas.)
- [x] 1.2 Recherche web des pages CFPPA des départements restants (agents de recherche), résultats relus. Fait quand :
  tableau par département (page stable, type, édition) et liste des départements sans page. (Fait le 2026-10-28, quatre
  agents : « cherches 75 page stable 65 lus 49 » ; types : rubrique du département 35, page permanente de la conférence
  27, page d'édition 3, aucune 10 ; édition 2027 vue pour 24. Deux pages écartées à la relecture : Nord (Phosphor'âge
  2027-2028 derrière une connexion), Seine-Maritime (catalogue général des aides, appel non vu). Sans page : Ain,
  Alpes-de-Haute-Provence, Ariège, Aube, Aveyron, Indre, Loir-et-Cher, Haute-Loire, Marne, Nord, Seine-Maritime, Mayotte.)
- [x] 1.3 Registre, `familles.json` et extrait `conferences_financeurs.csv` selon la règle de `design.md`. Fait quand :
  `registre.py --verifier-format` valide et `--tableau` affiche la ligne de couverture mesurée. (Fait le 2026-10-28 :
  essai à blanc puis écriture, « 102 lignes, 76 couvertes, 48 actions au registre » : 40 sources créées (dont le relais
  Pour bien vieillir Bretagne, `relais: true`, et la CGSS Martinique), 8 sources existantes confirmées avec leur page ;
  codes HTTP sondés (403 : Landes, Oise, Var) ; « Registre valide : 1270 sources » ; `REGISTRE_SOURCES.md` : « Conférences
  des financeurs de la prévention de la perte d'autonomie | 76 / 102 (74 %) ». 14 pages suivies sans que l'appel y ait
  été vu ce jour ne comptent pas. Une relecture de Monsieur DUCOUT remplacée (Vaucluse, « page morte à l'écran, adresse
  à retrouver ») : recopiée dans les notes de la source. Corrections après la découverte de 2.1 : la page de la
  conférence du Cantal renvoie vers la rubrique déjà relue pour le Département, source dédiée retirée et ligne rattachée
  à `conseil-departemental-cantal` ; Yvelines renvoyée vers l'accueil (site en refonte), source laissée « a-verifier » ;
  Vienne sans lien lisible, retirée du compte. Couverture finale « 75 / 102 (73 %) », « Registre valide : 1269 sources ».)
- [x] 2.1 Découverte (`--forcer --garder-depart`), veille et collecte des sources touchées : statuts et nombre de
  textes collés ; nombre de départements dont l'appel n'existe qu'en PDF. (Fait le 2026-10-28 : découverte des 48
  sources, 40 rubriques trouvées et 4 pages sans rubrique (Vienne, Dordogne, Vendée, Var) au premier passage (chiffre
  corrigé après relecture : 44 était écrit), La Réunion à la relance, 3 bloquées en HTTP 403 (Seine-Saint-Denis,
  Landes, Oise) ; Dordogne, Vendée et Var passées `page_appel` (7, 1 et 1 liens). Veille et collecte des 80 sources de
  la famille : « 77 sources relues, 3 ignorées (erreur ou aucun lien), 18 liens nouveaux, 66 disparus », « 222 pages
  lues à ce passage ». Mesure par mots-clés sur les 75 lignes couvertes (estimation, liens non ouverts un à un) : lien
  web d'appel 36, page d'appel lue elle-même 6, appel lié seulement en fichier (PDF, document) 23 (dont Alsace 67 et 68,
  une seule source), aucun lien d'appel repéré par les mots-clés 10. Les 23 départements « fichier seulement » ne
  donneront pas de fiche tant que la collecte ignore les fichiers.)
- [x] 3.1 Extraction, contrôle et qualification dans la délégation (devis, `--plafond`), import en « Proposée, non
  relue », relecture en base. (Fait le 2026-10-28. Devis d'extraction des 222 textes : 0,28 euro, au-dessus de la limite
  par commande ; découpé en deux commandes : 79 sources, 128 textes, devis 0,15, `--plafond 2.819`, réel 0,083
  (58 fiches, 70 pages refusées) ; Collectivité de Corse, 94 textes, devis 0,13, `--plafond 2.882`, réel 0,056
  (20 fiches, 74 refusées). 78 fiches : 39 dans le champ (santé 5, médico-social 33, incertain 1), 55 déjà closes.
  Contrôle des 16 fiches ouvertes ou sans date du champ : devis 0,005, arrêt au plafond après 10 fiches (coût réel
  0,0005 euro par fiche, devis sous-estimé), devis corrigé 0,004 et `--plafond 2.817` pour les 6 restantes ; réel 0,009 ;
  4 fiches douteuses sur la description seulement. Qualification des 16 : devis 0,005, `--plafond 2.822`, réel 0,005.
  Total du lot 0,153 euro, cumul Haiku 2,822. Import (`import_cfppa.py` de la session, mêmes fonctions que
  `scripts/import_to_firestore.py`, fiches produites le jour seulement) : « 23 ouvertes ou sans date, 4 déjà en base
  (non touchées), 19 nouvelles, 55 closes ignorées » ; « Terminé : 19 créés, 0 mis à jour | relus en base :
  {('draft', 'proposee'): 13, ('draft', 'a_corriger'): 6} » : 13 fiches dans sa file, les 6 hors champ en brouillon
  « à corriger » (règle de l'import ordinaire, hors de sa file). Base : 899 documents, file « Proposée » 121. Date de
  clôture 2035-12-31 (Hérault, dépôt au fil de l'eau) relue sur la page : « Expire le 31/12/2035 ». `doublons.py
  --file` : 49 groupes ; faux doublon signalé (Pas-de-Calais Axe 3 et Axe 5, deux appels distincts).)
- [x] 4.1 Documentation : `scraping/README.md`, `scraping/CHANGELOG.md`, `REPRISE.md`, `docs/PILOTE_MVP.md`,
  `docs/A_VALIDER.md`. (Fait le 2026-10-28 : paragraphe de la famille et limite des fichiers dans le README, entrée du
  CHANGELOG, reprise, journal des dépenses (semaine : 0,165 euro sur 0,50), questions 7 à 9, ligne « En cours » de
  `CLAUDE.md`.)
- [ ] 5.1 Vérification par Monsieur DUCOUT : ligne de couverture de `REGISTRE_SOURCES.md`, fiches CFPPA dans
  `/admin/aaps`.
