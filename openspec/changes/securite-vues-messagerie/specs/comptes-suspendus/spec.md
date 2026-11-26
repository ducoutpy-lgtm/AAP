## ADDED Requirements

### Requirement: La suspension laisse une fiche que le compte ne peut pas effacer

Suspendre un compte depuis l'administration SHALL écrire deux fiches, `suspensions/{uid}` et
`suspensions/email:<adresse de connexion en minuscules>` (une règle ne lit un document que par son chemin). Seul
l'administrateur SHALL pouvoir lire, écrire ou effacer ces fiches. Rétablir le compte SHALL les effacer, y compris pour
un compte qui a supprimé son document `users` (section « Comptes suspendus sans document » de l'administration).

#### Scenario: Fiche de suspension protégée

- **WHEN** le compte suspendu tente de lire ou d'effacer sa fiche de suspension
- **THEN** Firestore refuse

#### Scenario: Compte rétabli

- **WHEN** l'administrateur rétablit le compte
- **THEN** la fiche de suspension est effacée et le compte peut de nouveau créer son document

### Requirement: Un compte suspendu ne recrée pas son compte en essai

La création d'un document `users` SHALL être refusée quand une fiche de suspension existe pour l'identifiant du compte
ou pour son adresse de connexion, et SHALL exiger que le champ `email` du document soit l'adresse de connexion. La suppression de son compte par un compte non suspendu SHALL continuer de
fonctionner.

#### Scenario: Compte suspendu qui supprime puis recrée son document

- **WHEN** l'administrateur suspend un candidat, puis le candidat supprime son document `users` et le recrée en essai
- **THEN** Firestore refuse la création

#### Scenario: Nouvel identifiant, même adresse

- **WHEN** la personne suspendue crée un nouveau compte avec la même adresse de connexion
- **THEN** Firestore refuse la création de son document `users`
