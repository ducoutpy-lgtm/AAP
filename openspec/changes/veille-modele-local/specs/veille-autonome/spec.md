# Spec : veille autonome

## MODIFIED Requirements

### Requirement: Moteur de la veille

La veille du lundi MUST extraire, contrôler et qualifier les pages web nouvelles avec le modèle local, sans appel
payant, sauf si elle est lancée avec `--moteur api`.

#### Scenario: veille sur secteur
- **WHEN** la veille du lundi tourne sur secteur et trouve des pages nouvelles
- **THEN** le journal `scraping/logs/veille.log` montre les étapes avec `qwen3:8b`, aucune ligne de devis ni de dépense,
  et les fiches arrivent dans `/admin/aaps` en « à valider » ou publiées par le tri

#### Scenario: veille sur batterie
- **WHEN** la veille démarre sur batterie
- **THEN** le journal dit que les étapes du modèle local sont reportées, la collecte et les courriels se font quand
  même, et la veille suivante sur secteur traite les textes restés en attente

#### Scenario: API sur demande
- **WHEN** Monsieur DUCOUT demande la veille par l'API
- **THEN** `python veille_payante.py --reel --moteur api` reprend les devis et plafonds de la délégation
