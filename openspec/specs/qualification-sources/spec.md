# qualification-sources Specification

## Purpose
Dire, source par source et de façon vérifiée, si la rubrique trouvée par le robot de découverte
liste réellement des appels à projets, sous quelle forme et pour quel domaine, avant toute
extraction.

## Requirements

### Requirement: Verdict par source à partir de la page gardée

Pour chaque source dont la découverte a enregistré une rubrique, l'outil SHALL lire le texte de la
page gardée en local, interroger le modèle local Ollama avec un schéma JSON imposé, et SHALL
enregistrer un verdict parmi `rubrique-confirmee`, `pdf-seulement`, `hors-sante`, `pas-d-aap`,
accompagné de la justification du modèle. Une réponse invalide SHALL donner le verdict
`a-verifier` sans arrêter le traitement.

#### Scenario: Verdicts produits

- **WHEN** Monsieur DUCOUT lance `python qualification.py --qualifier`
- **THEN** le terminal affiche une ligne par source avec son verdict, et
  `decouverte/qualification.json` contient un verdict par source traitée.

### Requirement: Verdict reporté dans le registre

L'outil SHALL écrire le verdict dans le champ `qualification` de chaque source du registre, avec
la date, sans modifier les autres champs ; les sources sans rubrique gardée SHALL recevoir
`a-verifier`.

#### Scenario: Registre enrichi

- **WHEN** la qualification est terminée et `python registre.py --verifier-format` est lancé
- **THEN** aucune erreur de format n'est signalée et `REGISTRE_SOURCES.md` affiche une colonne
  « Qualification » pour chaque source.

### Requirement: Sondage manuel du modèle local

Au moins 30 verdicts, répartis entre les familles, SHALL être relus par la session (ou Monsieur
DUCOUT) sur la page d'origine, et l'accord ou le désaccord SHALL être noté dans
`decouverte/sondage_qualification.json`.

#### Scenario: Taux d'accord connu

- **WHEN** Monsieur DUCOUT ouvre `QUALIFICATION.md`
- **THEN** il lit le nombre de verdicts sondés, le nombre d'accords, et la liste des désaccords
  avec l'adresse de la page pour vérifier lui-même.

### Requirement: Rapport de qualification

`python qualification.py --rapport` SHALL écrire `QUALIFICATION.md` avec le décompte des verdicts
par famille, la liste des sources confirmées (nom, adresse de la rubrique, forme), et la liste des
sources `a-verifier` avec leur raison.

#### Scenario: Rapport lisible

- **WHEN** Monsieur DUCOUT ouvre `QUALIFICATION.md`
- **THEN** il voit en une phrase combien de sources publient réellement des appels à projets
  vérifiés, et peut cliquer sur chaque rubrique confirmée.
