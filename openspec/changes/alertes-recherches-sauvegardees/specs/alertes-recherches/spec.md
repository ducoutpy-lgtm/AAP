# Spec : alertes des recherches sauvegardées

## ADDED Requirements

### Requirement: Une recherche sauvegardée rouvre les mêmes résultats

Une recherche sauvegardée MUST garder les filtres de `/aap/search` sous la forme de son adresse (`params`), et
« Lancer » MUST ouvrir `/aap/search?<params>`.

#### Scenario: enregistrer puis relancer
- **WHEN** un candidat connecté choisit Territoire « Île-de-France » et Thématique « Médico-social » sur `/aap/search`
  puis clique « Enregistrer cette recherche »
- **THEN** un document `savedSearches` est créé avec `params` = `thematique=medico-social&territory=ile-de-france`,
  `alertEnabled` vrai et `frequency` « weekly » ; sur `/recherches-sauvegardees`, « Lancer » ouvre `/aap/search` avec
  ces deux filtres et le même nombre d'appels

#### Scenario: aucun filtre
- **WHEN** aucun filtre n'est choisi
- **THEN** le bouton « Enregistrer cette recherche » n'est pas proposé

#### Scenario: ancienne recherche d'avril
- **WHEN** une recherche porte l'ancien champ `filters` (`keywords`, `sectors`, `territories`, `budgetMin`)
- **THEN** elle s'affiche avec `q` et `budgetMin` repris, et la mention « critères non repris : » suivie des secteurs et
  régions d'avril

### Requirement: Même filtrage dans l'application et dans le courriel

Le filtrage MUST être une fonction pure `filtrerAppels` dans `app/src/utils/recherche.ts`, utilisée par
`SearchAapPage.tsx`, et sa copie Python dans `scraping/alertes.py` MUST donner le même résultat sur les cas de
`app/src/utils/cas_filtres_recherche.json`.

#### Scenario: cas communs
- **WHEN** `npm test` et `pytest` rejouent chaque cas du fichier commun
- **THEN** les deux donnent la liste attendue d'identifiants, dans le même ordre

### Requirement: Alerte hebdomadaire par recherche

Le courriel du lundi d'un candidat MUST contenir une section par recherche dont l'alerte est active, avec les appels
visibles publiés depuis le dernier envoi qui passent ses filtres ; une recherche dont l'alerte est arrêtée MUST être
ignorée.

#### Scenario: alerte active
- **WHEN** un candidat a une recherche « IDF médico-social » active et deux appels nouveaux y correspondent
- **THEN** son courriel contient « Votre recherche « IDF médico-social » : 2 nouveaux appels », leurs titres et le lien
  `/aap/search?thematique=medico-social&territory=ile-de-france`

#### Scenario: alerte arrêtée
- **WHEN** la même recherche a `alertEnabled` faux
- **THEN** le courriel ne contient pas cette section

#### Scenario: fréquence affichée
- **WHEN** le candidat ouvre `/recherches-sauvegardees`
- **THEN** l'écran dit « Alerte chaque lundi » et ne propose ni « temps réel » ni « quotidien »
