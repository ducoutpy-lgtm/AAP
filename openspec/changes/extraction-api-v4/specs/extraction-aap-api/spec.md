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
