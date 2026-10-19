# Changelog

Toutes les modifications notables du dépôt AAP Santé sont documentées ici (format Keep a Changelog, en
français). Le journal propre au volet scraping reste dans `scraping/CHANGELOG.md`.

## [Non publié]

### Ajouté
- Contrôle des fiches par le modèle (changement `verification-assistee-haiku`, 2026-10-15, accord de Monsieur DUCOUT) :
  `scraping/verification.py` relit chaque fiche publiable à côté de sa page avec `claude-haiku-5-5` et donne un verdict
  par champ ; 283 fiches contrôlées pour 0,15 euro, 129 sans doute, 74 douteuses sur une date, un montant, le financeur,
  le titre ou le territoire, 80 sur la seule description ; l'outil de validation présente les fiches douteuses en
  premier avec la valeur lue sur la page ; l'import reporte le résumé dans `scrapeMetadata.verification` ; rapport
  `scraping/VERIFICATION.md`. Le même jour à midi, sur décision de Monsieur DUCOUT (« j'ai payé pour qu'il le fasse à ma
  place »), le contrôle vaut relecture : l'import écrit la décision du modèle dans `validation` (validée, rejetée et
  archivée, ou à corriger ; un verdict humain l'emporte), applique ses corrections de dates et de montants ;
  `scripts/appliquer_controle.py` fait de même pour les fiches déjà en base (essai à blanc : 231 validées, 39 rejetées,
  8 à corriger sur 278, exécution réelle à 12 h 31 sur son accord, sauvegarde `controle_2026-10-15_1231.json`) ; base :
  270 publiées dont 231 validées par le modèle, 39 archivées, 38 badges « à vérifier » contre 307 ; l'outil de validation
  ne présente plus que les 6 fiches restantes.
- Accès à l'administration (changement `acces-administration`, 2026-10-15, demande de Monsieur DUCOUT : « le lien
  /admin ne fonctionne pas ») : script `scripts/creer_admin.py` (compte Firebase Auth créé sans mot de passe ou
  retrouvé, profil `users` avec le rôle admin, essai à blanc, idempotent) et page `/reset-password` « Mot de passe
  oublié » (e-mail de réinitialisation Firebase), dont le lien existait sur la page de connexion mais menait à la 404.
  Constat : aucun compte admin n'existait, fournisseur Google désactivé.
- Suivi de la validation dans `/admin/aaps` (changement `acces-administration` 2.1, 2026-10-19, instruction 12) :
  compteurs cliquables et filtre par `validation.statut`, badge, relecteur, date et commentaire sur chaque fiche. Base
  au 2026-10-19 : proposée 54, à corriger 245, validée 231, rejetée 39 (569 documents).

### Modifié
- Question du champ dans la chaîne d'extraction (changement `filtre-champ-sante` 5.1, 2026-10-19) : les fiches
  nouvelles, extraites en local ou par l'API, portent leur champ (santé, médico-social, hors champ, incertain) dès
  leur production, consigne version 4 ; le classement rétroactif `champ.py --classer` ne sert plus qu'en rattrapage.
- Fin du passage global d'extraction locale (2026-10-15, 7 h 40 : 2 178 textes, 1 086 fiches, 1 070 pages refusées,
  22 échecs, 28,6 h, 0 euro) puis classement du champ des 1 086 fiches par `claude-haiku-5-5` sur l'accord de Monsieur
  DUCOUT (santé 312, médico-social 209, hors champ 513, incertain 52 ; 0,23 euro réel), ré-import (120 fiches créées,
  409 mises à jour) et retrait des 147 appels hors champ publiés (`scripts/migrer_champ.py`, sauvegarde). Base : 308
  fiches publiées (santé 172, médico-social 106, incertain 29), 261 brouillons dont 258 hors champ. Rapport du champ
  par source : `scraping/CHAMP.md`.
