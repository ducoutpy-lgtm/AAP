# extraction-echantillon-aap Specification

## MODIFIED Requirements

### Requirement: Extraction par Ollama en local

Le script SHALL, pour chaque texte de fiche, demander d'abord au modèle local si la page est la
fiche d'un appel à projets ; SHALL n'extraire une fiche au format `AapNormalized` que si la réponse
est oui, et SHALL enregistrer les pages refusées avec la raison. Après extraction, le script SHALL
contrôler les formats (dates AAAA-MM-JJ ou null, montants entiers ou null, enveloppe chiffrée ou
null, financeur non vide), SHALL redemander une fois au modèle en citant l'écart, puis SHALL mettre
le champ à null et marquer la fiche « à relire » si l'écart persiste. Une réponse qui n'est pas un
JSON valide SHALL être comptée comme échec sans arrêter le traitement. Les fiches SHALL être
écrites au fil de l'eau dans un fichier propre au modèle, et une relance SHALL reprendre après la
dernière fiche écrite.

#### Scenario: Fiches produites par le modèle local

- **WHEN** Monsieur DUCOUT lance `python echantillon.py --extraire --moteur ollama --modele mistral:7b-instruct`
- **THEN** le fichier `results/echantillon_ollama_mistral-7b-instruct.json` contient une fiche par
  texte accepté et conforme, et le terminal affiche le nombre de pages refusées, de réussites,
  d'échecs et le temps total.

#### Scenario: Page hors sujet refusée

- **WHEN** le texte est la page « La facture d'eau expliquée » de l'agence de l'eau Artois-Picardie
- **THEN** aucune fiche n'est produite et la page figure dans
  `results/echantillon_ollama_mistral-7b-instruct_non_aap.json` avec la raison du modèle.

#### Scenario: Date hors format corrigée ou neutralisée

- **WHEN** le modèle répond « 20 Septembre 2026 » pour la date de clôture
- **THEN** le script redemande la date au format AAAA-MM-JJ ; si la réponse est encore hors
  format, la fiche porte `date_cloture` à null et `scrape_metadata.a_relire` à true.

## ADDED Requirements

### Requirement: Contrôle automatique contre les fiches de référence

`python echantillon.py --controler --modele <modele>` SHALL comparer chaque fiche produite par ce
modèle à la fiche de référence de même adresse dans `results/echantillon_claude_code.json` (titre
normalisé, financeur, date de clôture, montant) et SHALL remplir la grille
`results/controle_echantillon.json` sous la clé du modèle, sans modifier les autres colonnes. Les
fiches produites pour une page listée dans `results/echantillon_non_aap.json` SHALL être comptées
comme « fabriquées à tort ».

#### Scenario: Grille remplie

- **WHEN** Monsieur DUCOUT lance `--controler --modele mistral:7b-instruct` après l'extraction
- **THEN** le terminal affiche le nombre de fiches comparées, de fiches justes sur les quatre
  champs et de fiches fabriquées à tort, et la grille contient une entrée par fiche pour ce modèle.

### Requirement: Seuil de décision dans le rapport

`ECHANTILLON.md` SHALL afficher le seuil fixé par Monsieur DUCOUT (fiches justes minimales sur 24,
fiches fabriquées maximales sur 21) et, pour chaque modèle local testé, SHALL dire s'il atteint le
seuil.

#### Scenario: Verdict lisible

- **WHEN** Monsieur DUCOUT ouvre `ECHANTILLON.md` après les tours
- **THEN** il lit, pour chaque modèle, le nombre de fiches justes, le nombre de fiches fabriquées
  à tort, le temps total, et la mention « seuil atteint » ou « seuil non atteint ».
