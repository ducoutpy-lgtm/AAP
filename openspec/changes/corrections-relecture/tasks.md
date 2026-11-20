# Tâches

Signalements (21 confirmés, 8 écartés, avec les verdicts des vérificateurs) : `signalements.json`, sortie du flux de
relecture du 2026-11-20.
Chaque tâche : test en échec d'abord, puis correction ; fait quand le test passe et que lint, tests et compilation
sont verts.

## 1. Défauts graves

- [x] 1.1 Mon profil (candidat et financeur) : enregistrement fusionné, textes réutilisables conservés. (2026-11-20,
  émulateurs, compte candidat : avant, texte posé puis « Profil enregistré » -> `textesReutilisables` absent ; après,
  présent, `updatedAt` mis à jour.)
- [x] 1.2 Fenêtre « Préciser mon profil » : n'écrit que les champs saisis. (2026-11-20 : `precisionsAEnregistrer`,
  4 tests en échec avant, verts après.)
- [x] 1.3 Candidatures d'un appel : requête bornée au financeur connecté, rejouée sur les émulateurs. (2026-11-20,
  financeur de test, appel `test-fin-1` : avant « 0 candidature reçue » et refus des règles dans la console ; après
  « 2 candidatures reçues ». Index : deux égalités, aucun index composé attendu, non vérifié sur le vrai projet.)
- [x] 1.4 Route d'édition ouverte à l'administrateur ; date vide = échéance nulle (formulaire, création, modification).
  (2026-11-20 : test de la date vide en échec avant ; émulateurs, compte administrateur : avant renvoi vers `/admin`,
  après formulaire pré-rempli, fiche importée sans date enregistrée, `deadline` nulle, `scrapeMetadata` conservé.)

## 2. Défauts moyens

- [x] 2.1 Candidature refusée sur un appel clos (fiche et formulaire). (2026-11-20 : `candidatureOuverte`, 3 tests en
  échec avant ; émulateurs, `test-fin-2` reculé au 10/11 : plus de bouton, formulaire « Cet appel est clôturé » ;
  `test-fin-1` ouvert : bouton présent ; date remise.)
- [x] 2.2 Écran d'erreur réinitialisé au changement de page. (2026-11-20 : `gabarit.test.tsx` en échec avant, l'écran
  d'erreur restait après un clic sur « FAQ » ; clé = chemin de la page, les filtres de recherche ne la changent pas.)
- [x] 2.3 Validation et rejet groupés alignés sur les boutons unitaires. (2026-11-20 : `selectionATraiter`, 2 tests en
  échec avant ; émulateurs, 88 fiches cochées : « valider et publier 64 fiches (24 ignorées) », « rejeter 75 fiches
  (13 ignorées) », comptes attendus d'après la base ; « Annuler » sur le motif : aucune fiche modifiée.)
- [x] 2.4 Règles des candidatures et des appels bornées (tests de règles d'abord). (2026-11-20 : 6 tests en échec avant,
  43 verts après, joués sur l'émulateur en marche (port 8080 occupé, d'où `npx vitest run tests/rules/...` au lieu de
  `npm run test:rules`) ; candidature réelle envoyée ensuite dans le navigateur : « Candidature envoyée », `submitted`.
  Règles non déployées.)

## 3. Défauts mineurs

- [x] 3.1 Détail d'une candidature suivie hors de l'application, pièces non déposées. (2026-11-20 :
  `detailCandidature.test.tsx`, 2 tests en échec avant ; le cas d'une candidature envoyée par l'application reste couvert.)
- [x] 3.2 Retour à la recherche avec ses filtres. (2026-11-20, émulateurs, compte candidat : avant, parti de
  `?statut=tous&q=handicap`, retour sur `?territory=ile-de-france` ; après, retour sur `?statut=tous&q=handicap`,
  « 3 appels à projets ». Pas de test automatique : navigation entre deux pages reliées à Firebase.)
- [x] 3.3 Calendrier : fiches visibles seulement, appels clos non urgents. (2026-11-20 : `urgenceEcheance`, test en échec
  avant ; émulateurs, trois échéances posées en novembre : appel clos le 5 affiché en gris, absent des « Deadlines
  urgentes » ; appel du 24 présent ; fiche publiée non contrôlée du 26 absente.)
- [x] 3.4 Prochaine échéance du financeur : l'appel qui clôt aujourd'hui compte. (2026-11-20 : test en échec avant,
  « plus-tard » au lieu de « aujourdhui » ; même règle d'arrondi que la recherche.)
- [x] 3.5 Suppression du compte : Firebase juge de la connexion récente, pas l'horloge du poste. (2026-11-20 :
  `connexionRecenteSelonServeur` (heure de connexion et heure d'un jeton renouvelé, toutes deux du serveur), test en
  échec avant ; le contrôle reste préalable, car le compte de connexion est effacé en dernier. Émulateurs : connexion
  ancienne -> message « connexion récente » ; juste après reconnexion -> confirmation affichée, annulée d'office.)

## 4. Clôture

- [ ] 4.1 Documentation (`CHANGELOG.md`, `docs/PRET_POUR_TESTEURS.md`, `REPRISE.md`), questions hors périmètre dans
  `REPRISE.md`.
- [ ] 4.2 Vérification de Monsieur DUCOUT ; mise en ligne des règles et de l'hébergement sur son accord.