- Nettoyage de la base (changement `nettoyage-financeurs-territoires`, 2026-10-14 au soir, constat de Monsieur DUCOUT :
  « base sale », filtres incohérents) : l'import écrit la source réelle de chaque fiche (émetteur du registre, nom et
  fichier d'origine dans `scrapeMetadata`), un nom de financeur canonique (table `scraping/sources/financeurs.json`
  construite depuis le registre, nom lu par l'IA conservé) et un territoire déduit du texte puis de l'émetteur
  (`scraping/sources/departements.json`, 101 départements, outre-mer, anciennes régions, grandes villes), « france »
  réservé aux appels nationaux et « non-precise » sinon ; filtre Source ajouté à la recherche, filtre Financeur sur le
  nom canonique ; rapport des fiches publiées en double `scripts/doublons.py`. Essai à blanc : 149 financeurs
  distincts pour 390 fiches publiées (203 pour 420 dans la base le soir), 101 territoires « france » au lieu de 243,
  3 non précisés. Ré-import réel fait le 2026-10-14 à 23 h 15 sur son accord : 415 fiches publiées, 151 financeurs
  distincts contre 201, les 18 ARS à une entrée chacune, territoire « National » 108 contre 234, 3 « non précisé »,
  plus aucune source « extraction_locale » ; 5 groupes de fiches en double (10 fiches) listés par `scripts/doublons.py`,
  à trancher à la main. Les 10 fiches publiées classées hors
  champ ont été repassées en brouillon (`scripts/migrer_champ.py`, sauvegarde dans `scripts/sauvegardes/`), sur sa
  décision (« oui tu les retires »).
- Recherche des AAP (changement `filtres-recherche`, 2026-10-14 au soir) : filtres Territoire (libellés des identifiants
  réellement présents), Thématique (santé, médico-social, non classée, d'après le champ classé) et Financeur construits
  à partir des fiches chargées ; le filtre budget n'écarte plus les fiches sans montant connu. Import réel du soir :
  420 AAP publiés, dont les fiches sans date de clôture (décision de Monsieur DUCOUT).
- Filtre du champ santé et médico-social (changement `filtre-champ-sante`, instruction 26 du rapport de critique,
  2026-10-14 au soir) : chaque fiche reçoit un champ (`sante`, `medico-social`, `hors-champ`, `incertain`) par une
  question fermée au modèle (`scraping/champ.py`, définition décidée par Monsieur DUCOUT), l'import met les fiches
  hors champ en brouillon à corriger, le verdict « hors champ » de la validation quotidienne rejette la fiche, et les
  fiches sans date de clôture sont désormais publiées avec « Date de clôture non précisée » au lieu d'entrer en
  brouillon (décision de Monsieur DUCOUT). L'import ignore les fichiers de la comparaison des moteurs.
- Comparaison de deux moteurs sur 50 pages (changement `comparaison-moteurs-50-pages`, 2026-10-14) :
  `scraping/comparaison.py`, premier tirage de collectivités jugé et rapporté, second tirage chez les financeurs de
  la santé.
- Lot 0 d'assainissement (changement `lot-0-assainissement`, 2026-10-14, rapport de critique validé par Monsieur
  DUCOUT) : routage de l'application réduit au MVP de consultation (inscription fermée, modules gelés sans
  modification), `validation.statut` seule source de la fiabilité d'une fiche (étiquette `a-verifier` dérivée, `par`),
  liste blanche des champs de l'import, `deadline` nulle pour les fiches sans date (type `AAP` nullable, bloc
  `validation` dans le type), règles Firestore du MVP (actions admin, collections gelées en écriture interdite),
  verdicts des pages et des liens versionnés dans `scraping/sources/`, mesure d'un modèle API sur l'échantillon
  sous plafond. Verdicts migrés et règles déployées le 2026-10-14 après accord de Monsieur DUCOUT ; 141 échéances
  fictives passées à `null` par Monsieur DUCOUT le 2026-10-14 ; mesure API `claude-haiku-5-5` faite le 2026-10-14 après
  accord (45 textes lus par adresse, 19 justes et 1 fabriquée sur 20 comparées, seuil 20/2 manqué d'une fiche, coût
  réel 0,03 euro, `scraping/ECHANTILLON.md`).
- Organisation des données validées (changement `organisation-donnees-validees`, 2026-10-14, suite à
  `docs/AUDIT_DONNEES_2026-10-14.md`) : identifiant Firestore dérivé de l'adresse de l'appel (341 documents
  migrés), décisions humaines (`status`, `validation`) jamais réécrites par l'import, verdicts de
  `scraping/sources/verdicts_fiches.json` appliqués, fiches sans date en brouillon, adresse validée distincte
  de l'adresse d'origine dans le registre. Schéma des flux : `docs/FLUX_DONNEES.md`.

