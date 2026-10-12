# decouverte-rubriques-aap Specification

## Purpose
Trouve automatiquement, sur le site de chaque source du registre, la page où les appels à projets
sont listés, en collecte les liens et garde ces pages en local pour l'extraction.

## Requirements

### Requirement: Repérage de la rubrique appels à projets d'une source

Pour chaque source, l'outil SHALL ouvrir la page enregistrée dans le registre, repérer les liens
dont le texte ou l'adresse évoque un appel à projets, visiter au plus trois pages candidates du
même site et retenir celle qui contient le plus de liens vers des appels à projets.

#### Scenario: Rubrique trouvée

- **WHEN** Monsieur DUCOUT lance `python scraping/decouverte.py --ids ars-bretagne`
- **THEN** le terminal affiche « rubrique trouvée » avec l'adresse de la page de liste de l'ARS Bretagne et un nombre de liens d'AAP supérieur à 0

#### Scenario: Aucune rubrique

- **WHEN** une source n'offre aucun lien évoquant un appel à projets, ni sur sa page ni sur les candidats visités
- **THEN** son statut est « aucune rubrique » et le site n'est pas exploré au-delà

#### Scenario: Site bloquant

- **WHEN** le site refuse l'accès ou ne répond pas
- **THEN** le statut est « bloqué » ou « erreur » avec le motif, et l'outil passe à la source suivante sans s'arrêter

### Requirement: Conservation locale et reprise

L'outil SHALL enregistrer, par source, la page retenue et la liste des liens d'AAP dans
`scraping/decouverte/<id>/`, consigner le résultat dans `scraping/decouverte/resultats.json`, et
SHALL ignorer au lancement suivant les sources déjà traitées sauf demande explicite.

#### Scenario: Reprise après interruption

- **WHEN** l'outil est relancé après un arrêt en cours de route
- **THEN** il reprend aux sources non traitées et conserve les résultats précédents

#### Scenario: Pages en local

- **WHEN** une rubrique a été trouvée pour une source
- **THEN** le dossier de la source contient `rubrique.html` et `liens.json`

### Requirement: Rapport de découverte

L'outil SHALL produire `scraping/DECOUVERTE.md` avec, par famille du registre, le nombre de
sources traitées, de rubriques trouvées, de sites bloquants, et le total des liens d'AAP collectés,
suivi du tableau des sources avec leur rubrique.

#### Scenario: Rapport

- **WHEN** Monsieur DUCOUT lance `python scraping/decouverte.py --rapport`
- **THEN** `scraping/DECOUVERTE.md` commence par un décompte global, par exemple « 847 sources : 400 rubriques trouvées, 300 sans rubrique, 147 bloquées ; 5 000 liens d'AAP »
