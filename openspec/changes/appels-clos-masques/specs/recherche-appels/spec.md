# recherche-appels Specification

## ADDED Requirements

### Requirement: Appels clos masqués par défaut

Sans filtre de statut, la recherche SHALL n'afficher que les appels ouverts, bientôt clôturés ou sans date ; l'option
« Tous, clôturés compris » SHALL afficher aussi les appels clos, et le filtre « Clôturé » SHALL n'afficher qu'eux.

#### Scenario: Ouverture de la recherche

- **WHEN** Monsieur DUCOUT, connecté, ouvre `/aap/search` sans filtre
- **THEN** aucune carte ne porte la pastille « Clôturé », et le compteur annonce moins d'appels qu'avant (378 le
  2026-11-13, dont 141 clos)

#### Scenario: Voir aussi les appels clos

- **WHEN** il choisit le statut « Tous, clôturés compris »
- **THEN** les cartes « Clôturé » réapparaissent et le compteur revient au total des appels publiés