### Ajouté
- Lot 0 : configuration ESLint de l'application, tests des règles Firestore sur l'émulateur (`npm run test:rules`,
  JDK 21), cinq tests de l'audit sur un faux Firestore (`scripts/tests/`), `scripts/migrer_echeances.py`, options
  `--migrer-verdicts` et `--appliquer-pages --dry-run` de `validation.py`, moteur `api` de `echantillon.py`.
- Extraction locale globale (changement `extraction-locale-globale`, 2026-10-13 soir) : `scraping/extraction_locale.py`
  extrait avec `qwen3:8b` les pages des 242 rubriques validées (2 395 adresses web uniques), fiches marquées
  « à vérifier » ; l'import pose l'étiquette `a-verifier` et l'application affiche le badge « À vérifier ».
- Verdicts de Monsieur DUCOUT sur les 257 pages reportés au registre (`validation.py --appliquer-pages`, changement
  `recherche-page-aap-par-source`), 50 adresses corrigées et redécouvertes (`decouverte.py --garder-depart`) ; vague 1 des
  fondations terminée (365 / 664, 1 198 sources) ; famille PLIE ajoutée à l'inventaire.
- Registre : vague 1 poursuivie par la recherche web de la session (203 fondations, 100 sites inscrits), 1 123 sources,
  couverture 298 / 664 ; agrégateur Fimeco Walter Allinial ajouté (deux pages) ; veille URIOPSS PACA-Corse exploitée
  (10 financeurs ajoutés, 1 133 sources).
- Registre : 172 fondations de la vague 1 créées (1 022 sources), couverture mesurée 191 / 664 en tête de `REGISTRE_SOURCES.md` ;
  recherche des sites par l'API Tavily (clés du projet Scrapling, limite de plan atteinte après 191).
- Changement OpenSpec `registre-par-annuaires` (2026-10-13) : familles d'émetteurs adossées à des annuaires de référence avec taux de
  couverture ; première vague = 664 fondations reconnues d'utilité publique et d'entreprise à domaine santé-social, extraites du
  Registre national des fonds et fondations (`scraping/annuaires.py`, `scraping/sources/annuaires/`).
- Registre : source UDAF de l'Essonne ajoutée (848 sources) ; famille UDAF (96 sites listés par l'UNAF) à étudier.
- Outil de validation manuelle des pages et des liens dans le navigateur de Monsieur DUCOUT (changement OpenSpec
  `validation-manuelle-aap`, 2026-10-13, vérification 2.1 par Monsieur DUCOUT en attente) ; brouillon de changement
  `recherche-page-aap-par-source` (recherche web de la page des appels de chaque source). Règle « Preuve avant
  affirmation » ajoutée dans `CLAUDE.md`. Feuille de route : étape 2 repassée « à valider à la main ».
- Second tour d'extraction par le modèle local (changement OpenSpec `extraction-ollama-second-tour`, 2026-10-13, en
  attente de la décision de Monsieur DUCOUT) : question fermée avant extraction, contrôle des formats, contrôle
  automatique contre les fiches de référence, seuil de décision. Résultat : mistral 7b 15 fiches justes sur 23 et
  13 fabriquées ; qwen3:8b 16 sur 21 et 1 fabriquée ; seuil (20 et 2) non atteint. Détail dans `scraping/ECHANTILLON.md`.
- Consultation des AAP sans compte (changement OpenSpec `consultation-aap-sans-compte`, 2026-10-13) : règle Firestore
  « lecture publique des AAP publiés » déployée sur `aapi-11bc3`, routes « Rechercher des AAP » et fiche sorties de la
  zone protégée, lien « Voir les appels à projets » sur l'accueil ; « Candidater » et favori renvoient vers la
  connexion sans compte. Les appels à projets sont des informations publiques ; le compte ne sert qu'aux actions.
- Relecture manuelle de la qualification (changement OpenSpec `relecture-qualification`, 2026-10-12) : fichier versionné
  `scraping/sources/relecture_qualification.json` appliqué par `qualification.py` par-dessus les verdicts du modèle (verdict
  du modèle conservé, section « Relecture manuelle » dans `QUALIFICATION.md`). 60 pages relues sans IA ; bilan : 155 rubriques
  confirmées (127 avant), 88 hors santé, 6 sans AAP, 20 à vérifier.
