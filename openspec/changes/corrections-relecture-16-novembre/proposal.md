# Proposal

## Why

Avant la mise en ligne acceptée par Monsieur DUCOUT le 2026-11-16 (« Oui, mets en ligne », questions 24, 26, 27, 28),
une relecture à plusieurs agents des modifications du jour (`git diff c87054f..HEAD`) a relevé 19 constats ; 11 ont
survécu à un contradicteur chargé de les réfuter. Ce changement corrige ceux qui touchent le code mis en ligne ou le
courriel du lundi.

## What Changes

- Courriel du lundi (`scraping/alertes.py`) :
  - montants lus comme `parseFloat` en JavaScript (« 50 000 » vaut 50, « abc » ne garde que les fiches sans montant) au
    lieu de `float`, qui plantait ; deux cas ajoutés au fichier commun `cas_filtres_recherche.json` ;
  - un candidat en erreur n'empêche plus l'envoi aux suivants (erreur écrite dans le journal) ;
  - une recherche d'avril sans critère repris n'envoie plus de section « toute la France » ; une recherche d'avril dont
    une partie des critères est perdue le dit dans le courriel ;
  - le nom d'une recherche est raccourci à 80 caractères et ses liens sont retirés (défense en profondeur, voir la règle
    ci-dessous).
- Application :
  - « Alerte » : un double clic n'inverse plus l'écran par rapport à la base ;
  - « Enregistrer cette recherche » : bouton bloqué pendant l'écriture, et une recherche identique déjà enregistrée
    n'est pas recréée ; le message dit quand l'alerte ne partira pas (profil non complété, courriels désactivés) ;
  - une recherche d'avril sans critère repris le dit et n'annonce plus « Tous les appels ouverts » ;
  - page Confidentialité : l'export est annoncé pour un compte dont le profil est complété (la page Mon profil renvoie
    les autres vers le parcours d'accueil).
- Règles Firestore (`app/firestore.rules`), à déployer sur accord de Monsieur DUCOUT (question 31) :
  - `savedSearches`, `favoriteAap`, `notifications` : une mise à jour ne peut plus changer `userId` (une recherche
    réattribuée à un autre compte ferait partir depuis la boîte officielle un texte choisi par l'attaquant) ;
  - `aap` : le financeur auteur lit ses appels quel que soit son abonnement (son export échouait s'il était suspendu).
- Documentation : `--project aapi-11bc3` dans les commandes des questions 27 et 28.

## Hors périmètre

- Constats réfutés par le contradicteur (8), dont les liens `http://localhost:3000` du courriel du lundi, jugés
  antérieurs à ce jour : à vérifier séparément.

## Capabilities

### Modified Capabilities

- `alertes-recherches` : robustesse du courriel et des recherches sauvegardées.
