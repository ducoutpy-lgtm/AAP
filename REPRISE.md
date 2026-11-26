# Reprise du projet AAP Santé (écrit le 2026-10-12, à lire au début de chaque session)

**Règle de quota de la semaine du 16/11/2026** (relance de Monsieur DUCOUT, « Rythme régulier ») : plafond par jour sur
la ligne « Weekly · all models » de `mcp__ccd_session_mgmt__get_usage`, partagé par quatre projets : lundi 16 : 22 % ;
mardi 17 : 37 % ; mercredi 18 : 52 % ; jeudi 19 : 67 % ; vendredi 20 : 82 % ; samedi 21 : 95 %. Relire la consommation
avant chaque lot et au moins toutes les 15 minutes ; plafond du jour atteint : arrêt propre (commit, push, `REPRISE.md`
à jour), fin du tour ; relance automatique le lendemain matin. Mise en ligne et dépense hors délégation : son « oui »
écrit dans la conversation.

- 2026-11-16 : extraction des PDF des conférences finie (« 1327 réussites (65 nouvelles), 42 échecs », cumul Haiku
  3,462 euros, soit 0,589 pour un devis de 0,59) ; veille du lundi lancée à 9 h 11 (PC éteint à 8 h), en cours à 10 h 25 ;
  contrôle, qualification et import en « à valider » par sa partie payante (`veille_payante.py`).
- 2026-11-16 matin : changement `alertes-recherches-sauvegardees` (semaine 3, « alertes ») codé, testé et joué sur les
  émulateurs ; reste sa vérification 4.3 et la mise en ligne sur accord (question 24). Documents réutilisables : question
  23 (pièces jointes, donc Blaze, ou textes réutilisables). Changement `export-donnees-personnelles` (semaine 4, droits
  RGPD) codé et joué sur les émulateurs ; suppression du compte : question 25 ; mise en ligne : question 26. Prochains
  lots sans décision : mesure d'exactitude sur 30 fiches, espace financeur (démonstration à 9 étapes), liste « prêt pour
  testeurs ».
- 2026-11-16, 11 h 30 : faits : liste `docs/PRET_POUR_TESTEURS.md` ; mesure d'exactitude (`scraping/EXACTITUDE.md`,
  110 / 120, 0 date inventée, seuil atteint ; financeurs remplacés par le relais dans 6 fiches sur 30) ; règles du
  stockage durcies et testées (`regles-stockage-durcies`, question 27). Reste en semaine 4 : démonstration financeur
  9 / 9 (étape « Nouvel appel » à jouer sur les émulateurs).
- 2026-11-16, fin de matinée : démonstration financeur 9 / 9 sur les émulateurs (la publication d'un appel échouait
  toujours : corrigé, `publication-appel-financeur`) ; parcours candidat complet joué avec un compte neuf (premier clic
  sur « Candidater » renvoyait au tableau de bord : corrigé, `premier-clic-candidater` ; cloche « Alertes » retirée) ;
  tirage de vingt recommandations `docs/TIRAGE_RECOMMANDATIONS.md` (avis de la session : environ 4 pertinentes,
  qualification trop large, question 29) ; bilan du pilote dans `docs/PILOTE_MVP.md` section 4. Questions ouvertes du
  jour : 23 à 29 de `docs/A_VALIDER.md` (une seule mise en ligne possible pour 24, 26 et 28 ; règles du stockage 27).
- 2026-11-16, 13 h : veille du lundi terminée sans intervention (« Veille terminee le 16/11/2026 11:33 », courriels
  partis), étape payante arrêtée au devis (0,52 euro, question 30). « Oui, mets en ligne » : relecture à plusieurs agents,
  11 constats corrigés (`corrections-relecture-16-novembre`), hébergement et règles du stockage déployés (version
  `index-BB_FScPX.js`) ; règles Firestore déployées ensuite sur « Oui, déploie les règles ». Questions ouvertes : 23,
  25, 29, 30.
- 2026-11-16, après-midi : « Oui, 0,52 € » (question 30) : extraction des 341 textes nouveaux de la veille lancée en tâche
  de fond (`extraction_locale.py --extraire --moteur api --plafond 3.982`, journal
  `scraping/logs/extraction_veille_2026-11-16.log`). Ensuite : devis du contrôle et de la qualification (hors budget de
  la semaine, accord à demander), puis import en « à valider ».
  Fait : extraction 189 fiches nouvelles pour 0,427 euro (cumul 3,889) ; contrôle de 76 fiches dans la délégation pour
  0,054 euro (cumul 3,943), après le correctif d'encodage de `veille_payante.lancer` ; qualification (devis 0,054) et
  import attendent son accord (question 32). Semaine du 16 novembre : 0,481 euro dépensé sur 0,50.
- 2026-11-17 : « Oui, 0,054 € » : 74 fiches qualifiées pour 0,028 euro (cumul Haiku 3,971), import en « à valider » (159
  créées, 435 mises à jour) ; base 1 080 fiches, 363 visibles (inchangé), file « Proposée » 171. Semaine du 16 novembre :
  0,509 euro. Questions ouvertes : 3 (file à relire), 23, 25, 29.
- 2026-11-17 : /simplify appliqué au code de la séance (sans changement de comportement, rien de mis en ligne).
  Constats écartés, à reprendre dans des changements dédiés (le réglage `ignoreUndefinedProperties` est fait le 2026-11-18) : profil tenu par un écouteur `onSnapshot` au lieu de
  `fusionnerProfil` (cause de la relecture partielle non prouvée) ; règle Firestore générale « champs propriétaires
  figés » pour `aap`, `applications`, `messages` (déploiement sur accord) ; liste filtrée de `/aap/search` calculée au lieu d'être un état ; montant illisible normalisé à l'entrée au lieu d'imiter `parseFloat` (changement de
  comportement, à valider).
- 2026-11-18 : « reprends ». Lecture des PDF par la veille chiffrée (400 PDF jamais lus, environ 1 euro) : question 33.
  Aucune recherche sauvegardée en base : conversion des recherches d'avril retirée ; FAQ corrigée (alertes, messagerie) ;
  `EXACTITUDE.md` régénérable sans perte. Questions ouvertes : 3, 23, 25, 29, 33. Rien de mis en ligne depuis le 16.
  Puis réglage `ignoreUndefinedProperties` de Firestore (rejoué sur les émulateurs). À mettre en ligne sur accord : FAQ,
  retrait de la conversion d'avril, réglage Firestore (hébergement seulement).
- 2026-11-18, fin de matinée : il arrête de relire la file non triée (« tu dois me proposer uniquement les fiches où il
  y a un doute », « oui ok change la phrase de délégation ») : tri automatique (`tri-automatique-file`), 23 doublons
  rejetés, 83 publiées, 61 restent avec leur motif, 450 visibles ; la veille du lundi trie désormais après l'import.
  Hébergement mis en ligne ensuite (version `index-DhLlUBUZ.js`). Questions ouvertes : 23, 25, 29, 33.
