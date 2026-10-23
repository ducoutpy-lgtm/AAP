# pieces-jointes-hors-ligne Specification

## Purpose

Que le site en ligne ne rediffuse aucune pièce jointe de financeur tant que le droit de le faire n'est pas établi.

## Requirements

### Requirement: Aucune copie de pièce jointe en ligne

Le déploiement de l'hébergement SHALL exclure le dossier `documents/` ; la fiche d'un appel en ligne SHALL renvoyer
vers l'adresse d'origine du document chez le financeur.

#### Scenario: Ancienne adresse d'une copie

- **WHEN** après le déploiement, on ouvre https://aapi-11bc3.web.app/documents/ suivi du nom d'un PDF publié le 2026-10-22
- **THEN** le site renvoie la page de l'application (HTML), pas le PDF

#### Scenario: Pièce jointe depuis une fiche

- **WHEN** un visiteur clique une pièce jointe sur une fiche en ligne
- **THEN** le document s'ouvre sur le site du financeur
