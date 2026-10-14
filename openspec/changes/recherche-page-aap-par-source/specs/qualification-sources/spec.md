# qualification-sources Specification

## ADDED Requirements

### Requirement: Report des verdicts donnés à l'écran

L'outil SHALL reporter les verdicts du mode « pages » (`results/validation_pages.json`) dans
`sources/relecture_qualification.json`, une relecture par source retrouvée par l'adresse de sa page
gardée, avec le relecteur « Monsieur DUCOUT, validation à l'écran », la date du verdict et un motif
qui reprend son commentaire. La correspondance SHALL être : bonne page -> rubrique confirmée ; hors
champ -> hors santé ; page morte -> à vérifier ; mauvaise page avec adresse -> adresse corrigée dans
le registre et rubrique confirmée ; mauvaise page sans adresse -> à vérifier. Une relecture
antérieure SHALL être conservée sous `relecture_precedente`. Un verdict dont l'adresse ne correspond
à aucune source SHALL être signalé, pas perdu.

#### Scenario: Source exclue par le modèle, jugée bonne à l'écran

- **WHEN** Monsieur DUCOUT a cliqué « bonne page » sur la page de Bpifrance (verdict du modèle
  « hors santé ») et lance `python validation.py --appliquer-pages` puis
  `python qualification.py --registre --rapport`
- **THEN** `REGISTRE_SOURCES.md` montre Bpifrance avec la qualification « rubrique-confirmee », et
  `QUALIFICATION.md` liste la correction avec le relecteur « Monsieur DUCOUT, validation à l'écran »

#### Scenario: Mauvaise page avec adresse saisie

- **WHEN** le verdict de l'INSERM est « mauvaise page » avec le commentaire
  `https://pro.inserm.fr/rubriques/appels-a-projets/agenda-des-appels-a-projets`
- **THEN** après `--appliquer-pages`, l'entrée `inserm` du registre a cette adresse dans `url_aap`,
  l'ancienne adresse dans `notes`, et la sortie de l'outil cite `inserm` parmi les sources à
  redécouvrir

#### Scenario: Compte rendu de l'application

- **WHEN** `--appliquer-pages` se termine
- **THEN** il affiche le nombre de verdicts lus, de sources confirmées, corrigées, à retrouver,
  hors champ, et la commande de redécouverte à lancer avec la liste des identifiants

## MODIFIED Requirements

### Requirement: Relecture manuelle des verdicts

L'outil SHALL lire `sources/relecture_qualification.json` (identifiant de source -> verdict relu,
motif, date, relecteur) et SHALL appliquer le verdict relu par-dessus le verdict du modèle lors du
report dans le registre et de l'écriture du rapport. Le verdict du modèle SHALL être conservé sous
`verdict_modele`, avec le motif, la date et le relecteur. Un identifiant inconnu SHALL être ignoré
avec un avertissement ; un verdict hors de la liste admise SHALL arrêter le traitement. Une relecture
SHALL pouvoir venir d'une validation à l'écran (exigence « Report des verdicts donnés à l'écran »)
aussi bien que d'une relecture sur texte.

#### Scenario: Verdict du modèle conservé

- **WHEN** Monsieur DUCOUT ouvre `sources/registre.json` sur une source corrigée
- **THEN** le champ `qualification` contient à la fois `verdict` (relu) et `verdict_modele`
  (d'origine), avec le motif de la relecture.

#### Scenario: Identifiant inconnu ignoré

- **WHEN** le fichier de relecture contient un identifiant absent des verdicts du modèle
- **THEN** `--registre --rapport` termine normalement et signale cet identifiant sur la sortie
  d'erreur.
