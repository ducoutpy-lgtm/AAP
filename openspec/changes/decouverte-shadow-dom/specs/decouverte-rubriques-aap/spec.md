# decouverte-rubriques-aap Specification (delta)

## ADDED Requirements

### Requirement: Lecture des liens placés dans un shadow DOM

La lecture des liens d'une page SHALL inclure les liens situés dans un shadow DOM ouvert (sites Salesforce
Lightning comme celui de l'ANAP), avec la même forme de résultat (`texte`, `href` absolu) que les liens ordinaires.

#### Scenario: Page locale avec shadow DOM

- **WHEN** la session ouvre une page d'essai contenant un lien ordinaire et un lien dans un shadow DOM
- **THEN** `extraire_liens` renvoie les deux liens avec leur adresse absolue

#### Scenario: Page avec balise base

- **WHEN** une page déclare `<base href="/">` et un lien relatif « fr/appel-a-projets-general-2026.html »
- **THEN** `extraire_liens` renvoie `https://<site>/fr/appel-a-projets-general-2026.html`, comme le ferait le navigateur

#### Scenario: ANAP, page des actualités

- **WHEN** Monsieur DUCOUT lance `python scraping/decouverte.py --ids anap --forcer --garder-depart`
- **THEN** la lecture de la page (`decouverte.lire_page`) renvoie plus de liens que l'essai du 2026-10-21 (14), dont le
  lien « Appel à projets : Achats innovants » ; le statut reste « aucune rubrique » tant que la page n'offre qu'un seul
  lien d'appel (il en faut deux)
