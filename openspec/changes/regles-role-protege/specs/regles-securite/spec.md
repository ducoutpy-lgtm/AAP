# regles-securite Specification

## ADDED Requirements

### Requirement: Rôle administrateur protégé

Les règles Firestore SHALL refuser qu'un compte se crée ou se donne le rôle administrateur, et SHALL laisser un compte
passer de porteur à financeur ou l'inverse.

#### Scenario: Tentative d'élévation

- **WHEN** un compte porteur tente d'écrire `userType: "admin"` dans son propre document `users`
- **THEN** l'écriture est refusée (`npm run test:rules`, test « un compte ne se donne jamais le rôle administrateur »)
