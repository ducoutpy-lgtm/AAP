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
- [ ] 2.4 Règles des candidatures et des appels bornées (tests de règles d'abord).

## 3. Défauts mineurs

- [ ] 3.1 Détail d'une candidature suivie hors de l'application, pièces non déposées.
- [ ] 3.2 Retour à la recherche avec ses filtres.
- [ ] 3.3 Calendrier : fiches visibles seulement, appels clos non urgents.
- [ ] 3.4 Prochaine échéance du financeur : l'appel qui clôt aujourd'hui compte.
- [ ] 3.5 Suppression du compte : Firebase juge de la connexion récente, pas l'horloge du poste.

## 4. Clôture

- [ ] 4.1 Documentation (`CHANGELOG.md`, `docs/PRET_POUR_TESTEURS.md`, `REPRISE.md`), questions hors périmètre dans
  `REPRISE.md`.
- [ ] 4.2 Vérification de Monsieur DUCOUT ; mise en ligne des règles et de l'hébergement sur son accord.
