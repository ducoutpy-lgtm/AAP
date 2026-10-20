# Proposal

## Why

Retours de Monsieur DUCOUT du 2026-10-20 en parcourant l'application : aucun menu, aucun bouton de retour (connexion,
recherche), le logo ne ramène pas à l'accueil, les liens « Fonctionnalités, Tarifs, FAQ, À propos, Blog, Contact »
du pied de page ne mènent nulle part, les pages légales s'ouvrent en bas, l'accueil ne propose pas de choisir son
profil, les trois espaces (candidat, financeur, administrateur) ne se trouvent pas. Il demande de reprendre les menus
relevés sur helloDarwin (`docs/parcours_hellodarwin_2026-10.md`, section 2).

## What Changes

- **Gabarit commun à toutes les pages** : en-tête public (logo vers l'accueil, bouton Retour hors accueil, liens
  Voir les appels, Fonctionnalités, Tarifs, FAQ, Contact, Connexion ou Mon espace) ; pour un compte dont le profil est
  complet, barre latérale repliable façon helloDarwin (entrées selon le rôle, Support, Paramètres, Déconnexion) et
  barre haute (Retour, offres, alertes, compte) ; pied de page avec liens réels sur toutes les pages ; remontée en haut
  à chaque changement de page. Pourquoi un gabarit unique : un seul endroit pour les menus, plus aucune page sans
  retour.
- **Accueil** : choix du profil dès l'arrivée, en trois cartes (candidat, financeur, consultation sans compte) et un
  accès administrateur par la connexion ; en-tête et pied de page locaux retirés au profit du gabarit.
- **Pages publiques rédigées** : Fonctionnalités, Tarifs (gabarit à trois colonnes, montants à valider), FAQ
  (accordéon), À propos (ARCADIA SASU, données à valider), Contact (sujet et message, enregistré dans une collection
  `messagesContact` lue par l'administrateur). Blog retiré (rien à publier).
- **Hors périmètre** : contenu des pages d'administration (changement suivant), filtres de la recherche publique
  (changement suivant), réécriture des pages connectées existantes au-delà du retrait de leurs en-têtes locaux.

## Capabilities

### New Capabilities

- `navigation-et-pages-publiques` : gabarit, menus, accueil, pages publiques.

## Impact

- Code : `components/layout/*` (gabarit, en-tête, barre latérale, barre haute, pied de page, remontée en haut,
  entrées de menu testées), `components/offres/GrilleOffres.tsx` (partagé par le parcours et la page Tarifs),
  `pages/public/*` (accueil remanié, cinq pages nouvelles), `App.tsx` (routes sous le gabarit), tableaux de bord
  (en-tête local retiré).
- Données : collection `messagesContact` (création par tout visiteur, lecture par l'administrateur) ; règle ajoutée à
  `firestore.rules`, déploiement après accord.
- Coût : zéro euro.
