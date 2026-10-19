# consultation-aap-scrapes Specification

## ADDED Requirements

### Requirement: Mention de relecture sur chaque fiche scrapée

La liste et la fiche SHALL afficher, pour tout appel scrapé, une mention déduite de `validation` : « Relue par Monsieur
DUCOUT » si `statut = validee` et `par` est le relecteur humain ; « Contrôlée par le modèle » si `statut = validee` au nom
d'un modèle ; « Non relue : informations extraites automatiquement » si `statut` vaut `proposee` ou `a_corriger`. Un
appel saisi à la main (sans bloc `validation`) SHALL ne porter aucune mention.

#### Scenario: Fiche validée par le modèle

- **WHEN** un visiteur ouvre la liste ou une fiche dont `validation = { validee, par: claude-haiku-5-5 }`
- **THEN** il lit « Contrôlée par le modèle » et aucun badge « À vérifier »

#### Scenario: Fiche non relue

- **WHEN** la fiche porte `validation.statut = proposee`
- **THEN** il lit « Non relue : informations extraites automatiquement »

### Requirement: Date d'extraction et lien officiel en évidence

La liste et la fiche SHALL afficher la date à laquelle les informations ont été extraites (`scrapeMetadata.extraitLe`,
au format français) et un lien « Annonce officielle » vers `externalUrl`, visible sans faire défiler la fiche et
cliquable dans la liste sans ouvrir la fiche.

#### Scenario: Lien officiel depuis la liste

- **WHEN** le visiteur clique « Annonce officielle » sur une carte de la liste
- **THEN** la page du financeur s'ouvre dans un nouvel onglet et la fiche ne s'ouvre pas

### Requirement: Filtre « fiches relues seulement »

La recherche SHALL offrir un filtre « Relecture » dont l'option « Fiches relues ou contrôlées seulement » ne garde que
les fiches dont `validation.statut = validee`.

#### Scenario: Filtre activé

- **WHEN** le visiteur choisit « Fiches relues ou contrôlées seulement »
- **THEN** le compte affiché est égal au nombre de fiches publiées validées, et aucune fiche « Non relue » ne reste
