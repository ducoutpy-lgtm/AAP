# financeur-vendable Specification

## Purpose

Qu'un financeur comprenne en une page pourquoi payer, et qu'un compte financeur de test tienne une démonstration
de dix minutes de bout en bout.

## Requirements

### Requirement: Page publique Financeurs

`/financeurs` SHALL présenter les bénéfices tenus par l'application, les chiffres réels du document
`statistiquesPubliques/accueil` (établissements inscrits, appels suivis, financeurs distincts, date de mise à jour) et
le tarif financeur lu dans `config/stripe.ts`, avec la mention que le paiement n'est pas ouvert. Sans document de
chiffres, la page SHALL afficher les bénéfices sans chiffres, jamais de valeurs inventées.

#### Scenario: Chiffres réels

- **WHEN** `scripts/publier_chiffres.py` a tourné puis Monsieur DUCOUT ouvre `/financeurs` sans être connecté
- **THEN** il lit le nombre d'établissements inscrits et d'appels suivis égaux aux comptes de la base, et la date du
  calcul

#### Scenario: Tarif unique

- **WHEN** le montant mensuel financeur change dans `config/stripe.ts`
- **THEN** l'accueil, `/tarifs` et `/financeurs` affichent tous le nouveau montant

### Requirement: Tableau de bord financeur réel

`/dashboard/financeur` SHALL afficher, pour le compte connecté : nombre d'appels publiés, brouillons et clos ;
candidatures reçues au total et par statut ; vues cumulées ; les cinq dernières candidatures avec lien vers
l'évaluation ; la prochaine échéance. Tous les liens SHALL mener à une route existante.

#### Scenario: Compte financeur de test

- **WHEN** financeur@test.local ouvre son tableau de bord sur les émulateurs après le semis
- **THEN** il voit 3 appels, 4 candidatures reçues réparties par statut, et chaque lien ouvre une page

### Requirement: Candidatures reçues en colonnes

`/candidatures-recues` SHALL afficher toutes les candidatures reçues sur les appels du financeur en colonnes par statut
(reçue, en examen, présélectionnée, acceptée, refusée), chaque carte menant à l'évaluation ; entrée de menu
« Candidatures reçues ».

#### Scenario: Colonnes

- **WHEN** financeur@test.local ouvre la page sur les émulateurs
- **THEN** les quatre candidatures semées apparaissent chacune dans la colonne de son statut

### Requirement: Compteur de candidatures

« Mes appels » SHALL afficher, pour chaque appel, le nombre de candidatures reçues compté depuis la collection des
candidatures (un candidat ne peut pas modifier le document de l'appel, le compteur stocké reste à zéro).

#### Scenario: Envoi

- **WHEN** candidat@test.local envoie une candidature à un appel du financeur de test
- **THEN** « Mes appels » du financeur affiche une candidature de plus pour cet appel, sans modification du document de l'appel

### Requirement: Démonstration jouable

Un scénario de dix minutes SHALL être écrit (`docs/DEMO_FINANCEUR.md`) et joué par la session sur les émulateurs :
connexion financeur, tableau de bord, publication d'un appel en cinq étapes, candidatures en colonnes, évaluation,
statistiques, page publique.

#### Scenario: Démonstration

- **WHEN** Monsieur DUCOUT suit le scénario avec le compte financeur de test
- **THEN** aucune étape ne tombe sur une page vide ou introuvable
