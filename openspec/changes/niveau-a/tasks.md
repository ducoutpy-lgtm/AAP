# Tâches

Plan validé le 2026-11-24 (« Tout, failles d'abord »). Chaque tâche : test en échec d'abord, puis correction ; un commit
local par lot vérifié.

## 1. Sécurité

- [x] 1.1 (P0) Courriel du lundi : destinataire = adresse de connexion Firebase vérifiée ; nom de structure sans lien
  et borné ; propriétaire limité à `demarrage`, `profileComplete`, `cguAccepteLe`, `userType`, `notificationPreferences`
  dans `users` ; compte créé en essai seulement. (2026-11-24 : 2 tests Python et 2 tests de règles en échec avant ;
  254 tests Python et 49 tests de règles verts après.)
- [x] 1.2 Appels saisis par un financeur : validation « proposée » à la création, publication par l'administrateur.
  Toute modification par l'auteur repasse l'appel « Proposée », sauf la clôture ; le tri automatique ne le publie
  jamais (motif « saisi par un financeur ») ; message du financeur : « visible après validation par l'administrateur ».
  Les appels manuels déjà publiés, sans bloc de validation, restent visibles. (2026-11-24 : 2 tests du service, 2 tests
  de règles et 1 test du tri en échec avant ; 255 tests Python, 170 de l'application, 51 de règles verts après.
  Parcours sur les émulateurs à rejouer à la vérification finale.)
- [x] 1.3 Formulaire de contact borné, liens `javascript:` et `data:` refusés, messagerie limitée au champ « lu ».
  (2026-11-24 : `utils/liens.ts`, `lienSur` sur les 7 liens d'adresses saisies ou collectées ; contact : sujet de la
  liste, adresse de 254 caractères au plus, compte vide ou le sien ; le nombre d'envois par visiteur ne se borne pas
  par une règle Firestore, limite notée. Tests en échec avant ; 172 tests de l'application et 53 de règles verts.)
- [ ] 1.4 Dépendances : 7 inutilisées retirées, `npm audit fix` sans version majeure.

## 2. Chaîne du lundi

- [ ] 2.1 Courriels en tête de `veille.cmd` ; Python en `-u` et heure par étape.
- [ ] 2.2 Textes en échec retentés (trois fois au plus) ; JSON écrits sans fichier coupé et relus avec garde.
- [ ] 2.3 Journal des coûts à chemin fixe.
- [ ] 2.4 Chaîne des PDF : codes d'erreur propagés, ligne « terminée », tâches Windows exportées dans le dépôt.
- [ ] 2.5 Import : compteurs et corrections préservés, montants en millions ; scripts d'écriture à blanc par défaut ;
  migrations déjà jouées rangées à part.

## 3. Application

- [ ] 3.1 Messages d'erreur en français et composant d'erreur commun ; bandeaux au lieu d'`alert`.
- [ ] 3.2 Menu sur téléphone.
- [ ] 3.3 Cartes ouvrables au clavier, fenêtre modale accessible, couleurs manquantes de la palette.
- [ ] 3.4 Fiche non visible fermée par son adresse directe ; saisie des montants et dates contrôlée ; CSV échappés.
- [ ] 3.5 Connexion qui attend le profil et redirige selon le rôle.
- [ ] 3.6 Chargement découpé, Stripe seulement là où il sert.
- [ ] 3.7 Favori branché ; vraie page 404 ; écrans « en cours de développement » retirés des menus ; mention
  « paiement bientôt disponible » sur l'écran Abonnement.

## 4. Outillage, tests, documentation

- [ ] 4.1 Python : `pyproject.toml` (ruff, mypy sur la chaîne du lundi), dépendances complètes, tests indépendants de
  l'ordre.
- [ ] 4.2 Prettier, appliqué en un commit de mise en forme seul.
- [ ] 4.3 Tests des pages clés, des règles du formulaire de contact, de la reprise sur erreur de l'API.
- [ ] 4.4 README, `app/README.md`, `scraping/README.md`, `scraping/.env.example`, spec de consultation, tableau de
  `CLAUDE.md`, CHANGELOG.

## 5. Clôture

- [ ] 5.1 Vérification finale (lint, types, tests, règles, compilation, démarrage) et nouvelle note.
- [ ] 5.2 Question à part : poussée et mise en ligne des règles et de l'hébergement.
