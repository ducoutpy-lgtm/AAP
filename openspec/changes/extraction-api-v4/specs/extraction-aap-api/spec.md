# extraction-aap-api Specification

## ADDED Requirements

### Requirement: Devis écrit avant tout appel payant

L'outil SHALL, avec `--moteur api --dry-run`, écrire le modèle, le tarif par million de jetons, le nombre de textes
restants, le nombre de caractères, le coût estimé (trois appels par texte), le cumul déjà dépensé pour ce modèle et le
plafond, sans aucun appel au modèle ni aucune écriture.

#### Scenario: Essai à blanc

- **WHEN** la session lance `extraction_locale.py --extraire --moteur api --dry-run`
- **THEN** la sortie contient « Devis », le modèle, le coût estimé en euros et le cumul déjà dépensé, et aucune ligne
  n'est ajoutée au journal `logs/extraction_costs.jsonl`

### Requirement: Passage global par le moteur API

Après l'accord écrit de Monsieur DUCOUT, l'outil SHALL traiter les textes des rubriques confirmées avec le moteur API
par la même chaîne que le moteur local (question fermée, extraction, contrôle des formats, question du champ, consigne
4), SHALL écrire chaque fiche dans `results/extraction_api.json` avec `scrape_metadata.moteur = "api"`, le modèle, la
durée et `a_verifier = true`, SHALL reprendre là où il s'est arrêté, et SHALL s'arrêter avant l'appel qui ferait
dépasser le plafond.

#### Scenario: Fiche produite par l'API

- **WHEN** une page est acceptée par la question fermée
- **THEN** la fiche écrite porte `moteur = "api"`, `modele = "claude-haiku-5-5"`, `version_consigne = 4`, un champ parmi
  les quatre valeurs et `a_verifier = true`

#### Scenario: Reprise

- **WHEN** l'outil est relancé après un arrêt
- **THEN** les textes déjà présents dans les fiches, les refus ou les échecs ne sont pas renvoyés au modèle

#### Scenario: Plafond

- **WHEN** le cumul dépensé plus l'estimation du texte suivant dépasse le plafond donné
- **THEN** l'outil s'arrête avant cet appel et conserve les fiches déjà produites

### Requirement: La V3 reste disponible

Le moteur local SHALL rester le défaut de `extraction_locale.py` et `results/extraction_locale.json` SHALL rester
intact ; pour une même adresse présente dans les deux fichiers, l'import SHALL retenir la fiche API.

#### Scenario: Même adresse dans les deux fichiers

- **WHEN** l'import lit une fiche locale et une fiche API pour la même adresse
- **THEN** un seul document est écrit, avec `scrapeMetadata.moteur = "api"`

### Requirement: Les fiches validées par le modèle prennent les valeurs de l'API

Pour une adresse lue par les deux moteurs, la migration `scripts/reporter_valeurs_api.py` SHALL remplacer, sur une fiche
validée au nom du modèle, les champs métier qui diffèrent par ceux de la fiche API (avec les corrections de son contrôle),
SHALL laisser intactes les fiches portant un verdict humain et les brouillons hors champ, et SHALL n'écrire qu'après un
essai à blanc, une sauvegarde et l'accord de Monsieur DUCOUT.

#### Scenario: Montant lu différemment

- **WHEN** la fiche locale validée par le modèle porte un montant maximal de 21 000 et la fiche API 36 000
- **THEN** l'essai à blanc liste `budgetMax` pour cette fiche et l'exécution écrit 36 000, sans toucher aux autres champs

#### Scenario: Verdict humain

- **WHEN** la fiche porte `validation.par = Monsieur DUCOUT`
- **THEN** elle est comptée « verdict humain, conservée » et rien n'est écrit
