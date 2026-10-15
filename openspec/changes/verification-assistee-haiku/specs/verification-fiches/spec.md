# verification-fiches Specification

## ADDED Requirements

### Requirement: Contrôle de chaque fiche publiable par le modèle

L'outil SHALL soumettre au modèle chaque fiche dans le champ (santé, médico-social, incertain) et encore ouverte, avec
le texte de sa page, et SHALL enregistrer un verdict par champ parmi juste, faux, fabriqué, manquant, vide, incertain,
la valeur lue sur la page quand elle existe, et la liste des champs douteux (faux, fabriqué, manquant), après un essai à
blanc qui écrit le modèle, le tarif et le coût estimé.

#### Scenario: Fiche contredite par la page

- **WHEN** la fiche donne une date de clôture au 15 octobre et la page dit 30 novembre
- **THEN** le champ `date_cloture` reçoit le verdict « faux » avec la correction `2026-11-30` et figure dans `douteux`

#### Scenario: Réponse incomplète du modèle

- **WHEN** le modèle omet un champ ou répond une valeur hors liste
- **THEN** ce champ reçoit le verdict « incertain » et n'est pas compté douteux

### Requirement: Les fiches douteuses se relisent en premier

L'outil de validation SHALL présenter d'abord les fiches dont le contrôle signale des champs douteux, les plus
douteuses en tête, SHALL afficher ces champs avec la valeur lue sur la page, et SHALL rappeler que ce contrôle ne
remplace pas le verdict humain.

#### Scenario: Ouverture de la validation après le contrôle

- **WHEN** Monsieur DUCOUT ouvre la validation des fiches
- **THEN** la première fiche présentée est une fiche douteuse, avec la liste de ses champs douteux et les valeurs lues
  sur la page ; une fiche sans doute affiche « aucun doute »

### Requirement: Le contrôle ne vaut pas relecture

L'import SHALL reporter seulement un résumé du contrôle (modèle, date, champs douteux) dans `scrapeMetadata` et SHALL
laisser `validation.statut`, l'étiquette « à vérifier » et la publication inchangés.

#### Scenario: Fiche contrôlée sans doute

- **WHEN** une fiche contrôlée sans aucun champ douteux est importée
- **THEN** elle garde `validation.statut = proposee` et l'étiquette `a-verifier`, et porte `scrapeMetadata.verification.douteux = []`
