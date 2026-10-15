# Tasks

Accord de Monsieur DUCOUT du 2026-10-15 (« 1 ok ») : contrôle des fiches publiées par `claude-haiku-5-5`, 0,10 euro
estimé, mention « relue » réservée à ses verdicts. Règles : coût écrit avant tout appel, plafond cumulé 5 euros,
sauvegarde avant écriture, aucun `git push`, aucun archivage sans demande.

## 1. Outil

- [x] 1.1 `scraping/verification.py` et `extractor.verifier_fiche` : fonctions pures testées (normalisation, sélection,
  estimation, bilan, rapport), essai à blanc. Fait quand : pytest scraping vert ; essai à blanc collé (fiches, coût).
  (Fait le 2026-10-15 à 11 h : `tests/test_verification.py` 4 tests, pytest scraping 90 verts ; essai à blanc :
  « extraction_locale.json : 1086 fiches, 259 à vérifier, 0.088 euros estimés ; fondation_de_france.json : 22 ;
  ars_idf.json : 1 ; ars_idf_local.json : 1 ; Modèle claude-haiku-5-5, tarif entrée 0,1 et sortie 0,5 USD par million
  de tokens, cumul déjà dépensé 0.365 euros, plafond 5.00 euros ; Essai à blanc : 283 fiches à vérifier, 0.096 euros
  estimés ». Les 308 fiches publiées comprennent des fiches des connecteurs déjà closes, non contrôlées.)
- [x] 1.2 Contrôle réel des fiches publiables. Fait quand : compte des fiches vérifiées et douteuses collé, coût réel lu
  dans le journal, sauvegarde nommée ; `VERIFICATION.md` écrit et résumé collé. (Fait le 2026-10-15, 10 h 40 à 11 h 10 :
  premier passage interrompu à la 23e fiche par une réponse mal formée du modèle (bloc `champs` rendu en texte),
  normalisation rendue tolérante et testée, reprise ; « 260 fiches vérifiées ; coût cumulé 0.519 euros ; sauvegardes
  dans scripts/sauvegardes/verification_2026-10-15_1052 » (premier passage : `verification_2026-10-15_1037`) ; journal :
  284 appels étape `verification`, 0,154 euro réel pour 0,096 estimé ; « Rapport écrit : VERIFICATION.md (283 fiches
  vérifiées, 154 douteuses) » : 129 sans doute, 74 douteuses hors description, 80 sur la seule description, 39 pages
  « pas un appel précis » selon le modèle.)

## 2. Relecture et base

- [x] 2.1 `validation.py` : fiches douteuses d'abord, bloc « Contrôle par le modèle » ; `import_to_firestore.py` :
  résumé dans `scrapeMetadata.verification`, type `AAP`. Fait quand : pytest scripts vert, lint et build verts ; écran
  de validation relu par la session avec une fiche douteuse en tête. (Fait le 2026-10-15 : pytest scripts 23 verts,
  lint et build verts ; écran ouvert sur le port 8790 par la session : « Fiche 1 sur 486 », première fiche « 55th
  Fondation ARC Léopold Griffuel Awards » avec « Contrôle par le modèle (claude-haiku-5-5, 2026-10-15) : 4 champ(s)
  douteux : date_ouverture (fabrique) ; date_cloture (manquant, page : 2026-09-21) ; montant_min (manquant, page :
  200000) ; description (faux). Ce contrôle ne remplace pas votre verdict. »)
- [x] 2.2 Ré-import (résumé dans la base). Fait quand : sortie collée, nombre de fiches publiées inchangé. (Fait le
  2026-10-15 à 11 h 15 : essai à blanc « AAP lus : 1191 | a importer : 529 », réel « Termine : 0 crees, 529 mis a jour ».)

## 3. Documentation et vérification

- [x] 3.1 README scraping, README racine, CHANGELOGs, CLAUDE.md, REPRISE.md, `docs/FLUX_DONNEES.md`, rapport section 8.
  (Fait le 2026-10-15.)
- [x] 3.2 Monsieur DUCOUT ouvre la validation, voit une fiche douteuse en premier avec les valeurs lues sur la page, et
  lit `VERIFICATION.md`. (Ouverte le 2026-10-15 à midi : « j'ai toujours 486 fiches à valider ! pourquoi c'est pas validé
  par Haiku, j'ai payé pour qu'il le fasse à ma place » : la règle « relue réservée à ses verdicts » n'était pas ce qu'il
  voulait ; section 4.)

## 4. Le contrôle vaut relecture (décision de Monsieur DUCOUT du 2026-10-15, midi)

- [x] 4.1 `verification.decision_du_modele` (validee / rejetee / a_corriger, corrections lisibles dates et montants),
  `appliquer_corrections`, `restantes_a_relire` ; `import_to_firestore.appliquer_decision_du_modele` ; `validation.py`
  ne présente que les fiches restantes. Fait quand : tests verts ; écran de validation relu par la session. (Fait le
  2026-10-15 : pytest scraping 92, scripts 25 verts ; écran sur le port 8790 : « 486 fiches lues, 6 restent à relire ».
  Décisions sur `extraction_locale.json` : 224 validées, 29 rejetées, 6 à relire ; corrections : date_ouverture 30,
  date_cloture 17, enveloppe 16, montant_max 8, montant_min 4.)
- [x] 4.2 `scripts/appliquer_controle.py` (migration des fiches déjà en base, sauvegarde, essai à blanc, verdict humain
  conservé, connecteur préféré au modèle local pour une même adresse). Fait quand : essai à blanc collé. (Fait le
  2026-10-15 : « a_corriger 8, correction date_cloture 18, correction date_ouverture 32, correction enveloppe_globale 16,
  correction montant_max 8, correction montant_min 4, rejetee 39, validee 231 ; 278 fiches a mettre a jour ».)
- [ ] 4.3 Exécution réelle de `appliquer_controle.py` après l'accord de Monsieur DUCOUT ; sortie et sauvegarde collées ;
  ré-import ; compte des fiches « à vérifier » dans l'application collé.
- [x] 4.4 Documentation (README scraping, CHANGELOGs, CLAUDE.md, REPRISE.md, `docs/FLUX_DONNEES.md`, rapport section 8).
  (Fait le 2026-10-15.)
- [ ] 4.5 Monsieur DUCOUT ouvre la validation (6 fiches restantes attendues) et l'application (fiches sans badge « à
  vérifier », 39 fiches archivées absentes).
