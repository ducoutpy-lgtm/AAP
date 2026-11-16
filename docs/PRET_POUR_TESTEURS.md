# Liste « prêt pour testeurs »

Semaine 4 du plan de quatre semaines (`docs/FEUILLE_DE_ROUTE.md`). But : permettre à Monsieur DUCOUT de décider d'inviter
ou non trois testeurs. Chaque ligne donne l'état et sa preuve ; « en ligne » veut dire présent dans la version servie par
https://aapi-11bc3.web.app (contrôle du 2026-11-16 : fichier `assets/index-DWY0k7Mk.js`, recherche du texte de l'écran).
Mise à jour à chaque lot ; la session ne coche une ligne qu'avec sa preuve.

État au 2026-11-16, 11 h : 7 lignes faites, 2 décidées (paiement, invitations), 10 ouvertes.

## Contenu

| # | Condition | État | Preuve |
|---|---|---|---|
| 1 | Appels publiés, doublons retirés | Fait | 363 fiches publiées après le rejet de 43 doublons (2026-11-13, sauvegarde `scripts/sauvegardes/doublons_2026-11-13_1744.json`, `docs/A_VALIDER.md`) |
| 2 | Exactitude : 90 % de champs justes, aucune date inventée | Fait (session), relecture de 10 fiches par lui à faire | `scraping/EXACTITUDE.md` : 110 / 120 (91,7 %), 0 date inventée ; point faible : financeur remplacé par le relais dans 6 fiches sur 30 |
| 3 | Veille du lundi de bout en bout, sans intervention, et courriel de bilan | En cours | Veille du 2026-11-16 lancée à 9 h 11, encore en collecte à 10 h 51 (`scraping/logs/veille.log`) ; critère : « Veille terminee » |
| 4 | File « à valider » relue | À sa charge | Question 3 de `docs/A_VALIDER.md` (109 fiches après le rejet des doublons, 2026-11-13) |

## Parcours candidat

| # | Condition | État | Preuve |
|---|---|---|---|
| 5 | Inscription, connexion Google, mot de passe oublié, profil | Fait, en ligne | « Mot de passe oublié » présent dans la version servie ; Google activé le 2026-10-19 |
| 6 | Recherche avec appels clos masqués, recommandations d'après le profil | Fait, en ligne | Mise en ligne du 2026-11-13 au soir (« Oui pour les deux ») ; « Recommandations » présent dans la version servie |
| 7 | Candidater sur le site officiel d'un appel importé, puis suivre sa candidature | Fait, en ligne | « Candidater sur le site officiel » et « la suivre ici » présents dans la version servie ; joué sur les émulateurs le 2026-11-16 |
| 8 | Recherches sauvegardées avec alerte du lundi | Codé, pas en ligne | Changement `alertes-recherches-sauvegardees`, joué sur les émulateurs ; question 24 (mise en ligne) |
| 9 | Pièces jointes d'une candidature | Limite annoncée | Le stockage de fichiers exige la facturation Blaze (question 5) ; la candidature part et l'écran nomme les pièces « non déposées » |
| 10 | Documents réutilisables d'une candidature à l'autre | Décision attendue | Question 23 |

## Parcours financeur

| # | Condition | État | Preuve |
|---|---|---|---|
| 11 | Démonstration financeur à 9 étapes sur 9 | 7 sur 9 jouées | `docs/DEMO_FINANCEUR.md` (étape « Nouvel appel » non jouée par la session) ; question 5 |

## Conformité et sécurité

| # | Condition | État | Preuve |
|---|---|---|---|
| 12 | Mentions légales, confidentialité, conditions d'utilisation à jour | Fait, en ligne | Mise en ligne du 2026-11-13 (`docs/A_VALIDER.md`, questions 13 à 15) ; clause de litige à relire par un conseil avant l'ouverture du paiement |
| 13 | Un compte ne peut pas se donner le rôle administrateur | Fait, en ligne | Changement `regles-role-protege`, 30 tests de règles, règles publiées le 2026-11-13 |
| 14 | Pièces de candidature lisibles par leur seul auteur, documents d'appel en lecture seule (règles du stockage) | Testé, non déployé | Changement `regles-stockage-durcies`, 4 tests sur l'émulateur du stockage (34 tests de règles verts) ; question 27 |
| 15 | Télécharger ses données (accès, portabilité) | Codé, pas en ligne | Changement `export-donnees-personnelles` ; question 26 |
| 16 | Supprimer son compte (effacement) | Décision attendue | Question 25 ; en attendant, par le délégué à la protection des données |

## Exploitation

| # | Condition | État | Preuve |
|---|---|---|---|
| 17 | Retours des testeurs : page `/retour`, lecture dans `/admin/testeurs` | Fait, en ligne | Présents dans la version servie (changement `mise-en-ligne-testeurs`) |
| 18 | Paiement | Non ouvert, décidé | Test gratuit, tarifs provisoires (question 5 tranchée le 2026-11-13) |
| 19 | Invitations | Aucune, décidé | « Pas de test pour le moment » (2026-11-13) |

## Avant d'inviter

Lignes à fermer d'abord, selon la session : 2 (exactitude), 3 (veille autonome), 8 et 15 (mise en ligne), 11
(démonstration financeur), 14 (règles du stockage). Décision d'inviter : Monsieur DUCOUT.
