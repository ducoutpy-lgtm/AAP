# parcours-candidat Specification

## Purpose

Qu'un candidat connecté aille de son tableau de bord à une fiche, à une candidature et à son suivi sans page vide ni
donnée brute. Vérifiable par Monsieur DUCOUT avec son compte candidat de test.

## Requirements

### Requirement: Fiche d'appel lisible

La fiche `/aap/:id` SHALL afficher en en-tête trois cases : montant (« De X à Y € », « Jusqu'à Y € », « Enveloppe
Z € » ou « Montant non précisé »), dates (clôture en toutes lettres, jours restants, statut) et territoire en clair ;
une carte « À qui s'adresse cet appel » (types d'établissement éligibles et critères quand la fiche les porte) ; les
thématiques et territoires en libellés français. Les compteurs « Candidatures » et « Territoires » SHALL disparaître.

#### Scenario: Fiche d'une ARS

- WHEN le candidat ouvre une fiche d'ARS de sa région
- THEN il lit le nom de la région (pas « ile-de-france »), le montant ou « Montant non précisé », la date de clôture et
  le nombre de jours restants, et la carte « À qui s'adresse cet appel ».

### Requirement: Tableau de bord candidat utile

`/dashboard/porteur` SHALL afficher : « Bienvenue, <nom de la structure> », quatre chiffres réels (appels pour votre
structure, échéances sous 30 jours, candidatures, recherches sauvegardées), la liste des cinq appels ouverts de sa
région ou nationaux dont la clôture est la plus proche, avec un lien « Voir tous » vers la recherche déjà filtrée sur
sa région, et ses trois dernières candidatures.

#### Scenario: Candidat de Bourgogne-Franche-Comté

- WHEN un candidat dont le profil est en Bourgogne-Franche-Comté ouvre son tableau de bord
- THEN « Appels pour votre structure » ne contient que des appels de cette région ou nationaux, ouverts, et le
  chiffre correspond au compteur de la recherche filtrée sur cette région et le statut ouvert ou bientôt clôturé.

### Requirement: Détail d'une candidature

`/candidature/:id` SHALL afficher au candidat propriétaire : le statut, l'historique des statuts quand il existe, le
titre et la description du projet, objectifs, méthodologie, calendrier, budget, équipe, pièces jointes avec leurs
liens, le retour du financeur s'il y en a un, et un lien vers la fiche de l'appel. Un autre compte SHALL voir
« Candidature introuvable ».

#### Scenario: Après l'envoi

- WHEN le candidat clique sur sa candidature dans « Mes candidatures »
- THEN le détail s'ouvre avec le statut « Envoyée », la date d'envoi et tous les champs saisis.

### Requirement: Mes candidatures en colonnes

`/mes-candidatures` SHALL présenter cinq colonnes : Envoyée, En cours d'examen, Complément demandé, Acceptée,
Refusée, avec le nombre par colonne ; chaque carte (titre du projet, appel, date) SHALL ouvrir le détail.

#### Scenario: Une candidature envoyée

- WHEN le candidat a une candidature envoyée
- THEN elle apparaît dans la colonne « Envoyée (1) », les autres colonnes affichent « Aucune ».

### Requirement: Logique testée sans Firebase

Montant lisible, « à qui s'adresse », appels pour un profil, échéances proches et répartition en colonnes SHALL être
des fonctions sans Firebase, testées par Vitest.
