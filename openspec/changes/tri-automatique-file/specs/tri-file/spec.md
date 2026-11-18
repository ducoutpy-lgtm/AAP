# Spec : tri automatique de la file « à valider »

## ADDED Requirements

### Requirement: Seules les fiches douteuses restent dans la file

#### Scenario: fiche sûre
- **WHEN** une fiche « Proposée » a été contrôlée comme un appel, sans doute hors description, dans le champ santé ou
  médico-social, non close et sans doublon
- **THEN** `trier_file.py --reel` la publie avec la validation « validee » par « contrôle du modèle (tri automatique) »

#### Scenario: fiche douteuse
- **WHEN** une fiche « Proposée » a au moins un motif de doute
- **THEN** elle reste « Proposée » et ses motifs sont écrits dans `validation.commentaire` et visibles dans `/admin/aaps`

#### Scenario: fiche relue
- **WHEN** une fiche est relue par Monsieur DUCOUT
- **THEN** le tri ne la modifie jamais

### Requirement: Doublons

#### Scenario: même appel, une date manquante
- **WHEN** deux fiches portent « Fondation Béatrice Denys », les années 2026-2027, l'une sans date de clôture
- **THEN** elles forment un groupe ; la fiche gardée est celle de `doublons.a_garder`, l'autre est rejetée

#### Scenario: même financeur, autre appel
- **WHEN** deux fiches de la Fondation de France de 2026, l'une sans date, ont des titres sans mots distinctifs en
  commun suffisants
- **THEN** elles restent séparées