- Extraction sur échantillon (`extraction-echantillon-aap`, 2026-10-12) : extraction Ollama terminée (41 fiches sur 45 en une
  heure environ, dont trois délais dépassés de dix minutes), contrôle des fiches et rapport `scraping/ECHANTILLON.md`
  (Ollama 9 fiches justes sur 41, session 24 sur 24, API estimée 99 euros pour 3 748 liens) ; 6 fiches validées importées
  dans Firestore (95 AAP scrapés en base).
- `scripts/import_to_firestore.py` : l'import global ignore les fichiers `echantillon_*.json` et `controle_*.json`
  (import de l'échantillon seulement par `--source`), pour ne jamais verser en base des fiches non contrôlées.
- Qualification des sources (changement OpenSpec `qualification-des-sources`, 2026-10-12) : 270 rubriques relues par
  le modèle local, 127 confirmées comme publiant des appels à projets santé ; verdict dans le registre et `scraping/QUALIFICATION.md`.
- Échantillon d'extraction (`extraction-echantillon-aap`, en attente) : 24 fiches produites par la session, coût API estimé.
- `REPRISE.md` à la racine : résumé du projet et consigne de reprise pour chaque nouvelle session.
- Robot de découverte des rubriques appels à projets (changement OpenSpec `decouverte-rubriques-aap`,
  2026-10-09) : 847 sources explorées sans IA, 268 rubriques trouvées, 3744 liens d'AAP gardés en local
  pour l'extraction à venir. Rapport `scraping/DECOUVERTE.md`.
- Registre des sources, seconde extension (changement OpenSpec `registre-des-sources-2`, 2026-10-09) : 847
  sources, 657 pages vérifiées ; caisses et services de l'État locaux, IHU, GIRCI, Europe régionale, fédérations,
  plateformes de dépôt, sur la liste de Monsieur DUCOUT.
- Registre des sources (changement OpenSpec `registre-des-sources`, 2026-10-09) : 334 émetteurs d'AAP
  inventoriés dans `scraping/sources/registre.json` (régions, départements et grandes villes via l'annuaire
  officiel de l'administration), 304 pages vérifiées, outil `scraping/registre.py`,
  vue `scraping/REGISTRE_SOURCES.md`. Aucune dépense.
- Pièces jointes des AAP scrapés (changement OpenSpec `pieces-jointes-aap`, 2026-10-09) : section
  « Pièces jointes » sur la fiche et compteur « N pièces jointes » sur les cartes de la recherche ;
  champ optionnel `scrapeMetadata` déclaré sur le type `AAP`. Les fichiers déjà téléchargés par le
  scraping (93 sur 109) sont servis depuis le PC en développement (`app/public/documents` ->
  `scraping/downloads`, lien de jonction ignoré par Git), car les ARS refusent l'accès direct
  (« Forbidden ») ; les autres gardent leur lien d'origine. Envoi vers Firebase Storage codé mais
  désactivé (`--vers-storage`, nécessite le forfait Blaze : compte de facturation fermé).
- Démo de bout en bout (changement OpenSpec `demo-aap-scrapes-visibles`, 2026-10-09) : 89 AAP scrapés
  importés dans Firestore et visibles dans l'application ; procédure de rejeu dans le README (section 4).
- `app/src/utils/deadline.ts` : helper partagé « jours restants » ; mention « Clôturé » dans la liste et la
  fiche d'un AAP dont la date de clôture est passée.
- `scripts/import_to_firestore.py` : fusion des doublons entre sources avant écriture ; dépendances fixées
  (`google-cloud-firestore`, `grpcio` 1.74.0).

### Corrigé
- `app/src/pages/porteur/SearchAapPage.tsx` : la recherche par mot ne filtrait jamais (condition sur le
  financeur toujours vraie, parenthèse manquante).

### Connu, non corrigé (hors périmètre de la démo)
- À l'inscription, un message d'erreur s'affiche après la création réussie du compte (étape d'envoi de
  l'e-mail de vérification) ; la page de connexion ne redirige pas quand l'utilisateur est déjà connecté.
- `npm run lint` ne peut pas tourner : aucune configuration ESLint dans `app/`.
