# emulateurs-parcours-connectes Specification

## Purpose

Que la session puisse jouer les parcours connectés (candidat, financeur, administrateur) sur le PC, sans toucher au
vrai projet Firebase.

## Requirements

### Requirement: Application sur émulateurs

`npm run dev:emulateurs` SHALL servir l'application sur `http://localhost:3001`, branchée sur les émulateurs locaux
(comptes 9099, base 8080, stockage 9199) sous le projet `demo-aap`, avec les règles Firestore et Storage du dépôt.

#### Scenario: Connexion d'un compte de test

- WHEN la session ouvre `http://localhost:3001/login` et se connecte avec le compte candidat de test
- THEN le tableau de bord candidat s'affiche avec les appels importés dans l'émulateur, et la console des émulateurs
  (`http://localhost:4000`) montre le compte et les documents, sans aucune trace sur `aapi-11bc3`.

### Requirement: Comptes et données de test

`scripts/semer_emulateurs.py` SHALL créer trois comptes (candidat, financeur, administrateur) avec profil complet et
importer au moins trois fichiers de résultats dans l'émulateur ; relancé, il SHALL ne rien dupliquer.

#### Scenario: Semis

- WHEN la session lance le script, émulateurs démarrés
- THEN il affiche les trois comptes et le nombre d'appels, et un second lancement donne le même nombre.

### Requirement: Aucune écriture sur le vrai projet

Le script SHALL poser les variables d'environnement des émulateurs avant tout import Firebase et forcer le projet
`demo-aap` ; l'import SHALL accepter `--projet`.

#### Scenario: Garde-fou

- WHEN le script est lu
- THEN les variables d'émulateur sont posées en tête de fichier, avant l'import de `firebase_admin`.
