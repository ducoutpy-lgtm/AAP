# validation-manuelle-aap Specification

## ADDED Requirements

### Requirement: Validation des pages gardées par la découverte

`python scraping/validation.py --pages --port <port>` SHALL servir, sur `http://localhost:<port>`,
une page qui présente une à une les pages gardées par la découverte pour les sources dont la
qualification est « rubrique confirmée », avec le nom de l'organisme, la famille, le nombre de
liens d'AAP repérés, le texte de la page lu par le serveur, et trois verdicts : « bonne page »,
« mauvaise page » (la bonne adresse saisie dans le champ), « page morte ou sans appel ».

#### Scenario: Première page présentée

- **WHEN** Monsieur DUCOUT double-clique sur le raccourci « Validation des pages des sources »
- **THEN** son navigateur affiche « Fiche 1 sur 155 », l'organisme « Fondation de France », et les boutons 1 « C'est la page des appels de cet organisme », 2 « Pas la bonne page », 3 « Page morte, ou sans appel à projets », 4 « Passer »

#### Scenario: Mauvaise page avec la bonne adresse

- **WHEN** il saisit une adresse dans le champ puis clique sur le bouton 2
- **THEN** `scraping/results/validation_pages.json` contient, sous l'adresse de la page jugée, le verdict `mauvaise-page`, l'adresse saisie en commentaire et la date, et l'outil passe à la page suivante

### Requirement: Validation des liens repérés

`python scraping/validation.py --liens [--source <id>]` SHALL présenter les liens repérés sur les
pages des rubriques confirmées, un par adresse, triés par score décroissant dans chaque source, en
écartant les liens cassés (adresse contenant des crochets ou des accolades, intitulé contenant un
dièse). Les verdicts SHALL être « appel à projets », « appel douteux », « pas un appel », « passer »,
« page qui recense des appels », « appel permanent sans sujet ni montant ».

#### Scenario: Six verdicts proposés

- **WHEN** Monsieur DUCOUT ouvre l'outil en mode liens
- **THEN** la page montre six boutons numérotés de 1 à 6, dont « 5. Page qui recense des AAP » et « 6. On peut candidater, sans sujet ni montant précis »

#### Scenario: Lien cassé écarté

- **WHEN** la page de la Fondation APICIL contient le lien d'intitulé « [#DSR_FORM_URL_TEXT#] »
- **THEN** ce lien n'est jamais présenté

### Requirement: Échantillon réparti entre les sources

Avec `--echantillon N`, l'outil SHALL retenir N liens en prenant un lien par source à tour de rôle,
meilleur score d'abord, l'ordre des sources étant tiré au sort avec une graine fixe pour que la
liste soit la même à chaque lancement.

#### Scenario: Échantillon réparti

- **WHEN** Monsieur DUCOUT double-clique sur le raccourci « Validation manuelle des AAP » (échantillon de 60)
- **THEN** la page affiche « Fiche n sur 60 » et les 60 liens viennent de 60 sources différentes

### Requirement: Affichage de la page officielle et texte de secours

Pour chaque élément, l'outil SHALL ouvrir la page officielle dans une fenêtre séparée du navigateur,
toujours la même, ou dans un cadre si Monsieur DUCOUT décoche l'option (choix mémorisé par le
navigateur) ; SHALL afficher le texte visible de la page lu par le serveur ; et SHALL n'accepter de
lire que les adresses de la liste en cours.

#### Scenario: Fenêtre séparée

- **WHEN** l'option « Pages dans une fenêtre séparée » est cochée et qu'un verdict est donné
- **THEN** la fenêtre séparée affiche la page officielle de l'élément suivant, sans ouvrir de fenêtre supplémentaire

#### Scenario: Site qui refuse le cadre

- **WHEN** l'option est décochée et que le site interdit l'affichage dans un cadre
- **THEN** le cadre reste vide mais le texte de la page, lu par le serveur, est affiché à droite

### Requirement: Verdicts tracés et reprise

Chaque verdict SHALL être écrit immédiatement dans le fichier du mode (`results/validation_pages.json`,
`results/validation_liens.json` ou `results/validation_manuelle.json`), sous la clé de l'adresse,
avec le commentaire et la date ; la touche Entrée dans le champ de commentaire SHALL enregistrer le
commentaire sur l'élément affiché sans changer d'élément ; une relance SHALL reprendre au premier
élément sans verdict en conservant les verdicts précédents.

#### Scenario: Commentaire par Entrée

- **WHEN** Monsieur DUCOUT tape un commentaire puis Entrée
- **THEN** le commentaire apparaît sous « Verdict enregistré » pour le même élément, et l'élément affiché ne change pas

#### Scenario: Reprise

- **WHEN** le serveur est arrêté puis relancé par le raccourci
- **THEN** la barre indique le nombre de verdicts déjà enregistrés et l'outil se place sur le premier élément non jugé

### Requirement: Relecture des sources exclues par la qualification

Avec `--pages --verdicts <liste>`, l'outil SHALL présenter les pages gardées des sources dont le
verdict de qualification est dans la liste (par exemple `hors-sante,a-verifier,pas-d-aap,pdf-seulement`),
SHALL afficher pour chacune le verdict actuel et son motif (motif de la relecture manuelle s'il
existe, sinon justification du modèle), SHALL ignorer les sources sans page gardée en indiquant leur
nombre, et SHALL offrir un cinquième verdict « des appels, mais jamais santé ni médico-social ».

#### Scenario: Sources exclues présentées avec leur motif

- **WHEN** Monsieur DUCOUT double-clique sur le raccourci « Validation des sources exclues »
- **THEN** la page affiche « Fiche 1 sur 115 », la ligne « Verdict actuel » avec le verdict et le motif de l'exclusion, et cinq boutons dont « 5. Des appels, mais jamais santé ni médico-social »

#### Scenario: Bpifrance

- **WHEN** la page de Bpifrance « nos appels à projets et concours » est présentée
- **THEN** la ligne « Motif » montre « industrie, clusters Eureka, espace de données », et le bouton 1 enregistre le verdict `bonne-page` dans `results/validation_pages.json`
