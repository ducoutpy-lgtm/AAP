# suivi-couts-externes Specification

## Purpose

Que l'administrateur voie chaque appel à un service externe payant, ce qu'il a coûté et ce qu'il a rapporté en
appels qualifiés. Vérifiable par Monsieur DUCOUT sur `/admin/couts-ia`.

## Requirements

### Requirement: Journal unifié

`coutsIa` SHALL contenir une ligne par appel externe : `le` (date), `source` (`application` ou `collecte`), `etape`
(extraction, est_aap, champ, verification, qualification, preremplirCandidature...), `modele`, `fournisseur`
(`anthropic`), `origine` (source ou compte), `cible` (adresse ou appel), `tokensEntree`, `tokensSortie`,
`tokensCacheLus`, `coutEuros`. `scripts/publier_couts.py` SHALL recopier le journal de la chaîne de collecte sans
doublon, relançable.

#### Scenario: Recopie idempotente

- WHEN la session lance `publier_couts.py` deux fois de suite
- THEN la seconde exécution ne crée aucun document et le nombre de documents égale le nombre de lignes du journal.

### Requirement: Page Appels externes

`/admin/couts-ia` SHALL afficher : cumul total et cumul du mois face au plafond de 5 euros, nombre d'appels, coût
par étape et par modèle, coût par appel qualifié (cumul divisé par le nombre de fiches publiées et validées), une
courbe par semaine, et la table des 200 derniers appels (date, étape, modèle, origine, cible, tokens, coût) filtrable
par étape et par modèle.

#### Scenario: Après la qualification du 20 octobre

- WHEN l'administrateur ouvre la page
- THEN il lit un cumul proche de 2,2 euros pour `claude-haiku-5-5`, l'étape « qualification » à 0,09 euro environ,
  et la ligne de lecture du dossier de test si l'essai a eu lieu.

### Requirement: Logique testée

Les agrégations (par étape, par modèle, par semaine, cumul du mois, coût par fiche) SHALL être des fonctions testées
par Vitest ; la conversion d'une ligne du journal en document SHALL être testée par pytest.
