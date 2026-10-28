# connecteur-funding-tenders Specification

## Purpose

Que chaque appel européen de santé ouvert ou à venir du portail Funding & Tenders devienne une fiche de l'application,
avec son vrai financeur, ses vraies dates et son lien officiel, sans lecture par un modèle.

## ADDED Requirements

### Requirement: Lecture des appels européens de santé

`funding_tenders.py` SHALL lire, page par page, tous les appels ouverts ou à venir de l'interface publique du portail,
SHALL garder ceux dont l'identifiant relève d'un programme de santé (`HORIZON-HLTH`, `EU4H`, `HORIZON-JU-IHI`,
`HORIZON-JU-GH-EDCTP3`, `HORIZON-MISS-*-CANCER`), un seul par identifiant, et SHALL produire une fiche `AapNormalized`
par appel dans `scraping/results/funding_tenders.json`.

#### Scenario: Fichier produit

- **WHEN** Monsieur DUCOUT lance `python scraping/funding_tenders.py`
- **THEN** le terminal affiche le nombre d'appels lus, d'appels de santé retenus et d'appels encore ouverts, et le
  fichier de résultats contient une fiche par appel de santé retenu

#### Scenario: Conversion d'un appel

- **WHEN** l'interface renvoie l'appel HORIZON-HLTH-2027-01-CARE-02 (ouverture 2026-10-29, clôture 2027-02-17)
- **THEN** la fiche porte ce titre, le financeur « Commission européenne – Horizon Europe, pôle Santé »,
  `date_ouverture` = `2026-10-29`, `date_cloture` = `2027-02-17`, le lien officiel du portail, `champ` = `sante`

#### Scenario: Appel en deux étapes

- **WHEN** un appel porte deux dates limites, l'une passée et l'autre à venir
- **THEN** `date_cloture` est la première date à venir

#### Scenario: Statut périmé du portail

- **WHEN** le portail marque un appel « ouvert » ou « à venir » alors que toutes ses dates limites sont passées (26 cas
  le 2026-10-28, clôtures de 2023 et 2024)
- **THEN** il n'est pas retenu

#### Scenario: Programme hors santé

- **WHEN** l'interface renvoie un appel `HORIZON-CL5` ou `I3`
- **THEN** il n'est pas retenu

#### Scenario: Contrôle du modèle sans effet sur les champs structurés

- **WHEN** le contrôle du modèle juge « fabriqués » la date de clôture ou le montant d'une fiche de ce connecteur
  (`moteur` = `api-portail`), parce qu'il ne les voit pas dans la description
- **THEN** la décision du modèle ne les retire pas : ils viennent des données du portail

#### Scenario: Lecture stable

- **WHEN** le connecteur est lancé deux fois de suite
- **THEN** il retient les mêmes appels (lecture triée par identifiant ; sans tri, deux lectures différaient de 190 appels
  le 2026-10-28)

#### Scenario: Relance sans repayer

- **WHEN** le connecteur réécrit son fichier alors que des fiches y portaient déjà une qualification ou un contrôle du
  modèle
- **THEN** ces résultats sont repris pour les mêmes identifiants, et la qualification suivante ne les refait pas

#### Scenario: Interface indisponible

- **WHEN** l'interface ne répond pas ou renvoie une erreur
- **THEN** le terminal l'indique et le fichier de résultats existant n'est pas modifié
