# liste-demarrage Specification

## Purpose

Guider les quatre premières actions d'un nouveau compte et les cocher automatiquement. Vérifiable par Monsieur DUCOUT
avec un compte de test porteur et un compte financeur.

## Requirements

### Requirement: Carte Démarrer sur les tableaux de bord

Le tableau de bord porteur et le tableau de bord financeur SHALL afficher une carte « Démarrer (n/4) » listant quatre
actions, chacune cochée ou non, avec un lien ou un bouton pour la faire. La carte SHALL disparaître quand les quatre
actions sont faites.

#### Scenario: Nouveau porteur

- WHEN un porteur qui vient de finir le parcours d'intégration arrive sur `/dashboard/porteur`
- THEN il voit « Démarrer (0/4) » avec « Préciser mon profil », « Explorer les appels », « Consulter une fiche »,
  « Commencer une candidature », aucune cochée.

#### Scenario: Quatre sur quatre

- WHEN les quatre actions sont faites
- THEN la carte n'apparaît plus sur le tableau de bord, même après rechargement.

### Requirement: Marquage automatique des actions

Ouvrir `/aap/search` connecté SHALL cocher « Explorer les appels » ; ouvrir une fiche `/aap/:id` connecté SHALL cocher
« Consulter une fiche » ; ouvrir `/aap/:id/candidater` SHALL cocher « Commencer une candidature » (porteur) ; ouvrir
`/aap/nouveau` SHALL cocher « Publier un premier appel » (financeur). Un visiteur sans compte ne marque rien.

#### Scenario: Recherche puis retour

- WHEN le porteur clique « Explorer les appels », puis revient sur le tableau de bord
- THEN la carte affiche « Démarrer (1/4) » et « Explorer les appels » est cochée.

### Requirement: Fenêtre Préciser mon profil

« Préciser mon profil » (porteur) SHALL ouvrir une fenêtre de trois champs : objets de projet (choix multiple :
création de places, immobilier, équipement, numérique, prévention, formation et attractivité, recherche et innovation,
coordination des parcours, qualité de vie au travail), année d'ouverture, rayon d'action (local, départemental,
régional, national). « Enregistrer » SHALL écrire ces valeurs dans le profil et cocher l'action. Pour un financeur, la
fenêtre « Préciser mon organisation » SHALL proposer le site web et une présentation courte.

#### Scenario: Profil précisé

- WHEN le porteur coche « Rénovation et immobilier », saisit « 1998 », choisit « Régional » et clique « Enregistrer »
- THEN la fenêtre se ferme, « Préciser mon profil » est cochée, et « Mon profil » montre ces trois valeurs.

### Requirement: Logique testée sans Firebase

La liste des actions par rôle et le calcul de l'état (faites, total, terminé) SHALL être des fonctions sans Firebase,
testées par Vitest.

#### Scenario: Tests verts

- WHEN la session lance `npm test`
- THEN les tests de `demarrage.test.ts` passent et le compte est collé dans `tasks.md`.
