# Tasks

Constat de Monsieur DUCOUT du 2026-10-14 au soir (base « sale » : financeurs en doublon, régions incohérentes).
Règle « Preuve avant affirmation ». Aucun appel API. Type `AAP` : champs optionnels ajoutés dans `scrapeMetadata`
seulement (exigence explicite). Décisions humaines (`status`, `validation`) jamais réécrites. Accord de Monsieur
DUCOUT sur le plan le 2026-10-14 à 22 h 45 (« code maintenant »).

## 1. Tables et outil

- [x] 1.1 `scraping/financeurs.py --construire` : table `sources/financeurs.json` depuis le registre (nom canonique
  par émetteur, alias générés : « ARS X », « Agence régionale de santé X », avec et sans accents) ; rapport des noms de
  financeurs extraits non rattachés, à compléter à la main. Fait quand : table écrite, rapport collé, pytest vert.
  (Fait le 2026-10-14, 23 h : « financeurs.json : 1198 financeurs (1198 nouveaux), 1964 alias » ; `--non-rattaches` :
  « 932 fiches ; 360 fiches (267 noms) sans nom canonique, 572 rattachées », premiers noms restés tels quels :
  Département du Rhône 11, DRAAF Bourgogne-Franche-Comté 9, FSE.gouv.fr 8, Département du Loiret 7, Bpifrance 6 ;
  `tests/test_financeurs.py` 7 tests verts, dont `test_six_orthographes_un_seul_nom` et
  `test_construire_fusionne_sans_ecraser_la_main`.)
- [x] 1.2 `sources/departements.json` : 101 départements -> région (identifiants de `REGIONS`) ; fonction pure
  `territoire_depuis(texte, emetteur)` testée (région, département, ARS, conseil départemental, ville, national,
  inconnu -> `non-precise`). Fait quand : pytest vert. (Fait le 2026-10-14 : module `scraping/territoires.py`, table avec
  les 5 régions d'outre-mer, 27 anciennes régions et provinces, 61 villes ; `tests/test_territoires.py` 5 tests verts ;
  pytest scraping 86 verts au total.)

## 2. Import

- [x] 2.1 `scripts/import_to_firestore.py` : `scrapeMetadata.source` = émetteur du registre, `sourceNom`, `fichier` ;
  `financeurName` canonique et `financeurExtrait` ; territoire déduit ; `france` seulement si national. Tests sur le
  faux Firestore. Fait quand : pytest scripts vert ; essai à blanc collé avec le nombre de financeurs canoniques et la
  répartition des territoires. (Fait le 2026-10-14, 23 h : pytest scripts 21 verts (4 nouveaux :
  `test_source_reelle_emetteur_du_registre_et_fichier_conserve`, `test_six_orthographes_un_financeur_nom_extrait_conserve`,
  `test_territoire_deduit_jamais_france_par_defaut`, `test_groupes_de_doublons_meme_titre_normalise_et_meme_financeur`) ;
  essai à blanc : « AAP lus : 933 | a importer : 411 (dont 2 doublons fusionnes, 197 sans date publiees, 21 hors champ
  en brouillon) », « Fiches publiees : 390 | financeurs distincts : 149 (260 fiches au nom canonique) | territoires :
  france 101, ile-de-france 53, bourgogne-franche-comte 25, normandie 20, grand-est 20, bretagne 19, pays-de-la-loire 19,
  auvergne-rhone-alpes 18, hauts-de-france 18, centre-val-de-loire 16, occitanie 16, nouvelle-aquitaine 13,
  provence-alpes-cote-d-azur 13, mayotte 12, la-reunion 10, guyane 9, martinique 8, guadeloupe 6, corse 4,
  non-precise 3 ».)
- [ ] 2.2 Ré-import réel après accord de Monsieur DUCOUT. Fait quand : dans la base, nombre de financeurs distincts
  et part de `non-precise` collés, avant et après. (Avant, le 2026-10-14 à 22 h 30 : 203 financeurs distincts, 243
  territoires « france » sur 420 publiées.)

## 3. Application

- [x] 3.1 `SearchAapPage.tsx` : filtre Source (nom de l'émetteur) ajouté, Financeur sur le nom canonique, libellé
  « Territoire non précisé » ; `types/index.ts` : `sourceNom`, `financeurExtrait`. Fait quand : lint et build verts,
  filtre « ARS Île-de-France » vérifié dans le navigateur avec un seul choix dans la liste. (Fait le 2026-10-14, 23 h :
  lint et build verts ; `src/utils/territoires.ts` : libellés des 5 régions d'outre-mer ; écran `/aap/search` relu
  dans le navigateur de la session : « 410 AAP disponibles », quatre listes (Thématique 4 options, Territoire 15,
  Financeur 202, Source 2 : « Toutes les sources », « Non précisée »), aucune erreur de console. Le choix unique
  « ARS Île-de-France » ne peut se constater qu'après le ré-import 2.2 : sur la base du soir, la liste Financeur porte
  encore les 201 noms.)

## 4. Doublons et documentation

- [x] 4.1 Rapport des doublons : groupes de fiches publiées de même titre normalisé et même financeur, avec adresses.
  Fait quand : rapport collé. (Outil `scripts/doublons.py` plutôt que `scraping/financeurs.py --doublons` : la liste
  des fiches publiées est dans la base, pas dans les fichiers ; lecture seule de la collection, fonction pure
  `groupes_de_doublons` testée. Rapport à coller après le ré-import 2.2, sur les noms canoniques.)
- [x] 4.2 README racine, README de l'application, CHANGELOGs, CLAUDE.md, REPRISE.md, `docs/FLUX_DONNEES.md`, rapport
  de critique (section 8). Fait quand : fichiers relus. (Fait le 2026-10-14, 23 h.)

## 5. Vérification

- [ ] 5.1 Monsieur DUCOUT filtre par financeur, par source et par territoire, et constate l'absence de doublons dans
  la liste des financeurs.
