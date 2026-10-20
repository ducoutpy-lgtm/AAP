# recherche-guidee Specification

## Purpose

Rendre la page de recherche lisible et partageable : combien d'appels et d'euros, quels filtres sont actifs, quel
statut, et d'un clic les filtres du profil. Vérifiable par Monsieur DUCOUT sans compte pour l'essentiel, avec un compte
porteur pour l'initialisation au profil.

## Requirements

### Requirement: Compteur avec montants

L'en-tête de `/aap/search` SHALL afficher le nombre d'appels affichés et la somme des montants annoncés (budget total,
sinon budget maximal) avec le nombre de fiches chiffrées, recalculés à chaque changement de filtre.

#### Scenario: Compteur après un filtre

- WHEN le visiteur choisit le territoire « Normandie »
- THEN l'en-tête affiche « N appels à projets » et « M euros annoncés (K fiches chiffrées) » avec N, M et K
  correspondant aux fiches affichées, et M change si l'on retire le filtre.

### Requirement: Étiquettes des filtres actifs

Chaque filtre actif (mot-clé, thématique, territoire, financeur, source, relecture, statut, budget) SHALL apparaître
en étiquette au-dessus de la liste avec son libellé lisible et une croix qui le retire ; « Effacer tout » SHALL retirer
tous les filtres.

#### Scenario: Retrait d'une étiquette

- WHEN le visiteur a choisi « Médico-social » et « Normandie », puis clique la croix de « Normandie »
- THEN seule l'étiquette « Médico-social » reste, la liste et le compteur se recalculent, et la liste Territoire est
  revenue à « Tous les territoires ».

### Requirement: Statut à quatre valeurs

Le filtre Statut SHALL proposer « Ouvert », « Bientôt clôturé (30 jours ou moins) », « Clôturé » et « Date non
précisée » ; chaque carte SHALL porter une pastille du statut calculé à partir de sa date de clôture.

#### Scenario: Bientôt clôturé

- WHEN le visiteur choisit « Bientôt clôturé »
- THEN seules les fiches dont la clôture est dans 0 à 30 jours restent, chacune avec la pastille « Bientôt clôturé ».

### Requirement: Adresse partageable

Les filtres actifs SHALL être inscrits dans l'adresse de la page ; ouvrir cette adresse dans un autre onglet SHALL
rétablir les mêmes filtres ; un bouton « Copier le lien » SHALL copier l'adresse courante.

#### Scenario: Lien partagé

- WHEN le visiteur choisit « Normandie » et « Bientôt clôturé », copie l'adresse et l'ouvre dans un nouvel onglet
- THEN la nouvelle page montre les deux filtres actifs et la même liste.

### Requirement: Initialiser à mon profil

Pour un porteur connecté dont le profil a une région, un bouton « Initialiser à mon profil » SHALL positionner le
territoire sur cette région. Le bouton SHALL être absent pour un visiteur sans compte.

#### Scenario: Porteur d'Île-de-France

- WHEN un porteur dont le profil indique le code postal 91000 clique « Initialiser à mon profil »
- THEN le territoire « Île-de-France » est actif et l'étiquette correspondante apparaît.

### Requirement: Appels nationaux inclus dans un territoire

Quand un territoire régional est choisi, les appels ouverts à toute la France SHALL rester affichés.

#### Scenario: Normandie et national

- WHEN le visiteur choisit « Normandie »
- THEN la liste contient les fiches de Normandie et celles marquées « National, toute la France », et aucune autre
  région.

### Requirement: Fiches consultées

Un onglet « Consultées » SHALL lister les dernières fiches ouvertes sur ce navigateur (vingt au plus, la plus récente
en tête) ; vide, il SHALL le dire.

#### Scenario: Deux fiches ouvertes

- WHEN le visiteur ouvre deux fiches puis revient sur la recherche et clique « Consultées »
- THEN les deux fiches apparaissent, la dernière ouverte en premier.

### Requirement: Logique testée sans Firebase

Le statut, le total des montants, les étiquettes, la conversion filtres <-> adresse et les filtres d'après le profil
SHALL être des fonctions sans Firebase, testées par Vitest.

#### Scenario: Tests verts

- WHEN la session lance `npm test`
- THEN les tests de `recherche.test.ts` passent et le compte est collé dans `tasks.md`.
