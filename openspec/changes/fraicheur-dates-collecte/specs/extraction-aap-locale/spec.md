# extraction-aap-locale Specification

## ADDED Requirements

### Requirement: Date de collecte des textes

Tout texte collecté SHALL commencer par une ligne `# collecte_le <date ISO>` ; `lire_fiche` SHALL sauter cette ligne et
rendre toujours (adresse, texte) ; `date_collecte(chemin)` SHALL rendre la date de l'en-tête, ou la date de
modification du fichier pour un texte collecté avant ce changement.

#### Scenario: Texte nouveau

- **WHEN** un collecteur écrit le texte d'une page le 2026-10-20 à 09:00
- **THEN** le fichier commence par `# collecte_le 2026-10-20T09:00` suivi de l'adresse, et `lire_fiche` rend l'adresse
  en premier

#### Scenario: Texte ancien

- **WHEN** `date_collecte` lit un fichier dont la première ligne est une adresse
- **THEN** elle rend la date de modification du fichier, au format ISO

### Requirement: Date de collecte dans la fiche

Les deux moteurs SHALL écrire `scrape_metadata.collecte_le` (date de collecte du texte) dans chaque fiche produite, à
côté de `produite_le` ; `echantillon.py --dater-collecte` SHALL poser `collecte_le` sur les fiches existantes qui n'en
ont pas, après essai à blanc et sauvegarde.

#### Scenario: Fiche produite

- **WHEN** une page est acceptée et extraite
- **THEN** la fiche porte `collecte_le` égal à la date de collecte de son texte et `produite_le` égal à la date de
  l'extraction
