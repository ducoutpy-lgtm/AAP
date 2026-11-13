# veille-hebdomadaire Specification

## ADDED Requirements

### Requirement: Étapes payantes dans la délégation

La veille SHALL écrire le devis de chaque étape payante (extraction, contrôle, qualification) avant tout appel, SHALL ne
lancer une étape que si son devis tient dans le reste du budget de la semaine (0,50 euro, du lundi au dimanche) et si le
cumul après l'étape reste sous 4,50 euros, et SHALL lancer chaque étape avec `--plafond` égal au cumul plus le devis.

#### Scenario: Devis dans le budget

- **WHEN** la veille du lundi trouve 60 textes nouveaux pour un devis de 0,07 euro, aucune dépense dans la semaine
- **THEN** le journal `scraping/logs/veille.log` contient le devis, puis l'extraction lancée avec un plafond de 2,892
  euros (cumul 2,822 plus devis 0,07)

#### Scenario: Devis hors budget

- **WHEN** le devis d'une étape dépasse le reste du budget de la semaine
- **THEN** l'étape et les suivantes ne sont pas lancées, et le journal dit « accord de Monsieur DUCOUT demandé » avec
  le devis

### Requirement: Courriel après l'import

Le courriel hebdomadaire de l'administrateur SHALL partir après l'import, pour compter les fiches de la semaine.

#### Scenario: Bilan du lundi

- **WHEN** la veille du lundi va au bout
- **THEN** Monsieur DUCOUT reçoit le bilan, et le journal de la veille va jusqu'à la ligne des courriels
