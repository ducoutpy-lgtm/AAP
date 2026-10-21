# suivi-testeurs Specification

## Purpose

Que l'administrateur voie qui utilise l'application et ce que chacun y fait. Vérifiable par Monsieur DUCOUT avec son
compte administrateur après quelques actions de son compte candidat.

## Requirements

### Requirement: Journal des actions

L'application SHALL écrire dans `journal` une ligne {userId, role, action, cible, libelle, le} pour : `connexion`
(après une connexion réussie), `recherche` (ouverture de la recherche, filtres actifs en libellé), `fiche`
(ouverture d'une fiche : identifiant et titre), `recherche-sauvegardee`, `candidature` (envoi : appel visé), `appel`
(publication par un financeur). Un échec d'écriture SHALL être silencieux pour l'utilisateur.

#### Scenario: Candidat qui ouvre une fiche

- WHEN un candidat connecté ouvre `/aap/<id>`
- THEN une ligne `fiche` avec son identifiant de compte et le titre de l'appel existe dans `journal`.

### Requirement: Page Testeurs

`/admin/testeurs` SHALL lister les comptes candidats et financeurs, un par ligne : adresse, rôle, structure,
inscription, dernière connexion, et les nombres de connexions, recherches, fiches ouvertes, candidatures ou appels ;
cliquer une ligne SHALL montrer les vingt dernières actions du compte (date, action, cible). En tête, les chiffres de
la semaine : comptes actifs, connexions, recherches, fiches ouvertes, candidatures.

#### Scenario: Après le parcours d'un testeur

- WHEN le compte candidat de test s'est connecté, a fait une recherche, ouvert deux fiches et envoyé une candidature,
  puis que l'administrateur ouvre `/admin/testeurs`
- THEN la ligne du compte montre 1 connexion, 1 recherche, 2 fiches, 1 candidature, et le détail les liste dans
  l'ordre, la plus récente d'abord.

### Requirement: Accès et règle

Seul l'administrateur SHALL lire `journal` ; un compte connecté SHALL pouvoir créer une ligne portant son propre
identifiant et rien d'autre. La page SHALL être dans le menu de l'administrateur (« Testeurs ») et accessible depuis
le tableau de bord.

#### Scenario: Test des règles

- WHEN la session lance `npm run test:rules`
- THEN un test montre qu'un candidat crée sa ligne, ne peut pas en créer pour un autre compte ni lire le journal, et
  que l'administrateur le lit.

### Requirement: Logique testée sans Firebase

Libellés des actions, résumé par compte et chiffres de la semaine SHALL être des fonctions testées par Vitest.
