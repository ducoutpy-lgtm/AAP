# filtre-champ-sante Specification

## ADDED Requirements

### Requirement: Définition écrite du champ

Le projet SHALL disposer d'une définition écrite du champ en trois réponses (`sante`, `medico-social`,
`hors-champ`) plus `incertain`, décidée par Monsieur DUCOUT le 2026-10-14 (santé et médico-social des
établissements, y compris numérique, cybersécurité et rénovation des hôpitaux et cliniques ; pas de volet social :
ni insertion par l'emploi, ni jeunesse, ni logement), reprise mot pour mot dans la consigne des modèles et dans
`scraping/CHAMP.md`.

#### Scenario: Même définition partout

- **WHEN** Monsieur DUCOUT lit `CHAMP.md` et la consigne dans `echantillon.py`
- **THEN** il retrouve la même liste, avec les mêmes exemples, et la version de consigne 4

### Requirement: Question fermée sur le champ dans la chaîne d'extraction

Après l'acceptation d'une page, la chaîne SHALL poser la question du champ au texte de la page, pour le moteur
local comme pour le moteur API, et SHALL enregistrer `champ`, `champ_raison`, `champ_modele`, `champ_le` et
`champ_source` dans `scrape_metadata`, sans modifier le schéma `AapNormalized`.

#### Scenario: Fiche produite avec son champ

- **WHEN** une page est acceptée puis extraite par l'un des deux moteurs
- **THEN** la fiche porte un champ parmi les quatre valeurs et une raison en une phrase, et `version_consigne` vaut 4

#### Scenario: Page refusée

- **WHEN** une page est refusée à la question « est-ce un appel ? »
- **THEN** aucune question de champ n'est posée et aucun appel n'est facturé pour elle

### Requirement: Classification rétroactive des fiches existantes

`scraping/champ.py --classer` SHALL poser la question du champ aux fiches des fichiers de résultats lus par
l'import qui n'en ont pas encore, SHALL sauvegarder le fichier avant écriture, SHALL reprendre sans refaire les
fiches déjà classées, et SHALL afficher en essai à blanc le nombre de fiches et le coût estimé sans rien écrire.

#### Scenario: Essai à blanc

- **WHEN** `champ.py --classer --dry-run` est lancé
- **THEN** l'écran affiche le nombre de fiches à classer par fichier et le coût estimé pour le modèle donné, et
  aucun fichier ni journal ne change

#### Scenario: Classification réelle

- **WHEN** l'accord est donné et `champ.py --classer --moteur api --modele claude-haiku-5-5` est lancé
- **THEN** chaque fiche reçoit son champ et sa raison, une copie du fichier d'origine existe dans
  `scripts/sauvegardes/`, et le coût réel est lu dans le journal

### Requirement: Évaluation sur les pages de la comparaison

`champ.py --evaluer` SHALL comparer, pour chaque modèle, le champ obtenu sur les pages de la comparaison jugées
« appel » par Monsieur DUCOUT au commentaire « hors champ » de ses verdicts, et SHALL afficher le taux d'accord.

#### Scenario: Taux d'accord par modèle

- **WHEN** les 50 pages sont jugées et `champ.py --evaluer` est lancé
- **THEN** l'écran affiche, par modèle, le nombre de pages d'accord sur le nombre de pages jugées « appel », et les
  désaccords avec la raison du modèle

### Requirement: Verdict « hors champ » dans la validation quotidienne

Le mode fiches de `validation.py` SHALL offrir un verdict « hors champ » (touche 7), enregistré dans
`sources/verdicts_fiches.json` comme les autres verdicts.

#### Scenario: Écarter une fiche hors champ

- **WHEN** Monsieur DUCOUT appuie sur 7 devant une fiche d'un appel agricole
- **THEN** le verdict `hors-champ` est écrit avec la date, et la fiche suivante s'affiche

### Requirement: Rapport par source

`champ.py --rapport` SHALL écrire `scraping/CHAMP.md` avec la répartition des réponses, la part de fiches dans le
champ par source et la liste des sources ayant au moins cinq fiches et moins de 20 % dans le champ, avec leur
périmètre et leurs notes du registre, sans modifier le registre.

#### Scenario: Sources à revoir

- **WHEN** la classification est faite et `champ.py --rapport` est lancé
- **THEN** `CHAMP.md` liste les sources à revoir, et le registre est inchangé (`git diff` vide sur
  `sources/registre.json`)
