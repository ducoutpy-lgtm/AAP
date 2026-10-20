# qualification-appels Specification

## Purpose

Que chaque appel visible dise à qui il s'adresse, son type, ce qu'il finance, quand il ouvre et quelles pièces il
attend, et que le candidat puisse filtrer dessus. Vérifiable par Monsieur DUCOUT sur vingt fiches tirées au sort.

## Requirements

### Requirement: Qualification à choix fermés

`scraping/qualifier_fiches.py --qualifier` SHALL, pour chaque fiche publiable non encore qualifiée, écrire dans
`scrape_metadata.qualification` : `destinataires` (sous-ensemble de public, prive-non-lucratif, prive-lucratif,
collectivites, recherche, tous), `type_appel` (appel-a-projets, appel-a-candidatures, ami, subvention, prix, mecenat,
autre), `objets` (liste fermée), `date_ouverture` (AAAA-MM-JJ ou null), `pieces_attendues`, `champ`, `raison`, le modèle
et la date. Toute valeur hors liste SHALL être écartée. Un même appel présent dans le passage local et dans le passage
API SHALL n'être qualifié qu'une fois.

#### Scenario: Essai à blanc

- WHEN la session lance `--qualifier --dry-run`
- THEN le nombre de fiches et le coût estimé s'affichent, rien n'est écrit ni appelé, et le coût est écrit dans
  `tasks.md` avant toute exécution réelle.

### Requirement: Import de la qualification

L'import SHALL écrire sur le document `qualification` = {destinataires, typeAppel, objets, dateOuverture, par, le},
`startDate` depuis `date_ouverture` quand elle existe, `requiredDocuments` depuis `pieces_attendues` quand la fiche
n'en avait pas ; une fiche que la qualification classe hors champ, sans verdict humain, SHALL passer en brouillon à
corriger. Une qualification écrite dans l'application au nom de Monsieur DUCOUT SHALL être conservée par l'import.

#### Scenario: Test de l'import

- WHEN la session lance les tests de `scripts/tests`
- THEN un test montre le bloc `qualification`, `startDate`, le passage en brouillon pour hors champ, et la
  conservation d'une qualification humaine.

### Requirement: Filtres et fiche

`/aap/search` SHALL proposer les filtres « À qui s'adresse » et « Type d'appel » (étiquettes, adresse partageable) ;
un appel « tous » SHALL répondre à tout destinataire choisi. La fiche SHALL montrer les destinataires en clair dans
« À qui s'adresse cet appel », le type d'appel, les objets financés et la date d'ouverture quand elle existe.

#### Scenario: Filtre établissement public

- WHEN le candidat choisit « Établissements publics »
- THEN seules les fiches dont les destinataires contiennent public ou tous restent, et l'étiquette « Établissements
  publics » apparaît.

### Requirement: Correction en administration

`/admin/aaps` SHALL proposer « Qualifier » sur chaque fiche : destinataires (cases), type d'appel, objets (cases),
date d'ouverture ; « Enregistrer » SHALL écrire `qualification` au nom de Monsieur DUCOUT.

#### Scenario: Correction d'un destinataire

- WHEN l'administrateur coche « Privé non lucratif » et enregistre
- THEN la fiche montre « Privé non lucratif » dans « À qui s'adresse cet appel » et le filtre la retrouve.

### Requirement: Vérification humaine

Sur vingt fiches tirées au sort, Monsieur DUCOUT SHALL confirmer les destinataires d'au moins dix-huit.
