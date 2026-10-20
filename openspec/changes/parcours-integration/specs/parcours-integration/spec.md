# parcours-integration Specification

## Purpose

Faire entrer un nouveau compte dans l'application en trois écrans courts, propres au secteur santé et médico-social,
dont les réponses deviennent son profil. Vérifiable par Monsieur DUCOUT avec un compte de test neuf.

## Requirements

### Requirement: Parcours en trois écrans après l'inscription

Après l'inscription, l'adresse `/complete-profile` SHALL afficher un écran d'accueil puis trois écrans numérotés
(« Votre structure », « Vos détails », « Votre offre ») avec une barre de progression. Le bouton « Suivant » SHALL
rester grisé tant que les champs obligatoires de l'écran ne sont pas remplis ; « Retour » SHALL ramener à l'écran
précédent sans perdre les réponses.

#### Scenario: Accueil et acceptation des conditions

- WHEN un compte neuf arrive sur `/complete-profile`
- THEN il voit « Bienvenue sur AAP Santé », une case « J'accepte les conditions générales d'utilisation » avec un
  lien vers `/cgu`, et le bouton « Commencer » reste grisé tant que la case n'est pas cochée.

#### Scenario: Écran incomplet

- WHEN le porteur est sur « Votre structure » et n'a pas encore saisi le nom de sa structure
- THEN « Suivant » est grisé ; dès que le nom, la forme juridique, la ville et le code postal sont remplis, il devient
  cliquable.

#### Scenario: Retour sans perte

- WHEN le porteur remplit « Votre structure », passe à « Vos détails », puis clique « Retour »
- THEN les valeurs saisies sur « Votre structure » sont toujours là.

### Requirement: Région déduite du code postal

Le parcours SHALL déduire la région du code postal saisi et l'afficher sous le champ ; un code postal inconnu SHALL
laisser la région vide sans bloquer.

#### Scenario: Code postal d'Évry

- WHEN le porteur saisit le code postal « 91000 »
- THEN la mention « Région : Île-de-France » apparaît sous le champ.

#### Scenario: Corse et outre-mer

- WHEN le porteur saisit « 20000 » puis « 97200 »
- THEN la région affichée est « Corse » puis « Martinique ».

### Requirement: Détails du porteur propres au secteur

L'écran « Vos détails » d'un porteur SHALL proposer le type d'établissement (liste groupée d'après la nomenclature
FINESS : sanitaire, personnes âgées, handicap, autres), la taille en équivalents temps plein par tranches, le budget
annuel par tranches et les publics accueillis (choix multiple). Le type d'établissement et au moins un public SHALL
être obligatoires.

#### Scenario: EHPAD associatif

- WHEN le porteur choisit la forme « Association », le type « EHPAD », la taille « 51 à 200 », le budget « 2 à
  10 millions », le public « Personnes âgées », puis termine le parcours
- THEN la page « Mon profil » montre ces quatre valeurs dans le formulaire du porteur.

### Requirement: Écran des offres à trois colonnes

L'écran « Votre offre » SHALL présenter trois colonnes : Essai gratuit (14 jours, 0 euro), Mensuel et Annuel, avec
les montants de `config/stripe.ts` et la mention « 2 mois offerts » sur l'annuel. « Continuer avec l'essai gratuit »
SHALL enregistrer le profil, marquer le profil complet et ouvrir le tableau de bord du rôle. Choisir une offre payante
SHALL enregistrer le profil puis ouvrir `/abonnement/choisir`.

#### Scenario: Essai gratuit

- WHEN le porteur clique « Continuer avec l'essai gratuit »
- THEN il arrive sur `/dashboard/porteur`, et un rechargement de la page ne le renvoie plus vers `/complete-profile`.

#### Scenario: Offre payante

- WHEN le financeur clique « Choisir » sous la colonne Annuel
- THEN son profil est enregistré et il arrive sur `/abonnement/choisir`.

### Requirement: Compte créé avec Google

Un compte connecté qui n'a pas encore de document utilisateur SHALL voir, sur l'écran d'accueil, le choix du rôle
(porteur ou financeur) ; la fin du parcours SHALL créer son document utilisateur avec l'essai de 14 jours, comme
l'inscription par e-mail.

#### Scenario: Première connexion Google

- WHEN un compte Google se connecte pour la première fois et arrive sur `/complete-profile`
- THEN l'écran d'accueil propose « Porteur de projet » et « Financeur », et après le parcours le tableau de bord du
  rôle choisi s'ouvre.

### Requirement: Profil porteur enrichi

Le type `PorteurProfile` SHALL recevoir quatre champs optionnels (`typeEtablissement`, `tailleTranche`,
`budgetTranche`, `publics`) et la liste des formes juridiques du secteur ; les profils existants SHALL rester
lisibles sans ces champs. Le formulaire « Mon profil » du porteur SHALL permettre de les corriger.

#### Scenario: Profil ancien

- WHEN un porteur inscrit avant ce changement ouvre « Mon profil »
- THEN la page s'affiche, les nouveaux champs sont vides, et l'enregistrement fonctionne.

### Requirement: Logique du parcours testée sans Firebase

La déduction de la région, la complétude de chaque écran et la construction du profil à enregistrer SHALL être des
fonctions sans Firebase, testées par Vitest.

#### Scenario: Tests verts

- WHEN la session lance `npm test` dans `app/`
- THEN les tests de `parcours.test.ts` passent et le compte total est collé dans `tasks.md`.
