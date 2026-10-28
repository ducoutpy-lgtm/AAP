# registre-sources Specification (delta)

## ADDED Requirements

### Requirement: Couverture des relais régionaux de la santé

Le registre SHALL couvrir trois familles de relais régionaux de la santé, chacune avec une liste de référence et un
taux de couverture mesuré : cancéropôles, pôles de compétitivité santé, gérontopôles. Chaque membre SHALL être inscrit,
soit en rubrique confirmée avec sa page d'appels vérifiée, soit en « identifiée » avec la raison de l'absence de page.

#### Scenario: Couverture affichée

- **WHEN** Monsieur DUCOUT lance `python scraping/registre.py --tableau` puis ouvre `scraping/REGISTRE_SOURCES.md`
- **THEN** le tableau « Couverture par famille » affiche une ligne Cancéropôles « 7 / 7 », une ligne Pôles de
  compétitivité santé « 6 / 6 » et une ligne Gérontopôles « 14 / 14 »

#### Scenario: Pages suivies par la veille

- **WHEN** Monsieur DUCOUT lance `python scraping/decouverte.py --ids <identifiants ajoutés> --forcer --garder-depart`
- **THEN** chaque membre en rubrique confirmée a un fichier `scraping/decouverte/<id>/liens.json`, même sans appel ce
  jour-là, et la veille hebdomadaire le relit

#### Scenario: Aucune dépense sans accord

- **WHEN** les textes des nouveaux membres sont collectés
- **THEN** la session affiche le devis de l'extraction (`extraction_locale.py --extraire --moteur api --dry-run`) et
  n'appelle pas le modèle sans l'accord de Monsieur DUCOUT
