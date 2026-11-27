## ADDED Requirements

### Requirement: Recopie sans relire la base

`scripts/publier_couts.py` SHALL tenir sur le PC la liste des identifiants déjà recopiés dans `coutsIa`
(`scraping/logs/couts_publies.txt`) et, quand elle existe, n'écrire que les lignes absentes de la liste, sans aucune
lecture de Firestore. Sans liste, ou avec `--relire-base`, il SHALL relire une fois les identifiants « collecte » de la
base, puis écrire la liste. La liste SHALL n'être mise à jour qu'après une écriture réussie, jamais à l'essai à blanc.

#### Scenario: Liste présente

- **WHEN** la veille lance `publier_couts.py` et que la liste existe
- **THEN** le script ne lit aucun document de Firestore, écrit seulement les lignes nouvelles et les ajoute à la liste

#### Scenario: Premier passage

- **WHEN** la liste n'existe pas, ou que la session passe `--relire-base`
- **THEN** le script relit les identifiants de la base une fois, écrit les lignes absentes et crée la liste

#### Scenario: Essai à blanc

- **WHEN** la session lance `publier_couts.py --dry-run`
- **THEN** rien n'est écrit, ni dans Firestore ni dans la liste
