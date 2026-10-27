# registre-sources Specification (delta)

## ADDED Requirements

### Requirement: Champ facultatif page_appel

Une source du registre MAY porter `page_appel: true` pour dire que sa page validée est elle-même un appel. Le contrôle
de format SHALL refuser ce champ s'il n'est pas un booléen, ou s'il est vrai sans `url_validee`.

#### Scenario: Registre valide après l'ajout de Gérond'if

- **WHEN** Monsieur DUCOUT lance `python scraping/registre.py --verifier-format`
- **THEN** l'outil affiche « Registre valide : N sources » sans erreur

#### Scenario: Champ mal rempli

- **WHEN** une source porte `page_appel: true` sans `url_validee`, ou `page_appel: "oui"`
- **THEN** l'outil affiche la source fautive et le champ `page_appel`, et s'arrête avec un code de sortie non nul

### Requirement: Suivi d'un appel signalé par ses relais

Quand un appel signalé par Monsieur DUCOUT n'a pas de page propre que la veille puisse relire, le registre SHALL inscrire,
en rubrique confirmée avec leur page de liste validée, les sites qui ont déjà diffusé ses éditions précédentes, pour que
la veille hebdomadaire le trouve chez l'un d'eux.

#### Scenario: Relais de la Fondation Béatrice Denys

- **WHEN** Monsieur DUCOUT lance `python scraping/decouverte.py --ids turenne-groupe-actualites,canceropole-clara,canceropole-paca,eurasante,biotech-sante-bretagne --forcer --garder-depart`
- **THEN** le terminal affiche « rubrique-trouvee » pour chacun, avec la page de liste inscrite au registre

#### Scenario: Publication de l'appel chez un relais

- **WHEN** l'un de ces cinq sites publie l'appel 2026-2027 de la Fondation Béatrice Denys et que la veille passe
- **THEN** son lien figure dans « Liens nouveaux au dernier rejeu » de `scraping/VEILLE.md` et son texte est collecté,
  prêt pour l'extraction après devis
