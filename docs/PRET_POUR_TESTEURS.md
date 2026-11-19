# Liste « prêt pour testeurs »

Semaine 4 du plan de quatre semaines (`docs/FEUILLE_DE_ROUTE.md`). But : permettre à Monsieur DUCOUT de décider d'inviter
ou non trois testeurs. Chaque ligne donne l'état et sa preuve ; « en ligne » veut dire présent dans la version servie par
https://aapi-11bc3.web.app (contrôle du 2026-11-16 : fichier `assets/index-DWY0k7Mk.js`, recherche du texte de l'écran).
Mise à jour à chaque lot ; la session ne coche une ligne qu'avec sa preuve.

État au 2026-11-16, 13 h : 12 lignes faites, 2 décidées (paiement, invitations), 6 ouvertes (2 relecture de dix fiches,
4 file à valider, 6 recommandations, 9 pièces jointes, 10 documents réutilisables, 16 suppression du compte).

## Contenu

| # | Condition | État | Preuve |
|---|---|---|---|
| 1 | Appels publiés, doublons retirés | Fait | 363 fiches publiées après le rejet de 43 doublons (2026-11-13, sauvegarde `scripts/sauvegardes/doublons_2026-11-13_1744.json`, `docs/A_VALIDER.md`) |
| 2 | Exactitude : 90 % de champs justes, aucune date inventée | Fait (session), relecture de 10 fiches par lui à faire | `scraping/EXACTITUDE.md` : 110 / 120 (91,7 %), 0 date inventée ; point faible : financeur remplacé par le relais dans 6 fiches sur 30 |
| 3 | Veille du lundi de bout en bout, sans intervention, et courriel de bilan | Fait le 2026-11-16, étape payante en attente d'accord | `scraping/logs/veille.log` : « Veille terminee le 16/11/2026 11:33 », « admin : envoyé à ducout@hotmail.fr » ; devis d'extraction 0,52 euro au-delà du budget de la semaine, accord demandé (question 30) ; preuve suivante attendue le 23 novembre |
| 4 | File « à valider » relue | À sa charge, triée | 2026-11-18 : tri automatique, 61 fiches douteuses restent (motif affiché dans `/admin/aaps`), au lieu de 167 |

## Parcours candidat

| # | Condition | État | Preuve |
|---|---|---|---|
| 5 | Inscription, connexion Google, mot de passe oublié, profil | Fait, en ligne | « Mot de passe oublié » présent dans la version servie ; Google activé le 2026-10-19 |
| 6 | Recherche avec appels clos masqués, recommandations d'après le profil | En ligne, recommandations peu pertinentes | Mise en ligne du 2026-11-13 au soir ; tirage de vingt recommandations (`docs/TIRAGE_RECOMMANDATIONS.md`) : environ 4 pertinentes selon la session, qualification trop large ; question 29 |
| 7 | Candidater sur le site officiel d'un appel importé, puis suivre sa candidature | Fait, en ligne | « Candidater sur le site officiel » et « la suivre ici » présents dans la version servie ; joué sur les émulateurs le 2026-11-16 |
| 7 bis | Premier clic d'un compte neuf sur « Candidater » (appel d'un financeur inscrit) | Corrigé, en ligne le 2026-11-16 | Renvoi au tableau de bord au premier clic, trouvé en jouant le parcours complet le 2026-11-16 ; changement `premier-clic-candidater` ; question 28 |
| 8 | Recherches sauvegardées avec alerte du lundi | Fait, en ligne le 2026-11-16 | Changement `alertes-recherches-sauvegardees`, joué sur les émulateurs ; question 24 (mise en ligne) |
| 9 | Pièces jointes d'une candidature | Limite annoncée | Le stockage de fichiers exige la facturation Blaze (question 5) ; la candidature part et l'écran nomme les pièces « non déposées » |
| 10 | Documents réutilisables d'une candidature à l'autre | Textes faits, pas en ligne ; pièces jointes à l'ouverture de Blaze | Changement `textes-reutilisables` (question 23 (b), 2026-11-19), joué sur les émulateurs |

## Parcours financeur

| # | Condition | État | Preuve |
|---|---|---|---|
| 11 | Démonstration financeur à 9 étapes sur 9 | 9 sur 9 jouées sur les émulateurs, correctif en ligne le 2026-11-16 | `docs/DEMO_FINANCEUR.md` ; la publication d'un appel échouait toujours, corrigée (changement `publication-appel-financeur`) ; question 28 |

## Conformité et sécurité

| # | Condition | État | Preuve |
|---|---|---|---|
| 12 | Mentions légales, confidentialité, conditions d'utilisation à jour | Fait, en ligne | Mise en ligne du 2026-11-13 (`docs/A_VALIDER.md`, questions 13 à 15) ; clause de litige à relire par un conseil avant l'ouverture du paiement |
| 13 | Un compte ne peut pas se donner le rôle administrateur | Fait, en ligne | Changement `regles-role-protege`, 30 tests de règles, règles publiées le 2026-11-13 |
| 14 | Pièces de candidature lisibles par leur seul auteur, documents d'appel en lecture seule (règles du stockage) | Testé, en ligne le 2026-11-16 | Changement `regles-stockage-durcies` (« released rules storage.rules ») ; propriétaire figé des recherches, favoris et notifications : règles Firestore en ligne le 2026-11-16 |
| 15 | Télécharger ses données (accès, portabilité) | Fait, en ligne le 2026-11-16 | Changement `export-donnees-personnelles` ; question 26 |
| 16 | Supprimer son compte (effacement) | Décision attendue | Question 25 ; en attendant, par le délégué à la protection des données |

## Exploitation

| # | Condition | État | Preuve |
|---|---|---|---|
| 17 | Retours des testeurs : page `/retour`, lecture dans `/admin/testeurs` | Fait, en ligne | Présents dans la version servie (changement `mise-en-ligne-testeurs`) |
| 18 | Paiement | Non ouvert, décidé | Test gratuit, tarifs provisoires (question 5 tranchée le 2026-11-13) |
| 19 | Invitations | Aucune, décidé | « Pas de test pour le moment » (2026-11-13) |

## Avant d'inviter

Lignes à fermer d'abord, selon la session : 6 (recommandations, question 29), relecture de 10 fiches de la mesure
d'exactitude (ligne 2) ; veille du 23 novembre comme seconde preuve (ligne 3). Décision d'inviter : Monsieur DUCOUT.
