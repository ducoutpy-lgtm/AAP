# mise-en-ligne-testeurs Specification

## Purpose

Que trois testeurs puissent utiliser l'application en ligne et que leurs retours arrivent dans l'administration.

## Requirements

### Requirement: Formulaire de retour

`/retour` SHALL permettre à tout compte connecté d'envoyer un retour : type (anomalie, idée, incompréhension,
autre), page concernée (pré-remplie avec la page d'où l'on vient quand elle est connue), message d'au moins dix
caractères. Le retour SHALL être écrit dans `retours` avec l'identifiant et le rôle de l'auteur, son adresse, la date ;
seul l'auteur peut le créer, seul l'administrateur peut le lire, personne ne le modifie.

#### Scenario: Envoi d'un retour

- **WHEN** candidat@test.local ouvre `/retour` depuis une fiche, choisit « Anomalie » et écrit « La date de clôture manque sur cette fiche »
- **THEN** un message confirme l'envoi et le retour apparaît en tête de `/admin/testeurs` avec son compte, le type et la page

#### Scenario: Message trop court

- **WHEN** le message fait moins de dix caractères
- **THEN** le formulaire refuse l'envoi et le dit, rien n'est écrit

### Requirement: Retours dans l'administration

`/admin/testeurs` SHALL afficher en tête les retours reçus, les plus récents d'abord (date, compte, rôle, type, page,
message), ou « Aucun retour » s'il n'y en a pas.

#### Scenario: Lecture par l'administrateur

- **WHEN** admin@test.local ouvre `/admin/testeurs` après l'envoi du scénario précédent
- **THEN** il lit le retour et le compte qui l'a envoyé

### Requirement: Procédure de mise en ligne

`docs/MISE_EN_LIGNE.md` SHALL décrire, dans l'ordre, ce qu'il faut vérifier avant (champs d'entreprise des pages
légales, règles Firestore, variables de production), les commandes de construction et de déploiement sur Firebase
Hosting, les contrôles après mise en ligne, et le modèle d'invitation des testeurs.

#### Scenario: Déploiement rejoué

- **WHEN** Monsieur DUCOUT suit la procédure depuis `app`
- **THEN** l'adresse publique affiche l'accueil, la recherche sans compte et la page Financeurs avec les chiffres, et le
  premier retour envoyé depuis un compte invité apparaît dans `/admin/testeurs`
