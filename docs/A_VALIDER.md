# Questions en attente de Monsieur DUCOUT

La session écrit ici ce qui demande sa décision et continue sur autre chose. Il répond quand il veut ; une question
tranchée est déplacée en bas avec sa réponse et sa date.

## Ouvertes

3. (2026-10-27) Relire la file « Proposée, non relue » de `/admin/aaps` (121 fiches au 2026-11-13, même nombre que le
   2026-10-28, dont 24 appels européens de santé du connecteur Funding & Tenders, titres en anglais). Les appels signalés
   urgents le 2026-10-28 (novap, Idéa'Dom, Émergence du Cancéropôle Nord-Ouest, CGSS Martinique, CFPPA Aisne) sont clos
   depuis le 30 et le 31 octobre. À sa charge.
5. (2026-10-23) Démonstration financeur complète (`docs/DEMO_FINANCEUR.md`) et ouverture de la facturation Blaze. À sa
   charge. Les testeurs et les mentions légales sont tranchés (voir en bas).
9. (2026-10-28) Vérification 5.1 du changement `famille-conferences-des-financeurs` : ligne « Conférences des
   financeurs » de `scraping/REGISTRE_SOURCES.md` et fiches CFPPA dans `/admin/aaps`. À sa charge.
11. (2026-11-13) Netlify : arrêter les constructions du site `teal-twilight-a7fcf3` (décision prise, voir en bas). À
   faire par lui dans Netlify (Project configuration > Build & deploy > Continuous deployment > Build settings >
   Configure > Stopped builds).

17. (2026-11-13) Extraction des appels des conférences des financeurs publiés en PDF : devis 0,59 euro au plus pour 211
   textes (202 PDF, 9 pages web ; trois appels par texte supposés, le réel est souvent la moitié), au-delà du reste de la
   délégation de la semaine (0,449 euro). Plafond prévu : 3,463 euros (cumul 2,873 plus devis). Puis contrôle et
   qualification (devis à part, environ 0,07 euro) et import en « à valider ». Oui / non.
18. (2026-11-13) Bornes de la lecture des PDF : 20 Mo et 40 pages au plus par fichier. À garder ou à changer.
19. (2026-11-13) Choix par défaut des recommandations (`recommandations-profil`) : GCS rangé en public et privé non
   lucratif ; exercice coordonné sans statut déduit ; appel écarté s'il ne cite que d'autres types d'établissement, si son
   champ contredit le profil, s'il ne finance que de la recherche, ou s'il est national sans élément concret commun ;
   seuil de 3 points. À valider sur le tirage de vingt recommandations.

20. (2026-11-13) Sécurité, relevée par l'audit du parcours candidat : la règle Firestore laisse un compte réécrire son
   propre rôle (`userType`) dans `users` (`app/firestore.rules`, ligne 46), donc se donner le rôle administrateur ; les
   pièces de candidature sont lisibles par tout compte connecté qui connaît leur chemin (`app/storage.rules`, ligne 29).
   Proposition : changement dédié (règle qui interdit de modifier son rôle, tests de règles sur l'émulateur), puis
   déploiement des règles sur son accord. Oui / non.
21. (2026-11-13) Candidature à une fiche importée : elle porte `financeurId = "scraped"` et n'est transmise à personne,
   alors que l'écran dit « transmis à {financeur} ». Proposition : pour une fiche importée, « Candidater sur le site
   officiel » (lien de l'annonce) et un suivi tenu par le candidat. À trancher.
22. (2026-11-13) Mise en ligne des corrections du soir (recommandations, parcours candidat sans impasse). Oui / non.

Questions du 2026-11-21, nées de la relecture de l'application (changement `corrections-relecture`, signalements dans
`openspec/changes/corrections-relecture/signalements.json`) :

34. Mise en ligne groupée des corrections des 20 et 21 novembre : pousser sur GitHub les commits locaux faits depuis
   le 2026-11-20 à 20 h 20 (de `99bd416` au dernier), puis déployer l'hébergement et les règles Firestore (règles des candidatures et des appels bornées, 43 tests verts). Oui /
   non.
35. Compteur de vues des appels (toujours 0, d'où un taux de conversion à 0 %) : (a) l'alimenter (+1 à l'ouverture de la
   fiche, règle qui n'autorise que cet ajout) ; (b) retirer les vues et le taux de conversion des écrans ; (c) les
   afficher « non mesuré ».
36. Case « Se souvenir de moi » de la connexion (sans effet : la session reste ouverte, même décochée, ce qui pose
   problème sur un poste partagé d'établissement) : (a) la brancher (case décochée : session fermée à la fermeture du
   navigateur) ; (b) la retirer.
37. Thématique des appels saisis par un financeur : ils n'ont pas de champ classé, donc le filtre « Santé » ou
   « Médico-social » les écarte, ainsi que le courriel du lundi. Proposition : déduire la thématique des « Secteurs ciblés »
   du formulaire, dans l'application et dans `scraping/alertes.py`. Oui / non.
38. Jour de clôture hors de la métropole : un appel paraît « Clôturé » le soir de son dernier jour en Guadeloupe,
   Martinique et Guyane (comptage en heures depuis minuit UTC). Proposition : compter en jours du calendrier, règle
   commune à l'import, à l'application et au courriel. Oui / non.
39. Clôture d'un appel par son financeur : le tableau de bord annonce « Modifier, clôturer », mais aucun bouton ne clôture.
   Proposition : un bouton « Clôturer » dans « Mes appels » (les nouvelles règles autorisent déjà publié vers clôturé).
   Oui / non.
40. Avis du financeur : la page d'évaluation l'écrit dans `financeurFeedback`, que la page du candidat ne lit pas ; le
   candidat ne le voit donc jamais (déjà relevé le 2026-11-13, laissé hors périmètre). Le candidat doit-il voir l'avis du
   financeur ? Oui / non.
41. Régions d'outre-mer dans Mon profil : le champ Région ne propose que les 13 régions de métropole, alors que le
   parcours d'intégration enregistre La Réunion, la Guadeloupe, la Martinique, la Guyane ou Mayotte ; l'enregistrement est
   alors bloqué (déjà noté hors périmètre de `recommandations-profil`). Ajouter ces cinq régions à la liste. Oui / non.
42. (2026-11-22) Désabonnement du courriel du lundi : aucun écran ne permet de l'arrêter (le courriel renvoyait à un réglage
   de « Mon profil » qui n'existe pas). Depuis le 2026-11-22, le courriel dit « répondez à ce message en écrivant
   « Désabonnement » » : la réponse arrive dans la boîte d'envoi, et c'est à vous d'arrêter l'envoi pour ce compte.
   Proposition : une case « Recevoir le courriel du lundi » dans Mon profil (modification de l'application, puis mise en
   ligne sur votre accord). Oui / non.

Réponses du 2026-11-13 à 21 h 20 (choix à cocher, relayés par la séance de pilotage) : 17 « Oui, 0,59 € » ; 20 « Oui,
corriger » (fait : changement `regles-role-protege`, 30 tests de règles verts) ; 21 « Lien site officiel » ; 22 « Avec
le correctif » (une seule mise en ligne, site et règles ensemble). La dépense (17) et la mise en ligne (22) attendent
son « oui » direct dans la conversation de la séance AAP, selon la règle de la séance.
« Oui pour les deux » écrit par Monsieur DUCOUT dans la conversation le 2026-11-13 vers 22 h 40 : mise en ligne faite
(site et règles Firestore, « released rules », version `index-DWY0k7Mk.js` servie) ; extraction des PDF des
conférences lancée en tâche de fond avec `--plafond 3.463` (journal `scraping/logs/extraction_pdf_cfppa_2026-11-13.log`).

## Tranchées

| Date | Question | Réponse |
|---|---|---|
| 2026-10-28 | Délégation et petit budget de pilote | Accordés dans la conversation (« oui »), pour cette session |
| 2026-10-28 | 10. Les 47 `url_validee` posées par la session au lot B1 | « Oui, corrige », puis « Marqueur propre » : champ `page_ciblee` (changement `page-ciblee-par-la-session`), 47 sources migrées sans perte de lecture, Landes, Oise et Seine-Saint-Denis « à vérifier » |
| 2026-11-13 | 11. Crédits Netlify consommés par les poussées (site `jazzy-tarsier-6499a9`, 15 crédits par déploiement, 300 par mois) | « Oui, pousse » : constructions arrêtées par Monsieur DUCOUT dans Netlify ; poussées vers GitHub reprises |
| 2026-11-13 | 12. Les 25 autres `url_validee` posées par une session « à confirmer à l'écran » (27 et 28 octobre) | « Oui, migre-les » : 25 sources migrées vers `page_ciblee`, 0 écart de lecture ; plus aucune `url_validee` « à confirmer » au registre ; les 4 adresses posées avec son accord du 2026-10-21 restent telles quelles |
| 2026-11-13 | 4. Redéployer l'hébergement et les règles depuis `app` | « Oui, mets en ligne » : déploiement fait le 2026-11-13 à 14 h 49 depuis la séance de pilotage (`firebase deploy --only hosting,firestore:rules`, « Deploy complete! ») ; `/documents/ars_corse/media_141914.pdf` ne renvoie plus de PDF et la page d'accueil sert la compilation du jour ; tâche 2.1 de `pieces-jointes-hors-ligne` revérifiée par la session (réponse `text/html`) ; `/aap/search` affiche « 378 appels à projets » vers 15 h 45, lui étant connecté |
| 2026-11-13 | 1. Délégation (budget de pilote, imports en « à valider », commit et push en fin de changement) | « Oui, permanente » (choix à cocher, séance de pilotage). Effet seulement quand Monsieur DUCOUT l'aura écrite lui-même dans `CLAUDE.md` ; d'ici là, son accord est demandé comme d'habitude |
| 2026-11-13 | 2. Critères de réussite du pilote (`docs/PILOTE_MVP.md`) | « Oui, tels quels ». À faire par la session : bilan du pilote (2026-10-28 au 2026-11-11) contre les cinq seuils, et chiffrage du passage à l'échelle |
| 2026-11-13 | 3 bis. Doublons (`docs/DOUBLONS.md`) | « La séance, avec sauvegarde » : après la correction du rapprochement par numéro d'axe, la session rejette les doublons avec une sauvegarde préalable et lui remet la liste ; jamais l'« Axe 3 » du Pas-de-Calais. Écriture en base confirmée par lui dans la conversation avant exécution |
| 2026-11-13 | 3 ter et 7. Ancien test en échec, rapprochement des doublons par numéro d'axe | « Oui, les deux » |
| 2026-11-13 | 6. Courriel récapitulatif de la veille chaque lundi depuis contact@arcadiaco.fr | « Oui » |
| 2026-11-13 | 8. Lecture des appels publiés seulement en PDF | « Oui, avec devis » : changement OpenSpec, bibliothèque `pypdf`, devis écrit et accepté avant tout appel au modèle |
| 2026-11-13 | 11 (suite). Site Netlify `teal-twilight-a7fcf3` (version d'avril) | « Arrêter les constructions », à faire par lui dans Netlify |
| 2026-11-13 | 5. Testeurs | « Pas de test, on continue comme ça pour le moment, la plateforme n'est pas assez développée pour soumettre au test » : aucune invitation ; la prochaine livraison est du développement |
| 2026-11-13 | 5. Mentions légales encore « à valider » | Mesure d'audience : « Oui, aucun outil » pendant le test (mentions à retirer dans Mentions légales et Confidentialité) ; durées de conservation : « Oui, je confirme » ; tarifs et résiliation : « Tarifs provisoires » (aucun paiement pendant le test, résiliation fixée à l'ouverture du paiement) ; clause de litige : « Garder pour le test » (relecture par un conseil avant l'ouverture du paiement) ; emplacement des comptes et des fichiers vérifié le 2026-11-13 (comptes de connexion aux États-Unis, base en Union européenne `eur3`, stockage de fichiers aux États-Unis `US-CENTRAL1`, vide), texte proposé. Pages modifiées dans le code le 2026-11-13 au soir (changement `mentions-legales-decisions`, tests verts) ; mise en ligne sur son accord ; relecture de la clause de litige par un conseil avant l'ouverture du paiement |
| 2026-11-13 | 13 à 15. Rejet des doublons, mise en ligne, veille sans fenêtre | « Oui, les trois » (dans la conversation) : 43 fiches archivées après sauvegarde `scripts/sauvegardes/doublons_2026-11-13_1744.json` (363 publiées, 109 dans la file) ; hébergement mis en ligne deux fois (pages légales, appels clos masqués, puis date de mise à jour des pages au 13 novembre), version `index-UGUi_gyX.js` servie ; action de la tâche planifiée remplacée par `wscript.exe "...\scraping\veille_cachee.vbs"`, prochain passage lundi 16 novembre à 8 h |
| 2026-11-16 | 24, 26, 27, 28. Mise en ligne des alertes des recherches, de l'export des données, des règles du stockage et des correctifs financeur et premier clic | « Oui, mets en ligne » (dans la conversation) : relecture à plusieurs agents d'abord (19 constats, 11 confirmés, corrigés par `corrections-relecture-16-novembre`), puis `firebase deploy --only hosting,storage --project aapi-11bc3` : « released rules storage.rules », « Deploy complete! » ; version servie `index-BB_FScPX.js`, qui contient « Enregistrer cette recherche », « Télécharger mes données » et « suivez-le sur cette page ». Règles Firestore non déployées (question 31) |
| 2026-11-16 | 31. Règles Firestore corrigées après la relecture (propriétaire figé des recherches, favoris et notifications ; financeur suspendu lit ses appels) | « Oui, déploie les règles » (dans la conversation) : 36 tests de règles rejoués juste avant, `firebase deploy --only firestore:rules --project aapi-11bc3` : « released rules firestore.rules », « Deploy complete! » ; contrôle sur la vraie base : lecture sans compte des appels publiés acceptée, lecture sans compte des recherches sauvegardées refusée (« PERMISSION_DENIED ») |
| 2026-11-16 | 30. Extraction des 341 textes nouveaux de la veille du 16 novembre (devis 0,52 euro) | « Oui, 0,52 € » (dans la conversation) : `extraction_locale.py --extraire --moteur api --plafond 3.982` : « 1516 réussites (189 nouvelles), 50 échecs ; coût cumulé 3.889 euros », soit 0,427 euro ; puis contrôle de 76 fiches dans la délégation (0,054 euro, cumul 3,943), après correction d'un défaut qui rendait le devis du contrôle illisible (sortie des scripts enfants en UTF-8) ; qualification arrêtée au devis (question 32) |
| 2026-11-17 | 32. Qualification des fiches contrôlées le 16 novembre (devis 0,054 euro) | « Oui, 0,054 € » (dans la conversation) : 74 fiches qualifiées pour 0,028 euro (cumul 3,971), `--plafond 3.997` ; import `--a-valider` : « 159 crees, 435 mis a jour » ; base : 1 080 fiches, 363 visibles du public (inchangé), file « Proposée » 171 (62 créées le 17), 94 « à corriger » et 3 rejetées créées le 17. Semaine du 16 novembre : 0,509 euro dépensé (0,50 de délégation plus ses deux accords) |
| 2026-11-18 | Tri de la file « à valider » (il arrête de relire 167 fiches non triées, dont deux Béatrice Denys) | « oui ok change la phrase de délégation » ; « tu dois me proposer uniquement les fiches où il y a un doute » : `scripts/trier_file.py --reel` (sauvegarde `scripts/sauvegardes/tri_file_2026-11-18_1114.json`) : 23 doublons rejetés, 83 fiches publiées, 61 laissées avec leur motif (dont 4 gardées par la séance à la lecture de l'essai à blanc) ; 450 fiches visibles du public ; tri lancé ensuite par la veille de chaque lundi |
| 2026-11-18 | Mise en ligne de l'hébergement (FAQ corrigée, réglage Firestore, retrait de la conversion d'avril) | « OUI après » : faite après le tri, `firebase deploy --only hosting --project aapi-11bc3` (« Deploy complete! »), version servie `index-DhLlUBUZ.js` avec la nouvelle réponse de la FAQ ; gratuit (offre Firebase sans facturation) |
| 2026-11-19 | 23. Documents réutilisables | « (b) maintenant, (a) plus tard » (choix à cocher, séance de pilotage) : textes réutilisables sans stockage de fichiers ; pièces jointes à l'ouverture de Blaze |
| 2026-11-19 | 25. Suppression du compte en libre-service | « Proposition telle quelle » (séance de pilotage) ; mise en ligne des règles sur son accord, comme d'habitude |
| 2026-11-19 | 29. Recommandations trop larges | « (a) maintenant, (b) ensuite » ; (b) par le modèle local, et non par l'API (réponse à 33) |
| 2026-11-19 | 33. Lecture des PDF par la veille | Aucune des trois voies : lecture par le **modèle local** de son ordinateur, à zéro euro ; rien ne presse (mise à jour hebdomadaire, une lecture d'une semaine n'est pas grave) ; « il faut minimiser les coûts de traitement de la préqualification », « c'est la même chose pour tout » (relayé par la séance de pilotage) |
| 2026-11-19 | Voie de la lecture locale des PDF, puis tâche de nuit | « Voie A, tout local » puis « Oui, lundi 23 h » (dans la conversation) : contrôle et qualification en local (`--moteur ollama`), mesure contre Haiku (`scraping/LOCAL_CONTRE_HAIKU.md`), tâche Windows « AAP Sante - lecture locale des PDF » créée (lundi 23 h, limite 12 h, pas sur batterie) |
| 2026-11-20 | Demande groupée des deux heures en autonomie (poussée et mise en ligne) | « Oui : pousse les 3 commits sur GitHub, et mets en ligne les règles Firestore et l'hébergement » (dans la conversation) : commits poussés (`220aa51..d6cb729`) ; règles Firestore (suppression du compte, champs figés) et site (`index-BHWkCLGZ.js` : textes réutilisables, recommandations plus strictes, suppression du compte) en ligne à 20 h 20 ; la règle « modèle local d'abord » reste à recopier par lui dans `CLAUDE.md` |
| 2026-11-21 | 34. Mise en ligne des corrections de la relecture, et règle « modèle local d'abord » | « Oui : pousse les 22 commits sur GitHub, mets en ligne l'hébergement et les règles Firestore, et commite la règle « modèle local d'abord » ajoutée à CLAUDE.md » (dans la conversation) : règle commitée (`25667d2`), commits poussés (`01a5d1b..25667d2`), site `index-DaDo9GnV.js` et règles Firestore bornées en ligne ; contrôle : 3 appels publiés lus sans compte, brouillon refusé (403) |
| 2026-11-13 | 16. Veille sur batterie (la tâche refusait de démarrer sur batterie et s'arrêtait si le PC y passait) | « Oui, autorise-la » : réglages « DisallowStartIfOnBatteries » et « StopIfGoingOnBatteries » passés à faux ; action, déclencheur et limite de quatre heures inchangés |

Les réponses du 2026-11-13 (questions 1, 2, 3 bis, 3 ter, 5, 6, 7, 8, 11) ont été données par choix à cocher dans la
séance de pilotage des projets et transmises à la session AAP par cette séance.
