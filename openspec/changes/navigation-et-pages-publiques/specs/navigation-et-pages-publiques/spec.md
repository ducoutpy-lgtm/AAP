# navigation-et-pages-publiques Specification

## Purpose

Qu'aucune page ne soit une impasse : un menu, un retour, un pied de page partout ; un accueil qui fait choisir son
profil ; des pages publiques qui existent. Vérifiable par Monsieur DUCOUT sans compte, puis avec ses comptes de test.

## Requirements

### Requirement: En-tête public sur toutes les pages

Toute page vue sans compte, ou avec un compte dont le profil n'est pas encore complet, SHALL afficher un en-tête avec
le logo « AAP Santé » menant à l'accueil, un bouton « Retour » hors de l'accueil, les liens Voir les appels,
Fonctionnalités, Tarifs, FAQ, Contact, et Connexion / Créer un compte (ou Mon espace / Déconnexion si connecté).

#### Scenario: Retour depuis la connexion

- WHEN le visiteur ouvre `/login` depuis l'accueil puis clique « Retour »
- THEN il revient à l'accueil ; un clic sur « AAP Santé » depuis n'importe quelle page ramène aussi à l'accueil.

### Requirement: Barre latérale des comptes connectés

Un compte dont le profil est complet SHALL voir une barre latérale repliable avec, selon son rôle : candidat (porteur)
: Tableau de bord, Trouver des appels, Mes candidatures, Recherches sauvegardées, Recommandations, Calendrier,
Alertes, Messagerie ; financeur : Tableau de bord, Mes appels, Nouvel appel, Statistiques, Trouver des appels,
Calendrier, Alertes, Messagerie ; administrateur : Tableau de bord, Appels à projets, Utilisateurs, Statistiques,
Trouver des appels. Tous SHALL avoir Support (FAQ, Contact), Paramètres (Mon profil, Abonnement) et Déconnexion.
L'entrée de la page courante SHALL être mise en évidence.

#### Scenario: Menu du candidat

- WHEN un porteur connecté ouvre la recherche
- THEN la barre latérale est visible, « Trouver des appels » est mis en évidence, et « Mes candidatures » ouvre
  `/mes-candidatures`.

#### Scenario: Repli

- WHEN l'utilisateur clique le bouton de repli
- THEN la barre ne montre plus que les icônes, et ce choix est conservé après rechargement.

### Requirement: Remontée en haut et pied de page

Chaque changement de page SHALL afficher la nouvelle page depuis le haut. Toute page SHALL finir par un pied de page
avec les liens Fonctionnalités, Tarifs, FAQ, À propos, Contact, CGU, Confidentialité, Mentions légales.

#### Scenario: Pages légales

- WHEN le visiteur, en bas de l'accueil, clique « CGU »
- THEN la page des conditions s'ouvre sur son titre, en haut, et se termine par le pied de page avec les mêmes liens.

### Requirement: Accueil avec choix du profil

L'accueil SHALL proposer dès le premier écran trois cartes : « Je cherche des financements » (établissement candidat,
vers l'inscription porteur), « Je finance des projets » (vers l'inscription financeur), « Je consulte sans compte »
(vers la recherche), et un lien « Administrateur : connexion ».

#### Scenario: Carte candidat

- WHEN le visiteur clique la carte candidat
- THEN il arrive sur `/signup` avec « Porteur » présélectionné.

### Requirement: Pages publiques

`/fonctionnalites`, `/tarifs`, `/faq`, `/a-propos` et `/contact` SHALL exister avec un contenu rédigé en français ;
`/tarifs` SHALL reprendre le gabarit à trois colonnes du parcours d'intégration pour chaque rôle ; `/faq` SHALL être
un accordéon d'au moins huit questions ; `/contact` SHALL proposer un sujet, un message et un bouton « Envoyer » qui
enregistre la demande, avec les coordonnées d'ARCADIA SASU à côté. Aucun lien « Blog ».

#### Scenario: Liens du pied de page

- WHEN le visiteur clique chaque lien du pied de page
- THEN chacun ouvre une page rédigée, aucun ne revient sur l'accueil.

#### Scenario: Envoi d'un message

- WHEN le visiteur choisit un sujet, écrit un message et clique « Envoyer »
- THEN la page affiche « Message envoyé » (ou, tant que la règle Firestore n'est pas déployée, un message d'erreur
  explicite avec les coordonnées).

### Requirement: Entrées de menu testées

La liste des entrées par rôle SHALL être une fonction sans React ni Firebase, testée par Vitest (une entrée Tableau
de bord en tête, aucune adresse en double, Support et Paramètres présents pour chaque rôle).
