## ADDED Requirements

### Requirement: Une conversation par candidature, entre ses deux participants

Un candidat et le financeur d'une candidature envoyée par l'application SHALL pouvoir ouvrir une conversation propre à
cette candidature, depuis la candidature (côté candidat comme côté financeur). Une conversation SHALL compter
exactement deux participants : le candidat et le financeur de la candidature. Seuls ses participants SHALL pouvoir la
lire et y écrire.

#### Scenario: Le financeur écrit au candidat

- **WHEN** le financeur ouvre une candidature reçue et choisit d'écrire au candidat, puis envoie « Pouvez-vous préciser
  votre budget ? »
- **THEN** la conversation apparaît dans la page Messages des deux comptes, avec ce message

#### Scenario: Le candidat répond

- **WHEN** le candidat ouvre la conversation et répond
- **THEN** le financeur voit la réponse et la conversation passe en non lue pour lui

#### Scenario: Un tiers

- **WHEN** un autre compte tente de lire la conversation ou d'y écrire
- **THEN** Firestore refuse

### Requirement: Messages bornés

Un message SHALL être écrit par son expéditeur connecté, adressé à l'autre participant de la conversation, et compter
de 1 à 5 000 caractères. Le destinataire SHALL seulement pouvoir le marquer lu. Un envoi en échec SHALL être annoncé
à l'écran.

#### Scenario: Message vide ou trop long

- **WHEN** un participant envoie un message vide ou de plus de 5 000 caractères
- **THEN** l'envoi est refusé

#### Scenario: Usurpation

- **WHEN** un participant tente d'écrire un message au nom de l'autre participant
- **THEN** Firestore refuse
