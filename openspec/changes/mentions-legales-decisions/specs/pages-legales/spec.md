# pages-legales Specification

## ADDED Requirements

### Requirement: Pages légales sans mention en suspens

Les pages Mentions légales, Conditions générales et Confidentialité SHALL ne contenir aucune mention « À VALIDER »
une fois les décisions de Monsieur DUCOUT du 2026-11-13 appliquées, et SHALL dire où sont traitées les données :
base de données dans l'Union européenne, comptes de connexion et fichiers déposés aux États-Unis.

#### Scenario: Confidentialité

- **WHEN** Monsieur DUCOUT ouvre `/confidentialite` sur la copie locale de l'application
- **THEN** aucun encadré jaune « À VALIDER » n'apparaît, et la page dit que les comptes de connexion sont traités aux
  États-Unis et que la base de données est dans l'Union européenne

#### Scenario: Conditions générales

- **WHEN** il ouvre `/cgu`
- **THEN** la section « Période d'essai et abonnement » dit que les tarifs sont provisoires, qu'aucun paiement n'est
  ouvert pendant la phase de test et que la résiliation sera fixée à l'ouverture du paiement
