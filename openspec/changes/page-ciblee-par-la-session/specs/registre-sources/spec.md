# registre-sources Specification

## ADDED Requirements

### Requirement: Page ciblée par une session, distincte de l'adresse validée

Une source du registre MAY porter `page_ciblee`, `ciblee_par` et `ciblee_le` : page d'appels trouvée par une session,
en attente de la confirmation de Monsieur DUCOUT. Une session SHALL écrire une page qu'elle a trouvée dans `page_ciblee`,
jamais dans `url_validee`.

#### Scenario: Adresses validées réservées à Monsieur DUCOUT

- **WHEN** il cherche dans `scraping/sources/registre.json` les sources dont `validee_par` mentionne « lot B1 »
- **THEN** il n'en trouve aucune ; les 47 pages du lot B1 sont dans `page_ciblee`, avec « lot B1 » dans `ciblee_par`

#### Scenario: Sources non lues remises à vérifier

- **WHEN** il regarde la qualification des sources Landes, Oise et Seine-Saint-Denis de la famille des conférences
- **THEN** leur verdict est « a-verifier », avec un motif qui dit que la page n'a pas été lue par la session

### Requirement: Adresse de travail et contrôle de format avec une page ciblée

L'adresse de travail (`registre.adresse_aap`) SHALL être `url_validee`, sinon `page_ciblee`, sinon `url_aap`. Le
contrôle de format SHALL refuser une `page_ciblee` qui n'est pas une adresse http, et SHALL accepter `page_appel: true`
avec `url_validee` ou avec `page_ciblee`.

#### Scenario: Registre valide après la migration du lot B1

- **WHEN** Monsieur DUCOUT lance `python scraping/registre.py --verifier-format`
- **THEN** l'outil affiche « Registre valide : 1269 sources » sans erreur, y compris pour les six sources à page d'appel
  de la famille des conférences des financeurs (Aisne, Ardèche, Dordogne, Paris, Var, Vendée)

#### Scenario: Même page affichée dans la vue lisible

- **WHEN** il ouvre `scraping/REGISTRE_SOURCES.md` à la ligne de la conférence des financeurs de la Dordogne
- **THEN** le lien « page » mène à la même page qu'avant la migration

### Requirement: Confirmation à l'écran d'une page ciblée

Quand Monsieur DUCOUT juge « bonne page » la page d'une source qui porte `page_ciblee`, le report des verdicts
(`validation.py --appliquer-pages`) SHALL inscrire cette page dans `url_validee` à son nom et à la date du verdict, et
SHALL retirer `page_ciblee`, `ciblee_par` et `ciblee_le`. Une adresse qu'il donne pour une mauvaise page SHALL, de même,
remplacer la page ciblée.

#### Scenario: Page ciblée confirmée

- **WHEN** Monsieur DUCOUT marque « bonne page » la page de la conférence de la Dordogne dans la validation des pages,
  puis lance `python scraping/validation.py --appliquer-pages`
- **THEN** la source porte `url_validee` égale à cette page, `validee_par` à son nom, et n'a plus de `page_ciblee`

#### Scenario: Page ciblée corrigée

- **WHEN** il marque « mauvaise page » une source à page ciblée en donnant une autre adresse, puis lance
  `--appliquer-pages`
- **THEN** la source porte `url_validee` égale à l'adresse donnée, n'a plus de `page_ciblee`, et ses notes gardent
  l'ancienne page
