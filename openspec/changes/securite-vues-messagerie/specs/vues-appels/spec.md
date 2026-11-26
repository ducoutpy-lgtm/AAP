## ADDED Requirements

### Requirement: Une vue par compte et par appel

L'ouverture d'une fiche visible par un compte connecté, autre que son auteur et que l'administrateur, SHALL ajouter
une vue au compteur `views` de l'appel la première fois seulement. Les règles Firestore SHALL n'accepter l'ajout d'une
vue que s'il s'accompagne, dans la même écriture, de la création de la marque de vue de ce compte pour cet appel, et
refuser une seconde marque.

#### Scenario: Première ouverture

- **WHEN** un candidat ouvre pour la première fois une fiche publiée et validée
- **THEN** le compteur de vues augmente de un

#### Scenario: Ouvertures suivantes

- **WHEN** le même candidat rouvre la même fiche, ou recharge la page
- **THEN** le compteur ne change pas

#### Scenario: Vue ajoutée sans marque

- **WHEN** un compte tente d'ajouter une vue sans créer sa marque de vue, ou d'en ajouter une seconde
- **THEN** Firestore refuse l'écriture
