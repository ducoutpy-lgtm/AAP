# qualification-sources Specification

## ADDED Requirements

### Requirement: Relecture manuelle des verdicts

L'outil SHALL lire `sources/relecture_qualification.json` (identifiant de source -> verdict relu,
motif, date, relecteur) et SHALL appliquer le verdict relu par-dessus le verdict du modèle lors du
report dans le registre et de l'écriture du rapport. Le verdict du modèle SHALL être conservé sous
`verdict_modele`, avec le motif, la date et le relecteur. Un identifiant inconnu SHALL être ignoré
avec un avertissement ; un verdict hors de la liste admise SHALL arrêter le traitement.

#### Scenario: Verdict du modèle conservé

- **WHEN** Monsieur DUCOUT ouvre `sources/registre.json` sur une source corrigée
- **THEN** le champ `qualification` contient à la fois `verdict` (relu) et `verdict_modele`
  (d'origine), avec le motif de la relecture.

#### Scenario: Identifiant inconnu ignoré

- **WHEN** le fichier de relecture contient un identifiant absent des verdicts du modèle
- **THEN** `--registre --rapport` termine normalement et signale cet identifiant sur la sortie
  d'erreur.

### Requirement: Relecture tracée dans le rapport

`QUALIFICATION.md` SHALL contenir une section « Relecture manuelle » donnant le nombre de
corrections et, pour chacune, la source, le verdict du modèle, le verdict relu, le motif et
l'adresse de la page. Les décomptes du rapport SHALL utiliser le verdict relu.

#### Scenario: Correction visible

- **WHEN** Monsieur DUCOUT lance `python qualification.py --registre --rapport` après l'ajout
  d'une source dans le fichier de relecture
- **THEN** `REGISTRE_SOURCES.md` affiche le verdict relu pour cette source, et la section
  « Relecture manuelle » de `QUALIFICATION.md` montre la ligne avec le verdict du modèle, le
  verdict relu et le motif.
