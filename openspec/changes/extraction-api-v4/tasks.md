# Tasks

Décision de Monsieur DUCOUT du 2026-10-19 : « garde la V3, crée la V4 avec modèle API payant, tu dois toujours me donner
le coût supposé avant de lancer des appels à l'API ». Règles : devis écrit et accord avant chaque lancement, plafond
cumulé 5 euros, aucun `git push`, aucun archivage sans demande. V3 conservée sous l'étiquette Git `v3-local`.

## 1. Outil

- [x] 1.1 `echantillon.extraire_api` : paramètres `fiches` et `metadonnees` ; `extraction_locale.py` : `--moteur`,
  `--plafond`, `--dry-run`, sortie `results/extraction_api.json`, devis. Fait quand : pytest scraping vert ; essai à
  blanc collé (devis complet) ; journal des coûts inchangé. (Fait le 2026-10-19 : pytest scraping 97 verts ; « Devis :
  1808 textes restants, 6,090,494 caractères ; modèle claude-haiku-5-5, tarif 0.1 USD entrée et 0.5 USD sortie par
  million de jetons ; coût estimé 2.26 euros au plus (trois appels par texte) ; déjà dépensé pour ce modèle 0.519 euros ;
  plafond 5.00 euros » ; journal à 2 065 lignes avant et après.)
- [x] 1.2 Essai réel limité (`--limite 5`) après accord, coût réel collé, cinq fiches relues par la session (champ,
  version 4, moteur api). (Fait le 2026-10-19, accord « accord 1 et 2 » : 5 textes ARS Île-de-France, « 0 pages refusées,
  5 réussites, 0 échecs ; coût cumulé 0.529 euros », soit 0,01 euro, 8 à 12 s par page contre 47 à 60 s en local. Les cinq
  fiches portent moteur api, version 4, a_verifier, un champ avec raison ; mêmes champs et mêmes dates de clôture que les
  fiches locales ; sur « admissions directes », l'API place les 910 000 euros dans l'enveloppe globale, là où le local
  les avait mis en montant minimum et maximum, ce que le contrôle Haiku avait signalé.)

## 2. Passage global

- [x] 2.1 Devis du passage complet collé ici, accord écrit de Monsieur DUCOUT, lancement, bilan (fiches, refus, échecs,
  durée, coût réel lu dans le journal). (Devis : 1 808 textes, 2,26 euros au plus ; accord « accord 1 et 2 » ; lancé le
  2026-10-19 à 10 h 10, fini à 12 h 40 : « 951 pages refusées, 856 réussites, 1 échec ; coût cumulé 1.850 euros », soit
  1,33 euro réel pour le passage ; 7,8 s par fiche en moyenne ; champ : santé 293, médico-social 212, incertain 26, hors
  champ 325 ; 5 fiches à relire pour écart de format ; échec unique : une page de la Ville de Paris refusée par le schéma
  (`ValidationError`). Recouvrement avec la V3 : 807 adresses communes, 49 trouvées par l'API seule, 279 par le local
  seul (pages acceptées par le local et refusées par l'API). Fiches API ouvertes : 353, dont 218 dans le champ.)
- [x] 2.2 Contrôle des fiches API par `verification.py` (devis puis accord), décision du modèle appliquée
  (`appliquer_controle.py`, essai à blanc puis accord), import, compte des fiches publiées collé. (Fait le 2026-10-19 :
  devis « 218 fiches à vérifier, 0.074 euros estimés », accord « ok continue » ; réel « 218 fiches vérifiées ; coût cumulé
  1.978 euros », soit 0,13 euro, sauvegarde `scripts/sauvegardes/verification_2026-10-19_1257` ; `VERIFICATION.md` : 501
  fiches vérifiées, 225 douteuses ; import réel « 54 crees, 483 mis a jour » (la décision du modèle est posée à la
  création) ; `appliquer_controle.py` : essai à blanc « 14 fiches a mettre a jour » puis réel, sauvegarde
  `controle_2026-10-19_1315.json` ; `migrer_champ.py` : 4 fiches publiées classées hors champ par l'API repassées en
  brouillon (Dalloz, poissons migrateurs, Shoah, doctorants SHS ; sauvegarde `champ_publiees_2026-10-19_1317.json`). Base au 2026-10-19, 13 h 20 : 623 documents, 289 publiées (257 validées par le modèle, 28 proposées, 8 à corriger ; moteur api 207, connecteurs 37, local 48), 44 archivées, 290 brouillons ; « 289 AAP disponibles » sur /aap/search. Coût total de la V4 : 1,46 euro, cumul Haiku 1,98 euro sur 5.)

## 3. Documentation et vérification

- [x] 3.1 README scraping, README racine, CHANGELOGs, CLAUDE.md (décision V4, état d'avancement), REPRISE.md,
  `docs/FLUX_DONNEES.md`, `docs/FEUILLE_DE_ROUTE.md`, rapport section 8. (Fait le 2026-10-19.)
- [ ] 3.2 Monsieur DUCOUT ouvre `/aap/search` et constate le nombre d'appels publiés, et relit `tasks.md` (coûts réels).
