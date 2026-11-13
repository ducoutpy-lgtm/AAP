# Tasks

Correction acceptée par Monsieur DUCOUT le 2026-10-28 (« Oui, corrige », puis « Marqueur propre »). Zéro euro.

- [x] 1.1 Tests rouges : adresse de travail (`url_validee` > `page_ciblee` > `url_aap`), seuil d'un lien et
  `page_appel` permis avec une page ciblée, `page_ciblee` non http refusée, confirmation « bonne page » et correction
  « mauvaise page » d'une page ciblée. Fait quand : pytest rouge collé. (Fait le 2026-10-28 : « 3 failed, 30 passed »,
  dont `KeyError: 'url_validee'` pour la confirmation.)
- [x] 1.2 `registre.py`, `decouverte.py`, `validation.py`. Fait quand : tests verts, suite complète du scraping verte.
  (Fait le 2026-10-28 : « 33 passed » sur les trois fichiers, « 150 passed » sur `scraping/tests`. Le bilan de
  `--appliquer-pages` affiche aussi le nombre de pages ciblées devenues adresses validées.)
- [x] 2.1 Migration à blanc des 47 sources du lot B1 (script du dossier temporaire de la session). Fait quand : décompte
  collé (47 migrées, 3 remises « à vérifier »). (Fait le 2026-10-28 : « 47 sources migrées vers page_ciblee ; 3 remises
  « a-verifier » : seine-saint-denis-commission-des-financeurs, landes-commission-des-financeurs,
  oise-commission-des-financeurs » ; « validee_par « lot B1 » restantes : 0 ; format : 0 erreur ». Sélection mesurée :
  40 sources dont la page égale `url_aap`, 7 dont elle diffère (Nièvre, Cher, Vaucluse, Haute-Saône, Ardennes, Vienne,
  Collectivité de Corse), et non 39 et 8 comme écrit dans la question 10.)
- [x] 2.2 Migration réelle, `registre.py --verifier-format`, `registre.py --tableau`. Fait quand : « Registre valide »
  collé, aucune `validee_par` « lot B1 », diff de `REGISTRE_SOURCES.md` sans changement de lien. (Fait le 2026-10-28 :
  « Registre valide : 1269 sources » ; 47 champs `page_ciblee` ; diff de `REGISTRE_SOURCES.md` : 3 lignes, seule la
  colonne de qualification change (Landes, Oise, Seine-Saint-Denis : « a-verifier »), aucun lien.)
- [x] 3.1 Réglages recalculés comparés aux 47 `liens.json`. Fait quand : « 0 écart » collé. (Fait le 2026-10-28 :
  « réglages avant / après : 0 écart ; réglages / liens.json : 0 écart (44 fichiers comparés) » ; les 3 autres sources
  n'ont pas de fichier de liens : Landes, Oise, Seine-Saint-Denis.)
- [x] 3.2 Découverte rejouée sur `aude-appels-a-projets` et `dordogne-commission-des-financeurs`. Fait quand :
  « rubrique-trouvee » collé pour les deux. (Fait le 2026-10-28 : « rubrique-trouvee Dordogne – Conférence des
  financeurs (CFPPA) … (7 liens) », « rubrique-trouvee Aude – portail Moi Senior, appels à projets … (1 liens) » ;
  `liens.json` de la Dordogne : seuil 1, page d'appel, la page elle-même en premier lien ; Aude : seuil 1, appel
  #moisenior 2027.)
- [x] 3.3 Migration des 25 autres sources posées « à confirmer à l'écran » par une session (question 12 de
  `docs/A_VALIDER.md`, accord de Monsieur DUCOUT du 2026-11-13 : « Oui, migre-les »). Fait quand : essai à blanc, puis
  migration réelle, « 0 écart » et découverte rejouée collés. (Fait le 2026-11-13 : « 25 sources migrées vers
  page_ciblee ; réglages avant / après : 0 écart ; réglages / liens.json : 0 écart (25 fichiers comparés) ;
  url_validee « à confirmer » restantes : 0 ; page_ciblee au total : 72 ; format : 0 erreur » ; « Registre valide :
  1269 sources » ; diff de `REGISTRE_SOURCES.md` : la date de génération seulement. Découverte rejouée :
  « rubrique-trouvee Gérond'if … appel-à-projet-tubbe (1 liens) » (page d'appel) et « rubrique-trouvee Fehap …
  novap.fehap.fr (1 liens) » ; « 150 passed ».)
- [x] 4.1 Documentation : `scraping/README.md`, `scraping/CHANGELOG.md`, `docs/A_VALIDER.md` (question 10 tranchée,
  25 autres sources soumises en question 12), `REPRISE.md`, `CLAUDE.md`.
- [ ] 5.1 Vérification par Monsieur DUCOUT : `python scraping/registre.py --verifier-format`, puis lien « page » de la
  Dordogne dans `scraping/REGISTRE_SOURCES.md`.
