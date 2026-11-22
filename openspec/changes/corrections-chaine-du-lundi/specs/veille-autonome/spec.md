# Spec : veille autonome

## MODIFIED Requirements

### Requirement: Durée de la veille

La veille du lundi MUST envoyer ses courriels avant l'étape du modèle local, et cette étape MUST traiter au plus 40
textes encore jamais traités. La chaîne de nuit MUST traiter au plus 60 PDF encore jamais traités par nuit.

#### Scenario: semaine chargée
- **WHEN** la veille trouve 300 pages nouvelles
- **THEN** le courriel du lundi part dans la matinée, puis 40 pages sont traitées par le modèle local ; la semaine
  suivante traite les 40 suivantes, jamais les mêmes

### Requirement: Décisions humaines préservées

Le tri et l'import MUST NOT republier une fiche archivée ou clôturée à la main, ni réécrire les champs d'une fiche
validée.

#### Scenario: fiche archivée par Monsieur DUCOUT
- **WHEN** Monsieur DUCOUT archive une fiche « Proposée » dans `/admin/aaps`
- **THEN** le tri du lundi suivant la laisse archivée

### Requirement: Courriel du lundi

Le courriel du lundi MUST annoncer chaque appel nouveau une fois, et un échec du bilan de l'administrateur MUST NOT
empêcher l'envoi aux candidats.

#### Scenario: deux lundis de durée différente
- **WHEN** la veille d'une semaine finit à 13 h et celle de la semaine suivante à 9 h 30
- **THEN** aucun appel n'est annoncé deux fois, et aucun n'est oublié
