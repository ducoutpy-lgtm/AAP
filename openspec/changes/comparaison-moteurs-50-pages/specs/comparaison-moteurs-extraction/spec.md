# comparaison-moteurs-extraction Specification

## ADDED Requirements

### Requirement: Tirage reproductible de 50 pages

L'outil de comparaison SHALL tirer 50 adresses parmi les textes collectés que le modèle local n'a jamais traités
(ni fiche, ni refus, ni échec du passage global) et qui ne font pas partie de l'échantillon, avec une graine fixe
et une répartition par famille au prorata, et SHALL les écrire dans `sources/comparaison_pages.json` avec, pour
chacune, la source, la famille et le fichier texte.

#### Scenario: Même liste à chaque exécution

- **WHEN** `comparaison.py --tirer` est lancé deux fois avant tout traitement
- **THEN** le fichier contient les mêmes 50 adresses dans le même ordre, et l'écran affiche la répartition par
  famille

#### Scenario: Pages jamais traitées

- **WHEN** la liste est tirée
- **THEN** chacune des 50 adresses a un fichier texte dans `decouverte/` et n'apparaît ni dans les fiches, ni dans
  les refus, ni dans les échecs du passage local, ni dans les 45 adresses de l'échantillon

### Requirement: Extraction locale sur les mêmes textes

L'outil SHALL soumettre les 50 textes au modèle local par la chaîne existante du passage global (question fermée,
extraction, contrôle des formats), SHALL écrire les fiches dans `results/comparaison_ollama_<modele>.json` et les
refus dans le fichier `_non_aap`, et SHALL reprendre sans refaire les textes déjà traités.

#### Scenario: Les 50 textes par le modèle local

- **WHEN** `comparaison.py --extraire-local --modele qwen3:8b` est lancé
- **THEN** l'écran affiche l'avancement texte par texte, les fichiers de sortie se remplissent au fil de l'eau, et
  le journal des coûts ne reçoit aucune ligne

### Requirement: Extraction API sur les mêmes textes, sous plafond

L'outil SHALL soumettre les 50 textes au modèle API donné par la chaîne existante (question fermée puis
extraction), SHALL journaliser chaque appel avec son coût, SHALL reprendre sans refaire les textes déjà traités et
SHALL s'arrêter avant l'appel qui dépasserait le plafond cumulé.

#### Scenario: Premier texte après accord

- **WHEN** Monsieur DUCOUT a donné son accord écrit et `comparaison.py --extraire-api --modele claude-haiku-5-5
  --limite 1` est lancé
- **THEN** deux lignes au plus apparaissent dans le journal des coûts pour ce texte, et le coût affiché est
  inférieur à un centime

#### Scenario: Les 50 textes

- **WHEN** la commande est relancée sans `--limite`
- **THEN** l'écran affiche « 50 textes (1 déjà traités) », le fichier `results/comparaison_api_claude-haiku-5-5.json`
  contient les fiches produites, les refus sont dans le fichier `_non_aap`, et le coût cumulé reste sous le plafond

### Requirement: Jugement humain par page et par moteur

L'outil SHALL présenter à Monsieur DUCOUT, pour chaque page, le texte collecté, le lien officiel, la fiche du
modèle local et la fiche du modèle API côte à côte (ou le refus et sa raison), et SHALL enregistrer un verdict
sur la page (appel ou non) et un verdict par fiche (juste ou à corriger) dans `sources/verdicts_comparaison.json`.

#### Scenario: Juger une page

- **WHEN** `comparaison.py --juger` est lancé et Monsieur DUCOUT ouvre `http://localhost:8766`
- **THEN** il voit la première page sans verdict, clique « c'est un appel » puis « fiche juste » ou « fiche à
  corriger » pour chaque fiche présente, et le verdict apparaît dans le fichier avec la date

#### Scenario: Reprise

- **WHEN** l'écran est fermé puis relancé
- **THEN** il reprend à la première page sans verdict et affiche le compte des pages jugées sur 50

### Requirement: Rapport en pourcentages

L'outil SHALL produire `scraping/COMPARAISON.md` avec, par moteur, le repérage (décisions justes sur 50), la
qualité (fiches justes parmi les pages jugées « appel »), les fabrications (fiches sur des pages jugées « pas un
appel »), le temps et le coût réel, plus la liste des 50 pages avec leurs verdicts.

#### Scenario: Rapport après jugement

- **WHEN** les 50 pages sont jugées et `comparaison.py --rapport` est lancé
- **THEN** `COMPARAISON.md` montre une ligne par moteur avec les cinq valeurs, le coût de Haiku lu dans le journal
  et 0 euro pour le modèle local

#### Scenario: Rapport partiel

- **WHEN** moins de 50 pages sont jugées
- **THEN** le rapport indique le nombre de pages jugées et calcule les taux sur ces pages seulement

### Requirement: Aucun appel sans accord

Aucun appel au modèle API SHALL avoir lieu avant l'accord écrit de Monsieur DUCOUT sur le modèle, son prix
vérifié et le coût estimé, inscrits dans ce changement.

#### Scenario: Code en place sans accord

- **WHEN** `comparaison.py` est livré et testé mais l'accord n'a pas été donné
- **THEN** le journal des coûts ne contient aucune ligne de ce changement (aucun appel hors des 45 textes de
  l'échantillon)
