# decouverte-rubriques-aap Specification (delta)

## ADDED Requirements

### Requirement: Une page validée à la main est retenue dès un lien d'appel

Quand l'adresse d'une source a été validée par un humain (champ `url_validee` du registre), la découverte et la veille
SHALL retenir cette page dès qu'elle contient un lien d'appel. Les autres pages restent soumises au seuil de deux liens.

#### Scenario: FEHAP, site novap à un seul appel

- **WHEN** Monsieur DUCOUT lance `python scraping/decouverte.py --ids fehap --forcer --garder-depart`
- **THEN** le terminal affiche « rubrique-trouvee » avec la page `https://novap.fehap.fr/` et au moins un lien d'appel,
  dont l'appel à candidatures 2026

#### Scenario: Page d'accueil non validée

- **WHEN** une page qui n'a pas été validée à la main ne contient qu'un seul lien évoquant un appel
- **THEN** son statut reste « aucune rubrique », comme avant ce changement

#### Scenario: Page validée sans appel ce jour-là

- **WHEN** Monsieur DUCOUT lance `python scraping/decouverte.py --ids turenne-groupe-actualites --forcer --garder-depart`
  alors que la page d'actualités de Turenne ne contient aucun lien d'appel
- **THEN** le statut est « aucune rubrique », mais `scraping/decouverte/turenne-groupe-actualites/liens.json` existe
  avec l'adresse de la page et une liste de liens vide (un fichier déjà présent est gardé tel quel)
- **AND** `python scraping/rejeu.py --relire --ids turenne-groupe-actualites` relit la page au lieu de répondre « pas de
  liens.json (source jamais découverte) »

#### Scenario: Veille d'une page validée à un seul appel

- **WHEN** la veille relit l'ANAP (`python scraping/rejeu.py --relire --ids anap`)
- **THEN** la page n'est plus ignorée avec le motif « moins de deux » : le bilan donne le nombre de liens vus

### Requirement: Une page qui est elle-même l'appel

Quand une source porte `page_appel: true` au registre, la découverte et la veille SHALL enregistrer la page validée
comme son propre lien d'appel, avec le titre de la page pour texte, en plus des liens d'appel qu'elle contiendrait.

#### Scenario: Gérond'if, appel Tubbe

- **WHEN** Monsieur DUCOUT lance `python scraping/decouverte.py --ids gerondif --forcer --garder-depart`
- **THEN** le terminal affiche « rubrique-trouvee » avec la page de l'appel Tubbe et un lien
- **AND** `scraping/decouverte/gerondif/liens.json` contient l'adresse de la page Tubbe elle-même

#### Scenario: Page d'appel disparue

- **WHEN** la page d'appel répond par une erreur lors de la veille
- **THEN** la source est ignorée pour ce rejeu avec le motif de l'erreur, sans compter d'absence, comme toute page en
  erreur
