# Tâches

Accord de Monsieur DUCOUT du 2026-11-26 (« Oui, corrige »). Chaque correction : test en échec d'abord, puis le code.
Aucune écriture dans la base sans son accord direct, après sauvegarde et essai à blanc.

## 1. Pages bloquées et marchés publics

- [x] 1.1 Tests : `scraping/filtres_pages.py` (anti-robot, accès refusé, plateformes d'achat public, deux marques de
  consultation, un vrai appel qui cite un règlement) ; lecture de page qui se lève ou reste bloquée ; extraction qui met
  de côté un texte bloqué et refuse un marché public sans modèle (échec avant).
- [x] 1.2 Module `filtres_pages.py`, lecture de page avec attente dans les deux collectes, filtre avant le modèle dans
  les deux extractions.

## 2. Import

- [x] 2.1 Tests : fiche de marché public et description de page bloquée ignorées ; hors champ rejeté et archivé
  d'office (champ et qualification), verdict humain gardé ; relais Medicen -> France 2030, relais sans financeur ->
  « à préciser », statut inchangé (règle révisée après la contre-vérification), cancéropôle gardé ; corrections du champ
  et du financeur appliquées (échec avant).
- [x] 2.2 Code de l'import ; `scraping/sources/corrections_fiches.json` depuis la relecture du 2026-11-26.

## 3. Administration et consigne

- [x] 3.1 Test de `relecture.ts` : nombre de fiches hors champ d'une sélection (échec avant) ; confirmation dans
  `ManageAAPsPage`.
- [x] 3.2 Consigne version 5 (question fermée, champ, extraction).

## 4. Nettoyage

- [x] 4.1 `scripts/nettoyer_selection.py` et son test ; essai à blanc local.
- [ ] 4.2 Essai à blanc sur la base après la remise à zéro du quota ; écriture réelle sur son accord.

## 5. Clôture

- [x] 5.1 Contre-vérification indépendante ; documentation (README scraping, CHANGELOG, `CLAUDE.md`, `REPRISE.md`).

## Preuves (2026-11-26)

- Échec avant : 7 tests de l'import sur 8 (le cancéropôle passait déjà, garde-fou), 7 tests de la collecte et de
  l'extraction, 2 de `relecture.ts`, 1 du nettoyage (module absent), puis 3 cas ajoutés après l'essai à blanc (faux
  positifs « pas un robot » de Health Data Hub et du Gers, préfecture de Côte-d'Or oubliée ; appel à projets de la
  Mayenne pris pour un marché public) : tous en échec avant la correction.
- Après : 320 tests Python, 267 de l'application, ruff, mypy, lint, types et compilation verts.
- Essai à blanc local : 26 textes bloqués (les 25 du relevé manuel et une page d'erreur de la CGSS de Guadeloupe), à
  retirer : 8 entrées de `extraction_api.json`, 17 de `extraction_api_non_aap.json`, 3 de `extraction_locale.json`, 8 de
  `extraction_locale_non_aap.json`. Filtre des marchés publics sur les 3 940 textes : 10 refus, tous sur une plateforme
  d'achat public (9 Métropole Aix-Marseille, 1 Collectivité de Corse).
- Émulateurs : valider la fiche hors champ de test affiche « Cette fiche est classée hors champ par le modèle. La valider
  et la publier quand même ? » ; la sélection affiche « ... Attention : 1 fiche est classée hors champ par le modèle. » ;
  après « Annuler », la fiche reste « proposee » en brouillon.
- Non fait : 4.1 écriture locale réelle (attend la fin de la veille, qui lit ces fichiers) ; 4.2 (quota de lectures
  Firestore épuisé jusqu'à 9 h environ le 2026-11-27).
- Contre-vérification (workflow `revue-selection-des-appels`, trois relecteurs puis un sceptique par constat important,
  13 agents) : 9 constats confirmés, 1 réfuté, 7 mineurs. Corrigés avec un test en échec avant (10 tests) : écran
  Cloudflare « Sorry, you have been blocked » non reconnu (37 textes) ; apostrophe typographique effacée par la
  normalisation ; l'indice « relais » n'arrivait pas au modèle (`rubriques()` ne recopiait pas le champ) ; « Région
  Bretagne » pris pour le relais Atlanpole (comparaison par sous-chaîne) ; financeur nommé après « financé par » ignoré ;
  correction du champ écrasée par la qualification ; même page bloquée importée par sa version locale ; nettoyage qui
  aurait réécrit « EIT Health » ; rejet « page bloquée » définitif. Règle des relais révisée : « Financeur à préciser »
  sans changer le statut (la première version laissait publiée la fiche déjà en base). Après : 325 tests Python, ruff et
  mypy verts ; nettoyage local à blanc : 63 textes bloqués ; 195 fiches de relais : 136 inchangées, 25 vrai financeur,
  34 « à préciser ».
- Seconde contre-vérification (2 agents) : les 9 corrections confirmées ; une régression (fiche relue après page bloquée
  republiée avec l'ancienne description) et quatre points mineurs corrigés avec un test en échec avant (6 tests) :
  relais d'une même famille (« Gérontopôle Sud », « Pôle emploi ») et tête du nom coupée à la virgule (nom lu comparé à
  tous les mots du nom du relais au registre) ; « porté par » ne fabrique plus de financeur (« financé par » seul, nom
  du référentiel ou conseil régional) ; indice « relais » donné aussi au modèle local ; une fiche relue par Monsieur
  DUCOUT ne reçoit jamais « Financeur à préciser ». Après : 331 tests Python, ruff et mypy verts ; 195 fiches de relais :
  136 inchangées, 25 vrai financeur, 34 « à préciser », aucun relais pur encore affiché comme financeur. Défaut antérieur
  noté, hors périmètre : l'import global sans `--source` s'arrête sur `exactitude_tirage.json` (champ « fichier »).
