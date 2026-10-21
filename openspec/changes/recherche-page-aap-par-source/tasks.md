# Tasks

Règle « Preuve avant affirmation » (CLAUDE.md) : chaque tâche n'est cochée qu'avec la preuve
indiquée, collée dans le compte rendu de session.

## 1. Report des verdicts de Monsieur DUCOUT

- [x] 1.1 Fonction pure `appliquer_verdicts_pages` dans `validation.py` et tests dans
  `tests/test_validation.py` (bonne page sur source exclue, mauvaise page avec adresse, page morte,
  hors champ, adresse sans source, relecture antérieure conservée). Fait quand : pytest vert, sortie
  collée. (Fait le 2026-10-13 : `pytest tests/test_validation.py -q` : 6 passed in 0.15s.)
- [x] 1.2 Option `--appliquer-pages` : écrit `sources/relecture_qualification.json` et
  `sources/registre.json`, affiche les décomptes et la commande de redécouverte. Fait quand :
  sortie de l'outil collée, `registre.py --verifier-format` valide. (Fait le 2026-10-13 : « 257 verdicts lus : 64 sources
  confirmées (plus 127 déjà confirmées), 50 adresses corrigées, 10 à retrouver, 18 hors champ, 1 ignorés (passer), 0 sans
  source », « Relecture écrite : relecture_qualification.json (166 sources) », « Registre valide : 1133 sources ».)
- [x] 1.3 `qualification.py --registre --rapport` puis `registre.py --tableau` : les verdicts relus
  sont dans le registre, `QUALIFICATION.md` et `REGISTRE_SOURCES.md`. Fait quand : décompte des
  verdicts avant / après collé (rubriques confirmées, hors santé, à vérifier). (Fait le 2026-10-13 : avant
  rubrique-confirmee 155, hors-sante 88, a-verifier 597, pas-d-aap 6, pdf-seulement 1, sans verdict 286 ; après
  rubrique-confirmee 242, hors-sante 18, a-verifier 873 ; « 270 verdicts reportés dans le registre » ; Bpifrance en
  rubrique-confirmee avec relecteur « Monsieur DUCOUT, validation à l'écran » ; `inserm` : url_aap
  https://pro.inserm.fr/rubriques/appels-a-projets/agenda-des-appels-a-projets, ancienne adresse dans les notes.)
- [x] 1.4 Redécouverte des sources corrigées (`decouverte.py --ids ... --forcer`, environnement
  `.venv`), puis `--rapport`. Fait quand : pour chaque source corrigée, statut et page gardée
  collés ; liste des sources à revalider à l'écran (domaine différent) collée. (Fait le 2026-10-13 : premier passage
  sans `--garder-depart` : la découverte remplaçait la page donnée par une autre page du site (FRM, DGOS, SFGG, Alzheimer,
  AÉSIO, Oise) et 29 sources ont dépassé le délai de 180 s ; option `--garder-depart` ajoutée (spec modifiée), trois
  passages à 2 ou 3 en parallèle : 39 rubrique-trouvée sur l'adresse donnée, 11 aucune-rubrique (Maladies rares, ANSM,
  AÉSIO, Alzheimer, SFGG, Yonne, Saint-Pierre-et-Miquelon, Fédération Addiction, ANACT, Reims, DREETS Occitanie), 0 sur un
  autre domaine ; `DECOUVERTE.md` régénéré.)

## 2. Documentation

- [x] 2.1 README scraping (section « Validation manuelle » : `--appliquer-pages`, enchaînement),
  CHANGELOGs, CLAUDE.md (tableau), REPRISE.md, feuille de route (étape 2 : état après report).
  Fait quand : les fichiers citent les mêmes commandes que l'outil. (Fait le 2026-10-13 : README scraping section
  « Validation manuelle », CHANGELOGs, CLAUDE.md, REPRISE.md, feuille de route.)

## 3. Sources à retrouver (tâche de fond)

- [ ] 3.1 Recherche web de la session pour les pages mortes et les mauvaises pages sans adresse,
  puis pour les sources sans page, lot par lot ; chaque page proposée validée à l'écran par
  Monsieur DUCOUT avant correction. Fait quand : journal des recherches et décompte par lot collés.

- [x] 3.2 ANR et ANAP (2026-10-21, question de Monsieur DUCOUT, accord « oui, corrige les deux adresses et lance la
  découverte ») : `url_validee` ANR = https://anr.fr/fr/appels/ (adresse donnée par lui le 2026-10-12, jamais inscrite ;
  la découverte avait gardé l'archive des appels clos), `decouverte.py --ids anr --forcer --garder-depart` : « rubrique-trouvee
  ANR https://anr.fr/fr/appels/ (17 liens) », PEPR PROPSY Psychiatrie de précision présent dans `decouverte/anr/liens.json`.
  `url_validee` ANAP = https://www.anap.fr/s/toutes-les-actualites (choix de la session d'après le plan du site),
  `decouverte.py --ids anap --forcer` : « aucune-rubrique » (un lien d'appel sur la page ; liens Salesforce en shadow DOM
  non lus par l'outil, 14 sur 29). `DECOUVERTE.md` et `REGISTRE_SOURCES.md` régénérés. Reste : extraction des liens ANR
  par la veille après devis, et décision sur la lecture du shadow DOM (modification de l'outil, spec à mettre à jour).

## 4. Vérification

- [ ] 4.1 Vérification par Monsieur DUCOUT : il ouvre `REGISTRE_SOURCES.md` et retrouve Bpifrance en
  rubrique confirmée, l'INSERM avec la nouvelle adresse, et `validation_pages.cmd` lui présente les
  pages redécouvertes.
