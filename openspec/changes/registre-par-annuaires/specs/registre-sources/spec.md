# registre-sources Specification

## ADDED Requirements

### Requirement: Familles adossées à des annuaires de référence

Chaque famille d'émetteurs du registre SHALL être rattachée à un annuaire de référence nommé dans
`scraping/sources/annuaires/familles.json` (nom de l'annuaire, adresse, date, total), et
`REGISTRE_SOURCES.md` SHALL afficher en tête, pour chaque famille, le taux de couverture :
entrées du registre rapprochées de l'annuaire, divisées par le total de l'annuaire.

#### Scenario: Taux de couverture visible

- **WHEN** Monsieur DUCOUT ouvre `scraping/REGISTRE_SOURCES.md` après `python registre.py --tableau`
- **THEN** il lit une ligne par famille de la forme « Fondations reconnues d'utilité publique et d'entreprise (santé-social) : 46 / 664 (7 %) — annuaire RNF du 2026-10-01 »

#### Scenario: Famille sans annuaire

- **WHEN** une famille n'a pas encore d'annuaire de référence
- **THEN** la ligne indique « couverture non mesurée » au lieu d'un pourcentage

### Requirement: Extrait d'annuaire versionné

`python scraping/annuaires.py --rnf <fichier zip ou csv>` SHALL produire
`scraping/sources/annuaires/rnf_fondations_sante_social.csv` : fondations reconnues d'utilité
publique et d'entreprise, actives, dont le domaine d'intérêt général ou l'objet social évoque la
santé, le social, le médical, le handicap, l'autonomie ou le vieillissement, avec numéro RNF, titre,
type, SIRET, ville, domaine, et deux colonnes vides à remplir : site trouvé, identifiant du registre.

#### Scenario: Extrait de la première vague

- **WHEN** Monsieur DUCOUT lance la commande sur le fichier RNF du 2026-10-01
- **THEN** le terminal affiche « 664 fondations retenues (409 RUP, 255 d'entreprise) sur 4 072 actives » et le fichier a 664 lignes

### Requirement: Entrée au registre sans adresse devinée

Une fondation de l'extrait SHALL entrer au registre (statut « identifiée », catégorie « fondation »,
périmètre « santé et médico-social », note « RNF <numéro> ») seulement quand son site a été trouvé
et inscrit dans la colonne « site trouvé » ; `python scraping/annuaires.py --integrer` SHALL
rapprocher d'abord chaque ligne des entrées existantes par SIRET puis par nom normalisé, SHALL
réutiliser l'entrée existante le cas échéant, et SHALL lister les rapprochements douteux au lieu
de trancher.

#### Scenario: Fondation déjà au registre

- **WHEN** l'extrait contient la Fondation APICIL, déjà présente sous `fondation-apicil`
- **THEN** aucune entrée nouvelle n'est créée et la colonne « identifiant du registre » reçoit `fondation-apicil`

#### Scenario: Fondation sans site trouvé

- **WHEN** la colonne « site trouvé » d'une ligne est vide
- **THEN** la ligne n'entre pas au registre et compte dans les « sites non trouvés » affichés par la commande
