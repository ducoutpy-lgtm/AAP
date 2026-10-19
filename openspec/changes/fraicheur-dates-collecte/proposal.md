# Proposal

## Why

Lot 2 « fraîcheur » du rapport de critique, instruction 10 : une fiche doit dire quand sa page a été lue et quand elle a
été vue pour la dernière fois, sinon rien ne permet de repérer un appel disparu ou périmé. Aujourd'hui, les textes
collectés n'ont pas de date (seule la date du fichier sur le disque la garde), les fiches portent `produite_le` (date
d'extraction, reportée dans `extraitLe` depuis le 2026-10-19) mais pas de date de collecte, et l'import ne note pas la
dernière fois qu'il a vu une fiche. Accord de Monsieur DUCOUT du 2026-10-19 : « reprends le lot 2 ».

## What Changes

- **Textes collectés** : les deux collecteurs (`echantillon.collecter`, `extraction_locale.collecter`) écrivent une
  première ligne `# collecte_le <date ISO>` ; `lire_fiche` la reconnaît et la saute, les fichiers anciens (première
  ligne = adresse) restent lisibles. `date_collecte(chemin)` rend cette date, ou la date de modification du fichier
  pour un texte ancien.
- **Fiches** : `extraire` et `extraire_api` écrivent `scrape_metadata.collecte_le` ; `champ.py --classer` et
  `verification.py` n'y touchent pas.
- **Import** : `scrapeMetadata.collecteLe` (depuis `collecte_le`, sinon `scraped_at` des connecteurs) et
  `scrapeMetadata.derniereVueLe` (date de l'import, réécrite à chaque import où la fiche est présente). Le type `AAP`
  déclare les deux champs. Pourquoi `derniereVueLe` à l'import et non à la collecte : c'est la date à laquelle la fiche
  figurait encore dans un fichier de résultats, donc la base du rejeu (instruction 10 puis règle « non revue après deux
  rejeux » du lot 2, hors de ce changement).
- **Rattrapage** : les 1 191 fiches existantes reçoivent `collecte_le` depuis la date de leur fichier texte
  (`echantillon.py --dater-collecte`, essai à blanc, sauvegarde), puis un import pose `collecteLe` et `derniereVueLe`.

## Capabilities

### Modified Capabilities

- `extraction-aap-locale` : ligne d'en-tête datée et `collecte_le`.
- `import-aap-scrapes` : `collecteLe` et `derniereVueLe`.

## Impact

- Code : `scraping/echantillon.py`, `scraping/extraction_locale.py`, `scripts/import_to_firestore.py`,
  `app/src/types/index.ts`, tests.
- Données : fichiers texte nouveaux avec en-tête ; fichiers de résultats enrichis ; documents Firestore enrichis de deux
  champs techniques (jamais un champ humain).
- Coût : zéro. Hors périmètre : rejeu périodique de la collecte, rapport de veille, règle de péremption (changements
  suivants du lot 2).
