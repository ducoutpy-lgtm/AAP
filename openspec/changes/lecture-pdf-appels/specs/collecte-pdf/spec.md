# collecte-pdf Specification

## ADDED Requirements

### Requirement: Texte des appels publiés en PDF

Avec l'option `--pdf`, la collecte SHALL télécharger les liens d'appel qui sont des PDF, SHALL en écrire le texte au
même format qu'une page web pour qu'il soit compté par le devis et lu par l'extraction, et SHALL écarter un PDF de plus
de 20 Mo, ne lire que ses 40 premières pages, et signaler un PDF sans texte lisible. Sans `--pdf`, la collecte SHALL
rester inchangée.

#### Scenario: Conférences des financeurs

- **WHEN** Monsieur DUCOUT lance `python scraping/extraction_locale.py --collecter --pdf --ids <sources des conférences>`
- **THEN** le terminal compte les PDF lus et les PDF sans texte, et le devis à blanc
  (`--extraire --moteur api --dry-run --ids ...`) compte les nouveaux textes

#### Scenario: Veille du lundi inchangée

- **WHEN** la veille du lundi tourne
- **THEN** elle ne collecte aucun PDF tant que l'option n'y est pas ajoutée
