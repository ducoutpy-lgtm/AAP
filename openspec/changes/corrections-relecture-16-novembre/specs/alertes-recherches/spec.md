# Spec : alertes des recherches sauvegardées (corrections)

## ADDED Requirements

### Requirement: Montant mal formé

Un montant non numérique dans une recherche MUST être lu comme `parseFloat` le lit, dans l'application et dans le
courriel, sans erreur.

#### Scenario: montant en texte
- **WHEN** une recherche porte `budgetMin=abc`
- **THEN** l'application et le courriel gardent les seules fiches sans montant, et l'envoi continue

### Requirement: Propriétaire figé

Une mise à jour d'une recherche sauvegardée, d'un favori ou d'une notification MUST garder le même `userId`.

#### Scenario: réattribution
- **WHEN** porteur1 met à jour sa recherche avec `userId` = porteur2
- **THEN** l'émulateur refuse ; la même mise à jour sans changer `userId` réussit

### Requirement: Un candidat en erreur n'arrête pas l'envoi

#### Scenario: donnée imprévue
- **WHEN** la composition du courriel d'un candidat lève une erreur
- **THEN** l'erreur est écrite dans le journal et les candidats suivants reçoivent leur courriel