- 2026-11-18, 16 h 50 (relance de la séance de pilotage, quota 41 % pour 52 %) : liens du courriel du lundi corrigés
  (site en ligne au lieu de localhost). Plus aucune étape du plan sans dépense, mise en ligne ni décision : le reste
  attend ses réponses (23 documents réutilisables, 25 suppression du compte, 29 recommandations, 33 lecture des PDF) ou
  le budget de la semaine prochaine (contrôle des 27 fiches jamais contrôlées, environ 0,02 euro). Prochaine preuve : la
  veille du lundi 23 novembre (tri automatique après l'import, liens du courriel).
- 2026-11-19 (réponses 23, 25, 29, 33 relayées par la séance de pilotage, rangées dans « Tranchées ») : 29 (a) fait
  (règles plus strictes et règle Horizon Europe ; tirage au mieux 12 pertinentes sur 20) ; 23 (b) fait (textes
  réutilisables, joué sur les émulateurs). Restent : 25 (suppression du compte, règles à déployer sur son accord), 33 et
  29 (b) par le modèle local (règle « modèle local par défaut » à confirmer par lui, car elle renverse la décision V4 du
  19 octobre écrite dans `CLAUDE.md`). Rien de mis en ligne depuis le 18.
  Brouillon `openspec/changes/lecture-pdf-locale/proposal.md` : voies A (tout local, à mesurer) et B (extraction locale,
  contrôle Haiku), heure de la tâche de nuit ; en attente de son choix.
  25 fait aussi (`suppression-compte`, joué sur les émulateurs). À mettre en ligne sur son accord : règles Firestore
  (suppression) et hébergement (textes réutilisables, recommandations, suppression).
- 2026-11-19 après-midi : « Voie A, tout local » (question 33) : contrôle et qualification savent travailler en local
  (`--moteur ollama`, zéro euro, changement `lecture-pdf-locale` tâches 1.1-1.2). Suite : mesure local contre Haiku
  (tâche 2.1), puis collecte des PDF et chaîne locale de nuit (3.1).
  Mesure 2.1 lancée vers 12 h 15 (Ollama démarré, Unity arrêté) : 14 fiches contrôlées et qualifiées par Haiku,
  verdicts retirés dans une copie (dossier de travail de la séance : `reference_haiku.json`, `mesure_locale.json`,
  journaux `mesure_verif.log` et `mesure_qualif.log`). Résultat dans `scraping/LOCAL_CONTRE_HAIKU.md` : contrôle local
  utilisable pour le tri (plus prudent), qualification locale sans gain pour les recommandations. Prochaine étape (3.1) :
  collecte des PDF par la veille et tâche planifiée de nuit : faites sur son « Oui, lundi 23 h » (tâche « AAP Sante -
  lecture locale des PDF », premier passage 23/11 à 23 h, journal `scraping/logs/chaine_pdf_locale.log`). À vérifier
  mardi 24 au matin. Restent ses réponses : mise en ligne (règles de suppression, hébergement) et règle « modèle local
  par défaut ».
- 2026-11-19, 15 h 45 (demande relayée par la séance de pilotage) : premier passage anticipé. Collecte des PDF lancée
  (`rejeu.py --collecter --pdf`, journal `scraping/logs/collecte_pdf_2026-11-19.log`, sans coût) ; ensuite, si la carte
  graphique et Ollama sont libres (`ollama ps`, `nvidia-smi` ; la séance Perroquet fait une mesure d'environ 40 min),
  la chaîne locale est lancée par la tâche planifiée (`Start-ScheduledTask` « AAP Sante - lecture locale des PDF »),
  journal `scraping/logs/chaine_pdf_locale.log`.
- 2026-11-19, 16 h 10 : contre-ordre de Monsieur DUCOUT (relayé) : **premier passage des PDF : demain 20/11**. La
  collecte des PDF (sans modèle) lancée à 15 h 45 finit d'elle-même ; la chaîne locale n'est PAS lancée aujourd'hui.
  Demain : relire la fin de `scraping/logs/collecte_pdf_2026-11-19.log`, vérifier que la carte graphique et Ollama sont
  libres (`ollama ps`, `nvidia-smi`), puis lancer la chaîne (`Start-ScheduledTask -TaskName "AAP Sante - lecture locale
  des PDF"`, ou `scraping\chaine_pdf_locale.cmd`) ; elle demande à Windows de rester éveillé ; journal
  `scraping/logs/chaine_pdf_locale.log`. La tâche du lundi 23 h reste en place.
  Collecte finie vers 16 h 30 : « 283 pages lues à ce passage. PDF : 278 lus, 122 sans texte ou introuvables » ; la
  chaîne locale a 278 textes PDF à extraire (compte de `extraction_locale.py --extraire --seulement-pdf --limite 0`).
- 2026-11-20, 11 h 42 (reprise demandée par Monsieur DUCOUT, PC branché sur secteur après mon signalement de la
  batterie) : chaîne locale lancée par `Start-ScheduledTask` (« AAP Sante - lecture locale des PDF », état Running) ;
  carte graphique 48 %, qwen3:8b chargé. Fin estimée vers 17 h 30 - 18 h (extraction des 278 PDF environ 3 h 40, puis
  contrôle et qualification des fiches produites environ 2 h ; estimation). Journal : `scraping/logs/chaine_pdf_locale.log`
  (« Chaine locale des PDF terminee » à la fin) ; fiches : `scraping/results/extraction_pdf_locale.json`. À vérifier
  ensuite : bilan de l'import (« a valider ») et du tri (`trier_file.py`), file de Monsieur DUCOUT.
- 2026-11-20, 19 h (reprise relayée, quota jusqu'à 97 %) : la chaîne a été arrêtée à 18 h 05 par la séance de
  pilotage sur demande de pause : 72 PDF sur 278 lus, 58 fiches (santé 42, médico-social 6, hors champ 6, incertain
  4), 14 écartés, aucune contrôlée ni qualifiée. Rythme réel environ 12 PDF par heure (mon estimation de 17 h 30 était
  fausse : j'avais repris le rythme des pages web) ; fin plutôt samedi. Ne pas relancer : Perroquet relance la tâche
  après sa mesure. Relecture des 58 fiches lancée (sous-agent, verdicts dans
  `scraping/sources/exactitude_pdf_locale_verdicts.json`, liste `scraping/results/relecture_pdf_locale.json`).
  Relecture faite : rapport `scraping/EXACTITUDE_PDF_LOCALE.md`.
- 2026-11-20, 19 h 15 : consigne « deux heures en autonomie » (relayée) : commits locaux seulement, une demande groupée à
  la fin. Faits : README du scraping (modèle local, chaîne des PDF, tri) ; règle Firestore `figes` (41 tests). À faire
  ensuite : liste filtrée de `/aap/search` calculée au lieu d'un état. **Demande groupée à présenter** : pousser les
  commits locaux ; déployer les règles Firestore (suppression du compte, champs figés) et l'hébergement (textes
  réutilisables, recommandations plus strictes, suppression du compte) ; règle « modèle local d'abord » à recopier par
  lui dans `CLAUDE.md`.
- 2026-11-20, 20 h 20 : sur son « Oui : pousse les 3 commits sur GitHub, et mets en ligne les règles Firestore et
  l'hébergement » : commits poussés (`220aa51..d6cb729`), règles et site en ligne (`index-BHWkCLGZ.js`), lecture
  publique contrôlée (3 appels publiés lus sans compte, brouillon refusé en 403). `firebase deploy` échouait sur
  « Timed out » : IPv6 en panne sur le Wi-Fi, contourné par `NODE_OPTIONS` (voir `docs/MISE_EN_LIGNE.md`). Reste à sa
  charge : recopier la règle « modèle local d'abord » dans `CLAUDE.md` ; suppression du compte non jouée sur le vrai
  projet.
- 2026-11-20, 21 h 10 (relayé par la séance de pilotage) : « Non, tout brûler » : travail sans attendre jusqu'à 97 % du
  quota, sans Ollama ni carte graphique ; la lecture locale des PDF reste arrêtée (batterie) ; poussée et mise en ligne
  groupées à la fin. Commits locaux faits : liste de la recherche calculée (`99bd416`), tests des pages publiques et des
  menus (`920febf`), contrôle de toutes les adresses du code (`1748db7`), étiquettes des champs reliées (`82f6739`),
  retour après connexion avec les filtres (`59d9046`). Recherche de défauts lancée (six relecteurs, double vérification,
  aucun fichier modifié par eux) : 35 signalements, vérification en cours ; corrections ensuite, une à une, test d'abord.

- 2026-11-21, 9 h 40 (reprise après une veille du poste de 21 h 54 à 9 h 36, relayée par la séance de pilotage) : rien
  de perdu (tous les commits en place ; le bouton « Modifier » de « Mes appels » restait sans commit, rejoué puis
  enregistré). Changement OpenSpec `corrections-relecture` : 21 défauts confirmés par la relecture, toutes les tâches 1.1
  à 3.6 faites, une correction par commit, test en échec ou reproduction sur les émulateurs avant chaque correction
  (détail et preuves dans `openspec/changes/corrections-relecture/tasks.md`). Suite complète au 2026-11-21 : 168 tests
  de l'application, 47 tests de règles, compilation, 227 tests Python. Reste la tâche 4.2 (vérification de Monsieur
  DUCOUT). **Demande groupée** : question 34 de `docs/A_VALIDER.md` (poussée des commits locaux, déploiement de
  l'hébergement et des règles Firestore) ; questions 35 à 41 à trancher. Rien de poussé ni de déployé depuis le
  2026-11-20 à 20 h 20.

- 2026-11-21 : sur son « Oui : pousse les 22 commits sur GitHub, mets en ligne l'hébergement et les règles Firestore,
  et commite la règle « modèle local d'abord » ajoutée à CLAUDE.md » : règle commitée (`25667d2`), commits poussés
  (`01a5d1b..25667d2`), site `index-DaDo9GnV.js` et règles Firestore bornées en ligne, lecture publique contrôlée.
  Restent : sa vérification 4.2 de `corrections-relecture` sur le vrai projet, ses réponses aux questions 35 à 41.

- 2026-11-21, 10 h 40 : question « Pour la veille de lundi, quel moteur utiliser ? », réponse « Modèle local ».
  Changement `veille-modele-local` fait (tests d'abord, 234 tests Python verts, essai à blanc) : la veille du lundi
  23 novembre extrait, contrôle et qualifie en local, à zéro euro, et reporte ces étapes si le poste est sur batterie.
  À vérifier mardi 24 au matin dans `scraping/logs/veille.log` (tâche 3.1). La chaîne des PDF de 23 h est inchangée.

- 2026-11-21, midi (consigne relayée « continue jusqu'à 100 % des tokens ») : relecture de la chaîne du lundi, 10 défauts
  confirmés, rangés dans `openspec/changes/corrections-chaine-du-lundi/` (brouillon : `tasks.md`, `signalements.json`),
  quota épuisé avant les corrections. **À reprendre en premier après la remise à zéro** : 1.1 (le tri peut republier une
  fiche archivée), 1.2 (l'import réécrit des corrections humaines), 1.3 et 1.4 (courriel du lundi), puis 1.5 (limites
  de durée des tâches : risque que le courriel de lundi ne parte pas si l'étape locale dure plus d'environ 1 h 40).
  Commits locaux non poussés : `423c8c3` (veille locale) et celui-ci ; poussée à demander par boutons. (Poussés à
  13 h 50 sur son « Oui, pousse » : `4094ddd..9923b26`.)
- 2026-11-21, 14 h (quota à 98 %, PC éteint ensuite) : décision à préparer pour la tâche 1.5, limite de 4 h de la veille
  du lundi. Faits lus par la relecture : limite PT4H ; la veille du 16/11 a duré 2 h 22 sans modèle (284 textes
  collectés) ; les courriels (`alertes.py`), `publier_chiffres` et `publier_couts` passent après `veille_payante.py`. Si
  l'étape locale dépasse environ 1 h 40, Windows arrête la veille et rien de ce qui suit ne part.
  - **Option A, réglage Windows** : porter la limite de la tâche « AAP Sante - veille hebdomadaire » de 4 h à 12 h
    (modification d'un réglage du système : son accord, comme pour la question 16). Conséquences : les courriels
    comprennent les fiches extraites le jour même. Mais ils peuvent partir en fin de journée une semaine chargée ; le PC
    doit rester allumé et sur secteur jusqu'au bout ; la carte graphique est occupée tout le lundi.
  - **Option B, ordre des étapes** : dans `veille.cmd`, lancer `alertes.py`, `publier_chiffres.py` et `publier_couts.py`
    avant `veille_payante.py --reel` (code seulement, test et essai à blanc). Conséquences : les courriels partent
    toujours, vers 10 h 30-11 h 30. En revanche, ils ne contiennent que les fiches publiées avant : celles de la semaine
    arrivent dans le courriel du lundi suivant. L'étape locale peut encore être coupée à 4 h : l'extraction reprend la
    semaine suivante là où elle s'est arrêtée, mais le contrôle, l'import et le tri peuvent être sautés chaque semaine
    si le stock grossit. Il faudrait donc borner l'extraction par passage (`--limite`, par exemple 40 textes).
  - Proposition de la session : B avec une limite de 40 textes par passage, puis mesurer le temps réel de lundi avant de
    toucher au réglage Windows. Même logique pour la chaîne des PDF de 23 h (limite de 12 h, 197 PDF restants, environ
    17 h au rythme mesuré) : une limite par nuit, avec contrôle, qualification et import à la fin de chaque nuit.
  - Pour lundi 23/11, si rien n'est changé d'ici là : la collecte se fait ; l'étape locale et les courriels risquent
    d'être coupés si la semaine compte beaucoup de pages nouvelles. Rien n'est perdu (textes gardés en attente), mais le
    courriel de la semaine peut manquer.

- 2026-11-22, 17 h 50 à 18 h 30 (« aap et parti ok », AAP prioritaire avant la fin de l'abonnement le 29/11) : question à
  boutons posée et tranchée, « Ordre des étapes » et chargeur d'origine lundi. Neuf défauts de
  `corrections-chaine-du-lundi` corrigés, un commit par lot (806c280 à a05de3f), 250 tests Python verts, essais à blanc
  de la veille (local et API) et du tri sur la vraie base (0 rejet, 3 publications, 58 à relire, rien d'écrit). Date du
  dernier courriel amorcée au 16/11 10 h 32 UTC. Question 42 ajoutée (case de désabonnement dans Mon profil). Lundi 23 :
  PC allumé et branché sur le chargeur d'origine à 8 h ; preuve attendue mardi dans `scraping/logs/veille.log`
  (courriels vers 10 h 30-11 h 30, puis « Veille locale : … au plus 40 »).

- 2026-11-24 : audit « niveau A » demandé par Monsieur DUCOUT (note 11/20, une faille P0), plan validé par boutons
  (« Tout, failles d'abord », « Validation admin » pour les appels de financeurs, favori branché, écran Abonnement gardé
  avec « paiement bientôt disponible »). Changement `openspec/changes/niveau-a/` (`proposal.md`, `tasks.md` à jour,
  `audit.json` complet). Faits et commités en local : 1.1 à 1.4 (courriel du lundi vers l'adresse vérifiée seulement,
  profil limité, validation des appels de financeurs, contact et liens, dépendances : 20 vulnérabilités à 13, aucune
  critique) et 2.1 (courriel des candidats en tête de veille). Puis 2.2 à 2.6 le même jour : échecs retentés et JSON
  sans coupure, journal des coûts à chemin fixe, bilan de la chaîne des PDF, import (compteurs, corrections, montants en
  millions), migrations jouées rangées. 264 tests Python verts. Lot 3 commencé : palette complète (bandeaux d'erreur
  colorés) et messages d'erreur en français (`utils/erreurs.ts`, 17 affichages) ; 176 tests de l'application verts.
  **Reprendre à** : 3.1 (états d'erreur des pages, `alert()` en bandeaux), 3.2 (menu sur téléphone), 3.3 (clavier,
  modale), 3.4 à 3.7, puis lot 4, puis 1.5 (firebase 10 vers 12, react-router-dom 6 vers 7), puis vérification finale
  et question de mise en ligne (5.1, 5.2). Questions ouvertes : 35 à 43 de `docs/A_VALIDER.md`. Rien de poussé ni de déployé : règles
  et hébergement à mettre en ligne sur accord à la fin (tâche 5.2). Constat du 23/11 : poste arrêté à 10 h 13 (veille
  coupée pendant la collecte, aucun courriel), chaîne des PDF refusée par Windows (0x800710E0, batterie probable).
  Incident du 24/11 : `npx tsc` lancé par erreur depuis la racine a téléchargé le paquet public `tsc` 2.0.4 (paquet de
  substitution qui n'affiche qu'un avertissement) dans le cache npm ; dépôt vérifié intact.

- 2026-11-25, matinée (relance « Oui, relance-les ») : décisions 35 à 43 inscrites (`docs/A_VALIDER.md`) et ajoutées
  au plan (`openspec/changes/niveau-a/tasks.md`, section 6). Faits : 6.9 (`depublier_non_controlees` bloqué derrière
  `--reel` ; les deux scripts ont servi d'après leurs sauvegardes), 6.7 (régions d'outre-mer), 6.6 (avis du financeur
  visible), 6.5 (bouton « Clôturer »). 179 tests de l'application, 265 tests Python verts. **Reprendre à** : 6.8 (case
  « Recevoir le courriel du lundi » : écrit `notificationPreferences.email`, déjà autorisé par la règle `users`), 6.2
  (« Se souvenir de moi » : `setPersistence` de Firebase), 6.1 (vues +1 : règle qui n'autorise que l'ajout d'un sur
  `views`), 6.3 (thématique depuis `sectorsTargeted`, dans l'application et `scraping/alertes.py`), 6.4 (jours du
  calendrier, règle commune import, application, courriel), puis le reste du lot 3 (3.1 états d'erreur, 3.2 menu mobile,
  3.3 clavier et modale, 3.4 à 3.7), le lot 4, 1.5 (firebase et react-router-dom), 5.1 vérification finale (dont la
  saisie d'un appel par un financeur sur les émulateurs) et 5.2 (question à boutons de poussée et de mise en ligne, avec
  une ligne « AAP attend : … » à la séance de pilotage). Piège de test noté : une doublure de `useAuth` doit renvoyer
  le même objet à chaque appel, sinon une page qui dépend de `currentUser` recharge sans fin.

- 2026-11-25, journée : plan niveau A terminé dans le code (lots 1 à 4, décisions 35 à 43), parcours des trois rôles
  joués sur les émulateurs, puis relecture indépendante par agents (mode « ultracode » activé par Monsieur DUCOUT) :
  47 constats confirmés, note B-, corrigés en deux passes contre-vérifiées (14 commits, `openspec/changes/niveau-a/
  tasks.md` section 7). 254 tests de l'application, 61 de règles, 297 Python, lint, types, mise en forme, ruff, mypy
  verts. 2026-11-26 : sur son accord, 60 commits poussés, règles Firestore et hébergement en ligne (`index-C6x4fVWp.js`,
  brouillons refusés sans compte). **Reprendre à** : ses réponses aux questions 44 à 53 de `docs/A_VALIDER.md` (posées
  par la séance de pilotage), puis, s'il le demande, une troisième passe sur les 27 points du 5.1 de `tasks.md`. Lundi 30/11, 8 h : PC allumé, session ouverte, sur secteur.

- 2026-11-26, 11 h 45 : réponses 44 à 53 inscrites ; changement OpenSpec `securite-vues-messagerie` écrit (chantiers
  49, 51 « registre des suspensions », 53, 52, 50, dans cet ordre). Chantier 49 fait et commité (`a421cbf`, index à
  mettre en ligne AVANT les règles) ; chantier 51 en cours. Non poussés depuis `808488b`.
  **Plainte de Monsieur DUCOUT sur la sélection** (lecture seule de la base réelle, 1 080 fiches, 488 visibles) :
  99 fiches « à corriger – hors champ (modèle) » correctement jugées hors champ (forêts, grands fonds marins,
  décarbonation, LEADER) encombrent sa liste au lieu d'être écartées ; 38 fiches hors champ sont EN LIGNE avec une
  validation « Monsieur DUCOUT » (VEGEPOLYS, EIC, Bpifrance...) et 18 « incertain » ; « Biotech Santé Bretagne » (un
  relais) affiché comme financeur sur 7 fiches ; 2 vrais doublons visibles (MSA aidants familiaux, Choose France for
  Science) ; aucune fiche d'ARS en attente (192 en ligne sur 203). Proposé : relecture des titres par la session, liste
  à écarter / garder / reclasser, puis nettoyage sur son accord (sauvegarde, essai à blanc) et correction de la chaîne
  (hors champ écarté d'office, avertissement à la validation, relais jamais financeur). Il est en train de valider des
  fiches (`scraping/sources/verdicts_fiches.json` modifié à 11 h 32 : ne pas y toucher).
- 2026-11-26, 12 h 10 : relecture du champ faite et APPLIQUÉE sur son accord (`docs/RELECTURE_CHAMP_2026-11-26.md`,
  `scripts/appliquer_relecture_champ.py`, commit `6c71bcd`, sauvegarde `relecture_champ_2026-11-26_1206.json`) : 445
  fiches en ligne, 15 à corriger (dont ses 15 « à décider »). Veille du lundi relancée à 12 h 02 sur son accord
  (courriel des candidats parti : 1 candidat, 39 appels) ; à surveiller jusqu'à « Veille terminee », puis compte rendu au
  pilotage. Chantier 51 codé mais NON COMMITÉ (fichiers modifiés dans app/) : reprendre l'avis bloquant (adresse leurre :
  la règle de création de users doit exiger email == adresse de connexion) et le rétablissement d'un compte dont le
  document est supprimé. Puis chantier de la sélection (hors champ écarté d'office, avertissement à la validation,
  relais jamais financeur), puis 53, 52, 50.
- 2026-11-26, 12 h 40 : chantier 51 repris et commité (`aa92f13`, 78 tests de règles, 265 de l'application) ;
  parcours 2.3 sur les émulateurs à jouer. Veille relancée à 12 h 02 toujours en cours (surveillance par une tâche de
  fond de la séance : attendre « Veille terminee » dans `scraping/logs/veille.log`, puis compte rendu au pilotage).
  Ordre de mise en ligne à respecter : index d'abord (`firebase deploy --only firestore:indexes`), puis règles et
  hébergement ensemble. Rien n'est poussé depuis `808488b`.
- 2026-11-26, 15 h 30 : QUOTA DE LECTURES FIRESTORE ÉPUISÉ vers 14 h (« 429 Quota exceeded », forfait gratuit, 50 000
  lectures par jour) : le site n'affiche plus d'appel jusqu'à la remise à zéro (9 h environ le 27/11) ; ne pas balayer
  la collection `aap` sans besoin (lire les fichiers locaux). Changement `selection-des-appels` (« Oui, corrige ») :
  pages anti-robot et « accès refusé » écartées à la collecte et à l'extraction, marchés publics refusés, hors champ
  écarté d'office à l'import, relais jamais financeur (Medicen -> « France 2030 (État) »), corrections de la relecture
  conservées, alerte hors champ dans `/admin/aaps` (jouée sur les émulateurs) ; 320 tests Python, 267 de l'application.
  Restent : écriture locale du nettoyage (`scripts/nettoyer_selection.py --reel`, après la fin de la veille, qui lit les
  mêmes fichiers) ; essai à blanc puis écriture sur la base après 9 h le 27/11, sur son accord (fiche Urbanisme en ligne
  sans description, 7 fiches de marchés publics, financeur des relais) ; parcours 2.3 du chantier 51 ; chantiers 53, 52,
  50.

## 2026-11-13 : relance du projet (à lire en premier)

Aucun travail du 2026-10-28 au 2026-11-13. Monsieur DUCOUT relance AAP, son projet principal (« pas au tiers de ce qui
devrait être développé ») ; pas de testeurs pour l'instant, la prochaine livraison est du développement.
- Constat lu le 2026-11-13 : base 899 fiches, 378 publiées, 121 dans la file « à valider » (inchangée depuis le
  2026-10-28), 5 comptes, 0 retour de testeur ; veille du lundi jamais aboutie pendant le pilote (2 novembre : aucune
  sortie ; 9 novembre : interrompue pendant la collecte, `scraping/logs/veille.log`) ; 43 chantiers OpenSpec ouverts dont
  41 attendent sa vérification.
- Questions ouvertes tranchées par choix à cocher (séance de pilotage) : `docs/A_VALIDER.md`. Délégation permanente
  collée par lui dans la conversation (0,50 euro par semaine, imports « à valider », commit et push en fin de
  changement) ; à recopier par lui dans `CLAUDE.md` pour les séances suivantes.
- Faits pour les mentions légales : base Firestore en région `eur3` (Belgique, Pays-Bas, copie témoin en Finlande) ;
  comptes de connexion traités aux États-Unis (Firebase Authentication) ; stockage de fichiers
  `aapi-11bc3.firebasestorage.app` en région US-CENTRAL1 (États-Unis), vide au 2026-11-13.
- Fait le 2026-11-13 : changement `doublons-numero-axe` (axes distincts jamais rapprochés, ancien test réparé) ;
  `docs/DOUBLONS.md` : 48 groupes, 63 fiches à rejeter (30 dans la file, 33 publiées). Changement `rejet-des-doublons` :
  outil prêt. Faux doublons (« ESMS numérique » de plusieurs ARS, CRSA de Mayotte, ARS Guyane) corrigés le soir même
  (changement `doublons-appels-distincts`) : 43 fiches à rejeter (28 de la file, 15 publiées), pages relues ; passage
  réel `python scripts/rejeter_doublons.py --reel` sur son « oui ». Pages légales mises à jour dans le code
  (`mentions-legales-decisions`), mise en ligne sur son accord.
- Semaine 1 du plan lancée le 2026-11-13 au soir (« continue avec le plan ») : appels clos masqués par défaut dans la
  recherche (`appels-clos-masques`, joué sur les émulateurs ; lanceur `emulateurs-firebase` ajouté à
  `.claude/launch.json`) ; veille autonome (`veille-autonome` : `scraping/veille_payante.py`, import `--a-valider`,
  preuve réelle 0,051 euro, 16 fiches de plus dans la file). Feuille de route remise à jour. Sur son « Oui, les trois »
  (soir) : 43 doublons rejetés après sauvegarde (363 publiées, 109 dans la file), hébergement mis en ligne (version
  `index-UGUi_gyX.js`), tâche de la veille passée sans fenêtre (`veille_cachee.vbs`). À surveiller : la veille du lundi
  16 novembre doit aller jusqu'à « Veille terminee » dans `scraping/logs/veille.log` ; la tâche tourne aussi sur
  batterie depuis le 2026-11-13 (question 16).
- Semaine 2 commencée le 2026-11-13 au soir : recommandations depuis le profil (`recommandations-profil`, joué sur les
  émulateurs, 14 appels pour l'EHPAD de test, mise en ligne sur accord) ; reste la lecture des appels publiés en PDF
  (`lecture-pdf-appels` fait : 202 PDF des conférences collectés, devis d'extraction 0,59 euro en attente de
  son accord, question 17).
- Semaine 3 commencée le 2026-11-13 dans la nuit (pause levée à 20 h 06, règle de quota en tête de ce fichier) :
  `parcours-candidat-sans-impasse` (candidature sans pièce déposée, menus sans pages vides, recherches sauvegardées) ;
  questions 20 et 21 tranchées à 21 h 20 (relayées) puis faites : `regles-role-protege` (un compte ne se donne plus le
  rôle administrateur, 30 tests de règles verts), `candidature-site-officiel` (bouton « Candidater sur le site
  officiel », 85 tests verts, pas encore joué sur les émulateurs).
- En attente de son « oui » direct dans la conversation (quota à 89 % à 22 h) : mise en ligne groupée du site et des
  règles Firestore (`npm run build && firebase deploy --only hosting,firestore:rules --project aapi-11bc3` depuis
  `app`, JDK 21 en tête du PATH), à vérifier en ligne ; puis extraction des PDF des conférences (devis 0,59 euro,
  `veille_payante.py`-style : `--plafond 3.463`), contrôle, qualification, import « à valider ». Sans cet accord avant
  lundi, la veille du 16 novembre s'arrêtera à l'étape payante (« accord demandé »).
- Fait le 2026-11-13 vers 22 h 40 sur son « Oui pour les deux » : mise en ligne groupée (site `index-DWY0k7Mk.js`,
  règles Firestore avec le rôle protégé) ; extraction des 211 textes des conférences lancée en tâche de fond, plafond
  3,463 euros. Arrêt de la séance à 93 % du quota. À la reprise : lire la fin de
  `scraping/logs/extraction_pdf_cfppa_2026-11-13.log` et la ligne du coût cumulé ; le contrôle, la qualification et
  l'import en « à valider » se feront par la veille du lundi 16 (`veille_payante.py`, délégation de 0,50 euro), ou à la
  main avant ; noter la dépense réelle dans `docs/PILOTE_MVP.md`. Restent à jouer sur les émulateurs : boutons
  « site officiel » et suivi externe.
- Point d'étape publié pour lui le 2026-11-13 : https://claude.ai/artifact/1JQWMY4bTGMf6P7Bkyt5nR (état réel : 10 %
  vérifié par lui, environ 55 % écrit non vérifié, 35 % pas commencé ; bilan du pilote : autonomie et effort de
  relecture en échec, coût atteint, couverture et exactitude non mesurées ; plan de quatre semaines de développement ;
  décisions A à G à cocher, relues par `ArtifactData` collection `decisions`, document `point-2026-11-13`). Base au
  2026-11-13 : 378 publiées dont 96 ouvertes avec une date, 141 closes, 141 sans date ; 301 validées par le seul modèle.

## Où on en est au 2026-10-23 (à lire en premier)

Session du 2026-10-21 au 2026-10-23 close sur la demande de Monsieur DUCOUT (« repartir de là dans une nouvelle
conversation »). Journal des décisions de ces trois jours : `.audit/journal_2026-10-21_23.md` (local, hors Git).

**État** :
- Application en ligne depuis le 2026-10-22 : https://aapi-11bc3.web.app (Firebase Hosting, déployée par Monsieur DUCOUT).
  Les sept jours du plan MVP sont codés (`docs/PLAN_MVP_2026-10-20.md`) ; le jour 6 n'a qu'une démonstration partielle
  (six étapes sur neuf : publication d'un appel en cinq étapes et présélection jamais jouées).
- Base réelle au 2026-10-22 : 748 fiches, 362 publiées et validées, 386 archivées, 0 à trier (339 verdicts posés par
  Monsieur DUCOUT dans l'administration ; copie dans `scripts/sauvegardes/verdicts_admin_2026-10-22.json`).
- Sources : ANR, ANAP, ANRS, FIRAH, IReSP, HaDEA corrigées ou ajoutées ; portail appelsprojetsrecherche.fr lu par son
  export CSV (`scraping/portail_recherche.py`) ; 15 émetteurs sur 30 prioritaires alimentent la veille
  (`scraping/SOURCES_PRIORITAIRES.md`). Cumul Haiku : environ 2,32 euros sur 5.
- Outillage : skill `/show-me-your-work` (journal des décisions, audit, relecture par un autre modèle) dans
  `.claude/skills/` ; version claude.ai `show-me-your-work-web` importée par Monsieur DUCOUT.

**Actions en attente de Monsieur DUCOUT** :
1. Redéployer depuis `app` (retrait des pièces jointes en ligne, pages légales corrigées, taille maximale des
   retours) : `npm run build && firebase deploy --only hosting,firestore:rules --project aapi-11bc3`. Au 2026-10-23,
   une ancienne pièce jointe était encore servie en ligne : le déploiement n'avait pas eu lieu. Après, la session
   vérifie la tâche 2.1 de `openspec/changes/pieces-jointes-hors-ligne/tasks.md`.
2. Inviter trois testeurs (modèle dans `docs/MISE_EN_LIGNE.md`, section 4).
3. Jouer la démonstration financeur complète (`docs/DEMO_FINANCEUR.md`), dont la publication d'un appel.
4. Ouvrir la facturation Blaze pour déployer la fonction du jour 5 (lecture de PDF).
5. Trancher les mentions encore « à valider » des pages légales (tarifs et résiliation, durées de conservation,
   emplacement des comptes et des fichiers, mesure d'audience).

**Prochains chantiers** (`docs/FEUILLE_DE_ROUTE.md`, section « Chantiers programmés ») : pièces jointes des appels ;
recopie des verdicts de l'administration dans le fichier versionné des verdicts (proposée, pas encore décidée).

**Ajout du 2026-10-27** : quatre publications LinkedIn transmises par Monsieur DUCOUT ; aucun des trois appels de santé
n'était connu (novap de la FEHAP, Tubbe de Gérond'if, prix de la Fondation Béatrice Denys). Changement
`pages-a-un-seul-appel` ouvert et codé : une page validée à la main est retenue dès un lien d'appel, champ `page_appel`
au registre ; FEHAP, Gérond'if et ANAP retenues. Sur son accord : extraction, contrôle et qualification par Haiku
(0,008 euro, cumul 2,329 euros), import des deux fiches en brouillon. Restent : publier ou rejeter novap (clôture 31
octobre) et Tubbe (6 novembre) dans `/admin/aaps` ; familles absentes du registre (gérontopôles, cancéropôles et pôles
de compétitivité santé, fondations abritées) à décider. Fondation Béatrice Denys : aucune page web ne publie encore
l'édition 2026-2027 ; cinq relais inscrits et suivis par la veille (Turenne, cancéropôles CLARA et PACA, Eurasanté,
Biotech Santé Bretagne), 107 textes collectés ; sur ses deux accords, 79 fiches extraites, contrôlées et qualifiées
(0,104 euro, cumul Haiku 2,433 euros) ; 34 fiches ouvertes ou sans date importées en brouillon, à publier ou rejeter
dans `/admin/aaps` (doublons visibles : MATWIN, SILAB, Grands Défis). Fiche Béatrice Denys 2026-2027 saisie à la main
d'après le PDF officiel qu'il a transmis. Les 27 autres brouillons du jour (dont novap et Tubbe), d'abord marqués
« Validée » par le modèle et donc hors de sa file, sont passés en « Proposée, non relue » sur son accord : 28 fiches
dans sa file au 2026-10-27 à 16 h 07.

**Ajout du 2026-10-28** : 107 commits poussés sur GitHub (accord). Changement `familles-relais-regionaux` (« continue
surtout ») : cancéropôles 7 / 7, pôles de compétitivité santé 6 / 6, gérontopôles 14 / 14 au registre (1 230
sources) ; champ `relais` (liens vers les sites des financeurs gardés), 135 tests verts ; 170 textes collectés ; sur
son accord (0,28 euro), 102 fiches extraites, contrôle et qualification de 53, 0,224 euro réel (cumul Haiku 2,657) ;
71 fiches importées (64 en « Proposée, non relue », 7 archivées par le modèle). File « à valider » : 92 fiches (novap
ferme le samedi 31 octobre). Changement commité et poussé (39a442f).

**Pilote (2026-10-28)** : délégation accordée dans la conversation (budget 0,50 euro par semaine, imports en « à
valider », commit et push en fin de changement) ; le garde-fou refuse que la session l'écrive dans `CLAUDE.md` : à
recopier par Monsieur DUCOUT (`docs/A_VALIDER.md`, question 1). Critères et journal : `docs/PILOTE_MVP.md`. Lot A1 fait :
connecteur `connecteur-funding-tenders` (`scraping/funding_tenders.py`), 24 appels européens de santé ouverts, qualifiés
(0,006 euro, cumul Haiku 2,669) et importés : file « à valider » 116 fiches. Lot A2 fait : `scripts/doublons.py --file`
(changement `doublons-file-a-valider`), rapport `docs/DOUBLONS.md` : 47 groupes, 62 fiches à rejeter (29 dans la file).
Lot A3 fait : `financeur-reel-des-relais`, 10 fiches de la file corrigées (vrai financeur lu entre parenthèses),
36 restent au nom du relais. Lot B1 fait (« ok » de Monsieur DUCOUT) : changement `famille-conferences-des-financeurs`,
conférences des financeurs de la prévention de la perte d'autonomie couvertes à 75 / 102 (73 %), registre 1 269
sources, 222 pages lues par la veille, 78 fiches extraites, 16 contrôlées et qualifiées (0,153 euro, cumul Haiku 2,822),
13 importées en « Proposée, non relue » (file : 121 fiches), 6 hors champ en « à corriger ». Dans 23 départements
couverts, l'appel ne serait publié qu'en fichier (PDF), estimation par mots-clés : changement de lecture des PDF à
proposer. Relecture du lot par un second modèle (journal `.audit/2026-10-28_lot-b1-conferences-financeurs.tsv`) :
extraction coupée en deux commandes au lieu de demander l'accord au-delà de 0,20 euro ; 47 sources marquées
`url_validee` par la session (champ réservé à Monsieur DUCOUT), corrigées le soir même sur son accord (changement
`page-ciblee-par-la-session` : champ `page_ciblee`, lu comme une page validée, 0 écart de lecture ; Landes, Oise et
Seine-Saint-Denis « à vérifier ») ; les 25 autres sources dans le même cas migrées le 2026-11-13 sur son accord (question 12), 72 pages ciblées en tout,
plus aucune `url_validee` « à confirmer ». Poussées vers GitHub
suspendues du 2026-10-28 au 2026-11-13, le temps que Monsieur DUCOUT arrête les constructions Netlify du site
`jazzy-tarsier-6499a9` (question 11), puis reprises. Suite du plan : lots B2
et B3 (fondations abritées, Recherche), puis lot C (veille de bout en bout).

**Règles ajoutées pendant cette session** : chaque commande payante est lancée avec `--plafond` = cumul + devis accepté
(CLAUDE.md) ; un refus de déploiement par le garde-fou ne se contourne jamais par un autre outil, la commande est remise
à Monsieur DUCOUT.

## Objectif de Monsieur DUCOUT

Prouver, en local et sans dépense, qu'il est possible de récupérer tous les appels à projets (AAP)
du secteur santé et médico-social français, de les mettre dans la plateforme (application React +
Firebase du dossier `app/`), et d'utiliser cette plateforme. Déploiement seulement après que tout
fonctionne en local. GitHub sert de trace (commit et push à chaque changement validé).

## Règles non négociables

- Zéro dépense sans accord explicite : pas de crédit API Anthropic, pas de forfait Firebase Blaze.
  Un passage global payant (10 à 15 euros) est envisageable seulement quand la chaîne est prouvée
  et son coût estimé.
- Jamais de secret dans la conversation ni dans Git (`app/.env`, `scripts/serviceAccountKey.json`
  sont ignorés par Git ; vérifier avant chaque commit).
- Push uniquement sur demande explicite ("Validé : archiver, commit et push").
- Chaque évolution passe par un changement OpenSpec (`openspec/changes/`), avec tâches cochées,
  puis archivage. Documentation à jour avant de déclarer une tâche finie.
- Expliquer le pourquoi avant le comment, en français, sans jargon, sans emojis dans les fichiers.
- Une session = un seul dossier : ouvrir la session dans `AAP`, jamais dans `Scrapling`.

Vue d'ensemble des huit grandes étapes et de leur état : `docs/FEUILLE_DE_ROUTE.md` (à tenir à jour avec ce fichier).

## Chaîne de traitement et état réel

| Étape | Outil | État |
|---|---|---|
| 1. Registre des émetteurs (qui publie des AAP) | `scraping/registre.py`, `sources/registre.json` | 847 sources ; 657 adresses répondent. "Page vérifiée" veut dire que l'adresse répond, pas qu'elle contient des AAP. |
| 2. Découverte des rubriques (où ils publient) | `scraping/decouverte.py`, `DECOUVERTE.md` | 270 rubriques candidates et 3 748 liens candidats, repérés par mots-clés, NON vérifiés. Pages gardées dans `scraping/decouverte/` (hors Git). 2026-10-13 : les 155 pages gardées des rubriques confirmées n'ont jamais été vues par un humain ; à valider par Monsieur DUCOUT avec le raccourci « Validation des pages des sources » (mode `--pages`). |
| 3. Qualification des sources (publient-ils vraiment des AAP ?) | `scraping/qualification.py`, `QUALIFICATION.md`, `sources/relecture_qualification.json` | FAIT le 2026-10-12 : 270 rubriques relues par le modèle, puis relecture manuelle (changement `relecture-qualification`) : 155 confirmées, 88 hors santé, 6 sans AAP, 20 à vérifier. Verdict relu dans le registre (champ `qualification`, verdict du modèle conservé) et `QUALIFICATION.md`. |
| 4. Extraction des fiches (page -> fiche AAP) | `scraping/echantillon.py`, `ECHANTILLON.md` | ÉCHANTILLON FAIT (changement `extraction-echantillon-aap`, validation 3.4 en attente). 45 textes, 24 fiches Claude Code justes sur 24, Ollama 9 justes sur 41, 21 pages hors sujet, API estimée 99 euros pour 3 748 liens (avant qualification). 6 fiches ouvertes du champ santé importées dans Firestore. |
| 5. Import dans l'application | `scripts/import_to_firestore.py` | OK : 95 AAP en base (89 des 5 connecteurs historiques + 6 de l'échantillon), visibles dans "Rechercher des AAP" SANS compte depuis le 2026-10-13 (changement `consultation-aap-sans-compte`), pièces jointes servies depuis le PC. 2026-10-14 soir : import réel, 420 fiches publiées, puis 10 fiches hors champ repassées en brouillon ; nuit : règles de nettoyage codées (source réelle, financeur canonique `scraping/sources/financeurs.json`, territoire déduit `scraping/territoires.py`), ré-import réel fait sur son accord : 415 publiées, 151 financeurs contre 201, « National » 108 contre 234. 2026-10-15 matin : passage global terminé (1 086 fiches), champ classé par Haiku (0,23 euro), ré-import et retrait des 147 appels hors champ publiés : 308 fiches publiées (santé 172, médico-social 106, incertain 29), 261 brouillons dont 258 hors champ. Contrôle des 283 fiches ouvertes par Haiku (0,15 euro) : 74 douteuses sur dates, montants, financeur, titre ou territoire, à relire en premier dans l'outil de validation (`scraping/VERIFICATION.md`). Midi : décision de Monsieur DUCOUT, le contrôle vaut relecture (`verification.decision_du_modele`, `scripts/appliquer_controle.py`) ; essai à blanc 231 validées, 39 rejetées, 8 à corriger ; l'outil de validation ne présente plus que 6 fiches ; exécution réelle faite à 12 h 31 sur son accord (278 fiches, sauvegarde `controle_2026-10-15_1231.json`) : 270 publiées dont 231 validées par le modèle, 39 archivées, 38 badges « à vérifier » contre 307. |
| 6. Veille des changements (re-scraper ce qui bouge) | à créer | Idée validée par Monsieur DUCOUT : passage initial lent, puis comparaison quotidienne des pages gardées. |

## Leçons apprises (ne pas refaire)

- Les mots-clés ("aides", "prix", "financement") font remonter des pages sans rapport (facture
  d'eau, résultats de recherche, listes filtrées). Il faut un tri "est-ce un AAP ?" avant
  d'extraire : c'est l'objet de la qualification.
- Beaucoup d'AAP n'existent qu'en PDF (Cancéropôle Est, ministère de la Culture) : la lecture des
  PDF sera un changement à part.
- Les 92 sites de préfectures refusent les adresses de centres de données (réseau public, VPN) et
  coupent l'adresse domestique après une rafale : y aller depuis la box, un site à la fois, avec
  pause. Ameli (CPAM) et les CAF ne publient pas d'AAP sur leurs pages départementales.
- Le modèle local Ollama (`mistral:7b-instruct`) sert d'outil de tri gratuit ; il se trompe
  parfois (sondage obligatoire). La décision "Claude API pour le produit final" n'est pas remise
  en cause.

## Où en est le projet (mis à jour le 2026-10-13, midi)

- Changement `relecture-qualification` (validé par Monsieur DUCOUT et archivé le 2026-10-12) : les 133 "hors santé" ont été relus avec
  Monsieur DUCOUT. 10 passés en confirmée sur le motif du modèle, 60 pages relues par la session (sans Ollama ni API),
  décisions validées sauf 6 cas limites laissés "à vérifier" (Val-de-Marne, DREETS Nouvelle-Aquitaine, Mayotte,
  Région Île-de-France, Corrèze, FRM) et 9 sites illisibles par le robot (Meurthe-et-Moselle, Aube, Doubs,
  Hautes-Alpes, Drôme, DDETS Isère, DREETS Occitanie, GIRCI Est) à ouvrir à la main. L'ANR est confirmée sur
  l'adresse donnée par Monsieur DUCOUT (anr.fr/fr/appels).
  Vérification 3.2 faite par Monsieur DUCOUT sur Fondation Le Souffle et ANR.
- Bilan de la qualification après relecture : 155 confirmées, 1 PDF seulement, 88 hors santé, 6 sans AAP,
  20 à vérifier ; 577 sources sans page gardée. Leçon : le modèle ne juge que la page gardée ; quand c'est une page
  d'accueil, d'archives ou un bandeau cookies (liste de cookies plus longue que les 8 000 caractères lus), le verdict
  ne vaut rien. Mécanisme : `scraping/sources/relecture_qualification.json`, appliqué par `qualification.py`.
- Changement `extraction-echantillon-aap` : tâches 3.1 à 3.3 faites le 2026-10-12 (nuit). Ollama : 9 fiches justes
  sur 41 (il fabrique une fiche pour toute page, même hors sujet ; dates hors format ; enveloppes « oui ») ; session :
  24 sur 24. 6 fiches ouvertes du champ santé importées dans Firestore (`results/echantillon_valides.json`, 95 AAP en base).
  Validé et archivé le 2026-10-13. **Décision de Monsieur DUCOUT sur le moteur : « lentement et sûrement sur
  Ollama »**, c'est-à-dire un second tour à zéro euro avant tout appel payant.
- Changement `extraction-ollama-second-tour` (2026-10-13, nuit, tâches 1.1 à 3.1 faites, **décision 3.2 de
  Monsieur DUCOUT en attente**). Seuil fixé par lui : 20 justes sur 24, 2 fabriquées au plus. Résultat
  (`scraping/ECHANTILLON.md`) : mistral 7b 15 justes sur 23, 13 fabriquées ; qwen3:8b (téléchargé, 5,2 Go) 16 justes
  sur 21, 1 fabriquée, filtre presque parfait (20 des 21 pages hors sujet refusées) mais 70 s par texte et 2 délais
  dépassés. Aucun des deux n'atteint le seuil ; qwen3:8b s'en approche (2 de ses 5 désaccords sont des formulations
  exactes jugées sévèrement, 3 sont des enveloppes financières manquées). Carte graphique : 8 Go (RTX 5060 portable) :
  les Qwen de 17 et 23 Go installés ne tiennent pas, non testés. Le comparateur automatique a été corrigé deux fois après
  sondage (échéance ou titre confirmés par la page ; montants cités quel que soit le champ) ; sondage final 5/5 et 4/5.
- **Validation manuelle** (2026-10-13, changement `validation-manuelle-aap`, tâches 1.1 à 1.3 faites, vérification 2.1 par
  Monsieur DUCOUT en attente) : `scraping/validation.py`, lanceurs `.cmd` dans `scraping/` (« Validation des pages des
  sources » : les 155 pages gardées, port 8788 ; « Validation manuelle des AAP » : échantillon de 60 liens, un par
  source, port 8787). Depuis le 2026-10-14, seul le raccourci « Validation des fiches a verifier » reste sur son bureau
  (usage quotidien), les trois autres ont été envoyés à la corbeille à sa demande. Verdicts dans `results/validation_pages.json` et `results/validation_liens.json` (déplacés dans
  `sources/verdicts_pages.json` et `sources/verdicts_liens.json` par le lot 0 du 2026-10-14 ; 34 verdicts sur
  les liens à midi ; aucun sur les pages). Ses commentaires ont déjà donné deux verdicts de plus (page qui recense des
  appels, appel permanent) et une grille de critères proposée (nature, thème, état, destinataires), non décidée.
  Leçon du jour (règle « Preuve avant affirmation » dans CLAUDE.md) : j'ai affirmé que la découverte gardait de
  mauvaises pages sans ouvrir `decouverte/resultats.json`, qui prouvait le contraire ; vérifier avant d'acquiescer.
- **Registre par annuaires** (2026-10-13 après-midi, changement `registre-par-annuaires`, tâches 1.1 à 2.3 faites, 2.1 en cours) :
  Monsieur DUCOUT trouvait une source manquante « toutes les cinq » ; cause : registre constitué de mémoire, sans annuaire de
  référence. Inventaire de 24 familles validé (`scraping/sources/annuaires/familles.json`), taux de couverture en tête de
  `REGISTRE_SOURCES.md`. Vague 1 décidée par lui : 664 fondations RUP et d'entreprise santé-social du Registre national des
  fonds et fondations (`annuaires.py`). Décisions : aucune fusion des 35 rapprochements douteux ; recherche des sites par
  l'API Tavily avec les clés du projet Scrapling (le moteur gratuit refuse, Google est fermé, Brave exige une carte).
  Résultat Tavily : 191 / 664 (172 créées), puis les deux clés ont atteint la limite de leur plan (code 432). Sur sa
  consigne « continue avec ta recherche web toi-même » (2026-10-13 soir), la session a cherché 203 fondations de plus avec
  son propre moteur de recherche (choix lu dans les résultats, chaque adresse vérifiée par la sonde code 200 + mot du nom,
  journal `results/recherche_sites.jsonl` avec `moteur: session` et une note par fondation) : 100 sites inscrits et
  intégrés (`--integrer` : 1 123 sources), 96 sans site identifiable, 8 rapprochées d'une entrée déjà au registre (7 de la session, 1 de la vague Tavily)
  (FRM, Fondation Alzheimer, Ramsay Santé, Force, Saint-Joseph Marseille, Avenir, APICIL, ARC : `id_registre` posé, un
  doublon créé par `--integrer` supprimé), 16 adresses à resonder (SSL ou connexion refusée). Couverture 298 / 664 (44 %),
  242 fondations jamais cherchées (quota de 200 recherches par tour atteint). Suite : relancer la recherche sur les 242
  (nouveau tour), resonder les 16, puis découverte et qualification sur les nouvelles entrées (tâche 3.1), validation des
  pages par Monsieur DUCOUT. Beaucoup de fondations d'entreprise n'ont que le site de l'entreprise : la découverte devra y
  chercher la page de la fondation.
  Sources ajoutées à sa demande : UDAF 91, préfecture de région IdF (politique de la ville, 403), DITP ; adresse de la
  Fondation Crédit Mutuel Alliance Fédérale corrigée ; agrégateur Fimeco Walter Allinial (pages Digital et Numérique,
  Santé Maladie et Handicap) ajouté le 2026-10-13 soir ; veille PDF des AAP de l'URIOPSS PACA-Corse (lien SharePoint,
  82 appels) : 21 de ses 32 financeurs étaient au registre, 10 ajoutés (1 133 sources).
- **Verdicts reportés** (2026-10-13 nuit, changement `recherche-page-aap-par-source`, tâches 1.1 à 2.1 faites) : Monsieur
  DUCOUT a validé à l'écran les 257 pages (146 gardées, 111 exclues) : 181 bonnes, 47 mauvaises avec adresse, 10 mortes,
  18 hors champ ; le modèle local avait exclu à tort 68 des 88 « hors santé » (préfectures, DREETS, DRAAF, MSA, départements,
  villes). `validation.py --appliquer-pages` a écrit la relecture (relecteur « Monsieur DUCOUT, validation à l'écran ») et
  corrigé 50 adresses ; `qualification.py --registre --rapport` : 242 rubriques confirmées, 18 hors santé, 873 à vérifier
  (les entrées nouvelles du registre reçoivent « à vérifier » tant qu'elles ne sont pas découvertes). Redécouverte des 50
  sources corrigées avec `decouverte.py --garder-depart` : 39 pages rafraîchies, 11 sans lien d'appel repéré (Maladies
  rares, ANSM, AÉSIO, Alzheimer, SFGG, Yonne, Saint-Pierre-et-Miquelon, Fédération Addiction, ANACT, Reims, DREETS
  Occitanie : la page donnée est l'appel lui-même ou un formulaire, à traiter à l'extraction). Attention : lancer
  `--appliquer-pages` une seule fois avant la redécouverte, les verdicts sont indexés par l'adresse de l'ancienne page.
  Reste : 10 pages mortes à retrouver (Moselle, Aude, Alpes-de-Haute-Provence, Groupe Pasteur Mutualité, Vaucluse, Lille,
  Carsat Alsace-Moselle, Nièvre, DEETS Guadeloupe, MDPH Moselle), 577 sources sans page, vérification 4.1.
- Vague 1 terminée (2026-10-13 nuit) : 445 fondations traitées par la recherche web de la session, 365 / 664 (54 %),
  1 198 sources, 22 adresses à resonder ; famille « PLIE et organismes intermédiaires FSE+ » ajoutée (annuaire :
  fse.gouv.fr, 2 100 appels FSE+ dont ceux des PLIE ; annuaire Alliance Villes Emploi réservé aux adhérents).
- Brouillon initial `recherche-page-aap-par-source` : appliquer les verdicts « mauvaise page » au
  registre, puis recherche web « nom de l'organisme appels à projets » pour les sources mal servies ou sans page,
  validation humaine avant toute entrée dans le registre. Design et tâches après les premiers verdicts sur les pages.
- Réglage fin envisagé plus tard, à partir des verdicts : exemples validés dans la consigne (niveau 1, zéro euro),
  puis réglage fin d'un modèle léger à poids ouverts au-delà de quelques centaines d'exemples (niveau 2, carte louée
  avec son accord). Pas de réglage fin des modèles Claude.
- **Tâche suivante : décision de Monsieur DUCOUT (tâche 3.2)**, trois options honnêtes : (a) qwen3:8b pour le passage
  global malgré le seuil non atteint, avec sondage humain renforcé sur les montants ; (b) un troisième tour pour gagner
  les points manquants (contexte réduit pour tenir en mémoire graphique et éviter les délais dépassés, relance des
  2 pages en délai, question dédiée sur l'enveloppe financière) ; (c) API Anthropic, après estimation du coût sur les
  155 rubriques confirmées. Puis archivage du changement.
- Changement `consultation-aap-sans-compte` (2026-10-13, validé et archivé) : la
  consultation des AAP ne demande plus de compte (règle Firestore déployée, routes ouvertes, lien sur l'accueil) ;
  vérifié sans compte : 95 AAP listés, recherche « Dentobus », fiche, « Candidater » renvoie à la connexion.
  Défauts connus laissés de côté : redirection après connexion, bouton Google (fournisseur non activé). Leçon : après
  une modification de page, si le navigateur sert une version périmée, redémarrer le serveur de développement.
- Essai de modèles de décision : Laya multilingue testé (48 % d'accord, trop sûr de lui), non retenu ; Kev écarté
  (anglais, 16 Go de mémoire graphique). Mistral 7b via Ollama reste le moteur de tri. Laya est installé dans
  `.venv` mais inutilisé.
- Changement `extraction-echantillon-aap` (en cours, 2.1 coché) : 45 textes collectés, 24 fiches Claude Code validées,
  grille de contrôle remplie pour Claude Code, estimation API faite. Extraction Ollama terminée le 2026-10-12 à
  23 h 05 : 41 fiches sur 45, 4 échecs (`scraping/results/echantillon_ollama.json` et `.errors.json`), une heure
  de calcul dont 30 minutes de délais dépassés (1 à 5 minutes par page longue : prévoir d'écrire le fichier fiche
  par fiche à l'avenir). Défauts vus dans les fiches Ollama : fiches produites pour des pages sans rapport (facture
  d'eau, formulaire de recherche), dates hors format ("20 Septembre 2026", "Pas de date"), listes de catégories
  aberrantes (SFMU). Restent : contrôle manuel des 41 fiches Ollama (grille `results/controle_echantillon.json`),
  `--rapport`, import des fiches justes dans Firestore, documentation, validation.
- Tout est commité et poussé sur GitHub (dernier push le 2026-10-12 au soir). Le dossier
  `scraping/decouverte/` et `scraping/results/` restent sur le PC (ignorés par Git).
- Règle d'exploitation d'Ollama : un seul travail à la fois sur le modèle ; ne pas lancer un autre modèle
  (Qwen 27B) ni un calcul lourd sur le processeur pendant un passage.

- **Extraction locale globale** (2026-10-13 soir, changement `extraction-locale-globale`). Décision de Monsieur DUCOUT :
  extraire les pages des 242 rubriques validées avec `qwen3:8b`, zéro euro, fiches marquées « à vérifier », risque de
  l'échantillon accepté. Outil `scraping/extraction_locale.py` (`--collecter`, `--extraire`, `--bilan`), import avec
  étiquette `a-verifier`, badge « À vérifier » dans l'application. 2 395 adresses web uniques ; 25 à 40 heures de
  calcul prévues par nuits, reprise automatique ; import par lots. Avancement : `extraction_locale.py --bilan`.

- **Organisation des données validées** (2026-10-14, changement `organisation-donnees-validees`, après l'audit
  `docs/AUDIT_DONNEES_2026-10-14.md` et le schéma `docs/FLUX_DONNEES.md`). Décisions de Monsieur DUCOUT : « pas un
  appel » = archivé ; identifiant changé maintenant ; fiches sans date en attente. Fait : import protégé (identifiant
  = adresse, `status` / `validation` jamais réécrits, verdicts de `sources/verdicts_fiches.json` appliqués), registre
  avec `url_validee`, raccourci « Validation des fiches à vérifier » (fiches ouvertes), migration de la base
  (341 documents : 194 publiés, 147 brouillons). Reste : vérification 5.1 par Monsieur DUCOUT ; verdicts sur les
  pages rattachés à l'identifiant de l'émetteur (problème I3 de l'audit), rangement de `results/` (M4).

- **Lot 0 du rapport de critique** (2026-10-14, changement `lot-0-assainissement`, rapport
  `docs/RAPPORT_CRITIQUE_AAP_SANTE_2026-10-14.md` validé par Monsieur DUCOUT, instructions 1 à 9 et 17). Fait et prouvé :
  routage réduit au MVP (`/signup` en 404, liens d'inscription retirés), configuration ESLint créée (lint vert),
  `validation.statut` seule source de fiabilité (étiquette `a-verifier` dérivée, `par`), liste blanche des champs de
  l'import, `deadline` nulle pour les fiches sans date (type `AAP` nullable, bloc `validation` dans le type), cinq tests
  de l'audit sur un faux Firestore, verdicts des pages et des liens migrés dans `sources/` le 2026-10-14 après accord
  (257 pages, 34 liens, sauvegarde dans `scripts/sauvegardes/`), règles Firestore du MVP testées sur l'émulateur
  (`npm run test:rules`, JDK 21) et déployées le 2026-10-14 après accord, moteur `api` de l'échantillon sous plafond
  (`echantillon.py --moteur api`), 141 échéances fictives passées à `null` par Monsieur DUCOUT depuis son terminal le
  2026-10-14 (contrôle « 141 deja a null » ; le classificateur de sécurité de Claude Code avait refusé la mise à jour
  groupée à la session). Mesure API faite le 2026-10-14 après accord : `claude-haiku-5-5`, 45 textes (lecture par adresse), 19 justes et
  1 fabriquée sur 20 comparées, 4 pages de référence refusées à tort, seuil 20/2 manqué d'une fiche, coût réel 0,03 euro
  (`scraping/ECHANTILLON.md`). Demande de Monsieur DUCOUT : comparaison local / Haiku sur 50 pages chacun, à cadrer
  après le lot 0 dans un changement OpenSpec dédié (section 8 du rapport). Constat hors
  lot 0 consigné dans la section 8 du rapport : les filtres territoire, secteur et budget de `/aap/search` ne
  correspondent pas aux valeurs importées (libellés contre identifiants), proposition pour le lot 1 à valider.
  État détaillé : `openspec/changes/lot-0-assainissement/tasks.md`.
- Comparaison de deux moteurs sur 50 pages jamais traitées (changement `comparaison-moteurs-50-pages`, demande de
  Monsieur DUCOUT du 2026-10-14, plan accordé) : outil `scraping/comparaison.py` écrit et testé (tirage reproductible,
  extraction locale et API sur les mêmes textes, écran de jugement sur le port 8766, rapport `COMPARAISON.md`) ; 50 pages
  tirées, toutes de la famille collectivité (seuls textes jamais traités), extraction locale `qwen3:8b` lancée le
  2026-10-14 ; en attente : accord écrit pour Haiku (0,054 euro estimé sur la longueur réelle), jugement des 50 pages par
  Monsieur DUCOUT (`comparaison_juger.cmd`), rapport. État détaillé : `openspec/changes/comparaison-moteurs-50-pages/tasks.md`.
  Suite du 2026-10-14 au soir : premier tirage (collectivités, jugé inutilisable car sans appel de santé) tout de même
  jugé et rapporté (`scraping/COMPARAISON_collectivites_2026-10-14.md` : local 45/50 repérage, 19/23 qualité, 3
  fabrications ; Haiku 47/50, 19/23, 0 fabrication, 0,03 euro) ; second tirage de 50 pages d'appels chez ARS, INCa,
  CNSA, fondations, sociétés savantes, établissements (`--familles`, `--mots`), extraction locale en cours, Haiku sur
  accord (0,03 euro), jugement à refaire.
- **Filtre du champ santé et médico-social** (changement `filtre-champ-sante`, instruction 26 validée le 2026-10-14 au
  soir) : définition décidée par Monsieur DUCOUT (santé, médico-social, hors champ, incertain ; pas de social ;
  cybersécurité et rénovation des établissements inclus), consigne et outil `scraping/champ.py` (`--classer`,
  `--evaluer`, `--rapport`), règles d'import (hors champ -> brouillon à corriger ; verdict « hors champ » touche 7 ->
  rejeté ; fiches sans date publiées, décision du soir), migrations `scripts/migrer_champ.py` et
  `scripts/publier_sans_date.py` écrites avec essais à blanc. Fait : connecteurs classés par Haiku (105 fiches, 34 hors
  champ, 0,03 euro). À faire dans l'ordre : fin du passage global, `champ.py --classer --moteur api` sur
  `extraction_locale.json` (accord donné), import réel (accord), `migrer_champ.py` (accord), `publier_sans_date.py`
  (accord), question du champ dans la chaîne (5.1), rapport `CHAMP.md`, documentation. Tout est fait au 2026-10-19
  (5.1 : consigne version 4, les deux moteurs posent la question du champ après l'extraction) ; reste la vérification
  7.1 de Monsieur DUCOUT. État détaillé : `openspec/changes/filtre-champ-sante/tasks.md`.
- Administration (changement `acces-administration`, 2026-10-15 et 2026-10-19) : compte admin créé par Monsieur DUCOUT
  (`scripts/creer_admin.py`, mot de passe par `/reset-password`), espace `/admin` ouvert ; le 2026-10-19, `/admin/aaps`
  montre les compteurs et le filtre par `validation.statut` (base : proposée 54, à corriger 245, validée 231, rejetée
  39) et, sur chaque fiche, relecteur, date et commentaire. Reste : vérification 3.2 par Monsieur DUCOUT (la page exige
  une connexion que la session ne fait pas).
- 2026-10-19, décisions de Monsieur DUCOUT : V3 (modèle local) figée sous l'étiquette Git `v3-local`, V4 par l'API
  (`extraction-api-v4`, devis 2,26 euros au plus accepté, passage lancé à 10 h 10, fichier `results/extraction_api.json`) ;
  forfait Blaze accepté (il l'active lui-même) ; connexion Google à activer par lui ; MFA à la fin. Instruction 11 faite
  (`mention-relecture-fiches` : mentions de relecture, date d'extraction, lien officiel, filtre « Relecture »). Reste
  pour la V4 : fin du passage, contrôle Haiku (devis), décision du modèle, import (pose aussi `extraitLe`). Fait à 13 h 20 :
  passage 856 fiches pour 1,33 euro, contrôle 0,13 euro, import 54 créées et 483 mises à jour, 4 hors champ retirés.
  Base au 2026-10-19, 13 h 20 : 623 documents, 289 publiées (257 validées par le modèle, 28 proposées, 8 à corriger ; moteur api 207, connecteurs 37, local 48), 44 archivées, 290 brouillons ; « 289 AAP disponibles » sur /aap/search. Point réglé à 15 h 29 : `scripts/reporter_valeurs_api.py` a reporté les valeurs API sur 183 fiches validées par le modèle
  (sauvegarde `valeurs_api_2026-10-19_1529.json`), les fiches API closes non contrôlées et les verdicts humains intouchés.
- Suivi des appels externes (2026-10-21, `suivi-couts-externes`, demande de Monsieur DUCOUT) : page `/admin/couts-ia` et
  `scripts/publier_couts.py` (journal des coûts recopié dans `coutsIa`, appelé par la veille), joués sur les émulateurs.
  Reste : déployer la règle `coutsIa`, recopier les 6 433 lignes sur le vrai projet (accord), vérification 6.4.
- Jour 5 du plan MVP (2026-10-21, `candidature-depuis-pdf`) : fonction serveur `preremplirCandidature` (Haiku, plafond
  5 euros par mois) jouée sur les émulateurs : dossier de test lu, titre, résumé et montant remplis, 0,0009 euro. Reste :
  secret `ANTHROPIC_API_KEY` posé par Monsieur DUCOUT, déploiement de la fonction (5.3), vrai dossier (5.5).
- Jour 3 clos le 2026-10-21 : boîte d'envoi contact@arcadiaco.fr configurée par Monsieur DUCOUT (mot de passe d'application dans
  `scraping/.env`), courriel de test puis bilan administrateur et courriels candidats envoyés ; la veille du lundi les enverra seule.
- Jour 4 du plan MVP (2026-10-21 matin, `suivi-testeurs`) : journal des actions (connexion, recherche, fiche, recherche
- 2026-10-21 après-midi : connecteur `scraping/portail_recherche.py` (portail appelsprojetsrecherche.fr, export CSV, 125 fiches, appelé par `veille.cmd`) ; contrôle et qualification des 28 fiches ouvertes en attente d'accord (0,015 euro), puis import.
- 2026-10-21 fin d'après-midi : jour 6 `financeur-vendable` codé et lu sur les émulateurs (`docs/DEMO_FINANCEUR.md`) ; Monsieur DUCOUT joue la démonstration, puis règle `statistiquesPubliques` et `publier_chiffres.py` sur le vrai projet sur accord.
- 2026-10-21 soir : jour 7 `mise-en-ligne-testeurs` codé et joué sur les émulateurs ; Monsieur DUCOUT remplit `app/src/pages/legal/editeur.ts`, suit `docs/MISE_EN_LIGNE.md` (déploiement par lui), invite trois testeurs.
  sauvegardée, candidature, appel) et page `/admin/testeurs`, joués sur les émulateurs ; règle Firestore `journal` écrite
  et testée, à déployer après accord de Monsieur DUCOUT (tâche 4.3), puis sa vérification (4.5).
- Jour 3 du plan MVP (2026-10-20 soir, `alertes-courriel`) : courriels hebdomadaires (bilan administrateur, appels de la
  semaine aux candidats) composés et écrits à blanc dans `scraping/logs/courriels/` ; `veille.cmd` les envoie après la
  relecture. Reste : Monsieur DUCOUT renseigne la boîte d'envoi dans `scraping/.env` (3.2), test, premier envoi réel (3.3).
- Jour 2 du plan MVP (2026-10-20 soir, `qualification-appels`) : outil de qualification, import, filtres, fiche, fenêtre
  « Qualifier » faits ; qualification réelle lancée sur accord (303 fiches, 0,087 euro) ; reste : ré-import, rejouer filtre et
  fiche sur les émulateurs, tirer vingt fiches au sort pour Monsieur DUCOUT (tâche 2.6).
- Émulateurs Firebase en place (2026-10-20 soir, `emulateurs-parcours-connectes`) : `app/emulateurs_dev.cmd` ou
  `npm run emulateurs` + `npm run dev:emulateurs` (port 3001), comptes de test de `scripts/semer_emulateurs.py` ; règle :
  tout parcours connecté est joué par la session sur les émulateurs avant livraison. Parcours candidat du jour 1 joué
  de bout en bout (candidature avec pièce). Reste : Monsieur DUCOUT lance `emulateurs_dev.cmd` une fois (tâche 1.3).
- Jour 1 du plan MVP fait le 2026-10-20 au soir (`parcours-candidat-jour-1`) : fiche en trois cases, tableau de bord candidat réel,
  détail de candidature, colonnes ; 51 tests, lint, build ; attend le parcours de Monsieur DUCOUT (tâche 1.4). Jour 2 suivant :
  qualification (à qui s'adresse l'appel, type, objet, date d'ouverture, pièces) avec devis écrit avant tout appel.
- PLAN MVP (2026-10-20, fin d'après-midi) : à la demande de Monsieur DUCOUT (« rien n'avance côté application »), le plan
  de sept jours vers un prototype présentable à des testeurs est dans `docs/PLAN_MVP_2026-10-20.md` ; il remplace l'ordre
  de travail précédent (points helloDarwin, qualification) et commence par le parcours candidat sans impasse. Le lire
  en premier à la reprise.
- Retours de Monsieur DUCOUT après son parcours de l'application (2026-10-20, après-midi) : trois changements codés,
  `navigation-et-pages-publiques` (gabarit, menus par rôle, retour, pied de page, accueil à trois cartes, cinq pages
  publiques), `administration-controle` (carte « Fiches à contrôler », valider / rejeter / modifier depuis
  `/admin/aaps`, recherche publique limitée aux fiches contrôlées, import en brouillon sans validation, script de
  dépublication en essai à blanc : 34 fiches) et rattachement des financeurs étendu (86 -> 69 noms). En attente de son
  accord : dépublication réelle des 34 fiches, ré-import pour les financeurs, déploiement de la règle `messagesContact`,
  boîte d'envoi pour l'e-mail hebdomadaire de la veille. Décisions prises : candidat = établissement qui répond,
  porteur de projet = financeur ; une fiche non contrôlée n'est jamais visible des candidats. Agences de l'eau : deux
  fiches validées par le modèle à rejeter depuis l'administration (`scraped-9b62f48e295fb0ac`, `scraped-db009b2d484f0bdc`).
- Transposition helloDarwin, points 1 à 3 (2026-10-20, après-midi, changements `parcours-integration`,
  `liste-demarrage`, `recherche-guidee`) : nouveau parcours d'intégration sur `/complete-profile` (accueil, trois
  écrans, offres à trois colonnes avec les montants de `config/stripe.ts` à valider), carte « Démarrer (n/4) » sur les
  deux tableaux de bord, recherche avec compteur de montants, étiquettes, statut, lien partageable, « Initialiser à mon
  profil », onglet « Consultées ». Preuve de la session : 39 tests, lint, build, écran `/aap/search?territory=normandie&statut=bientot-clos`
  (« 19 appels à projets totalisant 6 860 433 € annoncés (6 fiches chiffrées) », deux étiquettes, croix qui retire
  « Normandie » et réécrit l'adresse). Reste : vérification par Monsieur DUCOUT avec un compte de test neuf (tâches
  4.2, 3.2, 3.2), puis points 4 à 6 (fiche, candidatures en colonnes, paramètres) et le second groupe de filtres
  (enrichir l'extraction, devis).
- Pages Mon profil et Modifier l'appel (2026-10-20, `profil-et-edition-aap`) : `/profil` montre le compte et le formulaire
  de profil pré-rempli (« Enregistrer ») ; `/aap/:id/edit` ouvre le formulaire de création pré-rempli pour le financeur
  auteur (« Sauvegarder » garde le statut, « Publier » publie un brouillon). Restent vides : paiements et paramètres
  admin. Monsieur DUCOUT rejoue les scénarios de la spec avec ses deux comptes de test (tâche 4.2).
- Dégel de l'application complète (2026-10-19, après-midi, `degel-application-complete`, décisions de Monsieur DUCOUT :
  tout lancer, pages légales rédigées, tests faits, MFA à la fin, Blaze activé par lui, Google à activer par lui) :
  routes rétablies, lint et build verts sur tout le code, règles Firestore rouvertes (23 tests), pages légales, `npm test`
  12 tests. Reste : accord pour déployer les règles (2.2), parcours connectés à jouer par Monsieur DUCOUT avec des comptes
  de test (3.1 à 3.4), ses données d'entreprise dans `app/src/pages/legal/editeur.ts`, puis fonctions serveur quand Blaze
  est confirmé. Règles déployées à 16 h 30 sur son accord ; application renommée « AAP Santé » ; raccourci « AAP Sante »
  sur son bureau ; connexion Google activée par lui.
- Lot 2 commencé (2026-10-19, 17 h, `fraicheur-dates-collecte`, instruction 10) : en-tête daté des textes, `collecte_le`,
  `collecteLe` et `derniereVueLe` ; 2 047 fiches datées, 537 documents mis à jour ; ses six premiers verdicts atteignent
  la base (correction de l'import).
- Rejeu et veille (2026-10-20, `rejeu-collecte-veille`) : `scraping/rejeu.py` (relire, collecter, marquer, rapport),
  `veille.cmd`, `scripts/perimer_fiches.py`, import `derniereVueLe` d'après le rejeu et `absences`. Premier rejeu réel sur
  les vingt premières sources (ARS, portail des ARS, CNSA) fait ; `VEILLE.md`. Chaque lundi à 8 h, la tâche planifiée Windows
  « AAP Sante - veille hebdomadaire » lance `veille.cmd auto` (journal `scraping/logs/veille.log`, décision du 2026-10-20) ;
  ensuite : lire `VEILLE.md`, devis, accord, extraction, contrôle, import ; `perimer_fiches.py` quand une fiche atteint deux
  absences. Le 2026-10-20 : 19 textes nouveaux extraits (17 fiches créées, 15 publiées), veille lancée sur les 222 pages
  restantes.

## Phrase à écrire au début de la prochaine session (ouverte dans le dossier AAP)

"Lis REPRISE.md et openspec/changes/lot-0-assainissement/tasks.md. Donne-moi ce qui reste à faire ou à valider dans le
lot 0 (sources vérifiées, pas de supposition), puis attends mes accords."

## Commandes utiles (depuis `AAP/scraping`, environnement `../.venv`)

```bash
../.venv/Scripts/python -m pytest tests -q
../.venv/Scripts/python qualification.py --qualifier      # reprend où il s'est arrêté
../.venv/Scripts/python qualification.py --registre --rapport
../.venv/Scripts/python echantillon.py --extraire --moteur ollama
../.venv/Scripts/python extraction_locale.py --bilan                        # avancement du passage local
../.venv/Scripts/python extraction_locale.py --extraire --modele qwen3:8b   # reprend où il s'est arrêté
../.venv/Scripts/python ../scripts/import_to_firestore.py --source extraction_locale   # depuis AAP/, import d'un lot
../.venv/Scripts/python validation.py --migrer-verdicts --dry-run                       # lot 0 : fait le 2026-10-14, plus rien à migrer
../.venv/Scripts/python validation.py --appliquer-pages --dry-run                       # bilan seul, rien d'écrit
../.venv/Scripts/python echantillon.py --extraire --moteur api --modele claude-haiku-5-5 --limite 1   # fait le 2026-10-14 ; une relance saute les textes déjà traités
../.venv/Scripts/python ../scripts/migrer_echeances.py --dry-run                        # lot 0 : fait le 2026-10-14, contrôle attendu « 141 deja a null »
cd ../app && npm run lint && npm run build && npm run test:rules                        # test:rules : JDK 21 en tête du PATH
openspec validate <changement> ; openspec archive <changement> --yes
```
